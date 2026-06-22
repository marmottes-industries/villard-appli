import type { IconName } from '@/src/components/icons/Icon';

// WMO weather interpretation codes → label + icon (see https://open-meteo.com/en/docs).

interface WeatherMeta {
  label: string;
  icon: IconName;
}

const WMO_META: Record<number, WeatherMeta> = {
  0: { label: 'Ciel dégagé', icon: 'sun' },
  1: { label: 'Plutôt dégagé', icon: 'sun' },
  2: { label: 'Partiellement nuageux', icon: 'cloudSun' },
  3: { label: 'Couvert', icon: 'cloud' },
  45: { label: 'Brouillard', icon: 'fog' },
  48: { label: 'Brouillard givrant', icon: 'fog' },
  51: { label: 'Bruine légère', icon: 'rain' },
  53: { label: 'Bruine', icon: 'rain' },
  55: { label: 'Bruine dense', icon: 'rain' },
  56: { label: 'Bruine verglaçante', icon: 'rain' },
  57: { label: 'Bruine verglaçante dense', icon: 'rain' },
  61: { label: 'Pluie faible', icon: 'rain' },
  63: { label: 'Pluie', icon: 'rain' },
  65: { label: 'Pluie forte', icon: 'rain' },
  66: { label: 'Pluie verglaçante', icon: 'rain' },
  67: { label: 'Pluie verglaçante forte', icon: 'rain' },
  71: { label: 'Neige faible', icon: 'snow' },
  73: { label: 'Neige', icon: 'snow' },
  75: { label: 'Neige forte', icon: 'snow' },
  77: { label: 'Grains de neige', icon: 'snow' },
  80: { label: 'Averses faibles', icon: 'rain' },
  81: { label: 'Averses', icon: 'rain' },
  82: { label: 'Averses violentes', icon: 'rain' },
  85: { label: 'Averses de neige', icon: 'snow' },
  86: { label: 'Fortes averses de neige', icon: 'snow' },
  95: { label: 'Orage', icon: 'storm' },
  96: { label: 'Orage et grêle', icon: 'storm' },
  99: { label: 'Orage et forte grêle', icon: 'storm' },
};

const FALLBACK: WeatherMeta = { label: 'Indéterminé', icon: 'cloud' };

export function weatherMeta(code: number): WeatherMeta {
  return WMO_META[code] ?? FALLBACK;
}

interface AqiMeta {
  label: string;
  color: string;
}

export function aqiMeta(aqi: number | null): AqiMeta | null {
  if (aqi === null) return null;
  if (aqi <= 20) return { label: 'Bonne', color: '#3a9d5d' };
  if (aqi <= 40) return { label: 'Correcte', color: '#7cb342' };
  if (aqi <= 60) return { label: 'Moyenne', color: '#e0a800' };
  if (aqi <= 80) return { label: 'Médiocre', color: '#e8743b' };
  if (aqi <= 100) return { label: 'Mauvaise', color: '#d64545' };
  return { label: 'Très mauvaise', color: '#9c3587' };
}
