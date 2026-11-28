import { useLocalSearchParams } from 'expo-router';
import { CatalogReferencePage } from '@/components/pages/catalog/catalog-reference-page';

export default function CatalogReferenceScreen() {
  const { kind, slug } = useLocalSearchParams<{ kind: string | string[]; slug: string | string[] }>();
  return <CatalogReferencePage key={`${kind}/${slug}`} kind={typeof kind === 'string' ? kind : ''} slug={typeof slug === 'string' ? slug : ''} />;
}
