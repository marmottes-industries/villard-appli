import { apiClient } from './client';

export interface ShoppingItem {
  '@id': string;
  '@type': 'ShoppingItem';
  id: number;
  name: string;
  quantity: number;
  purchased: boolean;
  category: string;
}

export interface ShoppingCreatePayload {
  name: string;
  quantity: number;
  purchased?: boolean;
  category: string;
}

export type ShoppingUpdatePayload = Partial<ShoppingCreatePayload>;

export const shoppingApi = {
  list: () => apiClient.get<ShoppingItem[]>('/api/shopping_items'),
  create: (payload: ShoppingCreatePayload) =>
    apiClient.post<ShoppingItem>('/api/shopping_items', payload),
  update: (id: number, payload: ShoppingUpdatePayload) =>
    apiClient.patch<ShoppingItem>(`/api/shopping_items/${id}`, payload, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    }),
  remove: (id: number) => apiClient.delete<void>(`/api/shopping_items/${id}`),
};

export function idFromIri(iri: string): number | null {
  const match = iri.match(/\/api\/shopping_items\/(\d+)/);
  return match ? Number(match[1]) : null;
}
