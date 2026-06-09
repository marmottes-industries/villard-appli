import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { appVersionApi, type AppVersionInfo } from '@/src/api/appVersion';
import { compareVersions } from '@/src/lib/version';

export type VersionStatus = 'checking' | 'up-to-date' | 'outdated-suggested' | 'outdated-forced' | 'error';

export interface VersionCheckResult {
  status: VersionStatus;
  currentVersion: string | null;
  latestVersion: string | null;
  storeUrl: string | null;
}

export function useAppVersionCheck(): VersionCheckResult {
  const [result, setResult] = useState<VersionCheckResult>({
    status: 'checking',
    currentVersion: Application.nativeApplicationVersion,
    latestVersion: null,
    storeUrl: null,
  });

  useEffect(() => {
    let cancelled = false;
    const current = Application.nativeApplicationVersion;
    // Sur web (ou si la version native n'est pas lisible), on ne tente rien.
    if (!current) {
      setResult((r) => ({ ...r, status: 'up-to-date' }));
      return;
    }

    (async () => {
      try {
        const { data } = await appVersionApi.get();
        if (cancelled) return;
        setResult({
          status: deriveStatus(current, data),
          currentVersion: current,
          latestVersion: data.latestVersion,
          storeUrl: pickStoreUrl(data),
        });
      } catch {
        if (cancelled) return;
        // Pas bloquant : si le check échoue (réseau, endpoint manquant), on laisse passer.
        setResult((r) => ({ ...r, status: 'error' }));
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return result;
}

function deriveStatus(current: string, info: AppVersionInfo): VersionStatus {
  if (compareVersions(current, info.minVersion) < 0) return 'outdated-forced';
  if (compareVersions(current, info.latestVersion) < 0) return 'outdated-suggested';
  return 'up-to-date';
}

function pickStoreUrl(info: AppVersionInfo): string | null {
  if (Platform.OS === 'ios') return info.iosStoreUrl ?? null;
  if (Platform.OS === 'android') return info.androidStoreUrl ?? null;
  return null;
}
