import { apiClient } from './client';

export interface Occupation {
  '@id': string;
  '@type': 'Occupation';
  id: number;
  startDate: string; // ISO 'YYYY-MM-DD'
  endDate: string;
  notes?: string;
  occupant: string; // IRI '/api/users/{id}'
}

export interface OccupationCreatePayload {
  startDate: string;
  endDate: string;
  notes?: string;
  occupant: string;
}

export interface OccupationUpdatePayload {
  startDate?: string;
  endDate?: string;
  notes?: string;
  occupant?: string;
}

export const occupationsApi = {
  list: () => apiClient.get<Occupation[]>('/api/occupations'),
  create: (payload: OccupationCreatePayload) =>
    apiClient.post<Occupation>('/api/occupations', payload),
  update: (id: number, payload: OccupationUpdatePayload) =>
    apiClient.patch<Occupation>(`/api/occupations/${id}`, payload, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    }),
  remove: (id: number) => apiClient.delete<void>(`/api/occupations/${id}`),
};
