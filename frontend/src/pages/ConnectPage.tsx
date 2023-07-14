import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import { polygonTestnet } from '../constants';
import {
  RightPageForm,
  PageContainer,
  LeftPageContainer,
  GradientHeader,
  HeaderSubtitle,
  LogoImage,
} from 'components/KYC/SplitPageForm';
import { UserContext } from 'UserContext';
import { toHex, truncateAddress } from 'utils/addresses';
import { addWallet } from 'api/kyc';
import { ErrorMessage } from 'components/ErrorMessage';
import WalletConnect from '@walletconnect/web3-provider';
import queryString from 'query-string';

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: '27e484dcd9e3efcfd25a83a78777cdf1', // required
    },
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: providerOptions,
});

const polygonNetwork = polygonTestnet;

export const ConnectPage: React.FC = () => {
  const { email, externalWallet, refreshLoggedIn } = useContext(UserContext);
  const history = useHistory();
  const [provider, setProvider] = useState<any>();
  const [library, setLibrary] = useState<any>();
  const [account, setAccount] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [chainId, setChainId] = useState<string | undefined>(undefined);
  const location = useLocation();
  const redirect = queryString.parse(location.search).redirect as string;
  const next_page = redirect ? `/onboard-redirect?redirect=${encodeURIComponent(redirect)}` : '/onboard-redirect';

  // Match message in api_kyc
  const message = `I authorize this wallet to recieve NFTs from Motyf on behalf of ${email}`;

  const switchNetwork = useCallback(async () => {
    try {
      await library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: polygonNetwork.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: 'wallet_addEthereumChain',
            params: [polygonNetwork],
          });
        } catch (error) {
          setError(error.message);
        }
      }
    }
  }, [library]);

  const connectWallet = useCallback(async () => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) setAccount(accounts[0]);
      if (toHex(network.chainId) !== polygonNetwork.chainId) {
        await switchNetwork();
      }
      setChainId(toHex(network.chainId));
    } catch (error) {
      setError(error.message);
    }
  }, [switchNetwork]);

  const signMessage = async () => {
    if (!library) return;
    try {
      const signature = await library.provider.request({
        method: 'personal_sign',
        params: [message, account],
      });
      await addWallet({ wallet: account, signature });
      await refreshLoggedIn();
      setSignature(signature);
      setSuccessMessage(true);
      setError('');
    } catch (error) {
      console.log('Error:', error);
      setError(error.message);
    }
  };

  const disconnect = useCallback(async () => {
    await web3Modal.clearCachedProvider();
    setAccount('');
    setChainId(undefined);
    setSignature('');
    setSuccessMessage(false);
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: any) => {
        // disconnect();
        if (accounts) setAccount(accounts[0]);
      };

      const handleChainChanged = (_hexChainId: any) => {
        setChainId(_hexChainId);
        switchNetwork();
      };

      const handleDisconnect = () => {
        disconnect();
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [provider, disconnect, switchNetwork]);

  return (
    <PageContainer>
      <LeftPageContainer />
      <RightPageForm
        onSubmit={() => history.push(next_page)}
        back={() => history.push('/suitability')}
        progress={'100%'}
      >
        <LogoImage />
        <GradientHeader>Connect your Polygon wallet</GradientHeader>
        <HeaderSubtitle>We need your Polygon wallet to send you NFTs</HeaderSubtitle>
        {externalWallet && (
          <InfoContainer>Your account is currently connect to the wallet {externalWallet}</InfoContainer>
        )}
        {!account ? (
          <WalletButton onClick={connectWallet}>Connect Wallet</WalletButton>
        ) : (
          <WalletButton onClick={disconnect}>Disconnect Wallet</WalletButton>
        )}
        {account && (
          <>
            <InfoContainer>Account: {account}</InfoContainer>
            <InfoContainer>Network ID: {chainId ? chainId : 'No Network'}</InfoContainer>
          </>
        )}
        {account && (
          <>
            <WalletButton onClick={signMessage} disabled={!message}>
              Sign Message
            </WalletButton>
            {signature && <InfoContainer>Signed message: {truncateAddress(signature)}</InfoContainer>}
          </>
        )}
        {successMessage && <InfoContainer>You have successfully linked your wallet {account}!</InfoContainer>}
        <ErrorMessage error={error} />
      </RightPageForm>
    </PageContainer>
  );
};

const InfoContainer = styled.div``;

const WalletButton = styled(Button)`
  width: fit-content;
  margin: 20px 10px;
`;
