import React, { useContext, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { UserContext } from 'UserContext';
import { TransactContext } from 'TransactContext';
import {
  RightPageForm,
  PageContainer,
  LeftPageContainer,
  GradientHeader,
  HeaderSubtitle,
  LogoImage,
} from 'components/KYC/SplitPageForm';
import { SelectGroup } from 'components/KYC/SelectGroup';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { ErrorMessage } from 'components/ErrorMessage';
import queryString from 'query-string';

const YES_NO = ['Yes', 'No'];
const ONE_TO_FIVE = ['1', '2', '3', '4', '5'];
const EDUCATION_OPTIONS = ['High School or GED', '4 Year College or University', 'Graduate Degree', 'Other'];
const OBJECTIVE_OPTIONS = [
  'Primarily on Capital Preservation',
  'Both Capital Preservation and Growth',
  'Primarily Focused on Growth',
];

export const SuitabilityPage: React.FC = () => {
  const { refreshLoggedIn } = useContext(UserContext);
  const [error, setError] = useState<string>('');
  const { suitabilityFields, setSuitabilityFields, writeSuitability, refreshSuitability } = useContext(TransactContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();
  const [progress, setProgress] = useState<number>(0);
  const location = useLocation();
  const redirect = queryString.parse(location.search).redirect as string;
  const next_page = redirect ? `/connect?redirect=${encodeURIComponent(redirect)}` : '/connect';

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshSuitability();
      setIsLoading(false);
    })();
  }, [refreshSuitability]);

  const onSubimtForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await writeSuitability();
      await refreshLoggedIn();
      history.push(next_page);
    } catch (e) {
      setError(e.message);
      console.log('Error:', e);
      setIsLoading(false);
    }
  };

  const onChange = (propertyKey: string) => {
    return function (value: string) {
      setSuitabilityFields({ ...suitabilityFields, [propertyKey]: value });
      if (progress < SUITABILITY_QUESTIONS.length - 1) {
        setProgress(progress + 1);
      }
    };
  };

  const SUITABILITY_QUESTIONS = [
    <SelectGroup
      callback={onChange('riskProfile')}
      required={false}
      label="What level of risk are you comfortable with?"
      propertyKey="riskProfile"
      fields={suitabilityFields}
      setFields={setSuitabilityFields}
      options={ONE_TO_FIVE}
    />,
    <SelectGroup
      callback={onChange('investmentExperience')}
      required={false}
      label="How much invesment experience do you have?"
      propertyKey="investmentExperience"
      fields={suitabilityFields}
      setFields={setSuitabilityFields}
      options={ONE_TO_FIVE}
    />,
    <SelectGroup
      callback={onChange('privOffExperience')}
      required={false}
      label="How much investment experience do you have in private offerings?"
      propertyKey="privOffExperience"
      fields={suitabilityFields}
      setFields={setSuitabilityFields}
      options={ONE_TO_FIVE}
    />,
    <SelectGroup
      callback={onChange('education')}
      required={false}
      label="Highest Education Achieved"
      propertyKey="education"
      fields={suitabilityFields}
      setFields={setSuitabilityFields}
      options={EDUCATION_OPTIONS}
    />,
    <SelectGroup
      callback={onChange('financialAdvisor')}
      required={false}
      label="Do you have a financial advisor? "
      propertyKey="financialAdvisor"
      fields={suitabilityFields}
      setFields={setSuitabilityFields}
      options={YES_NO}
    />,
    <SelectGroup
      callback={onChange('investmentObjective')}
      required={false}
      label="What is your investment objective?"
      propertyKey="investmentObjective"
      fields={suitabilityFields}
      setFields={setSuitabilityFields}
      options={OBJECTIVE_OPTIONS}
    />,
  ];

  const backFunction = () => {
    if (progress === 0) {
      history.push('/employment');
    } else {
      setProgress(progress - 1);
    }
  };

  return (
    <PageContainer>
      {isLoading && <CenteredSpinner />}
      {!isLoading && (
        <>
          <LeftPageContainer />
          <RightPageForm onSubmit={onSubimtForm} back={backFunction} progress={'80%'}>
            <LogoImage />
            <GradientHeader>Answer a few questions about investing</GradientHeader>
            <HeaderSubtitle>
              To help you open a brokerage account we need to ask a few questions about you and your experience with
              investing.
            </HeaderSubtitle>
            {SUITABILITY_QUESTIONS[progress]}
            <ErrorMessage error={error} />
          </RightPageForm>
        </>
      )}
    </PageContainer>
  );
};
