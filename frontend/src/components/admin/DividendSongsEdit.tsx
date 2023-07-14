import React from 'react';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import { AdminSongDividend } from 'types';
import { saveDividendSongs } from 'api/admin';

interface Props {
  songs: AdminSongDividend[];
  setSongs: (p: AdminSongDividend[]) => void;
  offeringId: number;
  refreshTrigger: number;
  setRefreshTrigger: (p: number) => void;
}

export const DividendSongsEdit: React.FC<Props> = ({
  songs,
  setSongs,
  offeringId,
  refreshTrigger,
  setRefreshTrigger,
}) => {
  const addSongRow = () => {
    const maxId = Math.max(...songs.map((payout) => payout.id || 0), 0) + 1;
    setSongs([...songs, { id: maxId, song: '', amount: 0, dirty: true }]);
  };

  const saveRows = () => {
    saveDividendSongs({ songs: songs, offeringId: offeringId });
    setRefreshTrigger(refreshTrigger + 1);
  };

  const handleAmountChange = (id: number, value: number) => {
    setSongs(songs.map((row) => (row.id === id ? { ...row, amount: value } : row)));
  };

  const handleNameChange = (id: number, value: string) => {
    setSongs(songs.map((row) => (row.id === id ? { ...row, song: value } : row)));
  };

  const markDeleted = (id: number) => {
    setSongs(songs.map((row) => (row.id === id ? { ...row, deleted: true } : row)));
  };

  return (
    <div>
      <h4>Song Dividend History</h4>
      <Table>
        <TableHead>
          <tr>
            <th>Song</th>
            <th>Amount</th>
          </tr>
        </TableHead>
        <tbody>
          {songs
            .filter((row) => !row.deleted)
            .map((row) => (
              <tr key={row.id}>
                <td>
                  <input type="text" value={row.song} onChange={(e) => handleNameChange(row.id || 0, e.target.value)} />
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
      <Button onClick={addSongRow}>Add Row</Button>
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
