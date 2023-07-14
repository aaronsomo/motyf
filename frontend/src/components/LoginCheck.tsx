import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { UserContext } from 'UserContext';

export const LoggedInCheck: React.FC = ({ children }) => {
  const { isLoggedIn } = useContext(UserContext);
  if (isLoggedIn === null) return <></>;
  if (!isLoggedIn) return <>{children}</>;
  return <Redirect to={'/home'} />;
};

export const LoginCheck: React.FC = ({ children }) => {
  const { isLoggedIn } = useContext(UserContext);
  if (isLoggedIn === null) return <></>;
  if (isLoggedIn) return <>{children}</>;
  return <Redirect to={'/login'} />;
};
