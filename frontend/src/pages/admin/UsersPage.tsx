import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import { allUsers, requestManualKYC, approveKYC } from 'api/admin';
import { User } from 'types';
import { CenteredSpinner } from 'components/CenteredSpinner';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[] | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const response = await allUsers();
        setUsers(response);
        setIsLoading(false);
      } catch (e) {
        history.push('/home');
        console.log('Error:', e);
      }
    })();
  }, [history, refreshTrigger]);

  const requestKYCDocuments = async (partyId: string) => {
    setIsLoading(true);
    await requestManualKYC(partyId);
    setRefreshTrigger(refreshTrigger + 1);
  };

  const manualApproveKYC = async (partyId: string) => {
    setIsLoading(true);
    await approveKYC(partyId);
    setRefreshTrigger(refreshTrigger + 1);
  };

  return (
    <AdminContainer>
      {isLoading && <CenteredSpinner />}
      {!isLoading && (
        <>
          <h1>Admin Panel</h1>
          <h3>
            <AdminLinks to={'/admin/offerings'}>Admin Offerings</AdminLinks>
          </h3>
          {!users && <CenteredSpinner />}
          {users && (
            <>
              <Table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>KYC</th>
                    <th>Wallet</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <Tr key={user.emailAddress}>
                      <td>{user.emailAddress}</td>
                      <td>{user.kycStatus}</td>
                      <td>{user.wallet}</td>
                      <td>
                        {user.onboardingStatus === 'KYC_DOCUMENT_REQUEST_NEEDED' && (
                          <Button onClick={() => requestKYCDocuments(user.partyId)}>Request Documents</Button>
                        )}
                        {user.onboardingStatus === 'KYC_MANUAL_APPROVAL_NEEDED' && (
                          <Button onClick={() => manualApproveKYC(user.partyId)}>Approve</Button>
                        )}
                      </td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </>
      )}
    </AdminContainer>
  );
};

const Tr = styled.tr`
  height: 50px;
`;

const AdminLinks = styled(Link)`
  padding-bottom: 30px;
`;

const Table = styled.table`
  width: -webkit-fill-available;
`;

const AdminContainer = styled.div`
  margin: 20px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
