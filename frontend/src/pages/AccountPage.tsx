import React, { useContext, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from 'UserContext';
import { TransactContext } from 'TransactContext';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { InputGroup } from 'components/KYC/InputGroup';
import { PhoneInput } from 'components/KYC/PhoneInput';
import { ZipInput } from 'components/KYC/ZipInput';
import {
  RightPageForm,
  PageContainer,
  LeftPageContainer,
  GradientHeader,
  HeaderSubtitle,
  LogoImage,
} from 'components/KYC/SplitPageForm';
import { CountryStateCombo } from 'components/KYC/CountryStateCombo';
import { ErrorMessage } from 'components/ErrorMessage';
import queryString from 'query-string';

export const AccountPage: React.FC = () => {
  const { refreshLoggedIn } = useContext(UserContext);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();
  const {
    accountRequiredFields,
    accountOptionalFields,
    setAccountRequiredFields,
    setAccountOptionalFields,
    writeAccount,
    refreshAccount,
  } = useContext(TransactContext);
  const location = useLocation();
  const redirect = queryString.parse(location.search).redirect as string;
  const next_page = redirect ? `/kyc?redirect=${encodeURIComponent(redirect)}` : '/kyc';

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshAccount();
      setIsLoading(false);
    })();
  }, [refreshAccount]);

  const onSubimtForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await writeAccount();
      await refreshLoggedIn();
      history.push(next_page);
    } catch (e) {
      setError(e.message);
      console.log('Error:', e);
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      {isLoading && <CenteredSpinner />}
      {!isLoading && (
        <>
          <LeftPageContainer />
          <RightPageForm onSubmit={onSubimtForm} progress="10%">
            <LogoImage />
            <GradientHeader>Help us verify your identity</GradientHeader>
            <HeaderSubtitle>
              We are required by law to collect certain information that helps us know it's you when you log in to
              Motyf, it's all about keeping your account safe!
            </HeaderSubtitle>
            <PhoneInput
              required={false}
              label="Phone number"
              propertyKey="phone"
              fields={accountOptionalFields}
              setFields={setAccountOptionalFields}
            />
            <InputGroup
              required={true}
              label="Primary Address Line 1"
              propertyKey="streetAddress1"
              fields={accountRequiredFields}
              setFields={setAccountRequiredFields}
            />
            <InputGroup
              required={false}
              label="Primary Address Line 2"
              propertyKey="streetAddress2"
              fields={accountOptionalFields}
              setFields={setAccountOptionalFields}
            />
            <InputBlock>
              <InputGroup
                required={true}
                label="City"
                propertyKey="city"
                fields={accountRequiredFields}
                setFields={setAccountRequiredFields}
              />
              <CountryStateCombo
                required={true}
                countryLabel="Country"
                stateLabel="State"
                countryKey="country"
                stateKey="state"
                fields={accountRequiredFields}
                setFields={setAccountRequiredFields}
              />
            </InputBlock>
            <ZipInput
              required={true}
              label="Zip Code"
              propertyKey="zip"
              fields={accountRequiredFields}
              setFields={setAccountRequiredFields}
            />
            <InputGroup
              required={false}
              label="Tax ID"
              propertyKey="taxID"
              fields={accountOptionalFields}
              setFields={setAccountOptionalFields}
            />
            <ErrorMessage error={error} />
          </RightPageForm>
        </>
      )}
    </PageContainer>
  );
};

const InputBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;
