import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';
import { UserContext } from 'UserContext';
import { TransactContext } from 'TransactContext';
import { CenteredSpinner } from 'components/CenteredSpinner';
import {
  RightPageForm,
  PageContainer,
  LeftPageContainer,
  GradientHeader,
  HeaderSubtitle,
  LogoImage,
} from 'components/KYC/SplitPageForm';
import { SelectInputGroup } from 'components/KYC/SelectInputGroup';
import { CalendarInput } from 'components/KYC/CalendarInput';
import { ErrorMessage } from 'components/ErrorMessage';
import queryString from 'query-string';

const DOMICILE_OPTIONS = ['U.S. Resident', 'U.S. Citizen', 'non-resident'];

export const KYCPage: React.FC = () => {
  const { refreshLoggedIn } = useContext(UserContext);
  const { partyRequiredFields, setPartyRequiredFields, refreshParty, writeParty } = useContext(TransactContext);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();
  const location = useLocation();
  const redirect = queryString.parse(location.search).redirect as string;
  const next_page = redirect ? `/credit-card?redirect=${encodeURIComponent(redirect)}` : '/credit-card';

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshParty();
      setIsLoading(false);
    })();
  }, [refreshParty]);

  const isNonResident = () => {
    return partyRequiredFields.domicile === 'non-resident';
  };

  const onSubimtForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await writeParty();
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
          <RightPageForm
            onSubmit={onSubimtForm}
            back={() => history.push('/account')}
            disabled={isNonResident()}
            progress={'40%'}
          >
            <LogoImage />
            <GradientHeader>Help us verify your identity</GradientHeader>
            <HeaderSubtitle>
              We are required by law to collect certain information that helps us know it's you when you log in to
              Motyf, it's all about keeping your account safe!
            </HeaderSubtitle>
            <CalendarInput
              label="Date of Birth (MM/DD/YYYY)"
              propertyKey="dob"
              fields={partyRequiredFields}
              setFields={setPartyRequiredFields}
              required={true}
            />
            <SelectInputGroup
              required={true}
              label="Domicile"
              propertyKey="domicile"
              fields={partyRequiredFields}
              setFields={setPartyRequiredFields}
              options={DOMICILE_OPTIONS}
            />
            {isNonResident() && (
              <DisabledMessage>Sorry, Motyf is only available to US Residents at this time</DisabledMessage>
            )}
            <ErrorMessage error={error} />
          </RightPageForm>
        </>
      )}
    </PageContainer>
  );
};

const DisabledMessage = styled.p`
  padding-left: 15px;
`;
