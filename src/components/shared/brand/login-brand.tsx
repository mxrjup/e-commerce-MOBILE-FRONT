import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function LoginBrand({ inverse = false }: { inverse?: boolean }) {
  const theme = useTheme();

  return (
    <Image
      source={require('@/assets/images/logo-log-lockup.svg')}
      accessibilityLabel="LOG, le sens du bois"
      accessible
      contentFit="contain"
      tintColor={inverse ? theme.onHero : theme.text}
      style={styles.logo}
    />
  );
}

const styles = StyleSheet.create({
  logo: { width: 116, height: 56 },
});
