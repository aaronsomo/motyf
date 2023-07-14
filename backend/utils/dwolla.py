import os
import requests
from base64 import b64encode
import json
from dwollav2 import Client, ExpiredAccessTokenError, ValidationError, InvalidAccessTokenError
from utils.transact_api import transact_request
from models import db
from utils.custom_error import CustomError

def reformat_dob(dob):
    mm, dd, yyyy = dob.split('-')
    return f'{yyyy}-{mm}-{dd}'

class DwollaClient:
    def __init__(self) -> None:
        if os.environ['ENVIRONMENT'] == 'test':
            self.client = None
            self.token = None
        else:
            client = Client(
                key = os.environ['DWOLLA_KEY'],
                secret = os.environ['DWOLLA_SECRET'],
                environment = 'sandbox', # defaults to 'production'
            )
            self.client = client
            self.token = client.Auth.client()

    def add_bank(self, current_user, routing, account, atype, name):
        body = {
          'routingNumber': routing,
          'accountNumber': account,
          'bankAccountType': atype,
          'name': name
        }

        funding_sources = self.post(f'customers/{current_user.dwolla_id}/funding-sources', body)
        return funding_sources.headers['location']

    def request_verify_bank(self, funding_source):
        req = self.post(f'funding-sources/{funding_source}/micro-deposits')

    def verify_bank(self, funding_source, amount1, amount2):
        body = {
            'amount1': {'value': amount1, 'currency': 'USD'},
            'amount2': {'value': amount2, 'currency': 'USD'}
        }
        req = self.post(f'funding-sources/{funding_source}/micro-deposits', body)

    def wallet(self, current_user):
        sources = self.funding_sources(current_user)
        wallet = next((source for source in sources if source['type'] == 'balance'), None)
        return wallet

    def balance(self, current_user):
        wallet = self.wallet(current_user)
        balance = Dwolla.get(wallet['_links']['balance']['href'])
        return balance.body['balance']

    def funding_sources(self, current_user):
        funding_sources = self.get(f'customers/{current_user.dwolla_id}/funding-sources')
        # dwolla doesn't get rid of the funding source, they just change the "removed" flag to true if we post to "remove"
        non_removed_funding_sources = [funding_source for funding_source in funding_sources.body['_embedded']['funding-sources'] if funding_source['removed'] == False]
        # return funding_sources.body['_embedded']['funding-sources']
        return non_removed_funding_sources

    def transfer(self, source, destination, amount, key = None):
        headers = {}
        if key:
            headers = {
              'Idempotency-Key': str(key)
            }

        request_body = {
          '_links': {
            'source': {
              'href': f'https://api-sandbox.dwolla.com/funding-sources/{source}'
            },
            'destination': {
              'href': f'https://api-sandbox.dwolla.com/funding-sources/{destination}'
            }
          },
          'amount': {
            'currency': 'USD',
            'value': f'{amount}'
          },
        }
        transfer = self.post('transfers', request_body, headers=headers)

        return transfer.headers['location']


    def get_or_create_customer(self, current_user):
        if current_user.dwolla_id:
            return current_user.dwolla_id

        preq = transact_request('getParty', { 'partyId': current_user.party_id })
        areq = transact_request('getAccount', { 'accountId': current_user.account_id })
        if areq['statusCode'] == '101' and preq['statusCode'] == '101':
            details = preq['partyDetails'][0]
            account_details = areq['accountDetails']
            try:
                create_customer = self.post('customers', 
                    {
                        'firstName': details['firstName'],
                        'lastName': details['lastName'],
                        'email': details['emailAddress'],
                        'type': 'personal',
                        'address1': account_details['address1'],
                        'city': account_details['city'],
                        'state': account_details['state'],
                        'postalCode': account_details['zip'],
                        'dateOfBirth': reformat_dob(details['dob']),
                        'ssn': details['socialSecurityNumber'],
                    }
                )
            except ValidationError as e:
                error = json.loads(str(e))
                messages = error['_embedded']['errors']
                raise CustomError(' '.join([message['message'] for message in messages]))
            current_user.dwolla_id = create_customer.headers['location'].split('/')[-1]
            db.session.commit()
            return current_user.dwolla_id
        else:
            raise CustomError('You need to complete onboarding before creating a secondary marketplace wallet')

    def get(self, resource, params = {}, headers = {}):
        try:
            return self.token.get(resource, params, headers)
        except (InvalidAccessTokenError, ExpiredAccessTokenError) as e:
            print(e)
            self.token = self.client.Auth.client()
        return self.token.get(resource, params, headers)

    def post(self, resource, params = {}, headers = {}):
        try:
            return self.token.post(resource, params, headers)
        except (InvalidAccessTokenError, ExpiredAccessTokenError) as e:
            print(e)
            self.token = self.client.Auth.client()
        return self.token.post(resource, params, headers)
    
    def remove_funding_source(self, funding_source_id):
        print("funding source id: ", funding_source_id)
        request_body = {
            'removed': True
        }
        funding_sources = self.post(f'https://api-sandbox.dwolla.com/funding-sources/{funding_source_id}', request_body)
        # print("funding_sources: ", json.dumps(funding_sources.body))
        return funding_sources


Dwolla = DwollaClient()