from enums import OnboardingStatuses
from utils.transact_api import transact_request

def onboarding_status_sync(user, kyc_status):
    if not user.account():
        return OnboardingStatuses.ACCOUNT_DETAILS_NEEDED.value
    if not user.party():
        return OnboardingStatuses.INVESTOR_DETAILS_NEEDED.value
    if not user.party().kyc_requested:
        return OnboardingStatuses.KYC_CHECK_NEEDED.value
    if not user.account().suitability_submitted:
        return OnboardingStatuses.ACCOUNT_SUITABILITY_NEEDED.value
    if not user.external_wallet:
        return OnboardingStatuses.WEB3_WALLET_NEEDED.value
    if not 'Approved' in kyc_status:
        if not user.party().kyc_request_uploads:
            return OnboardingStatuses.KYC_DOCUMENTS_NEEDED.value
        return OnboardingStatuses.KYC_MANUAL_APPROVAL_NEEDED.value
    return OnboardingStatuses.ONBOARDING_COMPLETE.value

def onboarding_status(user):
    if not user.account():
        return OnboardingStatuses.ACCOUNT_DETAILS_NEEDED.value
    if not user.party():
        return OnboardingStatuses.INVESTOR_DETAILS_NEEDED.value
    if not user.party().kyc_requested:
        return OnboardingStatuses.KYC_CHECK_NEEDED.value
    if not user.account().suitability_submitted:
        return OnboardingStatuses.ACCOUNT_SUITABILITY_NEEDED.value
    if not user.external_wallet:
        return OnboardingStatuses.WEB3_WALLET_NEEDED.value
    # Transact accounts are created, need to check KYC status
    req = transact_request('getKycAml', { 'partyId': user.party_id })
    kyc_status = req['KYC Status']
    if not 'Approved' in kyc_status:
        if not user.party().kyc_request_uploads:
            return OnboardingStatuses.KYC_DOCUMENTS_NEEDED.value
        return OnboardingStatuses.KYC_MANUAL_APPROVAL_NEEDED.value
    return OnboardingStatuses.ONBOARDING_COMPLETE.value

