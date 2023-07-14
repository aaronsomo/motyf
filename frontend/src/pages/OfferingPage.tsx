import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { getOffering, getOfferingStats } from 'api/offerings';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { OfferingDetails } from 'components/OfferingDetails';
import { DividendsGraph } from 'components/DividendsGraph';
import { OfferingStatsTable } from 'components/OfferingStatsTable';
import { Offering, OfferingStats } from 'types';
import { OfferingData, OfferingRight, OfferingTitle, OfferingContainer } from 'components/TokenPageComponents';
import Button from 'react-bootstrap/Button';

export const OfferingPage: React.FC = () => {
  const params = useParams<{ offeringId?: string | undefined }>();
  const offeringId = parseInt(typeof params.offeringId === 'string' ? params.offeringId : '');
  const [offering, setOffering] = useState<Offering | undefined>(undefined);
  const [offeringStats, setOfferingStats] = useState<OfferingStats | undefined>(undefined);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const offeringResponse = await getOffering({ offeringId: offeringId });
        setOffering(offeringResponse);
        const stats = await getOfferingStats({ offeringId: offeringId });
        setOfferingStats(stats);
      } catch (e) {
        console.log('Error:', e);
      }
    })();
  }, [offeringId]);

  return (
    <OfferingContainer>
      {!offering && <CenteredSpinner />}
      {offering && offeringStats && (
        <>
          <OfferingData>
            <OfferingTitle>{offering.issueName}</OfferingTitle>
            <OfferingImage src={`${process.env.PUBLIC_URL}/${offering.offeringId}.png`} />
            <DetailsContainer>
              <OfferingDetails offering={offering} />
            </DetailsContainer>
            <BuyButton onClick={() => history.push(`/checkout/${offeringId}`)}>Buy</BuyButton>
            <br />
            <OfferingSubtitle>ABOUT</OfferingSubtitle>
            {offering.offeringText}
          </OfferingData>
          <OfferingRight>
            <OfferingStatsTable stats={offeringStats} offering={offering} />
            <DividendsGraph stats={offeringStats} />
          </OfferingRight>
        </>
      )}
    </OfferingContainer>
  );
};

const OfferingImage = styled.img`
  width: 140px;
  height: 140px;
  margin-bottom: 20px;
`;

const OfferingSubtitle = styled.div`
  background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
  font-size: 21px;
  line-height: 120%;
  letter-spacing: 0.15em;
  width: fit-content;
  padding-top: 72px;
`;

const BuyButton = styled(Button)`
  width: 200px;
  margin-top: 40px;
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
