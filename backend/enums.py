from enum import Enum

class ERROR_CODES(str, Enum):
    # Login errors
    ERR_MISSING_FIELDS = 'ERR_MISSING_FIELDS'
    ERR_NO_EMAIL_OR_PASSWORD_PROVIDED = 'ERR_NO_EMAIL_OR_PASSWORD_PROVIDED'
    ERR_EMAIL_OR_PASSWORD_INCORRECT = 'ERR_EMAIL_OR_PASSWORD_INCORRECT'
    ERR_LOGIN_WITH_GMAIL = 'ERR_LOGIN_WITH_GMAIL'
    ERR_PASSWORD_RESET_NOT_SUPPORTED = 'ERR_PASSWORD_RESET_NOT_SUPPORTED'
    ERR_INVALID_AUTH_CODE = 'ERR_INVALID_AUTH_CODE'
    ERR_CODE_EXPIRED = 'ERR_INVALID_AUTH_CODE'
    ERR_USERNAME_EXISTS = 'ERR_USERNAME_EXISTS'

    # KYC Errors
    ERR_INCORRECT_EMAIL = 'ERR_INCORRECT_EMAIL'
    ERR_USER_PARTY_EXISTS='ERR_USER_PARTY_EXISTS'
    ERR_NO_PARTY='ERR_NO_PARTY'
    KYC_ALREADY_REQUESTED='KYC_ALREADY_REQUESTED'
    KYC_UNINITIATED='KYC_UNINITIATED'
    KYC_BAD_FILE_FORMAT = 'KYC_BAD_FILE_FORMAT'
    ERR_USER_ACCOUNT_EXISTS='ERR_USER_ACCOUNT_EXISTS'
    KYC_NOT_REQUESTED='KYC_NOT_REQUESTED'
    ERR_NO_ACCOUNT='ERR_NO_ACCOUNT'
    ERR_SUITABILITY_SUBMITTED='ERR_SUITABILITY_SUBMITTED'
    US_RESIDENTS_ONLY='US_RESIDENTS_ONLY'
    ERR_SUITABILITY_NOT_SUBMITTED='ERR_SUITABILITY_NOT_SUBMITTED'
    ERR_VALIDATION_FAILED='ERR_VALIDATION_FAILED'
    SIGNING_BAD_FILE_FORMAT='SIGNING_BAD_FILE_FORMAT'
    ERR_NO_CREDIT_CARD='ERR_NO_CREDIT_CARD'
    # General errors
    ERR_PERMISSION_DENIED = 'ERR_PERMISSION_DENIED'

class Permission(Enum):
  USER = 'USER'
  KYC_USER = 'KYC_USER'
  ADMIN = 'ADMIN'

class OnboardingStatuses(Enum):
  INVESTOR_DETAILS_NEEDED = 'INVESTOR_DETAILS_NEEDED'
  KYC_CHECK_NEEDED = 'KYC_CHECK_NEEDED'
  KYC_DOCUMENT_REQUEST_NEEDED = 'KYC_DOCUMENT_REQUEST_NEEDED'
  KYC_DOCUMENTS_NEEDED = 'KYC_DOCUMENTS_NEEDED'
  KYC_MANUAL_APPROVAL_NEEDED = 'KYC_MANUAL_APPROVAL_NEEDED'
  ACCOUNT_DETAILS_NEEDED = 'ACCOUNT_DETAILS_NEEDED'
  ACCOUNT_SUITABILITY_NEEDED = 'ACCOUNT_SUITABILITY_NEEDED'
  WEB3_WALLET_NEEDED = 'WEB3_WALLET_NEEDED'
  ONBOARDING_COMPLETE = 'ONBOARDING_COMPLETE'


PARTY_REQUIRED_FIELDS = [
    'domicile',
    'firstName',
    'lastName',
    'dob',
    'primCountry',
    'primAddress1',
    'primCity',
    'primState',
    'primZip',
    'emailAddress',
]

PARTY_OPTIONAL_FIELDS = [
    'middleInitial',
    'primAddress2',
    'socialSecurityNumber',
    'phone',
    'occupation',
    'associatedPerson',
    'empName',
    'empAddress1',
    'empAddress2',
    'empCity',
    'empState',
    'empCountry',
    'empZip',
    'currentAnnIncome',
    'avgAnnIncome',
    'currentHouseholdIncome',
    'avgHouseholdIncome',
    'householdNetworth',
    'empStatus',
]

ACCOUNT_REQUIRED_FIELDS = [
  'streetAddress1',
  'city',
  'state',
  'zip',
  'country',
]

ACCOUNT_OPTIONAL_FIELDS = [
  'streetAddress2',
  'email',
  'phone',
  'taxID',
]

SUITABILITY_FIELDS = [
  'riskProfile',
  'investmentExperience',
  'privOffExperience',
  'pctPrivSecurities',
  'pctIlliquidSecurities',
  'pctLiquidSecurities',
  'pctRealEstate',
  'timeHorizon',
  'education',
  'financialAdvisor',
  'investmentObjective',
]

TRADE_FIELDS = [
  'offeringId',
  'orderId',
  'totalAmount',
  'totalShares',
  'esignStatus',
  'transactionType',
  'orderStatus',
  'trade_createdDate',
  'issueName'
]
