import React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import styled from 'styled-components';

export const CenteredSpinner: React.FC = () => (
  <SpinnerContainer className="d-flex flex-row justify-content-center m-auto">
    <Spinner animation="border" />
  </SpinnerContainer>
);

const SpinnerContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
