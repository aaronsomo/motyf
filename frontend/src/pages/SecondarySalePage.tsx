import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { getOffering, getOfferingStats } from 'api/offerings';
import { getToken, sellSecondaryOffering, getOffers } from 'api/checkout';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { Offering, OfferingStats, Token, Offer } from 'types';
import Button from 'react-bootstrap/Button';
import { ErrorMessage } from 'components/ErrorMessage';
import graphSvg from 'assets/graph.svg';
import dollarSvg from 'assets/dollar.svg';
import blackCheckSvg from 'assets/blackCheck.svg';
import Form from 'react-bootstrap/Form';
import { FlashMessage } from 'components/FlashMessage';
import { DividendsGraph } from 'components/DividendsGraph';
import { GradientSwitch } from 'components/GradientSwitch';
import { OffersTable } from 'components/OffersTable';
import { OfferingData, OfferingRight, OfferingTitle, OfferingContainer } from 'components/TokenPageComponents';

export const SecondarySalePage: React.FC = () => {
  const params = useParams<{ offeringId?: string | undefined; tokenId?: string | undefined }>();
  const offeringId = parseInt(typeof params.offeringId === 'string' ? params.offeringId : '');
  const tokenId = parseInt(typeof params.tokenId === 'string' ? params.tokenId : '');
  const [offering, setOffering] = useState<Offering | undefined>(undefined);
  const [offeringStats, setOfferingStats] = useState<OfferingStats | undefined>(undefined);
  const [token, setToken] = useState<Token | undefined>(undefined);
  const [price, setPrice] = useState<number>(NaN);
  const [listingExpires, setListingExpires] = useState<boolean>(false);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [popupTimer, setPopupTimer] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState<boolean>(false);
  const history = useHistory();

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

  useEffect(() => {
    (async () => {
      try {
        const offeringResponse = await getOffering({ offeringId: offeringId });
        setOffering(offeringResponse);
        const { token: tokenResponse } = await getToken({ offeringId, tokenId });
        if (!tokenResponse.owner) {
          history.push(`/${offeringId}/token/${tokenId}`);
          return;
        }
        const stats = await getOfferingStats({ offeringId: offeringId });
        const { offers } = await getOffers({
          offeringId: offeringId,
          tokenId: tokenId,
        });
        setOffers(offers);
        setOfferingStats(stats);
        setToken(tokenResponse);
        setListingExpires(tokenResponse.expiry !== null);
        setExpiryDate(tokenResponse.expiry);
        setIsLoading(false);
      } catch (e) {
        console.log('Error:', e);
        setIsLoading(false);
      }
    })();
  }, [offeringId, history, tokenId, showPopup]);

  const submitSellOffering = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      setError('Please select a token to list');
      return;
    } else if (price <= 0) {
      setError('Price must be above zero');
      return;
    }
    try {
      setError('');
      setIsLoading(true);
      await sellSecondaryOffering({
        price: price,
        offeringId: offeringId,
        token: tokenId,
        expiry: expiryDate,
      });
      setPrice(0);
      setCheckoutComplete(true);
      onShowPopup();
    } catch (e) {
      setError(e.message);
      console.log('Error:', e);
    }
    setIsLoading(false);
  };

  return (
    <OfferingContainer>
      {showPopup && <FlashMessage>Your Motyf has been listed for sale</FlashMessage>}
      {isLoading && <CenteredSpinner />}
      {offering && token && offeringStats && !isLoading && (
        <>
          <OfferingData>
            <OfferingImage src={`${process.env.PUBLIC_URL}/${offering.offeringId}.png`} />
            <OfferingTitle>
              Selling {offering.issueName} #{tokenId}
            </OfferingTitle>
            <InputContainer>
              <ButtonSvg alt="" src={dollarSvg} />
              <NumberInput
                type="number"
                value={price}
                step="0.01"
                required={true}
                placeholder="Desired price"
                onChange={(e: any) => setPrice(parseFloat(e.target.value))}
              />
            </InputContainer>
            <ExpiryContainer>
              <GradientSwitch
                offLabel="No expiry"
                onLabel="Listing expires on"
                setValue={setListingExpires}
                value={listingExpires}
              />
              {listingExpires && (
                <DatePicker type="date" value={expiryDate} onChange={(e: any) => setExpiryDate(e.target.value)} />
              )}
            </ExpiryContainer>
            <br />
            <DetailsContainer>
              <p>
                {token.price && `Listed for $${token.price}`}
                {!token.price && 'This token is not currently for sale'}
              </p>
            </DetailsContainer>
            <Buttons>
              <Button className="btn-secondary" onClick={() => history.push(`/${token.offeringId}/token/${token.NFT}`)}>
                Back
              </Button>
              {checkoutComplete ? (
                <SoldButton onClick={submitSellOffering} disabled={true}>
                  <ButtonSvg alt="" src={blackCheckSvg} />
                  Success
                </SoldButton>
              ) : (
                <SellButton onClick={submitSellOffering}>
                  <ButtonSvg alt="" src={graphSvg} />
                  List for Sale
                </SellButton>
              )}
            </Buttons>
            <ErrorMessage error={error} />
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

const ExpiryContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 30px;
`;

const DatePicker = styled(Form.Control)`
  width: auto !important;
  margin-left: 10px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  background-color: white;
  width: fit-content;
  border-radius: 3px;
  margin-bottom: 10px;
  padding-left: 20px;
`;

const NumberInput = styled(Form.Control)`
  width: 150px !important;
  border: none !important;
  margin: 0 5px;
  &:focus {
    border: none !important;
    box-shadow: none !important;
  }
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
  margin-left: 15px;
`;

const SoldButton = styled(Button)`
  display: flex;
  margin-left: 15px;
  background-image: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%),
    linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%) !important;
  opacity: 1 !important;
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
