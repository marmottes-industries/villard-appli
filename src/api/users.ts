import { apiClient } from './client';

export interface ApiUser {
  '@id': string;
  '@type': 'User';
  uuid: string;
  username: string;
  roles: string[];
}

export const usersApi = {
  list: () => apiClient.get<ApiUser[]>('/api/users'),
};

export function idFromIri(iri: string): number | null {
  const match = iri.match(/\/api\/users\/(\d+)/);
  return match ? Number(match[1]) : null;
}
