import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import {
  worksApi,
  type Work,
  type WorkCreatePayload,
  type WorkUpdatePayload,
} from '@/src/api/work';
import type { AsyncState } from './occupations';

export function useWork() {
  const [items, setItems] = useState<Work[]>([]);
  const [state, setState] = useState<AsyncState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const { data } = await worksApi.list();
      setItems(data);
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMessage(formatError(err));
    }
  }, []);

  const create = useCallback(async (payload: WorkCreatePayload) => {
    const { data } = await worksApi.create(payload);
    setItems((prev) => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: number, payload: WorkUpdatePayload) => {
    const { data } = await worksApi.update(id, payload);
    setItems((prev) => prev.map((w) => (w.id === id ? data : w)));
    return data;
  }, []);

  const remove = useCallback(async (id: number) => {
    await worksApi.remove(id);
    setItems((prev) => prev.filter((w) => w.id !== id));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { items, state, errorMessage, fetchAll, create, update, remove };
}

function formatError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.code === 'ERR_NETWORK') return 'Impossible de joindre le serveur.';
    if (err.response?.status === 403) return "Vous n'avez pas les droits nécessaires.";
  }
  return 'Une erreur est survenue.';
}
