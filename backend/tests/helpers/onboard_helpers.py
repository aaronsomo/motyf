import json
import io

DEFAULT_ACCOUNT_CONTENT = {
  'streetAddress1': '123 Fake St',
  'city': 'Los Angeles',
  'state': 'CA',
  'zip': '90210',
  'country': 'United States',
}

DEFAULT_PARTY_CONTENT = {
  'domicile': 'U.S Resident',
  'firstName': 'John',
  'lastName': 'Smith',
  'dob': '02-16-1997',
  'primCountry': 'United States',
  'primAddress1': '123 Party St',
  'primCity': 'Seattle',
  'primState': 'WA',
}

DEFAULT_SUITABILITY_CONTENT = {
  'riskProfile': '1'
}

DEFAULT_UPLOAD_FILE = {
  'file': (io.BytesIO(b"abcdef"), 'test.jpg')
}

def post_account_content(client, content = DEFAULT_ACCOUNT_CONTENT):
  return client.post(
    '/api/kyc/upsert-account',
    data=json.dumps(content),
    content_type='application/json'
  )

def post_party_content(client, content = DEFAULT_PARTY_CONTENT):
  return client.post(
    '/api/kyc/upsert-party',
    data=json.dumps(content),
    content_type='application/json'
  )

def post_suitability_content(client, content = DEFAULT_SUITABILITY_CONTENT):
  return client.post(
    '/api/kyc/upsert-suitability',
    data=json.dumps(content),
    content_type='application/json'
  )

def upload_kyc_file(client, content = DEFAULT_UPLOAD_FILE):
  return client.post(
    '/api/kyc/upload-kyc',
    data=DEFAULT_UPLOAD_FILE,
    content_type='multipart/form-data'
  )

def post_add_wallet(client, wallet, signature):
  return client.post(
    '/api/kyc/add-wallet',
    data=json.dumps({'wallet': wallet, 'signature': signature}),
    content_type='application/json'
  )