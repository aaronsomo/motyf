import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { DividendPayout } from 'components/admin/DividendPayout';

export const OfferingPayoutPage: React.FC = () => {
  const params = useParams<{ offeringId?: string | undefined }>();
  const offeringId = parseInt(typeof params.offeringId === 'string' ? params.offeringId : '');

  return (
    <OfferingContainer>
      <Link to={'/admin/offerings'}>Back to all Offerings</Link>
      <OfferingData>
        <DividendPayout offeringId={offeringId} />
      </OfferingData>
    </OfferingContainer>
  );
};

const OfferingData = styled.div`
  padding: 8px;
  padding-top: 20px;
`;

const OfferingContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 80px;
`;
