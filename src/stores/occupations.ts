import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import {
  occupationsApi,
  type Occupation,
  type OccupationCreatePayload,
  type OccupationUpdatePayload,
} from '@/src/api/occupations';

export type AsyncState = 'idle' | 'loading' | 'error' | 'success';

export function useOccupations() {
  const [items, setItems] = useState<Occupation[]>([]);
  const [state, setState] = useState<AsyncState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const { data } = await occupationsApi.list();
      setItems(data);
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMessage(formatError(err));
    }
  }, []);

  const create = useCallback(async (payload: OccupationCreatePayload) => {
    const { data } = await occupationsApi.create(payload);
    setItems((prev) => [...prev, data]);
    return data;
  }, []);

  const update = useCallback(async (id: number, payload: OccupationUpdatePayload) => {
    const { data } = await occupationsApi.update(id, payload);
    setItems((prev) => prev.map((o) => (o.id === id ? data : o)));
    return data;
  }, []);

  const remove = useCallback(async (id: number) => {
    await occupationsApi.remove(id);
    setItems((prev) => prev.filter((o) => o.id !== id));
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
