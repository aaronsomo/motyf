import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { LoginCheck } from './LoginCheck';

interface Props {
  loginRedirect?: string;
  loginCallback?: () => React.ReactNode;
}

export const PrivateRoute: React.FC<Props & RouteProps> = ({
  children,
  loginRedirect,
  ...rest
}) => (
  <Route {...rest}>
    <LoginCheck>
      {children}
    </LoginCheck>
  </Route>
);
