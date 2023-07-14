import React, { useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { useLocation } from 'react-router-dom';
import { UserContext } from 'UserContext';
import { logout } from '../api/auth';
import { readNotifications } from '../api/notifications';
import styled from 'styled-components';
import Dropdown from 'react-bootstrap/Dropdown';
import { MOBILE_MAX_WIDTH } from '../constants';
import { NotificationContext } from 'NotificationContext';
import bellSvg from 'assets/bell.svg';
import trashSvg from 'assets/trash.svg';

export const MotyfNavbar: React.FC = () => {
  const { refreshLoggedIn, permissions, onboardingStatus, email } = useContext(UserContext);
  const { notifications, refreshNotifications, deleteNotification } = useContext(NotificationContext);
  const { pathname } = useLocation();
  const unreadNotifications = notifications.filter((notif) => !notif.isRead).length;

  const onClickLogout = async () => {
    try {
      await logout();
      await refreshLoggedIn();
      window.location.reload(); // clear all state, just to make sure nothing's left over
    } catch (e) {
      console.log('Error:', e);
    }
  };

  const getActiveKey = (pathname: string) => {
    if (LATEST_DROP_KEYS.includes(pathname)) {
      return '/offering/1331933';
    } else if (LOCKER_KEYS.includes(pathname)) {
      return '/locker';
    } else if (pathname === '/secondary-wallet') {
      return '/secondary-wallet';
    } else if (pathname === '/connect') {
      return '/connect';
    }
    return '/offerings';
  };

  const markNotificationsAsRead = (show: boolean) => {
    if (!show) {
      if (notifications.some((notif) => !notif.isRead)) {
        readNotifications();
        refreshNotifications();
      }
    }
  };

  const LATEST_DROP_KEYS = ['/home', '/offering/1331933'];

  const LOCKER_KEYS = ['/locker', '/orders'];

  return (
    <>
      <CustomNavbar expand="lg" collapseOnSelect>
        <HeaderBrand>
          <a href="/home">M O T Y F</a>
        </HeaderBrand>
        <RightNav activeKey={getActiveKey(pathname)}>
          {permissions && permissions.length > 0 && (
            <GradientItem>
              <GradientLink href="/admin">Admin</GradientLink>
            </GradientItem>
          )}
          <GradientItem>
            <GradientLink href="/offering/1331933">Latest Drop</GradientLink>
          </GradientItem>
          <GradientItem>
            <GradientLink href="/offerings">Shop</GradientLink>
          </GradientItem>
          <GradientItem>
            <GradientLink href="/locker">Locker</GradientLink>
          </GradientItem>
          <Dropdown alignRight={true}>
            <DropdownToggle id="dropdown-basic">{email && email[0]}</DropdownToggle>
            <DropdownMenu>
              <MobileDropdownItem href="/offering/1331933">Latest Drop</MobileDropdownItem>
              <MobileDropdownItem href="/offerings">Shop</MobileDropdownItem>
              <MobileDropdownItem href="/locker">Locker</MobileDropdownItem>
              {permissions &&
                permissions.length === 0 &&
                onboardingStatus !== 'ONBOARDING_COMPLETE' &&
                onboardingStatus !== 'KYC_MANUAL_APPROVAL_NEEDED' && (
                  <DropdownItem href="/onboard-redirect">Finish Onboarding</DropdownItem>
                )}
              <DropdownItem href="/secondary-wallet">Manage Balance</DropdownItem>
              <DropdownItem href="/connect">Connect Wallet</DropdownItem>
              <DropdownItem onClick={onClickLogout}>Log Out</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown alignRight={true} onToggle={markNotificationsAsRead}>
            <Dropdown.Toggle as="div" id="dropdown-notif" bsPrefix="none">
              <GradientImage src={bellSvg} />
              {unreadNotifications > 0 && <NotificationCount>{unreadNotifications}</NotificationCount>}
            </Dropdown.Toggle>
            <NotificationMenu>
              {notifications.length > 0 &&
                notifications.map((notification, i) =>
                  notification.isRead ? (
                    <Notification key={i}>
                      <NotificationItem key={notification.message} href={notification.url}>
                        {notification.message}
                      </NotificationItem>
                      <RemoveNotification src={trashSvg} onClick={() => deleteNotification(notification.id)} />
                    </Notification>
                  ) : (
                    <Notification key={i}>
                      <NotificationDot>•&nbsp;</NotificationDot>
                      <NotificationItem key={notification.message} href={notification.url}>
                        {notification.message}
                      </NotificationItem>
                      <RemoveNotification src={trashSvg} onClick={() => deleteNotification(notification.id)} />
                    </Notification>
                  )
                )}
              {notifications.length === 0 && (
                <Notification>
                  <NotificationItem>No new notifications</NotificationItem>
                </Notification>
              )}
            </NotificationMenu>
          </Dropdown>
        </RightNav>
      </CustomNavbar>
    </>
  );
};

const RemoveNotification = styled.img`
  filter: invert(100%);
  margin-right: 10px;
  cursor: pointer;
`;

const Notification = styled.div`
  display: flex;
  flex-direction: row;
`;

const NotificationCount = styled.div`
  background-color: white;
  color: black;
  position: absolute;
  text-align: center;
  border-radius: 10px;
  width: 20px;
  height: 20px;
  left: 40px;
  top: -10px;
`;

const NotificationDot = styled.div`
  color: #ecb7ff;
  align-self: center;
  padding-left: 10px;
`;

const GradientImage = styled.img`
  margin-left: 25px;
  cursor: pointer;
`;

const DropdownMenu = styled(Dropdown.Menu)`
  position: absolute !important;
`;

const NotificationMenu = styled(Dropdown.Menu)`
  position: absolute !important;
`;

const DropdownToggle = styled(Dropdown.Toggle)`
  text-transform: uppercase;
  border-radius: 30px !important;
  margin-left: 25px;
  &:focus,
  &:show {
    color: black !important;
  }
`;

const NotificationItem = styled(Dropdown.Item)`
  text-decoration: none;
  font-weight: 600 !important;
  font-size: 18px;
  padding-left: 12px !important;
  &:active,
  &.active {
    background-color: white !important;
    color: #212529 !important;
  }
  &:hover,
  &.hover {
    color: #16181b !important;
    background-color: #f8f9fa !important;
  }
`;

const DropdownItem = styled(Dropdown.Item)`
  text-decoration: none;
  font-weight: 600 !important;
  font-size: 18px;
  &.active {
    background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
    -webkit-background-clip: text, padding-box;
    -webkit-text-fill-color: transparent;
  }
  &:active {
    background-color: #2e2e2e !important;
  }
`;

const MobileDropdownItem = styled(Dropdown.Item)`
  text-decoration: none;
  font-weight: 600 !important;
  font-size: 18px;
  display: none !important;
  &.active {
    background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
    -webkit-background-clip: text, padding-box;
    -webkit-text-fill-color: transparent;
  }
  &:active {
    background-color: #2e2e2e !important;
  }
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    display: flex !important;
  }
`;

const GradientItem = styled(Nav.Item)`
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    display: none;
  }
`;

const GradientLink = styled(Nav.Link)`
  color: white !important;
  text-decoration: none;
  text-transform: uppercase;
  margin: 0 25px;
  padding: 0 !important;
  &.active {
    background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
    -webkit-background-clip: text, padding-box;
    -webkit-text-fill-color: transparent;
  }
`;

const HeaderBrand = styled.h4`
  margin-bottom: 0;
  color: white;
  background: linear-gradient(93.87deg, #7effb2 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
`;

const RightNav = styled(Nav)`
  margin-left: auto;
  flex-direction: row !important;
  align-items: center;
`;

const CustomNavbar = styled(Navbar)`
  margin: 60px;
  padding: 0px !important;
  @media (max-width: ${MOBILE_MAX_WIDTH}) {
    margin: 20px;
  }
`;
