import { useMemo } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/hooks/use-auth';
import { createApiClient } from '@/services/api-client';

const baseUrl = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');

export function useApi() {
  const { getAccessToken } = useAuth();
  return useMemo(() => createApiClient(baseUrl, getAccessToken), [getAccessToken]);
}
