import { apiClient } from './client';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  token: string;
  refresh_token: string;
}

export interface User {
  '@id': string;
  uuid: string;
  username: string;
  email?: string | null;
  roles: string[];
}

export const authApi = {
  login: (payload: LoginPayload) => apiClient.post<LoginResponse>('/api/login', payload),
  refresh: (refresh_token: string) => apiClient.post<RefreshResponse>('/api/token/refresh', { refresh_token }),
  me: () => apiClient.get<User>('/api/me'),
};
