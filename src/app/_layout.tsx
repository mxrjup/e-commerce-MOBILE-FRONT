import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/hooks/use-auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({ Manrope: require('@/assets/fonts/manrope.ttf') });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Accueil · LOG' }} />
        <Stack.Screen name="login" options={{ title: 'Connexion · LOG' }} />
        <Stack.Screen name="register" options={{ title: 'Inscription · LOG' }} />
        <Stack.Screen name="home" options={{ title: 'Accueil · LOG' }} />
        <Stack.Screen name="cart" options={{ title: 'Panier · LOG' }} />
        <Stack.Screen name="checkout" options={{ title: 'Paiement · LOG' }} />
        <Stack.Screen name="checkout-success" options={{ title: 'Commande validée · LOG' }} />
        <Stack.Screen name="checkout-cancel" options={{ title: 'Paiement annulé · LOG' }} />
        <Stack.Screen name="checkout-failure" options={{ title: 'Paiement échoué · LOG' }} />
        <Stack.Screen name="orders" options={{ title: 'Commandes · LOG' }} />
        <Stack.Screen name="orders/[id]" options={{ title: 'Suivi de commande · LOG' }} />
        <Stack.Screen name="profile" options={{ title: 'Profil · LOG' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications · LOG' }} />
        <Stack.Screen name="notifications/alerts" options={{ title: 'Alertes catalogue · LOG' }} />
        <Stack.Screen name="support" options={{ title: 'SAV · LOG' }} />
        <Stack.Screen name="support/new" options={{ title: 'Nouveau ticket SAV · LOG' }} />
        <Stack.Screen name="support/[id]" options={{ title: 'Ticket SAV · LOG' }} />
        <Stack.Screen name="auth-callback" options={{ title: 'Connexion · LOG' }} />
      </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}