import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';

// Show notifications while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function openFromData(data: unknown): void {
  const route = (data as { route?: string } | null)?.route;
  if (typeof route === 'string') {
    router.push(route as Href);
  }
}

/**
 * Routes the user to the deep-link carried by a tapped notification (the API sets
 * `data.route`, e.g. the inventory tab for the end-of-stay reminder). Also handles
 * the case where the app was launched cold by tapping a notification.
 */
export function useNotificationObserver(): void {
  useEffect(() => {
    let mounted = true;

    // App launched by tapping a notification while it was killed.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (mounted && response) {
        openFromData(response.notification.request.content.data);
      }
    });

    // App already running (foreground/background) when the notification is tapped.
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      openFromData(response.notification.request.content.data);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
}
