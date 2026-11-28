import { router } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';

import { AuthMethods } from './auth-methods';

export function LoginForm() {
  const { clearError } = useAuth();

  return (
    <AuthMethods
      mode="login"
      onSwitchMode={() => {
        clearError();
        router.replace('/register');
      }}
    />
  );
}