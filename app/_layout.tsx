import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/src/stores/auth';
import { colors } from '@/src/theme';

function RootStack() {
  const { hydrating } = useAuth();

  if (hydrating) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.paper },
        animation: 'fade',
      }}
    />
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
