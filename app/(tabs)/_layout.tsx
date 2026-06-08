import { Tabs, Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useAuth } from '@/src/stores/auth';
import { Icon } from '@/src/components/icons/Icon';
import { accent, colors } from '@/src/theme';

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent.base,
        tabBarInactiveTintColor: colors.ink3,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 84 : 64,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Icon name="leaf" color={color} size={size} /> }}
      />
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
    </Tabs>
  );
}
