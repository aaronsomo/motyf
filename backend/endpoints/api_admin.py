
"""
Endpoints for admin actions.
"""

import os
import json
from datetime import datetime, timedelta
import secrets
from typing import Any

import requests
from flask import jsonify, request, abort, redirect, session, url_for, Blueprint
from flask_login import current_user, login_user, logout_user
from oauthlib.oauth2 import WebApplicationClient
from models import db, User, Offering, Trade, DividendHistory, DividendRegion, SongDividend, RoyaltyPayout
from enums import ERROR_CODES, Permission
from utils.permissions import permission_required
from utils.transact_api import transact_request, format_transact_url
from utils.onboarding_status import onboarding_status_sync
from utils.custom_error import CustomError
from utils.web3_utils import transfer_token, checksum_address, deploy_contract, mint_token
from utils.construct_cap_table import cap_table_on
from datetime import datetime

api_admin = Blueprint('api_admin', __name__)

party_fields = [
    'partyId',
    'firstName',
    'lastName',
    'emailAddress',
    'kycStatus',
    'amlStatus'
]

@api_admin.route('/users', methods=['GET'])
@permission_required(Permission.ADMIN)
def all_offerings() -> Any:
    req = transact_request('getAllParties')
    transact_users = req['partyDetails']
    db_users = User.query.all()
    emails_to_data = {}

    for user in db_users:
        emails_to_data[user.email] = { 'emailAddress': user.email }

    for user in transact_users:
        if user['emailAddress'] not in emails_to_data:
            continue

        for field in party_fields:
            emails_to_data[user['emailAddress']][field] = user[field]

    for user in db_users:
        emails_to_data[user.email]['requestId'] = user.party() and user.party().kyc_request_id or None
        emails_to_data[user.email]['uploads'] = user.party() and user.party().kyc_request_uploads or 0
        emails_to_data[user.email]['accountId'] = user.account_id
        accountUrl = None if not user.account_id else format_transact_url('accounts_overview_information', 'accountid', user.account_id)
        emails_to_data[user.email]['accountUrl'] = accountUrl
        emails_to_data[user.email]['partyUrl'] = None if not user.party_id else format_transact_url('parties_overview_individual', 'party_id', user.party_id)
        emails_to_data[user.email]['onboardingStatus'] = None if not user.party_id else onboarding_status_sync(user, emails_to_data[user.email]['kycStatus'])
        emails_to_data[user.email]['wallet'] = user.external_wallet

    return jsonify(
        status='success',
        users=list(emails_to_data.values())
    )

@api_admin.route('/request-documents/<string:party_id>', methods=['GET'])
@permission_required(Permission.ADMIN)
def request_documents(party_id: str) -> Any:
    user = User.query.filter_by(party_id=party_id).first()
    if not user.party():
        raise CustomError(ERROR_CODES.ERR_NO_PARTY)

    if user.party().kyc_request_id:
        raise CustomError(ERROR_CODES.KYC_ALREADY_REQUESTED)

    req = transact_request('requestKycAml', {'investorId': party_id})
    user.party().kyc_request_id = req['requestDetails'][0]['requestId']
    db.session.commit()

    return jsonify(
        status='success',
    )

@api_admin.route('/approve/<string:party_id>', methods=['GET'])
@permission_required(Permission.ADMIN)
def approve_kyc(party_id: str) -> Any:
    user = User.query.filter_by(party_id=party_id).first()
    if not user.party():
        raise CustomError(ERROR_CODES.ERR_NO_PARTY)

    req = transact_request('updateParty', { 'partyId': party_id, 'KYCstatus': 'Manually Approved' })

    return jsonify(
        status='success',
    )

@api_admin.route('/trades/<string:offering_id>', methods=['GET'])
@permission_required(Permission.ADMIN)
def get_trades(offering_id: str) -> Any:
    req = transact_request('getTradesForOffering', payload={
        'offeringId': offering_id
    })
    if req['statusCode'] != '101':
        return jsonify(
            status='failed'
        )

    details = req['Offering purchased details']
    accounts = [order['accountId'] for order in details]
    trade_ids = [order['orderId'] for order in details]

    users = User.query.filter(User.account_id.in_(accounts)).all()
    trades = Trade.query.filter(Trade.trade_id.in_(trade_ids)).all()
    offering = Offering.query.filter_by(id=offering_id).first()

    user_by_account = {}
    for user in users:
        user_by_account[user.account_id] = user

    trade_by_id = {}
    for trade in trades:
        trade_by_id[str(trade.trade_id)] = trade

    for order in details:
        user = user_by_account[order['accountId']]
        order['email'] = user.email
        order['userId'] = user.id
        order['linkedWallet'] = user.external_wallet
        if offering:
            order['contractAddress'] = offering.contract_address

        if order['orderId'] in trade_by_id.keys() and trade_by_id[order['orderId']].minted:
            trade = trade_by_id[order['orderId']]
            order['minted'] = 'True'
            order['tokenId'] = trade.NFT
        else:
            order['minted'] = 'False'
            order['tokenId'] = ''

    return jsonify(
        status='success',
        trades=details,
    )

