
"""
Endpoints for fetching Offerings
"""
import os

import json
from datetime import datetime, timedelta
import secrets
from typing import Any
from math import ceil
import requests
from flask import jsonify, request, abort, redirect, session, url_for, Blueprint
from flask_login import current_user, login_user, logout_user
from oauthlib.oauth2 import WebApplicationClient
from models import db, User, Offering, SecondaryListing, UserTokenLike, Token, DividendHistory, SecondarySale, DividendRegion, SongDividend
from enums import ERROR_CODES
from utils.permissions import permission_required
from utils.browsercache import browsercache
from utils.construct_cap_table import cap_table_on
from utils.custom_error import CustomError
from utils.transact_api import transact_request

MOTYF_ISSUER_ID = os.environ['MOTYF_ISSUER_ID']
LATEST_OFFERING_ID = os.environ['LATEST_OFFERING_ID']

def safeint(value):
    if value == '':
        return None
    return int(value)

OFFERING_TYPES = {
    'issuerId': int,
    'offeringId': int,
    'issueName': str,
    'issueType': str,
    'targetAmount': float,
    'minAmount': float,
    'maxAmount': float,
    'unitPrice': float,
    'totalShares': float,
    'remainingShares': float,
    'startDate': str,
    'endDate': str,
    'offeringStatus': str,
    'offeringText': str,
    'stampingText': str,
    'createdDate': str,
    'field1': str,
    'field2': str,
    'field3': str,
    'escrowAccountNumber': safeint,
    'createdIPAddress': str,
}

OFFERING_DEFAULT_FIELDS = ['issuerId',
  'offeringId',
  'issueName',
  'issueType',
  'targetAmount',
  'minAmount',
  'maxAmount',
  'unitPrice',
  'totalShares',
  'remainingShares',
  'startDate',
  'endDate',
  'offeringStatus',
  'offeringText',
  'stampingText',
]

api_offerings = Blueprint('api_offerings', __name__)

@api_offerings.route('/all', methods=['GET'])
@permission_required()
def all_offerings() -> Any:
    response = transact_request('getAllOffers')
    db_offerings = Offering.query.all()
    id_to_data = {}
    for offering in response['offeringDetails']:
        data = parse_offering_data(offering, OFFERING_DEFAULT_FIELDS)
        id_to_data[data['offeringId']] = data

    for offering in db_offerings:
        id_to_data[offering.id]['contractAddress'] = offering.contract_address

    return jsonify(
        status='success',
        offerings=list(id_to_data.values())
    )

@api_offerings.route('/latest', methods=['GET'])
@browsercache(days=1)
@permission_required()
def latest_offering() -> Any:
    response = transact_request('getOffering', payload={"offeringId": LATEST_OFFERING_ID})
    offering = parse_offering_data(
        response['offeringDetails'][0],
        OFFERING_DEFAULT_FIELDS + ['escrowAccountNumber'],
    )
    db_offering = db.session.query(
        Offering.contract_address.label('contract_address'),
        Offering.id.label('id'),
        Offering.secondary_offering_id.label('secondary_id'),
        Offering.social.label('social'),
        Offering.website.label('website'),
        Offering.discord.label('discord'),
    ).filter(
        Offering.id == LATEST_OFFERING_ID
    ).first()

    if db_offering:
        offering['contractAddress'] = db_offering.contract_address
        offering['secondaryId'] = db_offering.secondary_id
        offering['social'] = db_offering.social
        offering['website'] = db_offering.website
        offering['discord'] = db_offering.discord

    return jsonify(
        status='success',
        offering=offering
    )

@api_offerings.route('/<int:offering_id>', methods=['GET'])
@browsercache(days=1)
@permission_required()
def get_offering(offering_id: int) -> Any:
    response = transact_request('getOffering', payload={"offeringId": offering_id})

    offering = parse_offering_data(
        response['offeringDetails'][0],
        OFFERING_DEFAULT_FIELDS + ['escrowAccountNumber'],
    )
    db_offering = db.session.query(
        Offering.contract_address.label('contract_address'),
        Offering.id.label('id'),
        Offering.secondary_offering_id.label('secondary_id'),
        Offering.social.label('social'),
        Offering.website.label('website'),
        Offering.discord.label('discord'),
    ).filter(
        Offering.id == offering_id
    ).first()

    if db_offering:
        offering['contractAddress'] = db_offering.contract_address
        offering['secondaryId'] = db_offering.secondary_id
        offering['social'] = db_offering.social
        offering['website'] = db_offering.website
        offering['discord'] = db_offering.discord
    return jsonify(
        status='success',
        offering=offering
    )


