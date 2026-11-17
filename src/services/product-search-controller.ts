import type { ProductCardResponse, ProductPageResponse } from './product-search-api';

type Api = {
  autocomplete: (query: string, signal: AbortSignal) => Promise<ProductCardResponse[]>;
  search: (query: string, page: number, signal: AbortSignal) => Promise<ProductPageResponse>;
};
export type SearchState = {
  query: string; mode: 'history' | 'suggestions' | 'results'; items: ProductCardResponse[];
  loading: boolean; error: string; page: number; totalPages: number; total: number;
};
export const initialSearchState: SearchState = { query: '', mode: 'history', items: [], loading: false, error: '', page: -1, totalPages: 0, total: 0 };

export function createProductSearchController(api: Api, emit: (state: SearchState) => void, errorMessage: (cause: unknown, timedOut: boolean) => string) {
  let state = initialSearchState;
  let revision = 0;
  let controller: AbortController | undefined;
  let debounce: ReturnType<typeof setTimeout> | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  function update(patch: Partial<SearchState>) { state = { ...state, ...patch }; emit(state); }
  function cancel() {
    revision++;
    clearTimeout(debounce); clearTimeout(timeout); controller?.abort();
  }
  async function request(page = 0) {
    cancel();
    const current = revision;
    const abort = new AbortController();
    controller = abort;
    let timedOut = false;
    update({ loading: true, error: '' });
    const timer = setTimeout(() => {
      if (revision !== current) return;
      timedOut = true;
      abort.abort();
      update({ loading: false, error: errorMessage(new Error('Timeout'), true) });
      revision++;
    }, 15000);
    timeout = timer;
    try {
      if (state.mode === 'suggestions') {
        const items = await api.autocomplete(state.query.trim(), abort.signal);
        if (revision === current) update({ items, loading: false });
      } else {
        const result = await api.search(state.query.trim(), page, abort.signal);
        if (revision === current) {
          const items = page === 0 ? result.content : [...state.items, ...result.content];
          update({ items: items.filter((item, index) => items.findIndex(other => other.id === item.id) === index),
            loading: false, page: result.page, totalPages: result.totalPages, total: result.totalElements });
        }
      }
    } catch (cause) {
      if (revision === current) update({ loading: false, error: errorMessage(cause, timedOut) });
    } finally { clearTimeout(timer); }
  }
  return {
    change(query: string) {
      cancel();
      update({ ...initialSearchState, query, mode: query.trim() ? 'suggestions' : 'history', loading: !!query.trim() });
      if (query.trim()) debounce = setTimeout(() => { void request(); }, 300);
    },
    submit(query: string) {
      if (!query.trim() || query.trim().length > 150) return false;
      cancel();
      update({ ...initialSearchState, query: query.trim(), mode: 'results' });
      void request();
      return true;
    },
    retry() { if (!state.loading && state.mode !== 'history') void request(state.mode === 'results' ? state.page + 1 : 0); },
    more() { if (state.mode === 'results' && !state.loading && !state.error && state.page + 1 < state.totalPages) void request(state.page + 1); },
    dispose: cancel,
  };
}
