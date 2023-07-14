import React from 'react';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import { AdminDividendRegion } from 'types';
import { saveDividendRegion } from 'api/admin';

interface Props {
  regions: AdminDividendRegion;
  setRegions: (p: AdminDividendRegion) => void;
  offeringId: number;
}

export const DividendRegionEdit: React.FC<Props> = ({ regions, setRegions, offeringId }) => {
  const handleInternationalChange = (value: number) => {
    setRegions({ id: regions.id, domestic: regions.domestic, international: value });
  };

  const handleDomesticChange = (value: number) => {
    setRegions({ id: regions.id, domestic: value, international: regions.international });
  };

  const saveRows = () => {
    saveDividendRegion({ regions: regions, offeringId: offeringId });
  };

  return (
    <div>
      <h4>Dividend Regions</h4>
      <Table>
        <TableHead>
          <tr>
            <th>Domestic</th>
            <th>International</th>
          </tr>
        </TableHead>
        <tbody>
          <tr key={regions.id}>
            <td>
              <input type="number" value={regions.domestic} onChange={(e) => handleDomesticChange(+e.target.value)} />
            </td>
            <td>
              <input
                type="number"
                value={regions.international}
                onChange={(e) => handleInternationalChange(+e.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </Table>
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
