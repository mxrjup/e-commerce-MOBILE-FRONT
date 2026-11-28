import { useEffect, useMemo, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { ApiError, getApiErrorMessage } from '@/services/api-client';
import { createCatalogApi } from '@/services/catalog-api';
import type { ProductDetail } from '@/services/product-detail';

export function useProduct(slug: string) {
  const client = useApi();
  const api = useMemo(() => createCatalogApi(client), [client]);
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([slug, attempt]);
  const [state, setState] = useState<{ key: string; data?: ProductDetail; error?: string; notFound?: boolean }>();
  useEffect(() => {
    if (!slug) return;
    let active = true;
    let timedOut = false;
    const controller = new AbortController();
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    api.product(slug, controller.signal).then(data => {
      if (active) setState({ key, data });
    }).catch(cause => {
      if (active) setState({ key, notFound: cause instanceof ApiError && cause.status === 404, error: getApiErrorMessage(cause, timedOut) });
    }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [api, key, slug]);
  const current = state?.key === key ? state : undefined;
  return { ...current, loading: !!slug && !current, notFound: !slug || current?.notFound, retry: () => setAttempt(n => n + 1) };
}
