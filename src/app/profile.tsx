import React from 'react';
import { router } from 'expo-router';
import { ProfilePage } from '@/components/pages/profile/profile-page';
import { useAuth } from '@/hooks/use-auth';

export default function ProfileRoute() {
  const { user, busy, getAccessToken, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/home');
  };

  return (
    <ProfilePage
      isAuthenticated={Boolean(user)}
      isAuthBusy={busy}
      getAccessToken={getAccessToken}
      onSignOut={handleSignOut}
    />
  );
}