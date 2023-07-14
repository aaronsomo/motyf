import styled from 'styled-components';
import { MOBILE_MAX_WIDTH } from '../constants';

export const OfferingData = styled.div`
  width: 33%;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    width: 100%;
    margin-bottom: 40px;
  }
`;

export const OfferingRight = styled.div`
  width: 66%;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    width: 100%;
  }
`;

export const OfferingTitle = styled.div`
  margin-bottom: 25px;
  font-style: normal;
  font-weight: 500;
  font-size: 28px;
  line-height: 120%;
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
  width: fit-content;
`;

export const OfferingContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 100px 100px 100px;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    flex-direction: column;
    margin: 20px;
  }
`;
