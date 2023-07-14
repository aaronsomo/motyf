

GET_ALL_PARTIES = {
  'statusCode': '101',
  'statusDesc': 'Ok',
  'partyDetails': [
    {'partyId': 'P1497737', 'firstName': 'uon', 'middleInitial': None, 'lastName': 'oniu', 'domicile': 'U.S. Resident', 'socialSecurityNumber': '', 'dob': '02-16-1997', 'primAddress1': 'i', 'primAddress2': 'oin', 'primCity': 'nooi', 'primState': 'noin', 'primZip': 'nio', 'primCountry': 'oin', 'emailAddress': 'admin@example.com', 'emailAddress2': '', 'phone': None, 'phone2': None, 'occupation': '', 'associatedPerson': None, 'empStatus': None, 'empName': '', 'empCountry': '', 'empAddress1': '', 'empAddress2': '', 'empCity': '', 'empState': '', 'empZip': None, 'invest_to': None, 'currentAnnIncome': None, 'avgAnnIncome': None, 'currentHouseholdIncome': None, 'avgHouseholdIncome': None, 'householdNetworth': None, 'kycStatus': None, 'amlStatus': None, 'amlDate': None, 'tags': '', 'notes': '', 'esignStatus': 'NOTSIGNED', 'documentKey': '', 'field1': '', 'field2': '', 'field3': '', 'createdDate': '2022-10-27 18:58:34', 'updatedDate': '2022-10-27 18:58:34'}
  ]
}

CREATE_ACCOUNT = {
  "statusCode": "101",
  "statusDesc": "Ok",
  "accountDetails": [{
    'accountId': 'A1234', 'kycStatus': 'Pending', 'amlStatus': 'Pending', 'accreditedStatus': 'Pending', 'approvalStatus': 'Pending'
  }]
}

GET_ACCOUNT = {
  'statusCode': '101',
  'statusDesc': 'Ok',
  'accountDetails': {
    'accountId': 'A1234', 'accountName': 'bob jones', 'type': 'Individual', 'entityType': None, 'residentType': 'domestic_account', 'address1': '123 Fake St', 'address2': '', 'city': 'Los Angeles', 'state': 'CA', 'zip': '90210', 'country': 'United States', 'email': '', 'phone': None, 'taxID': None, 'kycStatus': 'Pending', 'kycDate': None, 'amlStatus': 'Pending', 'amlDate': None, 'suitabilityScore': None, 'suitabilityDate': None, 'suitabilityApprover': None, 'accreditedStatus': 'Pending', 'accreditedInvestor': None, 'accreditedInvestorDate': None, '506cLimit': None, 'accountTotalLimit': None, 'singleInvestmentLimit': None, 'associatedAC': None, 'syndicate': 'syndicate', 'tags': '', 'notes': '', 'approvalStatus': 'Pending', 'approvalPrincipal': None, 'approvalLastReview': None, 'field1': '', 'field2': '', 'field3': '', 'createdDate': '2022-11-22 19:22:02', 'updatedDate': '0000-00-00 00:00:00'
  }
}

CREATE_PARTY = {
  'statusCode': '101',
  'statusDesc': 'Ok',
  'partyDetails': [
    True, [{'partyId': 'P1234', 'KYCstatus': None, 'AMLstatus': None}]
  ]
}

CREATE_LINK = {
  'statusCode': '101',
  'statusDesc': 'Ok',
  'linkDetails': [
    True, [{'id': '583500'}]
  ]
}

KYC_CHECK = {
  "statusCode": "101",
  "statusDesc": "Ok",
  "kyc": {
    "response": {
      "id-number": "3298151570",
      "summary-result": {
        "key": "id.success",
        "message": "PASS"
      },
      "results": {
        "key": "result.match",
        "message": "ID Located"
      },
      "qualifiers": {
        "qualifier": [
          {
            "key": "resultcode.address.does.not.match",
            "message": "Address Does Not Match"
          },
          {
            "key": "resultcode.street.number.does.not.match",
            "message": "Street Number Does Not Match"
          }
        ]
      },
      "idnotescore": "0"
    },
    "kycstatus": "Auto Approved",
    "amlstatus": "Auto Approved"
  }
}

GET_KYC_CHECK = {
  "statusCode": "101",
  "statusDesc": "Ok",
  "KYC Status":"Auto Approved",
  "Party Status":{
      "PartyID":"P41331",      
      "AML status":"Auto Approved",
      "AML date":"08-06-2018"
  }
}

FAIL_KYC_CHECK = {
  "statusCode": "101",
  "statusDesc": "Ok",
  "KYC Status":"Disapproved",
  "Party Status":{
      "PartyID":"P41331",      
      "AML status":"Disapproved",
      "AML date":"08-06-2018"
  }
}

CREATE_SUITABILITY = {
  "statusCode": "101",
  "statusDesc": "Ok",
  "accountDetails": [{
    "accountId": "A1234"
  }]
}

UPLOAD_FILE = {
  "statusCode": "101",
  "statusDesc": "Ok",
  "document_details": "Document has been uploaded Successfully"
}

ENDPOINTS_TO_DATA = {
  'getAllParties': GET_ALL_PARTIES,
  'createAccount': CREATE_ACCOUNT,
  'updateAccount': CREATE_ACCOUNT,
  'getAccount': GET_ACCOUNT,
  'createParty': CREATE_PARTY,
  'updateParty': CREATE_PARTY,
  'createLink': CREATE_LINK,
  'performKycAmlBasic': KYC_CHECK,
  'getKycAml': GET_KYC_CHECK,
  'calculateSuitability': CREATE_SUITABILITY,
  'updateSuitability': CREATE_SUITABILITY,
  'requestUploadPartyDocument': UPLOAD_FILE,
  'uploadPartyDocument': UPLOAD_FILE

}

def called_endpoints(mocked):
  return [call.args[0] for call in mocked.call_args_list]

def mock_transact_api(overrides):
  # return a function that overrides the defaults
  def mock_api(endpoint, payload = {}, method = 'POST'):
    if endpoint in overrides:
      return overrides[endpoint]
    return transact_mock_defaults(endpoint, payload, method)

  return mock_api

def transact_mock_defaults(endpoint, payload = {}, method = 'POST'):
  if endpoint in ENDPOINTS_TO_DATA:
    return ENDPOINTS_TO_DATA[endpoint]
  assert False, 'Transact endpoint not found: ' + endpoint

def mock_transact(mocker, path, overrides = {}):
    return mocker.patch(path, side_effect=mock_transact_api(overrides))