export enum ErrorCodes {
  // Session errors
  ERR_SESSION_EXPIRED = 'ERR_SESSION_EXPIRED',
  ERR_NO_SESSION_ID = 'ERR_NO_SESSION_ID',
  ERR_MISSING_FIELDS = 'ERR_MISSING_FIELDS',
  // Login errors
  ERR_NO_EMAIL_OR_PASSWORD_PROVIDED = 'ERR_NO_EMAIL_OR_PASSWORD_PROVIDED',
  ERR_EMAIL_OR_PASSWORD_INCORRECT = 'ERR_EMAIL_OR_PASSWORD_INCORRECT',
  ERR_PASSWORD_RESET_NOT_SUPPORTED = 'ERR_PASSWORD_RESET_NOT_SUPPORTED',
  ERR_INVALID_AUTH_CODE = 'ERR_INVALID_AUTH_CODE',
  ERR_CODE_EXPIRED = 'ERR_INVALID_AUTH_CODE',
  ERR_USERNAME_EXISTS = 'ERR_USERNAME_EXISTS',

  // KYC Errors
  ERR_INCORRECT_EMAIL = 'ERR_INCORRECT_EMAIL',
  ERR_USER_PARTY_EXISTS = 'ERR_USER_PARTY_EXISTS',
  ERR_NO_PARTY = 'ERR_NO_PARTY',
  KYC_ALREADY_REQUESTED = 'KYC_ALREADY_REQUESTED',
  KYC_UNINITIATED = 'KYC_UNINITIATED',
  ERR_USER_ACCOUNT_EXISTS = 'ERR_USER_ACCOUNT_EXISTS',
  KYC_BAD_FILE_FORMAT = 'KYC_BAD_FILE_FORMAT',
  KYC_NOT_REQUESTED = 'KYC_NOT_REQUESTED',
  ERR_NO_ACCOUNT = 'ERR_NO_ACCOUNT',
  ERR_SUITABILITY_SUBMITTED = 'ERR_SUITABILITY_SUBMITTED',
  ERR_SUITABILITY_NOT_SUBMITTED = 'ERR_SUITABILITY_NOT_SUBMITTED',
  US_RESIDENTS_ONLY = 'US_RESIDENTS_ONLY',
  ERR_VALIDATION_FAILED = 'ERR_VALIDATION_FAILED',
  SIGNING_BAD_FILE_FORMAT = 'SIGNING_BAD_FILE_FORMAT',
  ERR_NO_CREDIT_CARD = 'ERR_NO_CREDIT_CARD',
  // General errors
  ERR_PERMISSION_DENIED = 'ERR_PERMISSION_DENIED',
}

export const ERROR_MESSAGES = {
  [ErrorCodes.ERR_SESSION_EXPIRED]: 'Session Expired',
  [ErrorCodes.ERR_NO_SESSION_ID]: 'Missing Session ID',
  [ErrorCodes.ERR_MISSING_FIELDS]: 'Missing Fields',
  [ErrorCodes.ERR_NO_EMAIL_OR_PASSWORD_PROVIDED]: 'Missing Email or Password',
  [ErrorCodes.ERR_EMAIL_OR_PASSWORD_INCORRECT]: 'Incorrect Password',
  [ErrorCodes.ERR_PASSWORD_RESET_NOT_SUPPORTED]: 'Password Reset Not Supported',
  [ErrorCodes.ERR_INVALID_AUTH_CODE]: 'Invalid Authentication Code',
  [ErrorCodes.ERR_CODE_EXPIRED]: 'Invalid Authentication Code',
  [ErrorCodes.ERR_USERNAME_EXISTS]: 'Username Already Exists',
  [ErrorCodes.ERR_PERMISSION_DENIED]: 'Permission Denied',
  [ErrorCodes.ERR_INCORRECT_EMAIL]: 'Email does not match current user',
  [ErrorCodes.ERR_USER_PARTY_EXISTS]: 'User already created a party',
  [ErrorCodes.ERR_NO_PARTY]: 'User has not created a party',
  [ErrorCodes.KYC_ALREADY_REQUESTED]: 'User has already requested a KYC check',
  [ErrorCodes.KYC_UNINITIATED]: 'User has not begun KYC',
  [ErrorCodes.ERR_USER_ACCOUNT_EXISTS]: 'User has already created an account',
  [ErrorCodes.KYC_BAD_FILE_FORMAT]: 'Invalid format. Please upload a .jpg, .png or .pdf',
  [ErrorCodes.SIGNING_BAD_FILE_FORMAT]: 'Invalid format. Please upload a .pdf',
  [ErrorCodes.KYC_NOT_REQUESTED]: 'KYC has not been requested for this user',
  [ErrorCodes.ERR_NO_ACCOUNT]: 'User has not created an account',
  [ErrorCodes.ERR_SUITABILITY_SUBMITTED]: 'User has already submitted suitability survey',
  [ErrorCodes.US_RESIDENTS_ONLY]: 'Only US residents may register',
  [ErrorCodes.ERR_SUITABILITY_NOT_SUBMITTED]: 'Suitability not yet submitted',
  [ErrorCodes.ERR_VALIDATION_FAILED]: 'Unable to validate signature',
  [ErrorCodes.ERR_NO_CREDIT_CARD]: 'You need to add a credit card before checking out',
};