@api_admin.route('/mint', methods=['POST'])
@permission_required(Permission.ADMIN)
def mint_to() -> Any:
    content = request.json
    trade_id = content['tradeId']
    trade = Trade.query.filter_by(trade_id=trade_id).all()

    req = transact_request('getTradeStatus', payload={
        'tradeId': trade_id,
    })
    if req['statusCode'] != '101':
        raise CustomError('TRADE NOT FOUND')

    details = req['tradeDetails'][0]
    if details['orderStatus'] != 'SETTLED':
        raise CustomError('TRADE NOT SETTLED')
    offering_id = details['offeringId']


    mint_to = details['accountId']
    user = User.query.filter_by(account_id=mint_to).first()
    wallet = user.external_wallet
    if not wallet:
        raise CustomError('USER HAS NO LINKED WALLET')

    if not trade:
        new_trade = Trade(trade_id=trade_id, minted=False, offering_id=offering_id, user_id=user.id)
        db.session.add(new_trade)
        db.session.commit()

    trade = Trade.query.filter_by(trade_id=trade_id).first()
    if not trade:
        raise CustomError('CANNOT CREATE TRADE. PLEASE TRY AGAIN.')

    offering = Offering.query.filter_by(id=offering_id).first()
    if not offering or not offering.contract_address:
        raise CustomError('OFFERING IS NOT DEPLOYED')

    tokens_for_offering = Trade.query.filter_by(offering_id=offering_id).all()
    nfts = list(filter(lambda x: x is not None, [token.NFT for token in tokens_for_offering]))
    max_token = 0
    if len(nfts) > 0:
        max_token = max(nfts)
    new_token = max_token + 1
    try:
        trade.minted = True
        trade.NFT = new_token
        db.session.commit()
        txn_hash = mint_token(wallet, offering.contract_address)
    except Exception as e:
        db.session.rollback()
        return jsonify(
            status='failure',
            error=str(e)
        )
    return jsonify(
        status='success',
        transaction=txn_hash
    )

@api_admin.route('/transfer', methods=['POST'])
@permission_required(Permission.ADMIN)
def transfer() -> Any:
    content = request.json
    from_email = content['from']
    to_email = content['to']
    token_id = content['token']
    offering = content['offeringId']
    to_user = User.query.filter_by(email=to_email).first()
    from_user = User.query.filter_by(email=from_email).first()
    offering = Offering.query.filter_by(id=offering).first()
    if not to_user or not to_user.external_wallet:
        return jsonify(
            status='failure',
            error='Sending user does not have a web3 wallet.'
        )
    if not from_user or not from_user.external_wallet:
        return jsonify(
            status='failure',
            error='Receiving user does not have a web3 wallet.'
        )
    if not offering or not offering.contract_address:
        return jsonify(
            status='failure',
            error='Offering does not have a contract address.'
        )

    try:
        txn_hash = transfer_token(to_user.external_wallet, from_user.external_wallet, token_id, offering.contract_address)
    except Exception as e:
        return jsonify(
            status='failure',
            error=str(e)
        )

    return jsonify(
        status='success',
        transaction=txn_hash
    )


@api_admin.route('/deploy', methods=['POST'])
@permission_required(Permission.ADMIN)
def deploy() -> Any:
    content = request.json
    offering_id = content['offeringId']
    offering = Offering.query.filter_by(id=offering_id).first()

    if offering.contract_address:
        return jsonify(
            status='success',
            transaction=offering.contract_address
        )
    transactOffering = transact_request('getOffering', payload={'offeringId': offering_id})['offeringDetails'][0]
    maxTokens = transactOffering['totalShares']
    name = transactOffering['issueName']
    txn_receipt = deploy_contract('', int(float(maxTokens)), name, 'MOTYF')

    offering.contract_address = txn_receipt['contractAddress']
    db.session.commit()

    return jsonify(
        status='success',
        transaction=txn_receipt['transactionHash'].hex()
    )

@api_admin.route('/offering-stats/<int:offering_id>')
@permission_required(Permission.ADMIN)
def offering_stats(offering_id) -> Any:
    payouts = db.session.query(
        DividendHistory
    ).filter_by(
        offering_id=offering_id
    ).order_by(
        DividendHistory.year.desc(), DividendHistory.quarter.desc()
    ).all()

    regions = db.session.query(
        DividendRegion
    ).filter(
        DividendRegion.offering_id == offering_id
    ).first()

    songs = db.session.query(SongDividend).filter(
        SongDividend.offering_id == offering_id
    ).order_by(SongDividend.amount.desc()).all()

    return jsonify(
        status='success',
        payouts=[{
            'id': payout.id,
            'year': payout.year,
            'quarter': payout.quarter,
            'amount': payout.amount 
        } for payout in payouts],
        regions={
            'id': regions.id,
            'domestic': regions.domestic,
            'international': regions.international,
        } if regions else {},
        songs=[{
            'id': song.id,
            'song': song.song,
            'amount': song.amount,
        } for song in songs],
    )

