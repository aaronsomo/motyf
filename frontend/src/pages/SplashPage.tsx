import React, { useContext, useState } from 'react';
import { UserContext } from 'UserContext';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import heroImage from 'assets/hero-image.jpg';
import logoSvg from 'assets/logo.svg';
import blackLogoSvg from 'assets/blackLogo.svg';
import cube1 from 'assets/cube1.png';
import cube2 from 'assets/cube2.png';
import cube3 from 'assets/cube3.png';
import arrow from 'assets/arrow.svg';
import Button from 'react-bootstrap/Button';
import { joinWaitlist } from 'api/auth';
import { FlashMessage } from 'components/FlashMessage';
import { MOBILE_MAX_WIDTH } from '../constants';
import Form from 'react-bootstrap/Form';

export const SplashPage: React.FC = () => {
  const { isLoggedIn, email } = useContext(UserContext);
  const [waitlistEmail, setWaitlistEmail] = useState<string>('');
  const history = useHistory();
  const [popupTimer, setPopupTimer] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const onShowPopup = () => {
    setShowPopup(true);
    setPopupTimer(
      window.setTimeout(() => {
        closePopup();
      }, 5000)
    );
  };

  const closePopup = () => {
    if (popupTimer) {
      clearTimeout(popupTimer);
      setPopupTimer(null);
    }
    setShowPopup(false);
  };
  const submitWaitlist = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await joinWaitlist({
        email: waitlistEmail,
      });
      onShowPopup();
    } catch (e) {
      console.log('Error:', e);
    }
  };

  return (
    <SplashContainer>
      {showPopup && <FlashMessage>You have been added to the waitlist.</FlashMessage>}
      <SplashImageContainer>
        <SplashImage src={heroImage} />
        <Header>
          <LogoImage src={logoSvg} />
          <HeaderBrand>M O T Y F</HeaderBrand>
          <HeaderButtons>
            {isLoggedIn && (
              <>
                <HeaderButton onClick={() => history.push('/home')}>{email}</HeaderButton>
                <MobileHeaderLink href="/home">Home</MobileHeaderLink>
              </>
            )}
            {!isLoggedIn && (
              <>
                <HeaderButton onClick={() => history.push('/signup')}>Sign up</HeaderButton>
                <HeaderButton onClick={() => history.push('/login')} className="btn-secondary">
                  Log in
                </HeaderButton>
                <MobileHeaderLink href="/login">Log In</MobileHeaderLink>
              </>
            )}
          </HeaderButtons>
        </Header>
        <Container>
          <HeroMessage>own yoUr fAvorIte ArtIst's MusIC cAtAlog royAltIes</HeroMessage>
        </Container>
        <WaitlistContainer onSubmit={submitWaitlist}>
          <WaitlistInput
            value={waitlistEmail}
            type="email"
            autoComplete="email"
            required
            placeholder="email"
            onChange={(e: any) => setWaitlistEmail(e.target.value)}
          />
          <WaitlistButton type="submit">
            <ArrowSvg src={arrow} alt="" />
            Join Waitlist
          </WaitlistButton>
        </WaitlistContainer>
      </SplashImageContainer>
      <AboutUsContainer>
        <AboutUsBlock>
          <Cube1 alt="" src={cube1} />
          <Cube2 alt="" src={cube2} />
          <Cube3 alt="" src={cube3} />
        </AboutUsBlock>
        <AboutUsBlock>
          <BlackLogoImage src={blackLogoSvg} />
          <FlipLogoImage src={logoSvg} />
          <AboutUsHeader>MOTYF</AboutUsHeader>
          <AboutUsGradient>Share royalties with your favorite band</AboutUsGradient>
          Motyf lets you buy music catalog royalties in an SEC- and FINRA-compliant way. Historically, only
          institutional investors have had access to catalog royalty assets. We're changing that! You can buy
          income-producing shares of your favorite creator's royalties for as little as $150.
        </AboutUsBlock>
      </AboutUsContainer>
      <Copyright>MOTYF 2023©</Copyright>
    </SplashContainer>
  );
};

const ArrowSvg = styled.img`
  width: 40px;
  margin-right: 15px;
  margin-bottom: 3px;
`;

