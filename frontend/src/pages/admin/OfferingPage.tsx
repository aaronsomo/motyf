import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import { getOffering } from 'api/offerings';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { Offering, AdminSongDividend, AdminDividendRegion, AdminDividend } from 'types';
import { mintTo, getTrades, getDividends } from 'api/admin';
import { AllTrade } from 'types';
import { ErrorMessage } from 'components/ErrorMessage';
import { DividendHistoryEdit } from 'components/admin/DividendHistoryEdit';
import { DividendRegionEdit } from 'components/admin/DividendRegionEdit';
import { DividendSongsEdit } from 'components/admin/DividendSongsEdit';

export const AdminOfferingPage: React.FC = () => {
  const params = useParams<{ offeringId?: string | undefined }>();
  const offeringId = parseInt(typeof params.offeringId === 'string' ? params.offeringId : '');
  const [offering, setOffering] = useState<Offering | undefined>(undefined);
  const [transaction, setTransaction] = useState<string>('');
  const [trades, setTrades] = useState<AllTrade[] | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [payouts, setPayouts] = useState<AdminDividend[]>([]);
  const [regions, setRegions] = useState<AdminDividendRegion>({ domestic: 0, international: 0 });
  const [songs, setSongs] = useState<AdminSongDividend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const offeringResponse = await getOffering({
          offeringId,
        });
        setOffering(offeringResponse);
        const tradesResponse = await getTrades({
          offeringId,
        });
        setTrades(tradesResponse);
        const { payouts, songs, regions } = await getDividends({
          offeringId,
        });
        setPayouts(payouts);
        setSongs(songs);
        setRegions(regions);
      } catch (e) {
        console.log('Error:', e);
      }
      setIsLoading(false);
    })();
  }, [offeringId, params.offeringId, transaction, refreshTrigger]);

  const callMintTo = async (orderId: string) => {
    try {
      const { transaction } = await mintTo({ tradeId: orderId });
      setTransaction(transaction);
      setOffering(undefined);
      setTrades(undefined);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <OfferingContainer>
      <Link to={'/admin/offerings'}>Back to all Offerings</Link>
      {isLoading && <CenteredSpinner />}
      {!isLoading && offering && (
        <OfferingData>
          <OfferingTitle>{offering.issueName}</OfferingTitle>
          <OfferingText>
            {offering.remainingShares}/{offering.totalShares} shares remaining
          </OfferingText>
          <OfferingText>Share price: ${offering.unitPrice}</OfferingText>
          <OfferingText>
            Open from {offering.startDate} to {offering.endDate}
          </OfferingText>
          <a href={`/admin/offering/payout/${offeringId}/`}>Pay Royalties</a>
          <OfferingText>
            <a
              href={`https://mumbai.polygonscan.com/token/${offering.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contract: {offering.contractAddress}
            </a>
          </OfferingText>
          <DividendHistoryEdit
            payouts={payouts}
            setPayouts={setPayouts}
            offeringId={offeringId}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
          />
          <DividendSongsEdit
            songs={songs}
            setSongs={setSongs}
            offeringId={offeringId}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
          />
          <DividendRegionEdit regions={regions} setRegions={setRegions} offeringId={offeringId} />
          {trades && (
            <Table>
              <TableHead>
                <tr>
                  <th>User</th>
                  <th>Order</th>
                  <th>Shares</th>
                  <th>Order Status</th>
                  <th>NFT</th>
                </tr>
              </TableHead>
              <tbody>
                {trades.map((trade) => (
                  <Tr key={trade.orderId}>
                    <td>{trade.email}</td>
                    <td>
                      <a href={`/status/${trade.orderId}`}>{trade.orderId}</a>
                    </td>
                    <td>{trade.totalShares}</td>
                    <td>{trade.orderStatus}</td>
                    {trade.minted === 'False' && trade.orderStatus === 'SETTLED' && (
                      <>
                        {trade.linkedWallet ? (
                          <td>
                            <Button onClick={() => callMintTo(trade.orderId)}>Mint</Button>
                          </td>
                        ) : (
                          <td>No wallet linked</td>
                        )}
                      </>
                    )}
                    {trade.minted === 'True' && (
                      <td>
                        <a
                          href={`https://mumbai.polygonscan.com/token/${trade.contractAddress}?a=${trade.tokenId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Token {trade.tokenId}
                        </a>
                      </td>
                    )}
                    {trade.orderStatus !== 'SETTLED' && <td>Not Settled</td>}
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
          {transaction !== '' && (
            <TransactionConfirmation>
              <a href={`https://mumbai.polygonscan.com/tx/${transaction}`} target="_blank" rel="noopener noreferrer">
                Transaction confirmation
              </a>
            </TransactionConfirmation>
          )}
        </OfferingData>
      )}
      <ErrorMessage error={error} />
    </OfferingContainer>
  );
};

const Tr = styled.tr`
  height: 50px;
`;

const TableHead = styled.thead`
  padding-bottom: 100px;
`;

const Table = styled.table`
  margin: 50px 0;
  width: -webkit-fill-available;
`;

const OfferingData = styled.div`
  padding: 8px;
  padding-top: 20px;
`;

const OfferingText = styled.p`
  margin-bottom: 10px;
`;

const OfferingTitle = styled.h2`
  text-align: center;
  height: 60px;
`;

const OfferingContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 80px;
`;

const TransactionConfirmation = styled.div`
  padding: 10px;
`;
