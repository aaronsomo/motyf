import { request, request_post } from 'api';
import { Notification } from 'types';

export async function getNotifications(): Promise<Notification[]> {
  const url = new URL('/api/notifications/', window.location.origin);
  const response = await request<{ notifications: Notification[] }>(url.toString());

  return response.notifications;
}

export async function readNotifications() {
  const url = new URL('/api/notifications/read-all', window.location.origin);
  return await request(url.toString());
}

type deleteNotificationType = {
  id: number;
};

export async function postDeleteNotification(params: deleteNotificationType) {
  const url = new URL('/api/notifications/delete', window.location.origin);
  return await request_post(url.toString(), params);
}
