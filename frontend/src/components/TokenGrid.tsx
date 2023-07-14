import React, { useState } from 'react';
import { Token } from 'types';
import styled from 'styled-components';
import { nftUrl } from 'utils/nftUrl';
import { useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { TokenThumbnail } from 'components/TokenThumbnail';
import { MOBILE_MAX_WIDTH } from '../constants';
import rightSvg from 'assets/arrow_right_white.svg';

interface Props {
  tokens: Token[];
  title: React.ReactNode;
  orderStatusLink?: boolean;
}

export const TokenGrid: React.FC<Props> = ({ tokens, title, orderStatusLink }) => {
  const history = useHistory();
  const [hidden, setHidden] = useState<boolean>(false);

  return (
    <>
      {hidden && (
        <LockerHeader onClick={() => setHidden(false)}>
          <Title>
            <RightArrowImg alt="" src={rightSvg} />
            <LockerTitle>{title}</LockerTitle>
          </Title>
        </LockerHeader>
      )}
      {tokens.length === 0 && !hidden && (
        <>
          <LockerHeader onClick={() => setHidden(true)}>
            <Title>
              <DownArrowImg alt="" src={rightSvg} />
              <LockerTitle>{title}</LockerTitle>
            </Title>
          </LockerHeader>
          <EmptyLocker>
            It looks like you don't have any yet. Let's change that!
            <BrowseButton className="btn-secondary" onClick={() => history.push('/offerings/')}>
              Browse Available Motyfs
            </BrowseButton>
          </EmptyLocker>
        </>
      )}
      {tokens.length > 0 && !hidden && (
        <>
          <LockerHeader onClick={() => setHidden(true)}>
            <Title>
              <DownArrowImg alt="" src={rightSvg} />
              <LockerTitle>{title}</LockerTitle>
            </Title>
            {orderStatusLink && (
              <LockerSubtitle>
                <GradientLink href="/orders">View Order Status</GradientLink>
                <GradientLink href="/connect">Connect Wallet</GradientLink>
              </LockerSubtitle>
            )}
          </LockerHeader>
          <LockerGrid>
            {tokens &&
              tokens.map((token, i) => (
                <LockerCard key={i}>
                  {token.NFT === -1 ? (
                    <PendingImageContainer>Pending</PendingImageContainer>
                  ) : (
                    <a href={`/${token.offeringId}/token/${token.NFT}`}>
                      <TokenThumbnail token={token} setToken={undefined} />
                    </a>
                  )}
                  <CardSubtext>{token.name}</CardSubtext>
                  <CardSubtext>
                    {token.NFT === -1 ? (
                      '#?'
                    ) : (
                      <LockerLink
                        href={nftUrl(token.contractAddress, token.NFT)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        #{token.NFT}
                      </LockerLink>
                    )}
                  </CardSubtext>
                  <CardSubtext>
                    {token.NFT === -1 ? (
                      <a href={`/status/${token.orderNumber}`}>Order Status</a>
                    ) : (
                      <>{token.offer ? `Top Bid: $${token.offer}` : token.price ? `For Sale: $${token.price}` : ''}</>
                    )}
                  </CardSubtext>
                </LockerCard>
              ))}
          </LockerGrid>
        </>
      )}
    </>
  );
};

const DownArrowImg = styled.img`
  height: 30px;
  width: 30px;
  transform: rotate(90deg);
  margin-right: 10px;
`;

const RightArrowImg = styled.img`
  height: 30px;
  width: 30px;
  margin-right: 10px;
`;

const CardSubtext = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 5px;
`;

const GradientLink = styled.a`
  display: inline;
  text-decoration: none;
  color: white;
  padding-right: 20px;
`;

const LockerHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
  height: min-content;
`;

const Title = styled.div`
  display: flex;
  flex-direction: row;
  height: min-content;
`;

const LockerTitle = styled.div`
  font-size: 28px;
  line-height: 120%;
  width: fit-content;
`;

const LockerSubtitle = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 16px;
`;

const LockerGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -30px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    justify-content: center;
  }
`;

const LockerCard = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 30px;
  margin-bottom: 60px;
`;

const LockerLink = styled.a`
  text-decoration: none;
  color: white;
`;

const BrowseButton = styled(Button)`
  width: fit-content;
  margin-top: 20px;
`;

const EmptyLocker = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;
  padding-bottom: 40px;
`;

const PendingImageContainer = styled.div`
  width: 140px;
  height: 140px;
  margin-bottom: 20px;
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  border-radius: 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
