import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ApiError, createApiClient, getApiErrorMessage } from '@/services/api-client';
import { createCatalogApi, type CatalogKind, type CatalogReference } from '@/services/catalog-api';

const client = createApiClient(process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080'), async () => null);
const catalog = createCatalogApi(client);

export function useCatalog(kind: CatalogKind, slug?: string, enabled = true) {
  const key = JSON.stringify([kind, slug, enabled]);
  const [state, setState] = useState<{ key: string; data: CatalogReference[]; loading: boolean; error: string; notFound: boolean } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    const request = slug === undefined ? catalog.list(kind, controller.signal) : catalog.detail(kind, slug, controller.signal).then(item => [item]);
    request.then(data => {
      if (active) setState({ key, data, loading: false, error: '', notFound: false });
    }).catch(cause => {
      if (!active) return;
      const notFound = cause instanceof ApiError && cause.status === 404 && slug !== undefined;
      setState({ key, data: [], loading: false, notFound, error: notFound ? 'Cette rubrique n’existe plus.' : getApiErrorMessage(cause, timedOut) });
    }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [kind, slug, enabled, key]);
  const current = state?.key === key ? state : { data: [], loading: enabled, error: '', notFound: false };
  return current;
}
