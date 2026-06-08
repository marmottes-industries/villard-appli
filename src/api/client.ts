import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/src/config/env';
import { storage } from '@/src/lib/storage';

export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/ld+json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Déballe les collections API Platform 4 : { "@type": "Collection", member: [...] } -> [...]
apiClient.interceptors.response.use((response) => {
  const d = response.data;
  if (d && typeof d === 'object' && d['@type'] === 'Collection' && Array.isArray(d.member)) {
    response.data = d.member;
  }
  return response;
});

let refreshPromise: Promise<string> | null = null;
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

async function performRefresh(): Promise<string> {
  const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('No refresh token');
  const { data } = await axios.post<{ token: string; refresh_token: string }>(
    `${env.apiUrl}/api/token/refresh`,
    { refresh_token: refreshToken },
    { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } },
  );
  await storage.setItem(TOKEN_KEY, data.token);
  await storage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  return data.token;
}

async function hardLogout() {
  await storage.removeItem(TOKEN_KEY);
  await storage.removeItem(REFRESH_TOKEN_KEY);
  onUnauthorized?.();
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';
    const isAuthEndpoint = url.includes('/api/login') || url.includes('/api/token/refresh');

    if (status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;
      try {
        refreshPromise = refreshPromise ?? performRefresh().finally(() => { refreshPromise = null; });
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        await hardLogout();
        return Promise.reject(error);
      }
    }
    if (status === 401) await hardLogout();
    return Promise.reject(error);
  },
);
