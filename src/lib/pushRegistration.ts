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
    if (!token) return;

    const { data } = await deviceTokensApi.register({
      token,
      platform: devicePlatform(),
    });
    await storage.setItem(PUSH_DEVICE_ID_KEY, String(data.id));
  } catch {
    /* best-effort: ignore */
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
