import { apiClient } from './client';

export interface Note {
  '@id': string;
  '@type': 'Note';
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: string; // IRI '/api/users/{id}'
}

export interface NoteCreatePayload {
  title: string;
  content: string;
}

export type NoteUpdatePayload = Partial<NoteCreatePayload>;

export const notesApi = {
  list: () => apiClient.get<Note[]>('/api/notes'),
  create: (payload: NoteCreatePayload) =>
    apiClient.post<Note>('/api/notes', payload),
  update: (id: number, payload: NoteUpdatePayload) =>
    apiClient.patch<Note>(`/api/notes/${id}`, payload, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    }),
  remove: (id: number) => apiClient.delete<void>(`/api/notes/${id}`),
};

export function idFromIri(iri: string): number | null {
  const match = iri.match(/\/api\/notes\/(\d+)/);
  return match ? Number(match[1]) : null;
}
