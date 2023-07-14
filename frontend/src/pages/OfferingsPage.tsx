import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { getLatestOffering } from 'api/offerings';
import { getListings } from 'api/checkout';
import { Offering, Token } from 'types';
import heroImage from 'assets/posty-home.png';
import { OfferingDetails } from 'components/OfferingDetails';
import Button from 'react-bootstrap/Button';
import { TokenGrid } from 'components/TokenGrid';
import { MOBILE_MAX_WIDTH } from '../constants';

export const OfferingsPage: React.FC = () => {
  const [offering, setOffering] = useState<Offering | undefined>(undefined);
  const [listings, setListings] = useState<Token[] | undefined>(undefined);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const offeringResponse = await getLatestOffering();
        setOffering(offeringResponse);
        const { userTokens: listingResponse } = await getListings();
        setListings(listingResponse);
      } catch (e) {
        console.log('Error:', e);
      }
    })();
  }, []);

  return (
    <OfferingsContainer>
      <OfferingsFeature>
        <LeftFeature>
          <SplashImage src={heroImage} />
          <GradientContainer>
            <HeroMessage>own poSt MaLone's MusIC CataLog</HeroMessage>
          </GradientContainer>
        </LeftFeature>
        <RightFeature>
          <OfferingTitle>{offering && offering.issueName}</OfferingTitle>
          <FeatureSection>{offering && offering.offeringText}</FeatureSection>
          <FeatureSection>
            {offering && (
              <FeatureButton onClick={() => history.push(`/offering/${offering.offeringId}`)}>Buy Now</FeatureButton>
            )}
            {!offering && <FeatureButton>Buy Now</FeatureButton>}
            <FeatureButton className="btn-secondary">Historical Performance</FeatureButton>
          </FeatureSection>
          {offering && <OfferingDetails offering={offering} />}
        </RightFeature>
      </OfferingsFeature>
      <OfferingsSpacing />
      {listings && <TokenGrid tokens={listings} title={<>Featured Motyfs</>} />}
    </OfferingsContainer>
  );
};

const OfferingsSpacing = styled.div`
  margin-top: 60px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    margin-top: 100px;
  }
`;

const OfferingsFeature = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    flex-direction: column;
    margin-bottom: 40px;
  }
`;

const LeftFeature = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 350px;
  width: 50%;
  margin-right: 10%;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    width: 100%;
    height: initial;
  }
`;

const RightFeature = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 340px;
  margin-top: 10px;
  width: 50%;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    width: 100%;
  }
`;

const OfferingTitle = styled.div`
  margin-bottom: 5px;
  font-style: normal;
  font-weight: 500;
  font-size: 28px;
  line-height: 120%;
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
  width: fit-content;
`;

const FeatureButton = styled(Button)`
  margin-right: 10px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    width: fit-content;
    margin-bottom: 10px;
  }
`;

const FeatureSection = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 140%;
  margin 15px 0;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    flex-direction: column;
    width: 100%;
    justify-content: center;
  }
`;

const HeroMessage = styled.div`
  font-family: 'Dirtyline';
  src: url('./assets/fonts/Dirtyline.woff') format('woff'), url('./assets/fonts/Dirtyline.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
  font-size: 42px;
  line-height: 120%;
  width: 210px;
  letter-spacing: 0.04em;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    font-size: 32px;
  }
`;

const SplashImage = styled.img`
  object-fit: cover;
  overflow: hidden;
  left: 0;
  top: 0px;
  width: 40vw;
  position: relative;
  min-height: -webkit-fill-available;
  z-index: -1;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    width: 100%;
  }
`;

const GradientContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  color: white;
  background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;

  left: 46px;
  top: -300px;
  position: relative;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    top: -30vh;
    margin-bottom: -20vh;
  }
`;

const OfferingsContainer = styled.div`
  margin-top: 5vh;
  margin: 0 100px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    margin: 20px;
  }
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
