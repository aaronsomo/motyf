import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { getOffering, getOfferingStats } from 'api/offerings';
import { getDwollaBalance } from 'api/kyc';
import { getToken, buySecondaryOffering, getOffers } from 'api/checkout';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { Offering, OfferingStats, Token, Offer } from 'types';
import Button from 'react-bootstrap/Button';
import { ErrorMessage } from 'components/ErrorMessage';
import graphSvg from 'assets/graph.svg';
import { UserContext } from 'UserContext';
import { DividendsGraph } from 'components/DividendsGraph';
import { OffersTable } from 'components/OffersTable';
import { OfferingData, OfferingRight, OfferingTitle, OfferingContainer } from 'components/TokenPageComponents';

export const SecondaryCheckoutPage: React.FC = () => {
  const { onboardingStatus } = useContext(UserContext);
  const params = useParams<{ offeringId?: string | undefined; tokenId?: string | undefined }>();
  const offeringId = parseInt(typeof params.offeringId === 'string' ? params.offeringId : '');
  const tokenId = parseInt(typeof params.tokenId === 'string' ? params.tokenId : '');
  const [offering, setOffering] = useState<Offering | undefined>(undefined);
  const [token, setToken] = useState<Token | undefined>(undefined);
  const [offeringStats, setOfferingStats] = useState<OfferingStats | undefined>(undefined);
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const history = useHistory();
  const redirect = `?redirect=${encodeURIComponent('/' + offeringId + '/buy/' + tokenId)}`;

  useEffect(() => {
    (async () => {
      try {
        const offeringResponse = await getOffering({ offeringId: offeringId });
        setOffering(offeringResponse);
        const { token: tokenResponse } = await getToken({ offeringId, tokenId });
        if (tokenResponse.owner) {
          history.push(`/${offeringId}/token/${tokenId}`);
          return;
        }
        setToken(tokenResponse);
        const stats = await getOfferingStats({ offeringId: offeringId });
        setOfferingStats(stats);
        const { balance, currency } = await getDwollaBalance();
        setBalance(balance);
        setCurrency(currency);
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
  }, [offeringId, history, tokenId]);

  const submitBuyOffering = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setError('');
      setIsLoading(true);
      const { tradeId } = await buySecondaryOffering({
        offeringId: offeringId,
        tokenId: tokenId,
      });
      history.push(`/secondary-status/${tradeId}`);
    } catch (e) {
      setError(e.message);
      console.log('Error:', e);
    }
    setIsLoading(false);
  };

  return (
    <OfferingContainer>
      {isLoading && <CenteredSpinner />}
      {offering && token && offeringStats && !isLoading && (
        <>
          <OfferingData>
            <OfferingImage src={`${process.env.PUBLIC_URL}/${offering.offeringId}.png`} />
            <OfferingTitle>
              Buying {offering.issueName} #{tokenId}
            </OfferingTitle>
            <DetailsContainer>
              <p>
                {token.price && (
                  <>
                    Listed for ${token.price}
                    {token.expiry !== null && <div>Listing expires on {token.expiry}</div>}
                  </>
                )}
                {!token.price && 'This token is not currently for sale'}
              </p>
            </DetailsContainer>
            {onboardingStatus === 'KYC_MANUAL_APPROVAL_NEEDED' && (
              <p>Your investor details are being reviewed for approval</p>
            )}
            {onboardingStatus !== 'ONBOARDING_COMPLETE' && onboardingStatus !== 'KYC_MANUAL_APPROVAL_NEEDED' && (
              <p>
                <a href={`/onboard-redirect/${redirect}`}>You need to complete onboarding to purchase this offering</a>
              </p>
            )}
            <Buttons>
              <Button className="btn-secondary" onClick={() => history.push(`/${token.offeringId}/token/${token.NFT}`)}>
                Back
              </Button>
              <SellButton
                disabled={onboardingStatus !== 'ONBOARDING_COMPLETE' && token.price}
                onClick={submitBuyOffering}
              >
                <ButtonSvg alt="" src={graphSvg} />
                Purchase
              </SellButton>
            </Buttons>
            <ErrorMessage error={error} />
            <BalanceDetails>
              Balance: ${balance} {currency} <a href="/secondary-wallet">Manage Balance</a>
            </BalanceDetails>
            {offers && <OffersTable offers={offers} />}
          </OfferingData>
          <OfferingRight>
            <DividendsGraph stats={offeringStats} />
          </OfferingRight>
        </>
      )}
    </OfferingContainer>
  );
};

const BalanceDetails = styled.div`
  margin: 6px 0 18px 0;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 140%;
  letter-spacing: 0.05em;
  display: flex;
  flex-direction: column;
`;

const ButtonSvg = styled.img`
  margin-right: 10px;
`;

const OfferingImage = styled.img`
  width: 140px;
  height: 140px;
  margin-bottom: 20px;
`;

const Buttons = styled.div`
  margin-bottom: 20px;
  flex-direction: row;
  display: flex;
`;

const SellButton = styled(Button)`
  display: flex;
  margin-left: 20px;
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
