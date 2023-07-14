import React, { useContext, useState, useEffect } from 'react';
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
import { ErrorMessage } from 'components/ErrorMessage';
import { InputGroup } from 'components/KYC/InputGroup';
import { requestKYCStatus } from 'api/kyc';
import { ALL_OCCUPATIONS } from '../constants';
import { SSNInput } from 'components/KYC/SSNInput';
import queryString from 'query-string';

const EMPLOYMENT_STATUSES = ['Employed', 'Not Employed', 'Retired', 'Student'];

export const EmploymentPage: React.FC = () => {
  const { refreshLoggedIn } = useContext(UserContext);
  const { partyOptionalFields, setPartyOptionalFields, writeParty, refreshParty } = useContext(TransactContext);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();
  const location = useLocation();
  const redirect = queryString.parse(location.search).redirect as string;
  const next_page = redirect ? `/suitability?redirect=${encodeURIComponent(redirect)}` : '/suitability';

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshParty();
      setIsLoading(false);
    })();
  }, [refreshParty]);

  const isEmployed = () => {
    return partyOptionalFields.empStatus === 'Employed';
  };

  const onChangeCallback = (value: string) => {
    if (value !== 'Employed') {
      setPartyOptionalFields({ ...partyOptionalFields, empName: '', occupation: '', empStatus: value });
    } else {
      setPartyOptionalFields({ ...partyOptionalFields, empStatus: value });
    }
  };

  const onSubimtForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await writeParty();
      await requestKYCStatus();
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
          <RightPageForm onSubmit={onSubimtForm} back={() => history.push('/credit-card')} progress={'60%'}>
            <LogoImage />
            <GradientHeader>Help us verify your identity</GradientHeader>
            <HeaderSubtitle>
              We are required by law to collect certain information that helps us know it's you when you log in to
              Motyf, it's all about keeping your account safe!
            </HeaderSubtitle>
            <SelectInputGroup
              required={false}
              label="Employment Status"
              propertyKey="empStatus"
              fields={partyOptionalFields}
              setFields={setPartyOptionalFields}
              options={EMPLOYMENT_STATUSES}
              callback={onChangeCallback}
            />
            {isEmployed() && (
              <>
                <SelectInputGroup
                  required={false}
                  label="Occupation"
                  propertyKey="occupation"
                  fields={partyOptionalFields}
                  setFields={setPartyOptionalFields}
                  options={ALL_OCCUPATIONS}
                />
                <InputGroup
                  required={false}
                  label="Employer Name"
                  propertyKey="empName"
                  fields={partyOptionalFields}
                  setFields={setPartyOptionalFields}
                />
              </>
            )}
            <SSNInput
              required={true}
              label="Social Security Number"
              propertyKey="socialSecurityNumber"
              fields={partyOptionalFields}
              setFields={setPartyOptionalFields}
            />
            <ErrorMessage error={error} />
          </RightPageForm>
        </>
      )}
    </PageContainer>
  );
};
