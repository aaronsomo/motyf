
"""
Endpoints for admin actions.
"""

import os
import json
from datetime import datetime, timedelta
import secrets
from typing import Any
import io

import requests
from flask import jsonify, request, abort, redirect, session, url_for, Blueprint
from flask_login import current_user, login_user, logout_user
from oauthlib.oauth2 import WebApplicationClient
from models import db, User, Party, Account
from enums import ERROR_CODES, Permission, PARTY_OPTIONAL_FIELDS, PARTY_REQUIRED_FIELDS, ACCOUNT_OPTIONAL_FIELDS, ACCOUNT_REQUIRED_FIELDS, SUITABILITY_FIELDS, OnboardingStatuses
from utils.permissions import permission_required
from utils.transact_api import transact_request, transact_upload
from utils.custom_error import CustomError
from utils.onboarding_status import onboarding_status
import tempfile
from web3.auto import w3
from hexbytes import HexBytes
from eth_account.messages import encode_defunct
from utils.dwolla import Dwolla

api_kyc = Blueprint('api_kyc', __name__)

@api_kyc.route('/upsert-party', methods=['POST'])
@permission_required()
def upsert_party() -> Any:
    content = request.json
    content['emailAddress'] = current_user.email
    sanitize_content = {}

    if not current_user.party():
        return create_party_helper(content)
    else:
        return update_party_helper(content)

def create_party_helper(content):
    backup_fields = {}
    sanitize_content = {}
    if current_user.account_id:
        req = transact_request('getAccount', { 'accountId': current_user.account_id })['accountDetails']
        backup_fields = {
            'primAddress1': req['address1'],
            'primAddress2': req['address2'],
            'primCity': req['city'],
            'primState': req['state'],
            'primZip': req['zip'],
            'primCountry': req['country'],
            'phone': req['phone'],
            'firstName': current_user.first_name,
            'lastName': current_user.last_name,
            'email': current_user.email
        }

    for field in PARTY_REQUIRED_FIELDS:
        if field in content and content[field]:
            sanitize_content[field] = content[field]
        elif field in backup_fields:
            sanitize_content[field] = backup_fields[field]
        else:
            raise CustomError(ERROR_CODES.ERR_MISSING_FIELDS)

    for field in PARTY_OPTIONAL_FIELDS:
        if field in content and content[field]:
            sanitize_content[field] = content[field]
        elif field in backup_fields:
            sanitize_content[field] = backup_fields[field]

    req = transact_request('createParty', sanitize_content, 'PUT')

    if req['statusCode'] == '106':
        raise CustomError(req['Error(s)'])

    if req['partyDetails'][0]:
        partyId = req['partyDetails'][1][0]['partyId']
        current_user.party_id = partyId
        current_user.first_name = sanitize_content['firstName']
        current_user.last_name = sanitize_content['lastName']
        db.session.add(Party(party_id=partyId))
        db.session.commit()
        if current_user.account_id and current_user.party_id:
            create_link()

    return jsonify(
        status='success',
        partyId=current_user.party_id
    )

def update_party_helper(content):
    content = request.json
    sanitize_content = {}
    if not current_user.party():
        raise CustomError(ERROR_CODES.ERR_NO_PARTY)

    sanitize_content['partyId'] = current_user.party_id

    for field in PARTY_OPTIONAL_FIELDS + PARTY_REQUIRED_FIELDS:
        if field in content:
            sanitize_content[field] = content[field]

    req = transact_request('updateParty', sanitize_content)

    if req['statusCode'] == '106':
        raise CustomError(req['Error(s)'])

    return jsonify(
        status='success',
        partyId=current_user.party_id
    )

@api_kyc.route('/perform-kyc', methods=['GET'])
@permission_required()
def perform_kyc() -> Any:
    if not current_user.party():
        raise CustomError(ERROR_CODES.ERR_NO_PARTY)

    if current_user.party().kyc_requested:
        req = transact_request('getKycAml', { 'partyId': current_user.party_id })

        return jsonify(
            status='success',
            KYCStatus=req['KYC Status'],
            AMLStatus=req['Party Status']['AML status']
        )

    current_user.party().kyc_requested = True
    db.session.commit()
    req = transact_request('performKycAmlBasic', { 'partyId': current_user.party_id })

    return jsonify(
        status='success',
        KYCStatus=req['kyc']['kycstatus'],
        AMLStatus=req['kyc']['amlstatus']
    )

