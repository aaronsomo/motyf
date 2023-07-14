import React, { useState, useEffect, useCallback } from 'react';
import { getNotifications, postDeleteNotification } from 'api/notifications';
import { Notification } from 'types';

interface NotificationContextProps {
  notifications: Notification[];
  refreshNotifications: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

const NotificationContext = React.createContext<NotificationContextProps>({
  notifications: [],
  refreshNotifications: async () => {},
  deleteNotification: async (id: number) => {},
});

const NotificationContextProvider: React.FC = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      if (data !== null) {
        setNotifications(data);
      }
    } catch (e) {
      setNotifications([]);
    }
  }, []);

  const deleteNotification = async (id: number) => {
    await postDeleteNotification({ id });
    refreshNotifications();
  };

  useEffect(() => {
    refreshNotifications();

    const pollInterval = 5000;
    const interval = setInterval(refreshNotifications, pollInterval);

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, refreshNotifications, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationContextProvider };
