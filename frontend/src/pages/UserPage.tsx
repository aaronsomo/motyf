import React, { useContext } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { UserContext } from 'UserContext';


export const UserPage: React.FC = () => {
  const { email, onboardingStatus } = useContext(UserContext);
  return (
    <UserContainer>
      <h5>Welcome, {email}</h5>
      <Container>
        {onboardingStatus !== 'ONBOARDING_COMPLETE' && onboardingStatus !== 'KYC_MANUAL_APPROVAL_NEEDED' && (
          <>
            <UserLink to={'onboard-redirect'}>We need a few more details before you can participate in offerings</UserLink>
          </>
        )}
        {onboardingStatus === 'KYC_MANUAL_APPROVAL_NEEDED' && (
          <>
            We are reviewing your information for approval to participate in offerings
          </>
        )}
        {onboardingStatus === 'ONBOARDING_COMPLETE' && (
          <>
            User onboarding complete!
          </>
        )}
        <Spacer/>
        <UserLink to={'/offerings'}>View our offerings</UserLink>
      </Container>
    </UserContainer>
  );
};

const Spacer = styled.div`
  margin: 8px;
`;

const UserLink = styled(Link)`
  padding-top: 8px;
`;

const Container = styled.div`
  padding: 10px 10px;
  margin: 10px 0px;
  border-radius: 6px;
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const UserContainer = styled.div`
  margin: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;