@api_admin.route('/save-dividend-history', methods=['POST'])
@permission_required(Permission.ADMIN)
def save_dividend_history() -> Any:
    content = request.json
    payouts = content['payouts']
    offering = content['offeringId']
    print(content)
    for payout in payouts:
        if 'deleted' in payout and payout['deleted']:
            db_payout = db.session.query(DividendHistory).filter(
                DividendHistory.id == payout['id']
            ).first()
            db.session.delete(db_payout)
        elif 'dirty' in payout and payout['dirty']:
            db.session.add(DividendHistory(
                offering_id=offering,
                year=payout['year'],
                quarter=payout['quarter'],
                amount=payout['amount']
            ))
        else:
            db_payout = db.session.query(DividendHistory).filter(
                DividendHistory.id == payout['id']
            ).first()
            db_payout.amount = payout['amount']
            db_payout.year = payout['year']
            db_payout.quarter = payout['quarter']

    db.session.commit()
    return jsonify(status='success')

@api_admin.route('/save-dividend-region', methods=['POST'])
@permission_required(Permission.ADMIN)
def save_dividend_region() -> Any:
    content = request.json
    international = content['regions']['international']
    domestic = content['regions']['domestic']
    offering = content['offeringId']

    db_offering = db.session.query(DividendRegion).filter(
        DividendRegion.offering_id == offering
    ).first()

    if db_offering:
        db_offering.international = international
        db_offering.domestic = domestic
        db.session.commit()
    else:
        db_offering = DividendRegion(
            offering_id=offering,
            domestic=domestic,
            international=international
        )
        db.session.add(db_offering)
        db.session.commit()

    return jsonify(status='success')

@api_admin.route('/save-dividend-songs', methods=['POST'])
@permission_required(Permission.ADMIN)
def save_dividend_songs() -> Any:
    content = request.json
    songs = content['songs']
    offering = content['offeringId']

    for song in songs:
        if 'deleted' in song and song['deleted']:
            db_song = db.session.query(SongDividend).filter(
                SongDividend.id == song['id']
            ).first()
            db.session.delete(db_song)
        elif 'dirty' in song and song['dirty']:
            db.session.add(SongDividend(
                offering_id=offering,
                song=song['song'],
                amount=song['amount']
            ))
        else:
            db_song = db.session.query(SongDividend).filter(
                SongDividend.id == song['id']
            ).first()
            db_song.amount = song['amount']
            db_song.song = song['song']

    db.session.commit()
    return jsonify(status='success')

@api_admin.route('/cap-table', methods=['POST'])
@permission_required(Permission.ADMIN)
def get_cap_table() -> Any:
    content = request.json
    offering_id = content['offeringId']
    date = content['date']
    share_holders = []
    validate_date(date)

    if not date:
        raise CustomError('Invalid Date')

    cap_table = cap_table_on(date, offering_id)
    users = cap_table.keys()
    db_users = db.session.query(User).filter(
        User.id.in_(users)
    ).all()
    user_to_data = {}
    for user in db_users:
        user_to_data[user.id] = user

    return jsonify(
        status='success',
        capTable = [{
            'username': f'{user_to_data[holder].first_name} {user_to_data[holder].last_name}',
            'party': format_transact_url('parties_overview_individual', 'party_id', user.party_id),
            'shares': len(shares)
        } for holder, shares in cap_table.items()]
    )

@api_admin.route('/pay-royalties', methods=['POST'])
@permission_required(Permission.ADMIN)
def pay_royalties() -> Any:
    content = request.json
    offering_id = content['offeringId']
    date = content['date']
    payout = content['payout']

    date = validate_date(date)

    if not date:
        raise CustomError('Invalid Date')

    if not payout:
        raise CustomError('Invalid Payout')

    payout = RoyaltyPayout(
        offering_id=offering_id,
        amount=payout,
        date=date,
        executed=False
    )
    db.session.add(payout)
    db.session.commit()
    return jsonify(status='success')

@api_admin.route('get-royalties/<int:offering_id>', methods=['GET'])
@permission_required(Permission.ADMIN)
def get_royalties(offering_id) -> Any:
    payouts = RoyaltyPayout.query.filter(
        RoyaltyPayout.offering_id == offering_id
    ).order_by(RoyaltyPayout.date).all()

    return jsonify(
        status='success',
        payouts=[{
            'amount': payout.amount,
            'date': payout.date,
            'executed': payout.executed
        } for payout in payouts]
    )

def validate_date(date):
    try:
        dateobj = datetime.strptime(date, '%m-%d-%Y')
    except ValueError as e:
        print(e)
        raise CustomError('Invalid Date')
    return dateobj
