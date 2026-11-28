import { router } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';

import { AuthMethods } from './auth-methods';
import { AuthShell } from './auth-shell';

export function RegisterPage() {
  const { clearError } = useAuth();

  const switchToLogin = () => {
    clearError();
    router.replace('/login');
  };

  return (
    <AuthShell
      mode="register"
      eyebrow="Nouveau membre"
      title={'Créer votre\ncompte.'}
      subtitle="Rejoignez LOG pour suivre vos commandes et vos paniers"
      onSwitchMode={switchToLogin}>
      <AuthMethods mode="register" onSwitchMode={switchToLogin} />
    </AuthShell>
  );
}