import React, { useCallback, useEffect, useState } from 'react';

import { checkLogin } from 'api/auth';
import { Permission } from './constants';

interface Props {
  children: React.ReactNode;
}

interface UserContextProps {
  isLoggedIn?: boolean | null;
  email?: string | null;
  permissions?: Permission[] | null;
  onboardingStatus?: string | null;
  externalWallet?: string | null;
  refreshLoggedIn: () => Promise<void>;
}

const UserContext = React.createContext<UserContextProps>({
  refreshLoggedIn: async () => {},
});

const UserContextProvider: React.FC<Props> = ({ children }: Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Array<Permission> | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<string | null | undefined>(null);
  const [externalWallet, setExternalWallet] = useState<string | null | undefined>(null);

  const refreshLoggedIn = useCallback(async () => {
    try {
      const response = await checkLogin();
      if (response !== null) {
        const { email, permissions, onboarding_status, wallet } = response;
        setIsLoggedIn(true);
        setEmail(email);
        setPermissions(permissions);
        setOnboardingStatus(onboarding_status);
        setExternalWallet(wallet);
      }
    } catch (e) {
      setIsLoggedIn(false);
      setEmail(null);
      setPermissions(null);
      setOnboardingStatus(null);
      setExternalWallet(null);
    }
  }, []);

  useEffect(() => {
    refreshLoggedIn();
  }, [refreshLoggedIn]);

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        email,
        permissions,
        refreshLoggedIn,
        onboardingStatus,
        externalWallet,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
