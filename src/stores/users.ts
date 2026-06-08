import { useCallback, useEffect, useState } from 'react';
import { usersApi } from '@/src/api/users';
import { decorate, type DisplayUser } from '@/src/lib/occupants';
import type { AsyncState } from './occupations';

export function useUsers() {
  const [items, setItems] = useState<DisplayUser[]>([]);
  const [state, setState] = useState<AsyncState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const { data } = await usersApi.list();
      setItems(data.map(decorate));
      setState('success');
    } catch {
      setState('error');
      setErrorMessage('Impossible de charger les utilisateurs.');
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { items, state, errorMessage, fetchAll };
}
