import { request_post, request } from 'api';
import { Permission } from '../constants';

type LoginParams = { email: string; password: string; remember_me: boolean };

export async function joinWaitlist(params: { email: string }) {
  let url = new URL(`/api/auth/waitlist`, window.location.origin);
  return await request_post(url.toString(), params);
}

export async function login(params: LoginParams) {
  let url = new URL(`/api/auth/login`, window.location.origin);
  return await request_post<{}>(url.toString(), params);
}

export async function logout() {
  let url = new URL(`/api/auth/logout`, window.location.origin);
  await request_post(url.toString(), {});
}

type SignupParams = {
  email: string;
  password: string;
  remember_me: boolean;
  first_name: string;
  last_name?: string;
};

export async function signup(params: SignupParams) {
  let url = new URL(`/api/auth/register`, window.location.origin);
  await request_post(url.toString(), params);
}

type CheckLoginType = {
  email?: string;
  permissions?: Permission[];
  onboarding_status?: string;
  wallet?: string;
};

export async function checkLogin(): Promise<{
  email: string;
  permissions: Permission[];
  onboarding_status?: string;
  wallet?: string;
} | null> {
  const url = new URL(`/api/auth/check-login`, window.location.origin);
  const { email, permissions, onboarding_status, wallet } = await request<CheckLoginType>(url.toString());

  if (!email || !permissions) return null;
  return {
    email,
    permissions,
    onboarding_status,
    wallet,
  };
}
