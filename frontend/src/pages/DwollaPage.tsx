import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  getDwollaStatus,
  addBankAccount,
  verifyBankAccount,
  transferToWallet,
  requestVerifyBankAccount,
  removeDwollaFundingSource,
} from 'api/kyc';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { FundingSource } from 'types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import trash from '../assets/trash.svg';

export const DwollaPage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [routing, setRouting] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [type, setType] = useState<string>('checking');
  const [name, setName] = useState<string>('');
  const [fundingAmount, setFundingAmount] = useState<number>(0);
  const [fundingTarget, setFundingTarget] = useState<string>('');
  const [verificationAmount1, setVerificationAmount1] = useState<number>(0);
  const [verificationAmount2, setVerificationAmount2] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const response = await getDwollaStatus();
        setCurrency(response.currency);
        setBalance(response.balance);
        setFundingSources(response.fundingSources);
        setIsLoading(false);
      } catch (e) {
        console.log('Error:', e);
        setError(e.message);
        setIsLoading(false);
      }
    })();
  }, [refreshTrigger]);

  const linkBankAccount = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsLoading(true);
      await addBankAccount({
        routingNumber: routing,
        accountNumber: account,
        bankAccountType: type,
        name: name,
      });
      setRefreshTrigger(refreshTrigger + 1);
    } catch (e) {
      console.log('Error:', e);
    }
    setIsLoading(false);
  };

  const requestVerification = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsLoading(true);
      await requestVerifyBankAccount({
        id: fundingTarget,
      });
      setRefreshTrigger(refreshTrigger + 1);
    } catch (e) {
      console.log('Error:', e);
    }
    setIsLoading(false);
  };

  const verifyAccount = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsLoading(true);
      await verifyBankAccount({
        id: fundingTarget,
        amount1: verificationAmount1,
        amount2: verificationAmount2,
      });
      setRefreshTrigger(refreshTrigger + 1);
    } catch (e) {
      console.log('Error:', e);
    }
    setIsLoading(false);
  };

  const transferWallet = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsLoading(true);
      await transferToWallet({
        id: fundingTarget,
        amount: fundingAmount,
      });
      setRefreshTrigger(refreshTrigger + 1);
    } catch (e) {
      console.log('Error:', e);
    }
    setIsLoading(false);
  };

  const removeBankAccount = async (e: any, fundingSourceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsLoading(true);
      await removeDwollaFundingSource({
        fundingSourceId,
      });
      setRefreshTrigger(refreshTrigger + 1);
    } catch (e) {
      console.log('Error:', e);
    }
    setIsLoading(false);
  };

  return (
    <UserContainer>
      {isLoading && <CenteredSpinner />}
      {!isLoading && (
        <>
          {error !== '' && (
            <>
              <UserLink to={'onboard-redirect'}>You need to complete onboarding to fund your secondary wallet</UserLink>
              <br />
              <p>The following errors were found in your onboarding data: {error}</p>
            </>
          )}
          <p>
            Your wallet contains {balance} {currency}
          </p>
          <Spacer />
          {fundingSources && fundingSources.length === 0 && <p>You have not added any external funding sources</p>}
          {fundingSources && fundingSources.length !== 0 && (
            <Table>
              <TableHead>
                <tr key="head">
                  <GradientHeader>Source</GradientHeader>
                  <GradientHeader>Name</GradientHeader>
                  <GradientHeader>Bank</GradientHeader>
                  <GradientHeader>Account Type</GradientHeader>
                  <GradientHeader>Status</GradientHeader>
                  <GradientHeader style={{ textAlign: 'center' }}>Remove</GradientHeader>
                </tr>
              </TableHead>
              <tbody>
                {fundingSources.map((source) => (
                  <tr key={source.name}>
                    <td>{source.type}</td>
                    <td>{source.name}</td>
                    <td>{source.bankName}</td>
                    <td>{source.accountType}</td>
                    <td>{source.verified}</td>
                    <td
                      height={'40px'}
                      align={'center'}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => removeBankAccount(e, source.id)}
                    >
                      <img style={{ color: 'white' }} src={trash} alt="remove" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <DwollaAction>
            <InputContainer>
              <Input
                as="select"
                value={fundingTarget}
                placeholder="Funding target"
                required={true}
                onChange={(e: any) => setFundingTarget(e.target.value)}
              >
                <option key="" value="" disabled>
                  Select account
                </option>
                {fundingSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </Input>
            </InputContainer>
            <Button onClick={requestVerification}>Request Verification</Button>
          </DwollaAction>

          <br />
          <br />
          <DwollaAction>
            <InputContainer>
              <Input
                as="select"
                value={fundingTarget}
                placeholder="Funding target"
                required={true}
                onChange={(e: any) => setFundingTarget(e.target.value)}
              >
                <option key="" value="" disabled>
                  Select account
                </option>
                {fundingSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </Input>
            </InputContainer>
            <InputContainer>
              <Input
                type="number"
                step=".01"
                value={verificationAmount1}
                placeholder="Funding amount"
                required={true}
                onChange={(e: any) => setVerificationAmount1(parseFloat(e.target.value))}
              />
            </InputContainer>
            <InputContainer>
              <Input
                type="number"
                step=".01"
                value={verificationAmount2}
                placeholder="Funding amount"
                required={true}
                onChange={(e: any) => setVerificationAmount2(parseFloat(e.target.value))}
              />
            </InputContainer>
            <Button onClick={verifyAccount}>Submit Verification</Button>
          </DwollaAction>
          <br />
          <br />
          <DwollaAction>
            <InputContainer>
              <Input
                as="select"
                value={fundingTarget}
                placeholder="Funding target"
                required={true}
                onChange={(e: any) => setFundingTarget(e.target.value)}
              >
                <option key="" value="" disabled>
                  Select account
                </option>
                {fundingSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </Input>
            </InputContainer>
            <InputContainer>
              <Input
                type="number"
                value={fundingAmount}
                placeholder="Funding amount"
                required={true}
                onChange={(e: any) => setFundingAmount(parseFloat(e.target.value))}
              />
            </InputContainer>
            <Button onClick={transferWallet}>Transfer to Balance</Button>
          </DwollaAction>
          <br />
          <br />
          <DwollaAction>
            <InputContainer>
              <Input
                type="text"
                value={routing}
                placeholder="Routing name"
                required={true}
                onChange={(e: any) => setRouting(e.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <Input
                type="text"
                value={account}
                placeholder="Account number"
                required={true}
                onChange={(e: any) => setAccount(e.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <Input
                as="select"
                value={type}
                placeholder="Account name"
                required={true}
                onChange={(e: any) => setType(e.target.value)}
              >
                <option key={'checking'} value={'checking'}>
                  {'checking'}
                </option>
                <option key={'savings'} value={'savings'}>
                  {'savings'}
                </option>
              </Input>
            </InputContainer>
            <InputContainer>
              <Input
                type="text"
                value={name}
                placeholder="Account name"
                required={true}
                onChange={(e: any) => setName(e.target.value)}
              />
            </InputContainer>
            <Button onClick={linkBankAccount}>Link Bank Account</Button>
          </DwollaAction>
        </>
      )}
    </UserContainer>
  );
};

const DwollaAction = styled.div`
  border: 1px solid;
  display: flex;
  padding: 20px;
  flex-direction: column;
  border-radius: 10px;
`;

const TableHead = styled.thead`
  padding-bottom: 100px;
`;

const Table = styled.table`
  margin: 50px 0;
  width: 100%;
`;

const GradientHeader = styled.th`
  margin-bottom: 0;
  color: white;
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 120%;
  letter-spacing: 0.04em;
  width: fit-content;
`;

const Input = styled(Form.Control)`
  width: 300px !important;
  border: none !important;
  margin: 0 5px;
  padding: 7px;
  margin: 0 10px;
  &:focus,
  &:focus-visible {
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
  }
  &:focus-visible {
    border: none !important;
    box-shadow: none !important;
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  background-color: white;
  width: fit-content;
  border-radius: 3px;
  margin-bottom: 10px;
`;

const Spacer = styled.div`
  margin: 8px;
`;

const UserLink = styled(Link)`
  padding-top: 8px;
`;

const UserContainer = styled.div`
  margin: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
