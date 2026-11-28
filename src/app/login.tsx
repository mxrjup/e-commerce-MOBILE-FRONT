import { Redirect } from 'expo-router';

import { LoginPage } from '@/components/pages/login/login-page';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const { user } = useAuth();

  if (user) return <Redirect href="/home" />;

  return <LoginPage />;
}
