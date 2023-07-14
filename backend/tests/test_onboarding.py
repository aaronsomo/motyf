import json

from tests import client
from tests.helpers.auth_helpers import register_and_login_user, DEFAULT_USER
from tests.helpers.onboard_helpers import post_account_content, post_party_content, post_suitability_content, upload_kyc_file, post_add_wallet
from tests.helpers.transact_responses import mock_transact, called_endpoints, FAIL_KYC_CHECK
from models import db, User, Account, Party

def test_kyc(client, mocker):
    register_and_login_user(client)
    mocked = mock_transact(mocker, 'endpoints.api_kyc.transact_request')
    data = post_account_content(client).json
    user = db.session.query(User).filter(User.email == DEFAULT_USER).first()

    assert data['accountId'] == user.account_id, 'Account ID is saved to user'
    account = db.session.query(Account).filter(Account.account_id == user.account_id).first()
    assert account, 'Account is created in the database'

    calls = mocked.call_args_list
    assert calls[0].args[0] == 'createAccount', 'First post to upsert creates the account'
    data = post_account_content(client).json
    assert calls[1].args[0] == 'updateAccount', 'Second post to upsert updates account'
    assert len(calls) == 2, 'Transct API is called twice'

    data = post_party_content(client).json
    user = db.session.query(User).filter(User.email == DEFAULT_USER).first()
    assert user.party_id == data['partyId']
    party = db.session.query(Party).filter(Party.party_id == user.party_id).first()
    assert party, 'Party is created in the database'

    calls = mocked.call_args_list
    assert calls[2].args[0] == 'getAccount', 'Account is fetched for autofill'
    assert calls[3].args[0] == 'createParty', 'Party is created'
    assert calls[3].args[1]['primZip'] == calls[0].args[1]['zip'], 'Missing party fields are autofilled by account'
    assert calls[3].args[1]['primAddress1'] != calls[0].args[1]['streetAddress1'], 'Filled party fields are used'
    assert calls[4].args[0] == 'createLink', 'Party and Account are linked'

    data = post_party_content(client).json

    assert calls[5].args[0] == 'updateParty', 'Party is updated on second post'

def test_kyc_check(client, mocker):
    register_and_login_user(client)
    mocked = mock_transact(mocker, 'endpoints.api_kyc.transact_request')
    post_account_content(client)
    post_party_content(client)
    data = client.get('/api/kyc/perform-kyc').json
    assert data['status'] == 'success'
    data = client.get('/api/kyc/perform-kyc').json
    assert data['status'] == 'success'
    assert called_endpoints(mocked).count('performKycAmlBasic') == 1, 'KYC is only requested once'

def test_suitability(client, mocker):
    register_and_login_user(client)
    mocked = mock_transact(mocker, 'endpoints.api_kyc.transact_request')
    post_account_content(client)
    post_party_content(client)
    client.get('/api/kyc/perform-kyc')
    post_suitability_content(client)
    data = post_suitability_content(client)
    assert called_endpoints(mocked).count('calculateSuitability') == 1, 'Suitability is only created once'
    assert called_endpoints(mocked).count('updateSuitability') == 1, 'Suitability updated once'

def test_auto_approved_onboarding_status(client, mocker):
    signature_email = 'adam.test@hypotenuse.ca'
    register_and_login_user(client, email=signature_email)
    onboarding_mocked = mock_transact(mocker, 'utils.onboarding_status.transact_request')
    kyc_mocked = mock_transact(mocker, 'endpoints.api_kyc.transact_request')
    assert 'ACCOUNT_DETAILS_NEEDED' == get_onboarding_status(client)
    post_account_content(client)
    assert 'INVESTOR_DETAILS_NEEDED' == get_onboarding_status(client)
    post_party_content(client)
    assert 'KYC_CHECK_NEEDED' == get_onboarding_status(client)
    client.get('/api/kyc/perform-kyc')
    assert 'ACCOUNT_SUITABILITY_NEEDED' == get_onboarding_status(client)
    post_suitability_content(client)
    assert 'WEB3_WALLET_NEEDED' == get_onboarding_status(client)
    post_add_wallet(
        client,
        '0x42b0427d7d7799ea4c7d70672334ed7c71c08288',
        '0xa3fb9d4dbfc08e4c867c257913f1288931d69ce0f308fbb80bbcecccbd9f2e0244a2c2674c8a2590ca0de0904128e57c5779c22ce37fa7edfc238432fa07d8d11c'
    )
    assert 'ONBOARDING_COMPLETE' == get_onboarding_status(client)

def test_denied_onboarding_status(client, mocker):
    signature_email = 'adam.test@hypotenuse.ca'
    register_and_login_user(client, email=signature_email)
    onboarding_mocked = mock_transact(mocker, 'utils.onboarding_status.transact_request', {'getKycAml': FAIL_KYC_CHECK})
    kyc_mocked = mock_transact(mocker, 'endpoints.api_kyc.transact_request')
    upload_mocked = mock_transact(mocker, 'endpoints.api_kyc.transact_upload')
    assert 'ACCOUNT_DETAILS_NEEDED' == get_onboarding_status(client)
    post_account_content(client)
    assert 'INVESTOR_DETAILS_NEEDED' == get_onboarding_status(client)
    post_party_content(client)
    assert 'KYC_CHECK_NEEDED' == get_onboarding_status(client)
    client.get('/api/kyc/perform-kyc')
    assert 'ACCOUNT_SUITABILITY_NEEDED' == get_onboarding_status(client)
    post_suitability_content(client)
    assert 'WEB3_WALLET_NEEDED' == get_onboarding_status(client)
    post_add_wallet(
        client,
        '0x42b0427d7d7799ea4c7d70672334ed7c71c08288',
        '0xa3fb9d4dbfc08e4c867c257913f1288931d69ce0f308fbb80bbcecccbd9f2e0244a2c2674c8a2590ca0de0904128e57c5779c22ce37fa7edfc238432fa07d8d11c'
    )
    assert 'KYC_DOCUMENTS_NEEDED' == get_onboarding_status(client)
    upload_kyc_file(client)
    assert 'KYC_MANUAL_APPROVAL_NEEDED' == get_onboarding_status(client)
    onboarding_mocked = mock_transact(mocker, 'utils.onboarding_status.transact_request')
    assert 'ONBOARDING_COMPLETE' == get_onboarding_status(client)

def test_add_wallet(client):
    signature_email = 'adam.test@hypotenuse.ca'
    register_and_login_user(client, email=signature_email)
    user = db.session.query(User).filter(User.email == signature_email).first()
    assert not user.external_wallet, 'No wallet set by default'
    post_add_wallet(
        client,
        '0x42b0427d7d7799ea4c7d70672334ed7c71c08288',
        '0x7223f292b9da4ce06420c21b0087567aee5389106ca6364342d22888ba56479c2861e3806c1d6e9a7159459c620033dcc7e65bce4eb907dcfc5819a87909d8a21b'
    )
    assert not user.external_wallet, 'Invalid signature doesnt set the wallet address'
    post_add_wallet(
        client,
        '0x42b0427d7d7799ea4c7d70672334ed7c71c08288',
        '0xa3fb9d4dbfc08e4c867c257913f1288931d69ce0f308fbb80bbcecccbd9f2e0244a2c2674c8a2590ca0de0904128e57c5779c22ce37fa7edfc238432fa07d8d11c'
    )
    assert user.external_wallet == '0x42b0427d7d7799ea4c7d70672334ed7c71c08288', 'valid signature sets the wallet address'

def get_onboarding_status(client):
    return client.get('/api/auth/check-login').json['onboarding_status']
