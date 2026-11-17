import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ApiError, createApiClient, getApiErrorMessage } from '@/services/api-client';
import { createProductSearchApi } from '@/services/product-search-api';
import { createProductSearchController, initialSearchState } from '@/services/product-search-controller';
import { searchHistory } from '@/services/search-history-storage';

const api = createProductSearchApi(createApiClient(process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080'), async () => null));

export function useProductSearch() {
  const [state, setState] = useState(initialSearchState);
  const [history, setHistory] = useState<string[]>([]);
  const [historyError, setHistoryError] = useState('');
  const [controller] = useState(() => createProductSearchController(api, setState, (cause, timedOut) =>
    cause instanceof ApiError && [404, 501, 503].includes(cause.status)
      ? 'La recherche est temporairement indisponible. Réessayez plus tard.' : getApiErrorMessage(cause, timedOut)));
  useEffect(() => {
    let active = true;
    searchHistory.read().then(items => { if (active) setHistory(items); }).catch(() => {
      if (active) setHistoryError('Impossible de lire l’historique sur cet appareil.');
    });
    return () => { active = false; controller.dispose(); };
  }, [controller]);
  async function save(operation: Promise<string[]>) {
    try { setHistory(await operation); setHistoryError(''); }
    catch { setHistoryError('Impossible d’enregistrer l’historique sur cet appareil.'); }
  }
  return { ...state, history, historyError, change: controller.change, more: controller.more, retry: controller.retry,
    submit(query: string) { if (controller.submit(query)) void save(searchHistory.add(query)); },
    remove(query: string) { void save(searchHistory.remove(query)); },
  };
}
