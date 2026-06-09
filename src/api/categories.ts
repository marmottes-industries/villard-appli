import { apiClient } from './client';

export interface Category {
  '@id': string;
  '@type': 'Category';
  id: number;
  name: string;
  inventoryItems: string[];
  shoppingItems: string[];
}

export const categoriesApi = {
  list: () => apiClient.get<Category[]>('/api/categories'),
};

export function idFromIri(iri: string): number | null {
  const match = iri.match(/\/api\/categories\/(\d+)/);
  return match ? Number(match[1]) : null;
}
