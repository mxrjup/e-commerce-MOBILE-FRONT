import * as SecureStore from 'expo-secure-store';
import { createSearchHistory, searchHistoryKey } from './search-history';

// Dedicated key and service; never read or modify authentication storage.
const options = { keychainService: 'catalog-search-history' };
export const searchHistory = createSearchHistory({
  read: () => SecureStore.getItemAsync(searchHistoryKey, options),
  write: value => SecureStore.setItemAsync(searchHistoryKey, value, options),
});
