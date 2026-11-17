import { createSearchHistory, searchHistoryKey } from './search-history';

export const searchHistory = createSearchHistory({
  read: async () => localStorage.getItem(searchHistoryKey),
  write: async value => localStorage.setItem(searchHistoryKey, value),
});
