import os
import requests
from base64 import b64encode
import json

NORCAP_API_KEY = os.environ.get('NORCAP_API_KEY')
NORCAP_CLIENT_ID = os.environ.get('NORCAP_CLIENT_ID')
NORCAP_API_PREFIX = os.environ.get('NORCAP_API_PREFIX')
NORCAP_UI_PREFIX = os.environ.get('NORCAP_UI_PREFIX')

def bytestring(value):
    return b64encode(value.encode('ascii')).decode('ascii')

def format_transact_url(path, key, value):
    # NOTE: This url returns an UNENCRYPTED developer key
    # It should only be called and returned in the api when the endpoint is admin only
    return f'{NORCAP_UI_PREFIX}{path}?{key}={bytestring(value)}&clientid={bytestring(NORCAP_CLIENT_ID)}&developerkey={bytestring(NORCAP_API_KEY)}'

def transact_request(endpoint, payload={}, method='POST'):
    url = NORCAP_API_PREFIX + endpoint
    payload.update({
        "developerAPIKey": NORCAP_API_KEY,
        "clientID": NORCAP_CLIENT_ID
    })
    headers = {"content-type": "application/json"}

    if method == 'POST':
        request = requests.post(url, json=payload, headers=headers)
        return json.loads(request.text.replace('\\', ''))
    elif method == 'PUT':
        return requests.put(url, json=payload, headers=headers).json()

def transact_upload(endpoint, payload={}, method='POST'):
    url = NORCAP_API_PREFIX + endpoint
    payload.update({
        ('clientID', (None, NORCAP_CLIENT_ID)),
        ('developerAPIKey', (None, NORCAP_API_KEY)),
    })
    return requests.post(url, files=payload, allow_redirects=True).json()