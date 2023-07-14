import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { CenteredSpinner } from 'components/CenteredSpinner';
import { Token } from 'types';
import { getAllUserTokens, getLikedUserTokens } from 'api/checkout';
import { TokenGrid } from 'components/TokenGrid';
import heartSvg from 'assets/heart.svg';
import { MOBILE_MAX_WIDTH } from '../constants';

export const LockerPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingTokens, setPendingTokens] = useState<Token[] | undefined>(undefined);
  const [offeredTokens, setOfferTokens] = useState<Token[] | undefined>(undefined);
  const [listedTokens, setListedTokens] = useState<Token[] | undefined>(undefined);
  const [unlistedTokens, setUnlistedTokens] = useState<Token[] | undefined>(undefined);
  const [likedTokens, setLikedTokens] = useState<Token[] | undefined>(undefined);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        //split this call into sections
        const { pendingTokens, offeredTokens, listedTokens, unlistedTokens } = await getAllUserTokens();
        const { userTokens: likedTokens } = await getLikedUserTokens();
        setPendingTokens(pendingTokens);
        setOfferTokens(offeredTokens);
        setListedTokens(listedTokens);
        setUnlistedTokens(unlistedTokens);
        setLikedTokens(likedTokens);
        setIsLoading(false);
      } catch (e) {
        console.log('Error:', e);
        history.push('/home');
      }
    })();
  }, [history]);

  return (
    <LockerContainer>
      {isLoading && <CenteredSpinner />}
      {!isLoading && pendingTokens && offeredTokens && listedTokens && unlistedTokens && likedTokens && (
        <>
          <TokenGrid tokens={unlistedTokens} title={<>My Motyfs</>} orderStatusLink />
          {offeredTokens.length > 0 && <TokenGrid tokens={offeredTokens} title={<>Offers</>} />}
          {listedTokens.length > 0 && <TokenGrid tokens={listedTokens} title={<>Listings</>} />}
          {pendingTokens.length > 0 && <TokenGrid tokens={pendingTokens} title={<>Pending Motyfs</>} />}
          <TokenGrid
            tokens={likedTokens}
            title={
              <>
                My <img alt="" src={heartSvg} />
                's
              </>
            }
          />
        </>
      )}
      {!isLoading && <></>}
    </LockerContainer>
  );
};

const LockerContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 100px;
  font-weight: 500;
  font-size: 16px;
  line-height: 120%;
  letter-spacing: 0.04em;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    margin: 20px;
    justify-content: center;
  }
`;
