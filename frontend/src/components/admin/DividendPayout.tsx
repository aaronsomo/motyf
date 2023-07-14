import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import moment from 'moment';
import { CapTableEntry, Offering, RoyaltyPaid } from 'types';
import { getCapTable, getRoyalties, payRoyalties } from 'api/admin';
import { getOffering } from 'api/offerings';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { ErrorMessage } from 'components/ErrorMessage';

interface Props {
  offeringId: number;
}

const DATE_FORMAT = ['[0-1]', '\\d', '\\-', '[0-3]', '\\d', '\\-', '[1-2]', '[0|9]', '\\d', '\\d', '$'];
const DATE_REGEX = new RegExp(DATE_FORMAT.join(''));

export const DividendPayout: React.FC<Props> = ({ offeringId }) => {
  const [payout, setPayout] = useState<number>(0);
  const [date, setDate] = useState<string>(moment(Date.now()).format('MM-DD-YYYY'));
  const [capTable, setCapTable] = useState<CapTableEntry[]>([]);
  const [offering, setOffering] = useState<Offering | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [royaltiesPaid, setRoyaltiesPaid] = useState<RoyaltyPaid[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const userShares = capTable.reduce((total, obj) => total + obj.shares, 0);

  const calculatePayout = (v: number) => {
    if (!offering) {
      return 0;
    }
    return Math.round((v / offering.totalShares) * payout * 100) / 100;
  };

  const userPayout = capTable.reduce((total, obj) => total + calculatePayout(obj.shares), 0);

  const setDateHelper = (e: any) => {
    const input = e.target.value;
    const regex = new RegExp(DATE_FORMAT.slice(0, input.length).join(''));

    if (input.match(regex)) {
      if ((input.length === 2 && date.length === 1) || (input.length === 5 && date.length === 4)) {
        setDate(input + '-');
      } else {
        setDate(input);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (!date.match(DATE_REGEX) || date.length !== 10) {
        return;
      }
      try {
        setIsLoading(true);
        const offeringResponse = await getOffering({
          offeringId,
        });
        setOffering(offeringResponse);
        const { capTable } = await getCapTable({
          offeringId: offeringId,
          date: date,
        });
        setCapTable(capTable);
        const { payouts } = await getRoyalties({ offeringId });
        setRoyaltiesPaid(payouts);
        setError('');
      } catch (e) {
        setError(e.message);
        console.log('Error:', e);
      }
      setIsLoading(false);
    })();
  }, [refreshTrigger, offeringId, date]);

  const triggerRoyalties = async () => {
    try {
      await payRoyalties({
        offeringId: offeringId,
        date: date,
        payout: payout,
      });
      setRefreshTrigger(refreshTrigger + 1);
    } catch (e) {
      setError(e.message);
      console.log('Error:', e);
    }
  };

  return (
    <div>
      {isLoading && <CenteredSpinner />}
      {!isLoading && offering && (
        <>
          <h4>Pay Dividends</h4>
          Dividend amount: $<input type="number" value={payout} onChange={(e) => setPayout(+e.target.value)} />
          <br />
          <br />
          Dividend Distribution Date: &nbsp;
          <input type="text" value={date} placeholder={'MM-DD-YYYY'} onChange={setDateHelper} />
          &nbsp;&nbsp;
          <br />
          <br />
          <p>Undistributed Shares: {offering.totalShares - userShares}</p>
          <p>Retained Royalties: ${(payout - userPayout).toFixed(2)}</p>
          <p>User Shares: {userShares}</p>
          <p>Paid Royalties: ${userPayout.toFixed(2)}</p>
          <RoyaltyButton onClick={() => triggerRoyalties()}>Pay Royalties</RoyaltyButton>
          <br />
          <ErrorMessage error={error} />
          <Table>
            <TableHead>
              <tr>
                <th>User</th>
                <th>Shares</th>
                <th>Payout</th>
              </tr>
            </TableHead>
            <tbody>
              {capTable.map((row) => (
                <tr key={row.party}>
                  <td>
                    <a href={row.party} target="_blank" rel="noopener noreferrer">
                      {row.username}
                    </a>
                  </td>
                  <td>{row.shares}</td>
                  <td>${calculatePayout(row.shares)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h4>Past Payouts</h4>
          <Table>
            <TableHead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Executed</th>
              </tr>
            </TableHead>
            <tbody>
              {royaltiesPaid.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.amount}</td>
                  <td>{String(row.executed)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

const RoyaltyButton = styled(Button)`
  padding: 8px !important;
  margin-bottom: 10px !important;
`;

const TableHead = styled.thead`
  padding-bottom: 100px;
`;

const Table = styled.table`
  margin-bottom: 50px;
  width: -webkit-fill-available;
`;
