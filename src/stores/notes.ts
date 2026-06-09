import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import {
  notesApi,
  type Note,
  type NoteCreatePayload,
  type NoteUpdatePayload,
} from '@/src/api/notes';
import type { AsyncState } from './occupations';

export function useNotes() {
  const [items, setItems] = useState<Note[]>([]);
  const [state, setState] = useState<AsyncState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const { data } = await notesApi.list();
      setItems(data);
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMessage(formatError(err));
    }
  }, []);

  const create = useCallback(async (payload: NoteCreatePayload) => {
    const { data } = await notesApi.create(payload);
    setItems((prev) => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: number, payload: NoteUpdatePayload) => {
    const { data } = await notesApi.update(id, payload);
    setItems((prev) => prev.map((n) => (n.id === id ? data : n)));
    return data;
  }, []);

  const remove = useCallback(async (id: number) => {
    await notesApi.remove(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
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
