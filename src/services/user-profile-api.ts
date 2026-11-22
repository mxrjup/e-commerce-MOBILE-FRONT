export type UserProfile = {
  id: number;
  authProviderId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type UserProfileUpdatePayload = {
  firstName: string;
  lastName: string;
  phone: string;
};

export type UserProfileErrors = Partial<Record<'firstName' | 'lastName', string>>;

export type Address = {
  id: number;
  label: string;
  recipient: string;
  street: string;
  complement: string;
  zipCode: string;
  city: string;
  country: string;
  isDefault: boolean;
};

export type AddressPayload = {
  label: string;
  recipient: string;
  street: string;
  complement: string;
  zipCode: string;
  city: string;
  country: string;
  isDefault: boolean;
};

export type AddressFieldErrors = Partial<Record<'recipient' | 'street' | 'zipCode' | 'city' | 'country', string>>;

type RawUserProfile = {
  id?: unknown;
  authProviderId?: unknown;
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
};

type RawAddress = {
  id?: unknown;
  label?: unknown;
  recipient?: unknown;
  street?: unknown;
  complement?: unknown;
  zipCode?: unknown;
  city?: unknown;
  country?: unknown;
  isDefault?: unknown;
  default?: unknown;
};

type HttpClient = {
  get: <T>(path: string, options?: { signal?: AbortSignal }) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  put: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body?: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function mapUserProfileResponse(raw: unknown): UserProfile {
  const source = (raw && typeof raw === 'object' ? raw : {}) as RawUserProfile;
  return {
    id: readNumber(source.id),
    authProviderId: readString(source.authProviderId),
    email: readString(source.email),
    firstName: readString(source.firstName),
    lastName: readString(source.lastName),
    phone: readString(source.phone),
  };
}

export function mapAddressResponse(raw: unknown): Address {
  const source = (raw && typeof raw === 'object' ? raw : {}) as RawAddress;
  return {
    id: readNumber(source.id),
    label: readString(source.label),
    recipient: readString(source.recipient),
    street: readString(source.street),
    complement: readString(source.complement),
    zipCode: readString(source.zipCode),
    city: readString(source.city),
    country: readString(source.country),
    isDefault: Boolean(source.isDefault ?? source.default),
  };
}

export function mapAddressListResponse(raw: unknown): Address[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(mapAddressResponse)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.id - b.id);
}

export function validateUserProfile(input: UserProfileUpdatePayload): UserProfileErrors {
  const errors: UserProfileErrors = {};
  if (!input.firstName.trim()) {
    errors.firstName = 'Le prénom est obligatoire.';
  }
  if (!input.lastName.trim()) {
    errors.lastName = 'Le nom est obligatoire.';
  }
  return errors;
}

export function validateAddress(input: AddressPayload): AddressFieldErrors {
  const errors: AddressFieldErrors = {};
  if (!input.recipient.trim()) {
    errors.recipient = 'Le nom du destinataire est obligatoire.';
  }
  if (!input.street.trim()) {
    errors.street = 'L’adresse est obligatoire.';
  }
  if (!input.zipCode.trim()) {
    errors.zipCode = 'Le code postal est obligatoire.';
  }
  if (!input.city.trim()) {
    errors.city = 'La ville est obligatoire.';
  }
  if (!input.country.trim()) {
    errors.country = 'Le pays est obligatoire.';
  }
  return errors;
}

export function sanitizeProfilePayload(input: UserProfileUpdatePayload): UserProfileUpdatePayload {
  return {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone.trim(),
  };
}

export function sanitizeAddressPayload(input: AddressPayload): AddressPayload {
  return {
    label: input.label.trim(),
    recipient: input.recipient.trim(),
    street: input.street.trim(),
    complement: input.complement.trim(),
    zipCode: input.zipCode.trim(),
    city: input.city.trim(),
    country: input.country.trim(),
    isDefault: Boolean(input.isDefault),
  };
}

export async function fetchUserProfile(api: HttpClient, signal?: AbortSignal): Promise<UserProfile> {
  const data = await api.get<unknown>('/api/v1/users/me', { signal });
  return mapUserProfileResponse(data);
}

export async function updateUserProfile(api: HttpClient, payload: UserProfileUpdatePayload): Promise<UserProfile> {
  const data = await api.put<unknown>('/api/v1/users/me', sanitizeProfilePayload(payload));
  return mapUserProfileResponse(data);
}

export async function fetchAddresses(api: HttpClient, signal?: AbortSignal): Promise<Address[]> {
  const data = await api.get<unknown>('/api/v1/addresses', { signal });
  return mapAddressListResponse(data);
}

export async function createAddress(api: HttpClient, payload: AddressPayload): Promise<Address> {
  const data = await api.post<unknown>('/api/v1/addresses', sanitizeAddressPayload(payload));
  return mapAddressResponse(data);
}

export async function updateAddress(api: HttpClient, id: number, payload: AddressPayload): Promise<Address> {
  const data = await api.put<unknown>(`/api/v1/addresses/${id}`, sanitizeAddressPayload(payload));
  return mapAddressResponse(data);
}

export async function setDefaultAddress(api: HttpClient, id: number): Promise<Address> {
  const data = await api.patch<unknown>(`/api/v1/addresses/${id}/default`);
  return mapAddressResponse(data);
}

export async function deleteAddress(api: HttpClient, id: number): Promise<void> {
  await api.delete<void>(`/api/v1/addresses/${id}`);
}