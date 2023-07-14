import React, { useContext } from 'react';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { Redirect } from 'react-router-dom';
import { UserContext } from 'UserContext';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

const ONBOARDING_STATES: Record<string, string> = {
  ACCOUNT_DETAILS_NEEDED: 'account',
  INVESTOR_DETAILS_NEEDED: 'kyc',
  KYC_CHECK_NEEDED: 'employment',
  ACCOUNT_SUITABILITY_NEEDED: 'suitability',
  KYC_DOCUMENT_REQUEST_NEEDED: 'upload',
  KYC_DOCUMENTS_NEEDED: 'upload',
  KYC_MANUAL_APPROVAL_NEEDED: 'home',
  WEB3_WALLET_NEEDED: 'connect',
  ONBOARDING_COMPLETE: 'home',
};

export const OnboardRedirectPage: React.FC = () => {
  const { onboardingStatus } = useContext(UserContext);
  const location = useLocation();
  const redirect = queryString.parse(location.search).redirect as string;
  const redirectOrNothing = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';

  if (onboardingStatus === undefined || onboardingStatus === null) return <CenteredSpinner />;
  if (ONBOARDING_STATES[onboardingStatus] === 'home') {
    if (redirectOrNothing === '') {
      return <Redirect to={'/home'} />;
    } else {
      return <Redirect to={redirectOrNothing} />;
    }
  }
  return <Redirect to={`/${ONBOARDING_STATES[onboardingStatus]}${redirectOrNothing}`} />;
};
