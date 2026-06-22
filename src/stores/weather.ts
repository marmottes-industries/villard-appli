import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { weatherApi, type WeatherForecast } from '@/src/api/weather';

export type AsyncState = 'idle' | 'loading' | 'error' | 'success';

export function useWeather() {
  const [data, setData] = useState<WeatherForecast | null>(null);
  const [state, setState] = useState<AsyncState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const { data: forecast } = await weatherApi.get();
      setData(forecast);
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMessage(formatError(err));
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, state, errorMessage, fetch };
}

function formatError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.code === 'ERR_NETWORK') return 'Impossible de joindre le serveur.';
  }
  return 'Météo indisponible pour le moment.';
}
