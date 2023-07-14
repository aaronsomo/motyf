import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { getOrder } from 'api/checkout';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { SecondaryOrderStatus } from 'types';
import { nftUrl } from 'utils/nftUrl';

export const SecondaryTradeStatusPage: React.FC = () => {
  const params = useParams<{ orderId?: string | undefined }>();
  const orderId = parseInt(typeof params.orderId === 'string' ? params.orderId : '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderStatus, setOrderStatus] = useState<SecondaryOrderStatus | undefined>(undefined);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const { order } = await getOrder({ orderId: orderId });
        setOrderStatus(order);
        setIsLoading(false);
      } catch (e) {
        console.log('Error:', e);
        history.push('/home');
      }
    })();
  }, [orderId, history]);

  return (
    <ReceiptContainer>
      {(!orderStatus || isLoading) && <CenteredSpinner />}
      {orderStatus && !isLoading && (
        <ReceiptData>
          <p>Order ID: {orderStatus.orderId}</p>
          <p>Purchase Price: ${orderStatus.price}</p>
          <p>Order Status: {orderStatus.executed ? 'Executed' : 'Pending'}</p>
          <p>
            <a href={nftUrl(orderStatus.contractAddress, orderStatus.NFT)} target="_blank" rel="noopener noreferrer">
              Token #{orderStatus.NFT}
            </a>
          </p>
        </ReceiptData>
      )}
    </ReceiptContainer>
  );
};

const ReceiptData = styled.div`
  padding: 8px;
  padding-top: 20px;
`;

const ReceiptContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 80px;
`;
