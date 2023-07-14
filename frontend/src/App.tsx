import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { LoginPage } from 'pages/LoginPage';
import { SignupPage } from 'pages/SignupPage';
import { OfferingsPage } from 'pages/OfferingsPage';
import { AdminUsersPage } from 'pages/admin/UsersPage';
import { AdminOfferingsPage } from 'pages/admin/OfferingsPage';
import { AdminOfferingPage } from 'pages/admin/OfferingPage';
import { OfferingPage } from 'pages/OfferingPage';
import { OfferingPayoutPage } from 'pages/admin/OfferingPayoutPage';
import { SecondaryCheckoutPage } from 'pages/SecondaryCheckoutPage';
import { SecondarySalePage } from 'pages/SecondarySalePage';
import { SecondaryOfferPage } from 'pages/SecondaryOfferPage';
import { SecondaryAcceptOfferPage } from 'pages/SecondaryAcceptOfferPage';
import { SplashPage } from 'pages/SplashPage';
import { HomePage } from 'pages/HomePage';
import { LockerPage } from 'pages/LockerPage';
import { KYCPage } from 'pages/KYCPage';
import { EmploymentPage } from 'pages/EmploymentPage';
import { UserPage } from 'pages/UserPage';
import { TokenPage } from 'pages/TokenPage';
import { DwollaPage } from 'pages/DwollaPage';
import { UploadPage } from 'pages/UploadPage';
import { AccountPage } from 'pages/AccountPage';
import { ConnectPage } from 'pages/ConnectPage';
import { CreditCardPage } from 'pages/CreditCardPage';
import { OrdersPage } from 'pages/OrdersPage';
import { CheckoutPage } from 'pages/CheckoutPage';
import { TradeStatusPage } from 'pages/TradeStatusPage';
import { SecondaryTradeStatusPage } from 'pages/SecondaryTradeStatusPage';
import { SuitabilityPage } from 'pages/SuitabilityPage';
import { OnboardRedirectPage } from 'pages/OnboardRedirectPage';
import { UserContextProvider } from 'UserContext';
import { TransactContextProvider } from 'TransactContext';
import { NotificationContextProvider } from 'NotificationContext';
import { LoggedInCheck } from 'components/LoginCheck';
import { PrivateRoute } from 'components/PrivateRoute';
import { MotyfNavbar as Navbar } from 'components/Navbar';
import './App.scss';

const App: React.FC = () => {
  const loginRedirect = '/login';
  return (
    <Router>
      <UserContextProvider>
        <TransactContextProvider>
          <NotificationContextProvider>
            <Switch>
              <PrivateRoute exact path={'/offerings'} loginRedirect={loginRedirect}>
                <Navbar />
                <OfferingsPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/locker'} loginRedirect={loginRedirect}>
                <Navbar />
                <LockerPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/offering/:offeringId'} loginRedirect={loginRedirect}>
                <Navbar />
                <OfferingPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/checkout/:offeringId'} loginRedirect={loginRedirect}>
                <Navbar />
                <CheckoutPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/secondary-wallet'} loginRedirect={loginRedirect}>
                <Navbar />
                <DwollaPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/:offeringId/list/:tokenId'} loginRedirect={loginRedirect}>
                <Navbar />
                <SecondarySalePage />
              </PrivateRoute>
              <PrivateRoute exact path={'/:offeringId/token/:tokenId'} loginRedirect={loginRedirect}>
                <Navbar />
                <TokenPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/:offeringId/buy/:tokenId'} loginRedirect={loginRedirect}>
                <Navbar />
                <SecondaryCheckoutPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/:offeringId/offer/:tokenId'} loginRedirect={loginRedirect}>
                <Navbar />
                <SecondaryOfferPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/:offeringId/accept/:tokenId/:offerId'} loginRedirect={loginRedirect}>
                <Navbar />
                <SecondaryAcceptOfferPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/status/:tradeId'} loginRedirect={loginRedirect}>
                <Navbar />
                <TradeStatusPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/secondary-status/:orderId'} loginRedirect={loginRedirect}>
                <Navbar />
                <SecondaryTradeStatusPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/admin'} loginRedirect={loginRedirect}>
                <Navbar />
                <AdminUsersPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/admin/offerings'} loginRedirect={loginRedirect}>
                <Navbar />
                <AdminOfferingsPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/admin/offering/:offeringId'} loginRedirect={loginRedirect}>
                <Navbar />
                <AdminOfferingPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/admin/offering/payout/:offeringId'} loginRedirect={loginRedirect}>
                <Navbar />
                <OfferingPayoutPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/user'} loginRedirect={loginRedirect}>
                <Navbar />
                <UserPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/orders'} loginRedirect={loginRedirect}>
                <Navbar />
                <OrdersPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/kyc'} loginRedirect={loginRedirect}>
                <KYCPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/employment'} loginRedirect={loginRedirect}>
                <EmploymentPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/account'} loginRedirect={loginRedirect}>
                <AccountPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/suitability'} loginRedirect={loginRedirect}>
                <SuitabilityPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/upload'} loginRedirect={loginRedirect}>
                <UploadPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/connect'} loginRedirect={loginRedirect}>
                <ConnectPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/credit-card'} loginRedirect={loginRedirect}>
                <CreditCardPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/onboard-redirect'} loginRedirect={loginRedirect}>
                <OnboardRedirectPage />
              </PrivateRoute>
              <PrivateRoute exact path={'/home'} loginRedirect={loginRedirect}>
                <Navbar />
                <HomePage />
              </PrivateRoute>
              <Route exact path={`/login`}>
                <LoggedInCheck>
                  <LoginPage />
                </LoggedInCheck>
              </Route>
              <Route exact path={`/signup`}>
                <LoggedInCheck>
                  <SignupPage />
                </LoggedInCheck>
              </Route>
              <Route path="/">
                <Redirect to="/" />
                <SplashPage />
              </Route>
            </Switch>
          </NotificationContextProvider>
        </TransactContextProvider>
      </UserContextProvider>
    </Router>
  );
};

export default App;
