import { Redirect } from 'expo-router';

import { RegisterPage } from '@/components/pages/login/register-page';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterScreen() {
  const { user } = useAuth();

  if (user) return <Redirect href="/home" />;

  return <RegisterPage />;
}