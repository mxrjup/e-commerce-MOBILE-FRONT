import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { LoginTypography, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/services/api-client';
import { createCatalogApi } from '@/services/catalog-api';
import type { ProductCard, ProductFilters, ProductPageResponse } from '@/services/product-list';

const priceFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const formatPrice = (price: number) => priceFormatter.format(price);

export function ProductLink({ product }: { product: ProductCard }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const image = product.imageUrl && /^https?:\/\//i.test(product.imageUrl) && !failed;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Voir ${product.title}`}
    onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.slug } })}
    style={({ pressed }) => [styles.card, { borderColor: theme.border, backgroundColor: theme.background, opacity: pressed ? 0.7 : 1 }]}>
    {image ? <Image source={{ uri: product.imageUrl! }} contentFit="contain" style={styles.image} onError={() => setFailed(true)} />
      : <View style={[styles.image, styles.emptyImage, { backgroundColor: theme.backgroundElement }]}><ThemedText themeColor="textSecondary">Image indisponible</ThemedText></View>}
    <ThemedText style={LoginTypography.lead}>{product.title}</ThemedText>
    <ThemedText themeColor="textSecondary">{product.brand.name} · {product.category.name}</ThemedText>
    <ThemedText style={LoginTypography.button}>{product.variantCount > 1 ? 'À partir de ' : ''}{formatPrice(product.priceInclTax)} TTC</ThemedText>
    {product.regularPriceInclTax !== null && product.regularPriceInclTax > product.priceInclTax && <ThemedText style={styles.oldPrice}>{formatPrice(product.regularPriceInclTax)} TTC</ThemedText>}
    <ThemedText>{product.available ? 'Disponible' : 'Indisponible'}</ThemedText>
    <ThemedText themeColor="accent">Voir le produit →</ThemedText>
  </Pressable>;
}

// A bounded page (12 cards), embedded in the existing screen ScrollView. Pages
// replace one another; never accumulate an unbounded nested list of products.
export function CatalogProducts({ filters = {} }: { filters?: ProductFilters }) {
  return <ProductResults key={JSON.stringify([filters.category, filters.brand, filters.universe])} filters={filters} />;
}

function ProductResults({ filters }: { filters: ProductFilters }) {
  const { category, brand, universe } = filters;
  const client = useApi();
  const api = useMemo(() => createCatalogApi(client), [client]);
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([category, brand, universe, page, attempt]);
  const [state, setState] = useState<{ key: string; data?: ProductPageResponse; error?: string }>();
  useEffect(() => {
    let active = true;
    let timedOut = false;
    const controller = new AbortController();
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    api.products({ category, brand, universe }, page, controller.signal).then(data => {
      if (active) setState({ key, data });
    }).catch(cause => {
      if (active) setState({ key, error: getApiErrorMessage(cause, timedOut) });
    }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [api, category, brand, universe, page, key]);
  const current = state?.key === key ? state : undefined;
  const data = current?.data;
  return <View style={styles.section}>
    <ThemedText accessibilityRole="header" style={LoginTypography.lead}>Articles</ThemedText>
    {!current && <View accessibilityLiveRegion="polite"><ActivityIndicator color={theme.accent} /><ThemedText>Chargement des articles…</ThemedText></View>}
    {current?.error && <><ThemedText accessibilityRole="alert">{current.error}</ThemedText><Choice label="Réessayer les articles" onPress={() => setAttempt(n => n + 1)} /></>}
    {data && <>
      <ThemedText accessibilityLiveRegion="polite">{data.totalElements} article{data.totalElements !== 1 ? 's' : ''}</ThemedText>
      {!data.content.length && <ThemedText>Aucun article ne correspond à cette sélection.</ThemedText>}
      {data.content.map(product => <ProductLink key={product.id} product={product} />)}
    </>}
    <View style={styles.pagination}>
      <Choice label="Page précédente" disabled={page === 0} onPress={() => setPage(p => p - 1)} />
      <ThemedText>Page {page + 1}{data?.totalPages ? ` / ${data.totalPages}` : ''}</ThemedText>
      <Choice label="Page suivante" disabled={!data || page + 1 >= data.totalPages} onPress={() => setPage(p => p + 1)} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: Spacing.three },
  card: { borderWidth: 1, borderRadius: Radius.panel, padding: Spacing.three, gap: Spacing.two },
  image: { width: '100%', height: 160, borderRadius: Radius.control },
  emptyImage: { alignItems: 'center', justifyContent: 'center' },
  oldPrice: { textDecorationLine: 'line-through' },
  pagination: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two, justifyContent: 'space-between' },
});
