import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import {
  shoppingApi,
  type ShoppingItem,
  type ShoppingCreatePayload,
  type ShoppingUpdatePayload,
} from '@/src/api/shopping';
import type { AsyncState } from './occupations';

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [state, setState] = useState<AsyncState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const { data } = await shoppingApi.list();
      setItems(data);
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMessage(formatError(err));
    }
  }, []);

  const create = useCallback(async (payload: ShoppingCreatePayload) => {
    const { data } = await shoppingApi.create(payload);
    setItems((prev) => [...prev, data]);
    return data;
  }, []);

  const update = useCallback(async (id: number, payload: ShoppingUpdatePayload) => {
    const { data } = await shoppingApi.update(id, payload);
    setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
    return data;
  }, []);

  const patch = useCallback(async (id: number, payload: ShoppingUpdatePayload) => {
    let previous: ShoppingItem | undefined;
    setItems((prev) => {
      previous = prev.find((i) => i.id === id);
      if (!previous) return prev;
      return prev.map((i) => (i.id === id ? { ...i, ...payload } : i));
    });
    if (!previous) return;
    try {
      const { data } = await shoppingApi.update(id, payload);
      setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
      return data;
    } catch (err) {
      const prev = previous;
      setItems((current) => current.map((i) => (i.id === id && prev ? prev : i)));
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    await shoppingApi.remove(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { items, state, errorMessage, fetchAll, create, update, patch, remove };
}

function formatError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.code === 'ERR_NETWORK') return 'Impossible de joindre le serveur.';
    if (err.response?.status === 403) return "Vous n'avez pas les droits nécessaires.";
  }
  return 'Une erreur est survenue.';
}
