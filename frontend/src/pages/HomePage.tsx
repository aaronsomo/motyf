import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { getLatestOffering } from 'api/offerings';
import { Offering } from 'types';
import heroImage from 'assets/posty-home.png';
import { OfferingDetails } from 'components/OfferingDetails';
import Button from 'react-bootstrap/Button';
import { MOBILE_MAX_WIDTH } from '../constants';

export const HomePage: React.FC = () => {
  const [offering, setOffering] = useState<Offering | undefined>(undefined);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const offeringResponse = await getLatestOffering();
        setOffering(offeringResponse);
      } catch (e) {
        console.log('Error:', e);
      }
    })();
  }, []);

  return (
    <HomeContainer>
      <SplashImage src={heroImage} />
      <GradientContainer>
        <HeroMessage>own poSt MaLone's MusIC CataLog</HeroMessage>
      </GradientContainer>
      <HeaderSection>{offering && offering.offeringText}</HeaderSection>
      <HeaderSection>
        {offering && <HomeButton onClick={() => history.push(`/offering/${offering.offeringId}`)}>Buy Now</HomeButton>}
        {!offering && <HomeButton>Buy Now</HomeButton>}
        <Button className="btn-secondary">See Historical Performance</Button>
      </HeaderSection>
      {offering && <OfferingDetails offering={offering} />}
    </HomeContainer>
  );
};

const HomeButton = styled(Button)`
  margin-right: 10px;
`;

const HeaderSection = styled.div`
  flex-direction: row;
  display: flex;
  margin: 10px 0;
  justify-content: space-between;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 140%;
  max-width: 430px;
  margin 10px 0;
`;

const HeroMessage = styled.div`
  font-family: 'Dirtyline';
  src: url('./assets/fonts/Dirtyline.woff') format('woff'), url('./assets/fonts/Dirtyline.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
  font-size: 42px;
  line-height: 120%;
  max-width: 400px;
  letter-spacing: 0.04em;
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
`;

const GradientContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  color: white;

  background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
`;

const HomeContainer = styled.div`
  margin-top: 5vh;
  margin-left: 60px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    margin: 20px;
  }
`;
