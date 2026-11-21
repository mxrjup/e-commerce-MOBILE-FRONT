import { router } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';

import { AuthShell } from './auth-shell';
import { LoginForm } from './login-form';

export function LoginPage() {
  const { clearError } = useAuth();

  return (
    <AuthShell
      mode="login"
      eyebrow="Heureux de vous retrouver"
      title={'Bienvenue\nchez vous.'}
      subtitle="Connectez-vous à votre compte client"
      onSwitchMode={() => {
        clearError();
        router.replace('/register');
      }}>
      <LoginForm />
    </AuthShell>
  );
}