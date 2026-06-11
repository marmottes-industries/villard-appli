import { deviceTokensApi } from '@/src/api/deviceTokens';
import { storage } from '@/src/lib/storage';
import { devicePlatform, registerForPushNotifications } from '@/src/lib/push';

const PUSH_DEVICE_ID_KEY = 'push_device_id';

/**
 * Best-effort: obtain this device's Expo push token and register it with the API
 * so the backend can target it. Stores the created row id so we can unregister on
 * logout. Silent on failure — push must never block auth.
 */
export async function syncPushRegistration(): Promise<void> {
  try {
    const token = await registerForPushNotifications();
    if (!token) {
      if (__DEV__) console.warn('[push] no token — device not registered with API.');
      return;
    }

    const { data } = await deviceTokensApi.register({
      token,
      platform: devicePlatform(),
    });
    await storage.setItem(PUSH_DEVICE_ID_KEY, String(data.id));
    if (__DEV__) console.log('[push] device token registered with API, id:', data.id);
  } catch (err) {
    if (__DEV__) {
      const e = err as { response?: { status?: number; data?: unknown } };
      console.warn('[push] device_tokens register failed', e.response?.status, e.response?.data ?? err);
    }
  }
}

/**
 * Unregister this device's push token (called on logout) so the user stops
 * receiving notifications on a device they signed out of.
 */
export async function clearPushRegistration(): Promise<void> {
  try {
    const id = await storage.getItem(PUSH_DEVICE_ID_KEY);
    if (id) await deviceTokensApi.unregister(Number(id));
  } catch {
    /* best-effort: ignore */
  } finally {
    await storage.removeItem(PUSH_DEVICE_ID_KEY);
  }
}
