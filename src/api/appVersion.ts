import { apiClient } from './client';

export interface AppVersionInfo {
  latestVersion: string;
  minVersion: string;
  iosStoreUrl?: string;
  androidStoreUrl?: string;
}

export const appVersionApi = {
  get: () => apiClient.get<AppVersionInfo>('/api/app/version'),
};
