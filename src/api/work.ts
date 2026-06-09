import { apiClient } from './client';

export type WorkStatus = 'suggested' | 'planned' | 'in_progress' | 'done' | 'cancelled';
export type WorkType = 'diy' | 'pro';
export type WorkPriority = 'low' | 'medium' | 'high';

export interface Work {
  '@id': string;
  '@type': 'Work';
  id: number;
  title: string;
  description: string | null;
  status: WorkStatus;
  type: WorkType | null;
  priority: WorkPriority | null;
  author: string;
  createdAt: string;
  scheduledFor: string | null;
  completedAt: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
}

export interface WorkCreatePayload {
  title: string;
  description?: string | null;
  status?: WorkStatus;
  type?: WorkType | null;
  priority?: WorkPriority | null;
  scheduledFor?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
}

export type WorkUpdatePayload = Partial<WorkCreatePayload>;

export const worksApi = {
  list: () => apiClient.get<Work[]>('/api/works'),
  create: (payload: WorkCreatePayload) =>
    apiClient.post<Work>('/api/works', payload),
  update: (id: number, payload: WorkUpdatePayload) =>
    apiClient.patch<Work>(`/api/works/${id}`, payload, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    }),
  remove: (id: number) => apiClient.delete<void>(`/api/works/${id}`),
};

export function idFromIri(iri: string): number | null {
  const match = iri.match(/\/api\/works\/(\d+)/);
  return match ? Number(match[1]) : null;
}
