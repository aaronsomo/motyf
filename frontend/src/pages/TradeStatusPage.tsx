import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { getTrade, getResendDocuments } from 'api/checkout';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { Trade } from 'types';
import { ErrorMessage } from 'components/ErrorMessage';
import Button from 'react-bootstrap/Button';

export const TradeStatusPage: React.FC = () => {
  const params = useParams<{ tradeId?: string | undefined }>();
  const tradeId = parseInt(typeof params.tradeId === 'string' ? params.tradeId : '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trade, setTrade] = useState<Trade | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [confirmationMessage, setConfirmationMessage] = useState<string>('');
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const { trade } = await getTrade({ tradeId: tradeId });
        setTrade(trade);
        setIsLoading(false);
      } catch (e) {
        console.log('Error:', e);
        history.push('/home');
      }
    })();
  }, [tradeId, history]);

  const resendDocuments = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsLoading(true);
      if (trade) {
        await getResendDocuments({
          offeringId: trade.offeringId,
          tradeId: trade.orderId,
        });
      }
      setConfirmationMessage('Your documents have been sent');
    } catch (e) {
      console.log('Error:', e);
      setError('An error occured');
    }
    setIsLoading(false);
  };

  return (
    <ReceiptContainer>
      {(!trade || isLoading) && <CenteredSpinner />}
      {trade && !isLoading && (
        <ReceiptData>
          <p>Purchase Amount: ${parseFloat(trade.totalAmount)}</p>
          <p>Shares Purchased: {parseFloat(trade.totalShares)}</p>
          <p>Documents Signed: {trade.esignStatus}</p>
          {trade.esignStatus === 'NOTSIGNED' && (
            <UploadButton onClick={(e: any) => resendDocuments(e)}>Resend Documents</UploadButton>
          )}
          <p>Payment Method: {trade.transactionType}</p>
          <p>Order Status: {trade.orderStatus}</p>
          <p>Fund Status: {trade.fundStatus}</p>
          {confirmationMessage !== '' && <p>{confirmationMessage}</p>}
          <ErrorMessage error={error} />
        </ReceiptData>
      )}
      <br />
      <br />
      <h3>When will I receive my NFT?</h3>
      <p>You will recieve your NFT once your order status has been settled and all documents are signed.</p>
      <h3>Where do I sign my documents?</h3>
      <p>
        The subscription documents have been sent to your email address on file. If you cannot find the email, You can
        resend the documents using the button above. Remeber to check your spam and junk folders if you cannot locate
        the documents
      </p>
    </ReceiptContainer>
  );
};

const UploadButton = styled(Button)`
  margin-bottom: 10px;
`;

const ReceiptData = styled.div`
  padding: 8px;
  padding-top: 20px;
`;

const ReceiptContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 80px;
`;
