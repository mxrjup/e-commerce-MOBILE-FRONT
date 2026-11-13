import { UserProfile, UserProfileUpdateRequest } from '@/types/user';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.status === 401
        ? 'Votre session a expiré. Veuillez vous reconnecter.'
        : 'Impossible de traiter votre demande pour le moment.'
    );
  }
  return (await response.json()) as T;
}

export async function fetchUserProfile(
  accessToken: string,
  signal?: AbortSignal
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    signal,
  });
  return parseResponse<UserProfile>(response);
}

export async function updateUserProfile(
  accessToken: string,
  payload: UserProfileUpdateRequest
): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<UserProfile>(response);
}