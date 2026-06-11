import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import type { DevicePlatform } from '@/src/api/deviceTokens';

export const devicePlatform = (): DevicePlatform =>
  Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

/**
 * Requests notification permission and returns the Expo push token for this
 * install, or `null` when push isn't available (web, simulator, permission
 * denied, or no EAS projectId configured). Never throws — push is best-effort.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Remote push only works on physical devices.
  if (!Device.isDevice || Platform.OS === 'web') {
    if (__DEV__) console.warn('[push] not a physical device (or web) — skipping push token.');
    return null;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') {
      if (__DEV__) console.warn('[push] notification permission not granted:', status);
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // SDK 54 requires the EAS projectId to mint a push token.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    if (!projectId) {
      if (__DEV__) console.warn('[push] No EAS projectId — skipping push token.');
      return null;
    }

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (__DEV__) console.log('[push] got Expo push token:', data);
    return data;
  } catch (err) {
    if (__DEV__) console.warn('[push] getExpoPushTokenAsync failed', err);
    return null;
  }
}
