import React from 'react';
import styled from 'styled-components';
import heartSvg from 'assets/heart.svg';
import emptyHeartSvg from 'assets/emptyHeart.svg';
import { Token } from 'types';
import { likeToken } from 'api/offerings';

interface Props {
  token: Token | undefined;
  setToken: ((token: Token) => void) | undefined;
}

export const TokenThumbnail: React.FC<Props> = ({ token, setToken }) => {
  const onLikeToken = () => {
    if (token && setToken) {
      likeToken({ offeringId: token.offeringId, NFT: token.NFT });
      setToken({ ...token, liked: !token.liked });
    }
  };

  return (
    <ImageContainer>
      {token && (
        <>
          <OfferingImage src={`${process.env.PUBLIC_URL}/${token.offeringId}.png`} />
          <LikeButton src={token.liked ? heartSvg : emptyHeartSvg} alt="" onClick={onLikeToken} />
        </>
      )}
    </ImageContainer>
  );
};

const LikeButton = styled.img`
  position: relative;
  left: 105px;
  top: -135px;
  width: 30px;
  height: 30px;
  z-index: 1;
`;

const ImageContainer = styled.div`
  max-width: 140px;
  max-height: 140px;
  margin-bottom: 20px;
`;

const OfferingImage = styled.img`
  max-width: 140px;
  max-height: 140px;
`;