@api_offerings.route('/like/<int:offering_id>/<int:token_id>', methods=['GET'])
@permission_required()
def like_token(offering_id: int, token_id: int) -> Any:
    token = db.session.query(Token).filter(
        Token.offering_id == offering_id,
        Token.NFT == token_id
    ).first()
    cap_table_on('02-08-2023', 1247080)

    if not token:
        raise CustomError('Token not found')

    like = db.session.query(UserTokenLike).filter(
        UserTokenLike.user_id == current_user.id,
        UserTokenLike.offering_id == offering_id,
        UserTokenLike.token_id == token_id
    ).first()

    if like:
        db.session.delete(like)
        db.session.commit()
    else:
        db.session.add(
            UserTokenLike(
                user_id=current_user.id,
                token_id=token_id,
                offering_id=offering_id
            )
        )
        db.session.commit()

    return jsonify(
        status='success',
    )


@api_offerings.route('documents/<int:offering_id>', methods=['GET'])
@permission_required()
def get_offering_documents(offering_id: int) -> Any:
    response = transact_request('getDocumentsforOffering', payload={"offeringId": offering_id})
    if response['statusCode'] == '404':
        return jsonify(status='success', documents=[])
    return jsonify(
        status='success',
        documents=[
            {
                'documentTitle': document['documentTitle'],
                'documentId': int(document['documentId']),
                'templateName': document['templateName'],
                'documentFileReferenceCode': int(document['documentFileReferenceCode']),
                'documentName': document['documentName'],
                'createdDate': document['createdDate'],
                'url': document['url'],
            } for document in response['document_details']
        ]
    )


@api_offerings.route('stats/<int:offering_id>', methods=['GET'])
@permission_required()
def get_offering_stats(offering_id: int) -> Any:
    offering = db.session.query(Offering).filter_by(id=offering_id).first()

    payouts = db.session.query(
        DividendHistory.amount, DividendHistory.year, DividendHistory.quarter
    ).filter_by(offering_id=offering_id).order_by(DividendHistory.year.desc(), DividendHistory.quarter.desc()).limit(12)

    amounts = [payout.amount for payout in payouts]
    if amounts:
        max_bar = int(ceil(max(amounts)/100) * 100)
    else:
        max_bar = 0
    fillers = [max_bar - payout.amount for payout in payouts]

    floor = db.session.query(
        db.func.min(SecondaryListing.price)
    ).filter(
        SecondaryListing.secondary_offering_id == 52134, #offering.secondary_offering_id
    ).first()[0]

    volume = db.session.query(db.func.sum(SecondarySale.price)).filter(
        SecondarySale.secondary_offering_id == 52134,
        SecondarySale.executed == True,
    ).first()[0]

    royalties = sum(amounts[-4:])
    owners = db.session.query(Token).distinct(Token.owner_id).count()

    regions = db.session.query(
        DividendRegion
    ).filter(
        DividendRegion.offering_id == offering_id
    ).first()

    songs = db.session.query(SongDividend).filter(
        SongDividend.offering_id == offering_id
    ).order_by(SongDividend.amount.desc()).limit(5)

    return jsonify(
        status='success',
        offeringStats={
            'payouts': list(reversed(amounts)),
            'quarters': list(reversed([f'{payout.year}Q{payout.quarter}' for payout in payouts])),
            'fillers': list(reversed(fillers)),
            'floor': floor,
            'volume': volume,
            'royalties': royalties,
            'owners': owners,
            'regions': [
                {'value': regions.international, 'name': 'International'},
                {'value': regions.domestic, 'name': 'Domestic'},
            ] if regions else [],
            'songs': [
                {'value': song.amount, 'name': song.song} for song in songs
            ] if songs else [],
        }
    )

def parse_offering_data(offering, fields):
    data = {}
    for field in fields:
        data[field] = OFFERING_TYPES[field](offering[field])
    return data
