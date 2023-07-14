import React from 'react';
import { Offering } from 'types';
import styled from 'styled-components';
import chartSvg from 'assets/chart.svg';
import pieSvg from 'assets/pie.svg';
import dollarSvg from 'assets/dollar.svg';
import websiteSvg from 'assets/website.svg';
import discordSvg from 'assets/discord.svg';
import instagramSvg from 'assets/instagram.svg';
import shareSvg from 'assets/share.svg';
import moment from 'moment';

interface Props {
  offering: Offering;
}

export const OfferingDetails: React.FC<Props> = ({ offering }) => {
  return (
    <>
      <HeaderSection>
        <HeaderSvg src={chartSvg} />
        <GradientText />
        Went live <GradientText>{moment(offering.startDate, 'MM-DD-YYYY').format('MMMM DD, YYYY')}</GradientText>
      </HeaderSection>
      <HeaderSection>
        <HeaderSvg src={pieSvg} />
        <HeaderWrap>
          <HeaderText>
            <GradientText>{offering.remainingShares}</GradientText>shares total{' '}
          </HeaderText>
          <HeaderText>
            <GradientText>{offering.totalShares}</GradientText> shares remaining
          </HeaderText>
        </HeaderWrap>
      </HeaderSection>
      <HeaderSection>
        <HeaderSvg src={dollarSvg} />
        <GradientText>${offering.unitPrice}</GradientText> per Share{' '}
      </HeaderSection>
      {offering.social && offering.website && offering.discord && (
        <HeaderSection>
          <a href={offering.website} target="_blank" rel="noopener noreferrer">
            <HeaderSvg src={websiteSvg} />
          </a>
          <a href={offering.discord} target="_blank" rel="noopener noreferrer">
            <HeaderSvg src={discordSvg} />
          </a>
          <a href={offering.social} target="_blank" rel="noopener noreferrer">
            <HeaderSvg src={instagramSvg} />
          </a>
          <HeaderClickSvg
            src={shareSvg}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
          />
        </HeaderSection>
      )}
    </>
  );
};

const HeaderWrap = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: row;
`;

const HeaderSvg = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 10px;
`;

const HeaderClickSvg = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 10px;
  cursor: pointer;
`;

const GradientText = styled.div`
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
  margin: 0 3px;
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
  margin 10px 0;
`;
