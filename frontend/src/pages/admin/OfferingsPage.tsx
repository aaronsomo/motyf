import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { allOfferings } from 'api/offerings';
import { deploy } from 'api/admin';
import { Offering } from 'types';
import { CenteredSpinner } from 'components/CenteredSpinner';
import Button from 'react-bootstrap/Button';

export const AdminOfferingsPage: React.FC = () => {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const response = await allOfferings();
        setOfferings(response);
        setIsLoading(false);
      } catch (e) {
        console.log('Error:', e);
      }
    })();
  }, [refreshTrigger]);

  const deployContract = async (offeringId: number) => {
    setIsLoading(true);
    await deploy({ offeringId });
    setRefreshTrigger(refreshTrigger + 1);
  };

  return (
    <OfferingsContainer>
      <h1>Offerings</h1>
      {isLoading ? (
        <CenteredSpinner />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Remaining Shares</th>
              <th>Total Shares</th>
              <th>Contract</th>
            </tr>
          </thead>
          <tbody>
            {offerings.map((offering) => (
              <tr key={offering.issueName}>
                <Td>
                  <Link to={`/admin/offering/${offering.offeringId}`}>{offering.issueName}</Link>
                </Td>
                <Td>{offering.remainingShares}</Td>
                <Td>{offering.totalShares}</Td>
                {!offering.contractAddress ? (
                  <Td>
                    <Button onClick={() => deployContract(offering.offeringId)}>Deploy Contract</Button>
                  </Td>
                ) : (
                  <Td>
                    <a
                      href={`https://mumbai.polygonscan.com/address/${offering.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Polygon Scan
                    </a>
                  </Td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </OfferingsContainer>
  );
};

const Td = styled.td`
  padding-bottom: 8px;
`;

const OfferingsContainer = styled.div`
  margin: 10px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Table = styled.table`
  width: -webkit-fill-available;
`;
