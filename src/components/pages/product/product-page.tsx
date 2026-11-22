import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Choice } from '@/components/shared/forms/choice';
import { ThemedText } from '@/components/shared/ui/themed-text';
import { ThemedView } from '@/components/shared/ui/themed-view';
import { formatPrice } from '@/components/pages/cart/cart-logic';
import { LoginTypography, MaxContentWidth, Spacing } from '@/constants/theme';
import type { ProductDetail } from '@/services/product-detail';
import { useTheme } from '@/hooks/use-theme';
import { ProductGallery } from './product-gallery';
import { availability, descriptionText, productImages, promotion, variantForValue } from './product-logic';
import { ProductAccessories, ProductReviews, ProductSection } from './product-sections';
import { useProduct } from './use-product';

function ProductContent({ product }: { product: ProductDetail }) {
  const [selectedId, setSelectedId] = useState(() => (product.variants.find(v => v.available) ?? product.variants[0])?.id);
  const variant = product.variants.find(v => v.id === selectedId);
  const description = descriptionText(product.description);
  return <>
    <ThemedText themeColor="textSecondary">{product.brand.name} · {product.category.name}</ThemedText>
    <ThemedText accessibilityRole="header" style={styles.title}>{product.title}</ThemedText>
    <ProductGallery key={variant?.id ?? 'empty'} images={productImages(variant)} title={product.title} />
    {variant && <>
      <View accessibilityLiveRegion="polite" style={styles.group}>
        <ThemedText style={styles.price}>{formatPrice(variant.priceInclTax)} TTC</ThemedText>
        {promotion(variant) && <ThemedText accessibilityLabel={`Ancien prix : ${formatPrice(variant.regularPriceInclTax!)} TTC`} style={styles.oldPrice}>{formatPrice(variant.regularPriceInclTax!)} TTC</ThemedText>}
        {variant.ecoTaxInclTax !== null && <ThemedText themeColor="textSecondary">Dont {formatPrice(variant.ecoTaxInclTax)} d’éco-participation</ThemedText>}
        <ThemedText>{availability(variant)}</ThemedText>
        <ThemedText themeColor="textSecondary">Référence : {variant.sku}</ThemedText>
      </View>
      {product.attributes.map((attribute, index) => <View key={attribute.name} style={styles.group}>
        <ThemedText style={LoginTypography.button}>{attribute.name} : {variant.values[attribute.name]}</ThemedText>
        <View style={styles.options}>{attribute.values.map(value => {
          const candidate = variantForValue(product, variant, index, value);
          return <Choice key={value} label={value} accessibilityLabel={`${attribute.name} : ${value}`} selected={variant.values[attribute.name] === value}
            disabled={!candidate} onPress={() => candidate && setSelectedId(candidate.id)} />;
        })}</View>
      </View>)}
      {product.attributes.length > 1 && <ThemedText themeColor="textSecondary">Les choix suivants s’adaptent aux combinaisons proposées.</ThemedText>}
      {product.attributes.length === 0 && product.variants.length > 1 && <View style={styles.options}>
        {product.variants.map(v => <Choice key={v.id} label={v.sku} selected={v.id === selectedId} onPress={() => setSelectedId(v.id)} />)}
      </View>}
    </>}
    {!variant && <ThemedText>Aucune variante disponible.</ThemedText>}
    <ProductSection title="Description"><ThemedText style={LoginTypography.body}>{description || 'Aucune description disponible.'}</ThemedText></ProductSection>
    <ProductSection title="Caractéristiques techniques">
      {product.specifications.length ? product.specifications.map((spec, index) => <View key={`${spec.key}-${index}`} style={styles.specification}>
        <ThemedText style={LoginTypography.button}>{spec.key}</ThemedText><ThemedText style={LoginTypography.body}>{spec.value}</ThemedText>
      </View>) : <ThemedText>Aucune caractéristique renseignée.</ThemedText>}
    </ProductSection>
    <ProductReviews />
    <ProductAccessories />
  </>;
}

export function ProductPage({ slug }: { slug: string }) {
  const { data, loading, error, notFound, retry } = useProduct(slug);
  const theme = useTheme();
  return <ThemedView style={styles.root}><SafeAreaView style={styles.root}>
    <ScrollView contentContainerStyle={styles.content}>
      <Choice label="Retour au catalogue" onPress={() => router.replace('/catalog')} />
      {loading && <View accessibilityLiveRegion="polite" style={styles.group}><ActivityIndicator color={theme.accent} /><ThemedText>Chargement du produit…</ThemedText></View>}
      {notFound ? <ThemedText accessibilityRole="header" style={LoginTypography.lead}>Produit introuvable</ThemedText> : error ? <ThemedText accessibilityRole="alert">{error}</ThemedText> : null}
      {(error || notFound) && !!slug && <Choice label="Réessayer" onPress={retry} />}
      {data && <ProductContent key={data.id} product={data} />}
    </ScrollView>
    <View style={[styles.footer, { borderColor: theme.border }]}>
      <Choice label="Voir mon panier" onPress={() => router.push('/cart')} />
    </View>
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.four, maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center' },
  title: { ...LoginTypography.title, fontSize: 28, lineHeight: 34 },
  price: { ...LoginTypography.title, fontSize: 26, lineHeight: 32 },
  oldPrice: { textDecorationLine: 'line-through' },
  group: { gap: Spacing.two },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  specification: { gap: Spacing.one },
  footer: { borderTopWidth: 1, padding: Spacing.small },
});
