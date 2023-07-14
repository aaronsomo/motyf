import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { CenteredSpinner } from 'components/CenteredSpinner';
import {
  RightPageForm,
  PageContainer,
  LeftPageContainer,
  GradientHeader,
  HeaderSubtitle,
  LogoImage,
} from 'components/KYC/SplitPageForm';
import { ErrorMessage } from 'components/ErrorMessage';
import { getCreditCardLink, getBankAccountLink } from 'api/kyc';
import styled from 'styled-components';
import queryString from 'query-string';
import secureSvg from 'assets/secure.svg';
import plaidSvg from 'assets/plaid.svg';

export const CreditCardPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [bankAccountLink, setBankAccountLink] = useState<string>('');
  const [creditCardLink, setCreditCardLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const history = useHistory();
  const location = useLocation();
  const redirect = queryString.parse(location.search).redirect as string;
  const next_page = redirect ? `/onboard-redirect?redirect=${encodeURIComponent(redirect)}` : '/onboard-redirect';

  const onSubimtForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await getCreditCardLink();
      history.push(next_page);
    } catch (e) {
      setError(e.message);
      console.log('Error:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const ccResponse = await getCreditCardLink();
        if (ccResponse.url === 'NO_ACCOUNT') {
          setError('You need to create an Account first');
        }
        setCreditCardLink(ccResponse.url);
        const baResponse = await getBankAccountLink();
        setBankAccountLink(baResponse.url);
      } catch (e) {
        setError(e.message);
        console.log('Error:', e);
      }
      setIsLoading(false);
    })();
  }, [history, redirect]);

  return (
    <PageContainer>
      {isLoading && <CenteredSpinner />}
      {!isLoading && (
        <>
          <LeftPageContainer />
          <RightPageForm onSubmit={onSubimtForm} back={() => history.push('/kyc')} progress={'60%'}>
            <LogoImage />
            <GradientHeader>Add your Payment Information</GradientHeader>
            <SubtitleContainer>
              <SecureImg src={secureSvg} />
              <HeaderSubtitle>
                We need your credit card to process transactions. Your information will remain safe and private.
              </HeaderSubtitle>
            </SubtitleContainer>
            {creditCardLink !== 'ADDED' && creditCardLink !== 'NO_ACCOUNT' && creditCardLink && (
              <CCFrame src={creditCardLink} />
            )}
            {creditCardLink === 'ADDED' && <CCAdded>Your credit card has been added successfully</CCAdded>}
            {bankAccountLink !== 'ADDED' && bankAccountLink && (
              <>
                <br />
                Or you can link your bank account
                <PlaidContainer href={bankAccountLink} target="_blank" rel="noopener noreferrer">
                  <img alt="Plaid" src={plaidSvg} />
                </PlaidContainer>
              </>
            )}
            {bankAccountLink === 'ADDED' && <CCAdded>Your bank account has been added successfully</CCAdded>}
            <ErrorMessage error={error} />
            {creditCardLink === 'NO_ACCOUNT' && (
              <a href="/account">
                <b>Create an Account</b>
              </a>
            )}
          </RightPageForm>
        </>
      )}
    </PageContainer>
  );
};

const SecureImg = styled.img`
  margin-bottom: 28px;
`;

const SubtitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const CCAdded = styled.p`
  padding: 10px 0;
`;

const CCFrame = styled.iframe`
  height: 350px;
  width: 100%;
  border: ;
`;

const PlaidContainer = styled.a`
  background-color: white;
  color: black;
  display: flex;
  justify-content: center;
  width: 50%;
  border-radius: 8px;
  margin-top: 10px;
`;
