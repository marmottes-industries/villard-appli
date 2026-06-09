import { Tabs, Redirect } from 'expo-router';
import { Platform, View } from 'react-native';
import { useAuth } from '@/src/stores/auth';
import { Icon } from '@/src/components/icons/Icon';
import { UserPill } from '@/src/components/UserPill';
import { accent, colors } from '@/src/theme';

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: accent.base,
          tabBarInactiveTintColor: colors.ink3,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          tabBarStyle: {
            backgroundColor: colors.paper,
            borderTopColor: colors.line,
            paddingTop: 6,
            height: Platform.OS === 'ios' ? 84 : 64,
          },
        }}
      >
        <Tabs.Screen
          name="planning"
          options={{ title: 'Planning', tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="inventaire"
          options={{ title: 'Inventaire', tabBarIcon: ({ color, size }) => <Icon name="box" color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="courses"
          options={{ title: 'Courses', tabBarIcon: ({ color, size }) => <Icon name="cart" color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="notes"
          options={{ title: 'Notes', tabBarIcon: ({ color, size }) => <Icon name="note" color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="travaux"
          options={{ title: 'Travaux', tabBarIcon: ({ color, size }) => <Icon name="tools" color={color} size={size} /> }}
        />
      </Tabs>
      <UserPill />
    </View>
  );
}
