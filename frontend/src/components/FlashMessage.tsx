import React from 'react';
import styled from 'styled-components';
import checkSvg from 'assets/blackCheck.svg';

export const FlashMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FlashMessageBox>
      <FlashSvg src={checkSvg} alt="" />
      &nbsp;
      {children}
    </FlashMessageBox>
  );
};

const FlashMessageBox = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 50px;
  width: 100%;
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  color: #171717;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 120%;
  z-index: 1;
  text-align: center;
  letter-spacing: 0.04em;
`;

const FlashSvg = styled.img`
  color: black;
`;
