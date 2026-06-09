import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/src/stores/auth';
import { useAppVersionCheck } from '@/src/stores/appVersion';
import { UpdateModal } from '@/src/components/UpdateModal';
import { colors } from '@/src/theme';

function RootStack() {
  const { hydrating } = useAuth();
  const version = useAppVersionCheck();
  const [dismissed, setDismissed] = useState(false);

  if (hydrating) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  const showModal =
    (version.status === 'outdated-forced') ||
    (version.status === 'outdated-suggested' && !dismissed);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
          animation: 'fade',
        }}
      />
      <UpdateModal
        visible={showModal}
        forced={version.status === 'outdated-forced'}
        currentVersion={version.currentVersion}
        latestVersion={version.latestVersion}
        storeUrl={version.storeUrl}
        onDismiss={() => setDismissed(true)}
      />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    NavigationBar.setBehaviorAsync('overlay-swipe');
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootStack />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
});
