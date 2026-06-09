import { useCallback, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { categoriesApi, type Category } from '@/src/api/categories';
import type { IconName } from '@/src/components/icons/Icon';
import type { AsyncState } from './occupations';

const ICON_BY_NAME: Record<string, IconName> = {
  'Cuisine': 'dish',
  'Salle de bain': 'bath',
  'Chambre': 'linen',
  'Salon': 'leaf',
  'Extérieur': 'sun',
  'Cave': 'gear',
};

export type DisplayCategory = Category & { icon: IconName };

export function useCategories() {
  const [items, setItems] = useState<DisplayCategory[]>([]);
  const [state, setState] = useState<AsyncState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const { data } = await categoriesApi.list();
      setItems(data.map((c) => ({ ...c, icon: ICON_BY_NAME[c.name] ?? 'box' })));
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMessage(formatError(err));
    }
  }, []);

  const findByIri = useCallback(
    (iri: string): DisplayCategory | null => items.find((c) => c['@id'] === iri) ?? null,
    [items],
  );

  const forInventory = useMemo(
    () => items.filter((c) => c.inventoryItems.length > 0),
    [items],
  );

  const forShopping = useMemo(
    () => items.filter((c) => c.shoppingItems.length > 0),
    [items],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { items, forInventory, forShopping, state, errorMessage, fetchAll, findByIri };
}

function formatError(err: unknown): string {
  if (err instanceof AxiosError && err.code === 'ERR_NETWORK') {
    return 'Impossible de joindre le serveur.';
  }
  return 'Une erreur est survenue.';
}