const WaitlistButton = styled(Button)`
  min-width: 220px;
  width: 100%;
  border: none !important;
  border-radius: 0px !important;
  padding-bottom: 11px !important;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    flex-direction: column;
  }
`;

const WaitlistContainer = styled(Form)`
  display: flex;
  flex-direction: row;
  width: 40%;
  min-width: 420px;
  margin-left: 60px;
  align-items: center;
  border: 3px solid #ffffff;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    flex-direction: column;
    min-width: 220px;
  }
`;

const WaitlistInput = styled(Form.Control)`
  width: 100%;
  height: 100% !important;
  padding: 10px !important;
  background-color: black !important;
  color: white !important;
  border: none !important;
  border-radius: 0px !important;
`;

const Cube1 = styled.img`
  width: 100px;
  height: 100px;
  align-self: flex-end;
  margin-right: -40px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    display: none;
  }
`;

const Cube2 = styled.img`
  width: 131px;
  height: 131px;
  align-self: flex-end;
  margin-right: 10px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    display: none;
  }
`;

const Cube3 = styled.img`
  width: 83px;
  height: 83px;
  align-self: flex-end;
  margin-right: -80px;
  margin-top: -20px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    display: none;
  }
`;

const BlackLogoImage = styled.img`
  width: 80px;
  height: 48px;
  align-self: flex-end;
  margin-top: -48px;
  margin-right: -62px;
`;

const FlipLogoImage = styled.img`
  width: 80px;
  height: 48px;
  transform: rotate(180deg);
  align-self: flex-end;
`;

const Copyright = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 120%;
  letter-spacing: 0.05em;
  align-self: center;
  margin: 20px;
`;

const AboutUsHeader = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 28px;
  line-height: 120%;
  letter-spacing: 0.04em;
`;

const AboutUsBlock = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  margin: 0 80px;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.05em;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    width: fit-content;
    margin: 0 60px;
  }
`;

const AboutUsGradient = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 21px;
  line-height: 120%;
  letter-spacing: 0.04em;
  background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin: 20px 0;
`;

const AboutUsContainer = styled.div`
  display: flex;
  flex-direction: row;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    flex-direction: column;
  }
`;

const HeroMessage = styled.div`
  font-family: 'Dirtyline';
  src: url('./assets/fonts/Dirtyline.woff') format('woff'), url('./assets/fonts/Dirtyline.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
  font-size: 60px;
  line-height: 120%;
  letter-spacing: 0.04em;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    font-weight: 400;
    font-size: 42px;
    line-height: 120%;
    letter-spacing: 0.04em;
  }
`;

const LogoImage = styled.img`
  margin-left: 60px;
  margin-top: -7px;
  width: 80px;
  height: 48px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    width: 30px;
    height: 18px;
    left: 30px;
    top: 30px;
    margin-top: 0px;
    margin-left: 30px;
  }
`;

const HeaderBrand = styled.h4`
  color: white;
  background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    height: 19px;
    font-family: 'Avenir';
    font-style: normal;
    font-weight: 900;
    font-size: 16px;
    line-height: 120%;

    letter-spacing: 0.15em;
  }
`;

const HeaderButton = styled(Button)`
  margin-right: 20px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    display: none !important;
  }
`;

const MobileHeaderLink = styled.a`
  display: none !important;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    display: flex !important;
    text-decoration: none !important;
    color: white;
    font-weight: 900;
    margin-right: 20px;
  }
`;

const HeaderButtons = styled.div`
  padding: 0 10px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    padding: 0;
  }
`;

const Header = styled.div`
  height: 100px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  justify-content: space-between;
  background-color: transparent;
  margin-top: 60px;
`;

const SplashImage = styled.img`
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  overflow: hidden;
  left: 0;
  top: 0px;
  position: absolute;
  z-index: -1;
  filter: brightness(70%);
`;

const Container = styled.div`
  margin-left: 60px;
  align-items: center;
  display: flex;
  flex-direction: column;
  color: white;
  width: 60%;
  margin-top: 5vh;
  padding: 2vh;
  background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
`;

const SplashImageContainer = styled.div`
  width: 100vw;
  height: 100vh;
`;

const SplashContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