@api_kyc.route('/get-party', methods=['GET'])
@permission_required()
def get_party() -> Any:
    if not current_user.party_id:
        raise CustomError(ERROR_CODES.ERR_NO_PARTY)

    req = transact_request('getParty', { 'partyId': current_user.party_id })

    sanitize_content = {}
    content = req['partyDetails'][0]
    for field in PARTY_OPTIONAL_FIELDS + PARTY_REQUIRED_FIELDS:
        if field in content:
            sanitize_content[field] = content[field]

    return jsonify(
        status='success',
        party=sanitize_content
    )

@api_kyc.route('/get-onboarding-status', methods=['GET'])
@permission_required()
def get_kyc() -> Any:
    onboarding = onboarding_status(current_user)

    return jsonify(
        status='success',
        onboardingStatus=onboarding,
    )

@api_kyc.route('/upload-kyc', methods=['POST'])
@permission_required()
def upload_kyc() -> Any:
    if not current_user.party_id:
        raise CustomError(ERROR_CODES.ERR_NO_PARTY)

    uploaded_file = request.files['file']
    filename, file_extension = os.path.splitext(uploaded_file.filename)

    if file_extension not in ['.png', '.jpg', '.pdf', '.jpeg']:
        raise CustomError(ERROR_CODES.KYC_BAD_FILE_FORMAT)
    # Needed to do some trickery to get TransactAPI to parse
    # the filename correctly
    file_bytes = io.BytesIO(uploaded_file.read())
    file_bytes.name = uploaded_file.filename
    file = io.BufferedReader(file_bytes)

    content = {
        'documentTitle': (None, f'documentTitle0={filename}'),
        'userfile0': file,
        'requestId': (None, current_user.party().kyc_request_id),
        'createdIpAddress': (None, request.remote_addr),
    }
    if current_user.party().kyc_request_id:
        content['requestId'] = (None, current_user.party().kyc_request_id)
        content['investorId'] = (None, current_user.party_id)

        req = transact_upload('requestUploadPartyDocument', payload=content)
    else:
        content['file_name'] = (None, f'filename0={uploaded_file.filename}')
        content['partyId'] = (None, current_user.party_id)

        req = transact_upload('uploadPartyDocument', payload=content)

    if req['statusCode'] == "101":
        current_user.party().kyc_request_uploads = current_user.party().kyc_request_uploads + 1 if current_user.party().kyc_request_uploads else 1
        db.session.commit()
    else:
        raise CustomError(req['Error(s)'])

    return jsonify(
        status='success',
    )

@api_kyc.route('/upsert-account', methods=['POST'])
@permission_required()
def upsert_account() -> Any:
    content = request.json
    if not current_user.account_id:
        return create_account_helper(content)
    else:
        return update_account_helper(content)


def create_account_helper(content):
    sanitize_content = {}
    for field in ACCOUNT_REQUIRED_FIELDS:
        if field not in content:
            raise CustomError(ERROR_CODES.ERR_MISSING_FIELDS)
        else:
            sanitize_content[field] = content[field]

    for field in ACCOUNT_OPTIONAL_FIELDS:
        if field in content:
            sanitize_content[field] = content[field]

    if sanitize_content['country'] != 'United States':
        raise CustomError(ERROR_CODES.US_RESIDENTS_ONLY)

    if len(sanitize_content['zip']) != 5:
        raise CustomError('Invalid Zip Code')

    sanitize_content['domesticYN'] = 'domestic_account' if sanitize_content['country'] == 'United States' else 'international_account'
    sanitize_content['accountRegistration'] = f'{current_user.first_name} {current_user.last_name}'
    sanitize_content['type'] = 'Individual'
    sanitize_content['KYCstatus'] = 'Pending'
    sanitize_content['AMLstatus'] = 'Pending'
    sanitize_content['AccreditedStatus'] = 'Pending'
    sanitize_content['approvalStatus'] = 'Pending'

    req = transact_request('createAccount', sanitize_content, 'PUT')

    if req['statusCode'] == '106':
        raise CustomError(req['Error(s)'])

    if req['accountDetails'][0]:
        accountId = req['accountDetails'][0]['accountId']
        current_user.account_id = accountId
        db.session.add(Account(account_id=accountId))
        db.session.commit()
        if current_user.account_id and current_user.party_id:
            create_link()

    return jsonify(
        status='success',
        accountId=current_user.account_id
    )

