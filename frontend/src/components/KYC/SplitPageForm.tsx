import React from 'react';
import styled from 'styled-components';
import { MOBILE_MAX_WIDTH } from '../../constants';
import { ProgressFooter } from 'components/KYC/ProgressFooter';
import Form from 'react-bootstrap/Form';
import loginImage from 'assets/login-image.jpeg';
import logoSvg from 'assets/logo.svg';

interface RightPageFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  back?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  progress?: string;
}

export const RightPageForm: React.FC<RightPageFormProps> = ({ onSubmit, back, disabled, progress, children }) => (
  <RightPageContainer onSubmit={onSubmit}>
    <FormContainer>{children}</FormContainer>
    <ProgressFooter buttonLabel={'Continue'} back={back} disabled={disabled} progress={progress} />
  </RightPageContainer>
);

export const LeftPageContainer = () => {
  return (
    <>
      <LeftContainer src={loginImage} />
      <LeftPageFade />
    </>
  );
};

export const LogoImage = () => {
  return <LogoImg src={logoSvg} />;
};

const LogoImg = styled.img`
  width: 60px;
  height: 60px;
  margin-left: 12px;
  margin-bottom: 25px;
`;

export const HeaderSubtitle = styled.div`
  margin-left: 10px;
  margin-bottom: 25px;
`;

export const GradientHeader = styled.h3`
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  width: fit-content;
  -webkit-text-fill-color: transparent;
  margin-left: 10px;
  margin-bottom: 20px;
`;

const LeftContainer = styled.img`
  width: 40vw;
  height: 100vh;
  object-fit: cover;
  overflow: hidden;

  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    display: none;
  }
`;

const LeftPageFade = styled.div`
  background: linear-gradient(269.55deg, #171717 -2.04%, rgba(0, 0, 0, 0));
  position: absolute;
  height: 100vh;
  width: 40vw;

  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    display: none;
  }
`;

const RightPageContainer = styled(Form)`
  width: 41vw;
  display: flex;
  flex-direction: column;
  padding: 2vw 2vw;
  padding-top: 20vh;
  margin-left: 10vw;
  margin-right: 10vw;

  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    padding: 0;
    padding-left: 4vw;
    height: fit-content;
    width: 96vw;
    overflow: scroll;
    margin: 0;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    padding: 2vh 0;
    height: 76vh;
    width: 90vw;
    overflow: scroll;
  }
`;

export const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;

  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    flex-direction: column;
    height: auto;
  }
`;
