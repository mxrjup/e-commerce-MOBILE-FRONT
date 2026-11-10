import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { categories, type Product } from '@/services/catalog';

export function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const theme = useTheme();
  return <View style={[styles.imageBox, large && styles.largeImage, { backgroundColor: theme.backgroundElement }]}>
    {!failed ? <Image source={{ uri: product.image }} accessibilityLabel={`Photo d’illustration : ${product.name}`} style={styles.image} resizeMode="cover" onError={() => setFailed(true)} />
      : <ThemedText style={styles.fallback}>{categories.find(c => c.id === product.category)?.symbol}{'\n'}{product.name}</ThemedText>}
  </View>;
}

const styles = StyleSheet.create({
  imageBox: { width: '100%', height: 160, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  largeImage: { height: 320, borderRadius: Radius.panel },
  image: { width: '100%', height: '100%' },
  fallback: { textAlign: 'center', fontSize: 24, padding: 16 },
});
