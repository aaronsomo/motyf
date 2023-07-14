import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { login } from 'api/auth';
import { UserContext } from 'UserContext';
import styled from 'styled-components';
import { ErrorMessage } from 'components/ErrorMessage';
// import { MOBILE_MAX_WIDTH } from '../constants';
import {
  RightPageForm,
  PageContainer,
  LeftPageContainer,
  GradientHeader,
  HeaderSubtitle,
  LogoImage,
} from 'components/KYC/SplitPageForm';

export const LoginPage: React.FC = () => {
  const { refreshLoggedIn } = useContext(UserContext);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const history = useHistory();

  const onClickSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    if ([email, password].some((val) => val === '')) {
      setError('All fields required');
      return;
    }

    try {
      await login({
        email,
        password,
        remember_me: rememberMe,
      });
      await refreshLoggedIn();
      history.push('/home');
    } catch (e) {
      setError(e.message);
      console.log('Error:', e);
    }
  };

  return (
    <PageContainer>
      <LeftPageContainer />
      <RightPageForm onSubmit={onClickSignIn}>
        <LoginInfo>
          <LogoImage />
          <GradientHeader>Sign in to Motyf</GradientHeader>
          <HeaderSubtitle>Welcome back! We're happy to see you.</HeaderSubtitle>
        </LoginInfo>
        <LoginForm>
          <LoginCombo>
            <LoginInput
              type="email"
              autoComplete="email"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </LoginCombo>
          <LoginCombo>
            <LoginInput
              type="password"
              autoComplete="current-password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </LoginCombo>
          <SignupMessage>
            Not on Motyf? <Link to={'/signup'}>Sign Up</Link>
          </SignupMessage>
          <LoginTerms>
            <Form.Group>
              <LoginCheck
                label={'Keep me signed in'}
                checked={rememberMe}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
              />
            </Form.Group>
          </LoginTerms>
          <ErrorMessage error={error} />
        </LoginForm>
      </RightPageForm>
    </PageContainer>
  );
};

const SignupMessage = styled.div`
  padding-top: 20px;
`;

const LoginTerms = styled.div`
  padding-top: 8px;
  display: flex;
`;

const LoginCheck = styled(Form.Check)`
  accent-color: white;
`;

const LoginForm = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-left: 10px;
`;

const LoginInput = styled.input`
  width: 100%;
  padding: 4px;
`;

const LoginCombo = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
`;

const LoginInfo = styled.div`
  display: flex;
  padding: 20px 5px;
  flex-direction: column;
`;
