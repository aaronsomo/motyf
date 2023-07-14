import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { signup } from 'api/auth';
import { UserContext } from 'UserContext';
import styled from 'styled-components';
import { ErrorMessage } from 'components/ErrorMessage';
import {
  RightPageForm,
  PageContainer,
  LeftPageContainer,
  GradientHeader,
  HeaderSubtitle,
  LogoImage,
} from 'components/KYC/SplitPageForm';
import { MOBILE_MAX_WIDTH } from '../constants';
import { CenteredSpinner } from 'components/CenteredSpinner';

export const SignupPage: React.FC = () => {
  const { refreshLoggedIn } = useContext(UserContext);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [error, setError] = useState<string>('');
  const history = useHistory();

  const onClickSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    if ([firstName, lastName, email, password].some((val) => val === '')) {
      setError('All fields required');
      return;
    }

    try {
      await signup({
        email,
        password,
        remember_me: true,
        first_name: firstName,
        last_name: lastName,
      });
      await refreshLoggedIn();
      history.push('/account');
    } catch (e) {
      setIsLoading(false);
      console.log('Error:', e);
      setError(e.message);
    }
  };

  return (
    <PageContainer>
      {isLoading && <CenteredSpinner />}
      {!isLoading && (
        <>
          <LeftPageContainer />
          <RightPageForm onSubmit={onClickSignUp}>
            <LoginInfo>
              <LogoImage />
              <GradientHeader>Create your login</GradientHeader>
              <HeaderSubtitle>
                We'll need your name, email and a password.
                <br />
                You can use this info to access Motyf next time!
              </HeaderSubtitle>
            </LoginInfo>
            <LoginForm>
              <InputContainer>
                <LoginInput
                  placeholder="First name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <LoginInput
                  placeholder="Last name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </InputContainer>
              <InputContainer>
                <LoginInput
                  placeholder="Email address"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputContainer>
              <InputContainer>
                <LoginInput
                  placeholder="Password"
                  type="password"
                  autoComplete="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputContainer>
              <LoginTerms>
                <p>
                  By continuing, you agree to the <Link to="/"> Terms of Service</Link>
                </p>
              </LoginTerms>
              <LoginTerms>
                <p>
                  Already have an account? <Link to={'/login'}>Log in</Link>
                </p>
              </LoginTerms>
              <LoginTerms>
                <ErrorMessage error={error} />
              </LoginTerms>
            </LoginForm>
          </RightPageForm>
        </>
      )}
    </PageContainer>
  );
};

const LoginForm = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-left: 10px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    flex-direction: column;
  }
`;

const LoginTerms = styled.div`
  display: flex;
  padding-left: 8px;
  padding-top: 4px;
`;

const LoginInput = styled.input`
  padding: 4px;
  margin: 10px 5px;
  width: 100%;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    width: auto;
  }
`;

const LoginInfo = styled.div`
  display: flex;
  padding: 20px 5px;
  flex-direction: column;
`;
