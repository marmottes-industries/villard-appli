import { Redirect } from 'expo-router';
import { useAuth } from '@/src/stores/auth';

export default function Index() {
  const { isAuthenticated } = useAuth();
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}
