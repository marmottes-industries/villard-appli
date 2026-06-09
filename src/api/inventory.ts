import { apiClient } from './client';

export type InvState = 'ok' | 'worn' | 'replace';

export interface InventoryItem {
  '@id': string;
  '@type': 'InventoryItem';
  id: number;
  name: string;
  quantity: number;
  state: InvState;
  location: string | null;
  note: string | null;
  category: string; // IRI category
}

export interface InventoryCreatePayload {
  name: string;
  quantity: number;
  state: InvState;
  location?: string | null;
  note?: string | null;
  category: string;
}

export type InventoryUpdatePayload = Partial<InventoryCreatePayload>;

export const inventoryApi = {
  list: () => apiClient.get<InventoryItem[]>('/api/inventory_items'),
  create: (payload: InventoryCreatePayload) =>
    apiClient.post<InventoryItem>('/api/inventory_items', payload),
  update: (id: number, payload: InventoryUpdatePayload) =>
    apiClient.patch<InventoryItem>(`/api/inventory_items/${id}`, payload, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    }),
  remove: (id: number) => apiClient.delete<void>(`/api/inventory_items/${id}`),
};

export function idFromIri(iri: string): number | null {
  const match = iri.match(/\/api\/inventory_items\/(\d+)/);
  return match ? Number(match[1]) : null;
}