def update_account_helper(content):
    sanitize_content = {}

    for field in ACCOUNT_OPTIONAL_FIELDS + ACCOUNT_REQUIRED_FIELDS:
        if field in content:
            sanitize_content[field] = content[field]

    if len(sanitize_content['zip']) != 5:
        raise CustomError('Invalid Zip Code')

    sanitize_content['accountId'] = current_user.account_id
    sanitize_content['accountRegistration'] = f'{current_user.first_name} {current_user.last_name}'
    req = transact_request('updateAccount', sanitize_content, 'PUT')
    if req['statusCode'] == '106':
        raise CustomError(req['Error(s)'])


    return jsonify(
        status='success',
        accountId=current_user.account_id
    )

def create_link():
    link_content = {
        'firstEntryType': 'Account',
        'firstEntry': current_user.account_id,
        'relatedEntryType': 'IndivACParty',
        'relatedEntry': current_user.party_id,
        'linkType': 'owner',
        'primary_value': '1'
    }
    req = transact_request('createLink', link_content, 'PUT')



@api_kyc.route('/get-account', methods=['GET'])
@permission_required()
def get_account() -> Any:
    if not current_user.account_id:
        raise CustomError(ERROR_CODES.ERR_NO_ACCOUNT)

    req = transact_request('getAccount', { 'accountId': current_user.account_id })['accountDetails']
    return jsonify(
        status='success',
        account={
            'streetAddress1': req['address1'],
            'streetAddress2': req['address2'],
            'city': req['city'],
            'state': req['state'],
            'zip': req['zip'],
            'country': req['country'],
            'phone': req['phone'],
            'taxID': req['taxID']
        }
    )

@api_kyc.route('/upsert-suitability', methods=['POST'])
@permission_required()
def upsert_suitability() -> Any:
    content = request.json

    if not current_user.account_id:
        raise CustomError(ERROR_CODES.ERR_NO_ACCOUNT)

    if current_user.account().suitability_submitted:
        return update_suitability_helper(content)
    else:
        return submit_suitability_helper(content)

def submit_suitability_helper(content):
    sanitize_content = {}
    for field in SUITABILITY_FIELDS:
        if field in content:
            sanitize_content[field] = content[field]

    sanitize_content['accountId'] = current_user.account_id
    req = transact_request('calculateSuitability', sanitize_content, 'PUT')
    if req['statusCode'] == "101":
        current_user.account().suitability_submitted = True
        db.session.commit()

    return jsonify(
        status='success',
        accountId=current_user.account_id
    )

def update_suitability_helper(content):
    sanitize_content = {}
    for field in SUITABILITY_FIELDS:
        if field in content:
            sanitize_content[field] = content[field]

    sanitize_content['accountId'] = current_user.account_id
    req = transact_request('updateSuitability', sanitize_content, 'PUT')

    return jsonify(
        status='success',
        accountId=current_user.account_id
    )

@api_kyc.route('/get-suitability', methods=['GET'])
@permission_required()
def get_suitability() -> Any:
    if not current_user.account_id:
        raise CustomError(ERROR_CODES.ERR_NO_ACCOUNT)

    if not current_user.account().suitability_submitted:
        raise CustomError(ERROR_CODES.ERR_SUITABILITY_NOT_SUBMITTED)

    req = transact_request('getSuitability', { 'accountId': current_user.account_id })
    sanitize_content = {}
    content =  req['accountDetails']
    for field in SUITABILITY_FIELDS:
        if field in content:
            sanitize_content[field] = content[field]

    return jsonify(
        status='success',
        suitability=content
    )

@api_kyc.route('/add-wallet', methods=['POST'])
@permission_required()
def add_wallet() -> Any:
    # Match message in ConnectPage
    msg = f'I authorize this wallet to recieve NFTs from Motyf on behalf of {current_user.email}'
    wallet = request.json['wallet']
    signature = request.json['signature']

    message = encode_defunct(text=msg)
    # Check that the passed wallet has signed the message
    if (wallet.lower() == w3.eth.account.recover_message(message, signature=signature).lower()):
        current_user.external_wallet = wallet.lower()
        db.session.commit()
        return jsonify(
            status='success',
        )
    raise CustomError(ERROR_CODES.ERR_VALIDATION_FAILED)

