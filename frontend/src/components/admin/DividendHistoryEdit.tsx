import React from 'react';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import { AdminDividend } from 'types';
import { saveDividendHistory } from 'api/admin';

interface Props {
  payouts: AdminDividend[];
  setPayouts: (p: AdminDividend[]) => void;
  offeringId: number;
  refreshTrigger: number;
  setRefreshTrigger: (p: number) => void;
}

export const DividendHistoryEdit: React.FC<Props> = ({
  payouts,
  setPayouts,
  offeringId,
  refreshTrigger,
  setRefreshTrigger,
}) => {
  const addPayoutRow = () => {
    const maxId = Math.max(...payouts.map((payout) => payout.id || 0), 0) + 1;
    setPayouts([...payouts, { id: maxId, year: 0, quarter: 0, amount: 0, dirty: true }]);
  };

  const saveRows = () => {
    saveDividendHistory({ payouts: payouts, offeringId: offeringId });
    setRefreshTrigger(refreshTrigger + 1);
  };

  const handleAmountChange = (id: number, value: number) => {
    setPayouts(payouts.map((row) => (row.id === id ? { ...row, amount: value } : row)));
  };

  const handleQuarterChange = (id: number, value: number) => {
    setPayouts(payouts.map((row) => (row.id === id ? { ...row, quarter: value } : row)));
  };

  const handleYearChange = (id: number, value: number) => {
    setPayouts(payouts.map((row) => (row.id === id ? { ...row, year: value } : row)));
  };

  const markDeleted = (id: number) => {
    setPayouts(payouts.map((row) => (row.id === id ? { ...row, deleted: true } : row)));
  };

  return (
    <div>
      <h4>Dividend History</h4>
      <Table>
        <TableHead>
          <tr>
            <th>Year</th>
            <th>Quarter</th>
            <th>Amount</th>
          </tr>
        </TableHead>
        <tbody>
          {payouts
            .filter((row) => !row.deleted)
            .map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="number"
                    value={row.year}
                    onChange={(e) => handleYearChange(row.id || 0, +e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.quarter}
                    onChange={(e) => handleQuarterChange(row.id || 0, +e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => handleAmountChange(row.id || 0, +e.target.value)}
                  />
                </td>
                <td>
                  <Button className="btn-secondary" onClick={() => markDeleted(row.id || 0)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <Button onClick={addPayoutRow}>Add Row</Button>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <Button onClick={saveRows}>Save</Button>
      <br />
      <br />
    </div>
  );
};

const TableHead = styled.thead`
  padding-bottom: 100px;
`;

const Table = styled.table`
  margin-bottom: 50px;
  width: -webkit-fill-available;
`;
