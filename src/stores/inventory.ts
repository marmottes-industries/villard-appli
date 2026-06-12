import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import {
  inventoryApi,
  type InventoryItem,
  type InventoryCreatePayload,
  type InventoryUpdatePayload,
} from '@/src/api/inventory';
import type { AsyncState } from './occupations';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [state, setState] = useState<AsyncState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const { data } = await inventoryApi.list();
      setItems(data);
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMessage(formatError(err));
    }
  }, []);

  const create = useCallback(async (payload: InventoryCreatePayload) => {
    const { data } = await inventoryApi.create(payload);
    setItems((prev) => [...prev, data]);
    return data;
  }, []);

  const update = useCallback(async (id: number, payload: InventoryUpdatePayload) => {
    const { data } = await inventoryApi.update(id, payload);
    setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
    return data;
  }, []);

  // MAJ optimiste avec rollback en cas d'erreur — pour stepper qty / cycle d'état.
  // Ne pas lire `previous` depuis l'updater de setItems : il n'est pas exécuté
  // de façon synchrone, l'appel API serait court-circuité (PATCH jamais envoyé).
  const patch = useCallback(async (id: number, payload: InventoryUpdatePayload) => {
    const previous = items.find((i) => i.id === id);
    if (!previous) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...payload } : i)));
    try {
      const { data } = await inventoryApi.update(id, payload);
      setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
      return data;
    } catch (err) {
      setItems((current) => current.map((i) => (i.id === id ? previous : i)));
      throw err;
    }
  }, [items]);

  const remove = useCallback(async (id: number) => {
    await inventoryApi.remove(id);
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