@api_kyc.route('/check-secondary-wallet')
@permission_required()
def check_secondary_wallet() -> Any:
    if not current_user.dwolla_id:
        customer = Dwolla.get_or_create_customer(current_user)
    sources = Dwolla.funding_sources(current_user)

    wallet = next((source for source in sources if source['type'] == 'balance'), None)
    balance = Dwolla.get(wallet['_links']['balance']['href'])
    value = 0
    currency = None
    funding_sources = []

    for source in sources:
        if source['type'] == 'balance':
            balance = Dwolla.get(wallet['_links']['balance']['href'])
            value = balance.body['balance']['value']
            currency = balance.body['balance']['currency']
        else:
            funding_sources.append({
                'type': source['type'],
                'accountType': source['bankAccountType'],
                'name': source['name'],
                'bankName': source['bankName'],
                'verified': source['status'],
                'id': source['id']
            })

    return jsonify(
        status='success',
        balance=balance.body['balance']['value'],
        currency=balance.body['balance']['currency'],
        fundingSources=funding_sources
    )

@api_kyc.route('/add-bank-account', methods=['POST'])
@permission_required()
def add_bank_account() -> Any:
    content = request.json
    bank = Dwolla.add_bank(current_user, content['routingNumber'], content['accountNumber'], content['bankAccountType'], content['name'])
    return jsonify(
        status='success'
    )

@api_kyc.route('/verify-bank-account', methods=['POST'])
@permission_required()
def rverify_bank_account() -> Any:
    content = request.json
    Dwolla.verify_bank(content['id'], content['amount1'], content['amount2'])
    return jsonify(
        status='success'
    )  

@api_kyc.route('/request-verify-bank-account', methods=['POST'])
@permission_required()
def request_verify_bank_account() -> Any:
    account_id = request.json['id']
    Dwolla.request_verify_bank(account_id)
    return jsonify(
        status='success'
    )

@api_kyc.route('/balance', methods=['GET'])
@permission_required()
def dwolla_balance() -> Any:
    balance = Dwolla.balance(current_user)
    return jsonify(
        status='success',
        balance=balance['value'],
        currency=balance['currency']
    )

@api_kyc.route('/transfer-to-wallet', methods=['POST'])
@permission_required()
def transfer_to_wallet() -> Any:
    content = request.json
    sources = Dwolla.funding_sources(current_user)
    wallet = next((source for source in sources if source['type'] == 'balance'), None)
    source = next((source for source in sources if source['id'] == content['id']))
    Dwolla.transfer(source['id'], wallet['id'], content['amount'])
    return jsonify(
        status='success'
    )

@api_kyc.route('/link-bank-account', methods=['GET'])
@permission_required()
def link_bank_account() -> Any:
    req = transact_request('linkExternalAccount', {'accountId': current_user.account_id})

    if req['statusCode'] == '101':
        return jsonify(
            status='success',
            url=req['accountDetails']
        )
    elif req['statusCode'] == '715':
        return jsonify(
            status='success',
            url='ADDED'
        )
    else:
        raise CustomError(req['statusDesc'])

@api_kyc.route('/link-credit-card', methods=['GET'])
@permission_required()
def link_credit_card() -> Any:
    req = transact_request('linkCreditCard', {'accountId': current_user.account_id})

    if req['statusCode'] == '101':
        return jsonify(
            status='success',
            url=req['accountDetails']
        )
    elif req['statusCode'] == '710':
        return jsonify(
            status='success',
            url='ADDED'
        )
    elif req['statusCode'] == '106':
        return jsonify(
            status='success',
            url='NO_ACCOUNT'
        )
    else:
        raise CustomError(req['statusDesc'])

@api_kyc.route('/remove-dwolla-funding-source', methods=['POST'])
@permission_required()
def remove_dwolla_funding_source() -> Any:
    founding_source_Id = request.json['fundingSourceId']
    Dwolla.remove_funding_source(founding_source_Id)
    return jsonify(
        status='success'
    )