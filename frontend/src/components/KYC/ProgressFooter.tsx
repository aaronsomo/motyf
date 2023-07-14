import React from 'react';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';
import { useHistory } from 'react-router-dom';

interface Props {
  buttonLabel: string;
  progress?: string;
  disabled?: boolean;
  back?: () => void;
}

export const ProgressFooter: React.FC<Props> = ({ buttonLabel, disabled, back, progress }) => {
  const history = useHistory();
  return (
    <>
      <OnboardFooter>
        {!back && (
          <OnboardButton disabled={disabled || false} type="submit">
            {buttonLabel}
          </OnboardButton>
        )}
        {back && (
          <>
            <MainActions>
              <OnboardButton className="btn-secondary" onClick={back}>
                <b>Back</b>
              </OnboardButton>
              <OnboardButton disabled={disabled || false} type="submit">
                {buttonLabel}
              </OnboardButton>
            </MainActions>
            <BackLink onClick={() => history.push('home')}>
              <b>Finish Later</b>
            </BackLink>
          </>
        )}
      </OnboardFooter>
    </>
  );
};

const MainActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

const BackLink = styled.div`
  text-decoration-line: underline;
  cursor: pointer;
`;

const OnboardFooter = styled.div`
  height: 20vh;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
`;

const OnboardButton = styled(Button)`
  width: fit-content;
  padding: 10px 20px;
  border-radius: 6px;
  align-self: flex-end;
  margin-bottom: 20px;
`;
