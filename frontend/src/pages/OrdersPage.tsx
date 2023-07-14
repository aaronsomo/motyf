import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { getTrades, getOrders } from 'api/checkout';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { Trade, SecondaryOrderStatus } from 'types';
import { nftUrl } from 'utils/nftUrl';

export const OrdersPage: React.FC = () => {
  const params = useParams<{ tradeId?: string | undefined }>();
  const tradeId = parseInt(typeof params.tradeId === 'string' ? params.tradeId : '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [purchases, setPurchases] = useState<SecondaryOrderStatus[]>([]);
  const [sales, setSales] = useState<SecondaryOrderStatus[]>([]);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const { trades } = await getTrades();
        const { buys, sells } = await getOrders();
        setPurchases(buys);
        setSales(sells);
        setTrades(trades);
        setIsLoading(false);
      } catch (e) {
        console.log('Error:', e);
        history.push('/home');
      }
    })();
  }, [tradeId, history]);

  return (
    <OrdersContainer>
      {isLoading && <CenteredSpinner />}
      {!isLoading && (
        <Table>
          <TableHead>
            <tr>
              <GradientHeader>Order</GradientHeader>
              <GradientHeader>Offering</GradientHeader>
              <GradientHeader>Order Status</GradientHeader>
              <GradientHeader>Price</GradientHeader>
              <GradientHeader>Doucments Signed?</GradientHeader>
              <GradientHeader>NFT</GradientHeader>
            </tr>
          </TableHead>
          <tbody>
            <SpacerRow>
              <SpacerCell colSpan={5}>Primary Purchases</SpacerCell>
            </SpacerRow>
            {trades.map((trade) => (
              <tr key={trade.orderId}>
                <td>
                  <a href={`/status/${trade.orderId}`}>{trade.orderId}</a>
                </td>
                <td>{trade.issueName}</td>
                <td>{trade.orderStatus}</td>
                <td>${Math.round(parseInt(trade.totalAmount) * 100) / 100}</td>
                <td>{trade.esignStatus}</td>
                <td>
                  {trade.tokenId && (
                    <a href={nftUrl(trade.contractAddress, trade.tokenId)} target="_blank" rel="noopener noreferrer">
                      Token #{trade.tokenId}
                    </a>
                  )}
                  {!trade.tokenId && 'Not Minted'}
                </td>
              </tr>
            ))}
            <SpacerRow>
              <SpacerCell colSpan={5}>Secondary Purchases</SpacerCell>
            </SpacerRow>
            {purchases.map((trade) => (
              <tr key={trade.orderId}>
                <td>
                  <a href={`/secondary-status/${trade.orderId}`}>{trade.orderId}</a>
                </td>
                <td>{trade.issueName}</td>
                <td>{trade.executed ? 'Executed' : 'Pending'}</td>
                <td>${trade.price}</td>
                <td>Not Implemented</td>
                <td>
                  <a href={nftUrl(trade.contractAddress, trade.NFT)} target="_blank" rel="noopener noreferrer">
                    Token #{trade.NFT}
                  </a>
                </td>
              </tr>
            ))}
            <SpacerRow>
              <SpacerCell colSpan={5}>Secondary Sales</SpacerCell>
            </SpacerRow>
            {sales.map((trade) => (
              <tr key={trade.orderId}>
                <td>
                  <a href={`/secondary-status/${trade.orderId}`}>{trade.orderId}</a>
                </td>
                <td>{trade.issueName}</td>
                <td>{trade.executed ? 'Executed' : 'Pending'}</td>
                <td>${trade.price}</td>
                <td>Not Implemented</td>
                <td>
                  <a href={nftUrl(trade.contractAddress, trade.NFT)} target="_blank" rel="noopener noreferrer">
                    Token #{trade.NFT}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </OrdersContainer>
  );
};

const SpacerCell = styled.th`
  padding: 10px 0px;
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
  width: min-content;
`;

const SpacerRow = styled.tr`
  width: fit-content;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  width: 100%;
  line-height: 120%;
  letter-spacing: 0.04em;
`;

const GradientHeader = styled.th`
  margin-bottom: 0;
  color: white;
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
  width: fit-content;
  font-style: normal;
  font-weight: 500;
  font-size: 28px;
  line-height: 120%;
  letter-spacing: 0.04em;
`;

const TableHead = styled.thead`
  padding-bottom: 100px;
`;

const Table = styled.table`
  margin: 50px 0;
`;

const OrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 80px;
`;
