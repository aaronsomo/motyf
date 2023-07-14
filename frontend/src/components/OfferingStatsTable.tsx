import React from 'react';
import { OfferingStats, Offering } from 'types';
import styled from 'styled-components';
import { MOBILE_MAX_WIDTH } from '../constants';

interface Props {
  stats: OfferingStats;
  offering: Offering;
}

export const OfferingStatsTable: React.FC<Props> = ({ stats, offering }) => {
  return (
    <StatsTable>
      <StatPair>
        <Stat>${stats.floor}</Stat>
        <Title>Floor price</Title>
      </StatPair>
      <Spacer />
      <StatPair>
        <Stat>${stats.volume}</Stat>
        <Title>Volume</Title>
      </StatPair>
      <BlankSpace />
      <StatPair>
        <Stat>${(stats.royalties * offering.totalShares).toLocaleString()}</Stat>
        <Title>Royalties last 12 months</Title>
      </StatPair>
      <Spacer />
      <StatPair>
        <Stat>${stats.royalties}</Stat>
        <Title>Royalties per unit last 12 months</Title>
      </StatPair>
      <BlankSpace />
      <StatPair>
        <Stat>{stats.owners}</Stat>
        <Title>Owners</Title>
      </StatPair>
      <Spacer />
      <StatPair>
        <Stat>{Math.round((stats.owners / (offering.totalShares - offering.remainingShares)) * 100000) / 1000}%</Stat>
        <Title>Unique Owners</Title>
      </StatPair>
    </StatsTable>
  );
};

const BlankSpace = styled.div`
  min-width: 30px;
  height: 100%;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    height: 30px;
  }
`;

const Spacer = styled.div`
  border: solid 1.5px transparent;
  border-image-slice: 1;
  background-image: linear-gradient(white, white),
    linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  margin: -10px 10px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    margin: 10px;
  }
`;

const Title = styled.div`
  font-size: 14px;
  line-height: 17px;
  padding-top: 10px;
  height: 50%;
`;

const Stat = styled.div`
  font-style: normal;
  font-weight: 900;
  font-size: 16px;
  line-height: 17px;
  height: 50%;
`;

const StatPair = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  width: 100%;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    margin: 10px;
  }
`;

const StatsTable = styled.div`
  flex-direction: row;
  display: flex;
  height: 100px;
  padding-bottom: 60px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    flex-direction: column;
    height: fit-content;
  }
`;
