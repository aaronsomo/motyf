import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getOffering, getOfferingStats } from 'api/offerings';
import { getToken, getOffers } from 'api/checkout';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { Offering, OfferingStats, Token, Offer } from 'types';
import Button from 'react-bootstrap/Button';
import { useHistory } from 'react-router-dom';
import { nftUrl } from 'utils/nftUrl';
import { TokenThumbnail } from 'components/TokenThumbnail';
import { DividendsGraph } from 'components/DividendsGraph';
import { OffersTable } from 'components/OffersTable';
import { OfferingData, OfferingRight, OfferingTitle, OfferingContainer } from 'components/TokenPageComponents';

export const TokenPage: React.FC = () => {
  const params = useParams<{ offeringId?: string | undefined; tokenId?: string | undefined }>();
  const offeringId = parseInt(typeof params.offeringId === 'string' ? params.offeringId : '');
  const tokenId = parseInt(typeof params.tokenId === 'string' ? params.tokenId : '');
  const [offering, setOffering] = useState<Offering | undefined>(undefined);
  const [offeringStats, setOfferingStats] = useState<OfferingStats | undefined>(undefined);
  const [token, setToken] = useState<Token | undefined>(undefined);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const offeringResponse = await getOffering({ offeringId: offeringId });
        setOffering(offeringResponse);
        const { token: tokenResponse } = await getToken({ offeringId, tokenId });
        setToken(tokenResponse);
        const stats = await getOfferingStats({ offeringId: offeringId });
        setOfferingStats(stats);
        const { offers } = await getOffers({
          offeringId: offeringId,
          tokenId: tokenId,
        });
        setOffers(offers);
        setIsLoading(false);
      } catch (e) {
        console.log('Error:', e);
        setIsLoading(false);
      }
    })();
  }, [offeringId, tokenId]);

  return (
    <OfferingContainer>
      {isLoading && <CenteredSpinner />}
      {offering && token && offeringStats && !isLoading && (
        <>
          <OfferingData>
            <OfferingTitle>{offering.issueName}</OfferingTitle>
            <TokenThumbnail token={token} setToken={setToken} />
            <DetailsContainer>
              <p>
                <a href={nftUrl(token.contractAddress, token.NFT)}>#{token.NFT}</a>
              </p>
              <p>
                {token.price && `Listed for $${token.price}`}
                {!token.price && 'This token is not currently for sale'}
              </p>
            </DetailsContainer>
            <Buttons>
              {token.owner && (
                <BuyButton onClick={() => history.push(`/${token.offeringId}/list/${token.NFT}`)}>
                  {!token.price ? 'Sell' : 'Update Listing'}
                </BuyButton>
              )}
              {!token.owner && (
                <>
                  {token.price && (
                    <BuyButton onClick={() => history.push(`/${token.offeringId}/buy/${token.NFT}`)}>Buy Now</BuyButton>
                  )}
                  <BuyButton onClick={() => history.push(`/${token.offeringId}/offer/${token.NFT}`)}>
                    Make an Offer
                  </BuyButton>
                </>
              )}
            </Buttons>
            {offers && <OffersTable offers={offers} owner={token.owner} />}
          </OfferingData>
          <OfferingRight>
            <DividendsGraph stats={offeringStats} />
          </OfferingRight>
        </>
      )}
    </OfferingContainer>
  );
};

const Buttons = styled.div`
  margin-bottom: 20px;
  flex-direction: column;
  display: flex;
  width: fit-content;
`;

const BuyButton = styled(Button)`
  display: flex;
  margin-bottom: 20px !important;
  justify-content: center;
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-style: normal;
  font-weight: 400;
  font-size: 21px;
  line-height: 140%;
  letter-spacing: 0.05em;
`;
