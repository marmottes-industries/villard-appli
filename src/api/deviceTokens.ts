import { apiClient } from './client';

export type DevicePlatform = 'ios' | 'android' | 'web';

export interface DeviceToken {
  '@id': string;
  '@type': 'DeviceToken';
  id: number;
  token: string;
  platform: DevicePlatform;
}

export interface DeviceTokenRegisterPayload {
  token: string;
  platform: DevicePlatform;
}

export const deviceTokensApi = {
  register: (payload: DeviceTokenRegisterPayload) =>
    apiClient.post<DeviceToken>('/api/device_tokens', payload),
  unregister: (id: number) => apiClient.delete<void>(`/api/device_tokens/${id}`),
};
