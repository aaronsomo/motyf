import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getOffering, getOfferingStats } from 'api/offerings';
import { buyOffering } from 'api/checkout';
import { getCreditCardLink, getBankAccountLink } from 'api/kyc';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { Offering, OfferingStats } from 'types';
import Button from 'react-bootstrap/Button';
import { ErrorMessage } from 'components/ErrorMessage';
import { useHistory } from 'react-router-dom';
import checkSvg from 'assets/check.svg';
import blackCheckSvg from 'assets/blackCheck.svg';
import { FlashMessage } from 'components/FlashMessage';
import { UserContext } from 'UserContext';
import { DividendsGraph } from 'components/DividendsGraph';
import Form from 'react-bootstrap/Form';
import { OfferingData, OfferingRight, OfferingTitle, OfferingContainer } from 'components/TokenPageComponents';

export const CheckoutPage: React.FC = () => {
  const { onboardingStatus } = useContext(UserContext);
  const params = useParams<{ offeringId?: string | undefined }>();
  const offeringId = parseInt(typeof params.offeringId === 'string' ? params.offeringId : '');
  const [offering, setOffering] = useState<Offering | undefined>(undefined);
  const [offeringStats, setOfferingStats] = useState<OfferingStats | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [paymentPreference, setPaymentPreference] = useState<string>('');
  const [creditCardLink, setCreditCardLink] = useState<string>('');
  const [bankAccountLink, setBankAccountLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [popupTimer, setPopupTimer] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState<boolean>(false);
  const history = useHistory();
  const redirect = `?redirect=${encodeURIComponent('/checkout/' + offeringId)}`;

  const paymentOptions = [];
  if (creditCardLink === 'ADDED') {
    paymentOptions.push('Linked Credit Card');
  }
  if (bankAccountLink === 'ADDED') {
    paymentOptions.push('Linked Bank Account');
  }

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
        const { url } = await getCreditCardLink();
        setCreditCardLink(url);
        const response = await getBankAccountLink();
        setBankAccountLink(response.url);
        const stats = await getOfferingStats({ offeringId: offeringId });
        setOfferingStats(stats);
        setIsLoading(false);
      } catch (e) {
        console.log('Error:', e);
        setIsLoading(false);
      }
    })();
  }, [offeringId]);

  const submitBuyOffering = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsLoading(true);
      setError('');
      await buyOffering({
        offeringId: offeringId,
        paymentPreference: paymentPreference,
        quantity: quantity,
      });
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
      {showPopup && (
        <FlashMessage>
          Your purchase was successful. See your new Motyf in your&nbsp;<FlashLink href="/locker">Locker</FlashLink>
        </FlashMessage>
      )}
      {isLoading && <CenteredSpinner />}
      {offering && offeringStats && !isLoading && (
        <>
          <OfferingData>
            <OfferingImage src={`${process.env.PUBLIC_URL}/${offering.offeringId}.png`} />
            <OfferingTitle>{offering.issueName}</OfferingTitle>
            <DetailsContainer>
              ${offering.unitPrice}/ Share
              <CreditCardLink>
                <GradientLink href={`/credit-card/${redirect}`}>
                  {paymentOptions.length === 0
                    ? 'You have not added any payment options yet'
                    : 'Manage payment options'}
                  <br />
                  <br />
                </GradientLink>
                {paymentOptions.length > 0 && (
                  <>
                    <p>Payment Method:</p>
                    <Form.Control
                      as="select"
                      value={paymentPreference}
                      onChange={(e: any) => setPaymentPreference(e.target.value)}
                    >
                      <option key={''} value={''}></option>
                      {paymentOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Form.Control>
                    <br />
                  </>
                )}
                <p>Quantity:</p>
                <Form.Control as="select" value={quantity} onChange={(e: any) => setQuantity(e.target.value)}>
                  <option key={''} value={''}>
                    Quantity
                  </option>
                  {[...Array(10).keys()]
                    .map((i) => i + 1)
                    .map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </Form.Control>
                <br />
                {onboardingStatus !== 'ONBOARDING_COMPLETE' && (
                  <>
                    {onboardingStatus === 'KYC_MANUAL_APPROVAL_NEEDED' ? (
                      <p>Your account is awaiting manual approval to participate in our offerings</p>
                    ) : (
                      <a href={`/onboard-redirect/${redirect}`}>
                        We need a few more details before you can complete your purchase
                      </a>
                    )}
                    <br />
                    <br />
                  </>
                )}
              </CreditCardLink>
              <p>Total: ${offering.unitPrice * quantity}</p>
            </DetailsContainer>
            <Buttons>
              <Button className="btn-secondary" onClick={() => history.push(`/offering/${offering.offeringId}`)}>
                Back
              </Button>
              {checkoutComplete ? (
                <BoughtButton disabled={true}>
                  <CheckImg alt="" src={blackCheckSvg} />
                  Success
                </BoughtButton>
              ) : (
                <BuyButton
                  disabled={offering.remainingShares === 0 || onboardingStatus !== 'ONBOARDING_COMPLETE'}
                  onClick={submitBuyOffering}
                >
                  <CheckImg alt="" src={checkSvg} />
                  Confirm Purchase
                </BuyButton>
              )}
            </Buttons>
            <ErrorMessage error={error} />
          </OfferingData>
          <OfferingRight>
            <DividendsGraph stats={offeringStats} />
          </OfferingRight>
        </>
      )}
    </OfferingContainer>
  );
};

const GradientLink = styled.a`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 140%;
  /* or 22px */

  letter-spacing: 0.05em;
  text-decoration-line: underline;

  /* light g */

  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const CreditCardLink = styled.div`
  font-weight: 400;
  font-size: 16px;
  line-height: 140%;
  margin-top: 20px;
`;

const CheckImg = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 10px;
`;

const OfferingImage = styled.img`
  width: 140px;
  height: 140px;
  margin-bottom: 20px;
`;

const Buttons = styled.div`
  margin-bottom: 20px;
  display: flex;
`;

const BuyButton = styled(Button)`
  display: flex;
  margin-left: 15px;
  flex-direction: row;
`;

const BoughtButton = styled(Button)`
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

const FlashLink = styled.a`
  color: black;
`;
