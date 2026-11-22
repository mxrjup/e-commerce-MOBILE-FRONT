export type NotificationType = 'VARIANT_ALERT' | 'ORDER_UPDATE' | 'SYSTEM';

export type CatalogAlertType = 'PRICE_DROP' | 'BACK_IN_STOCK';

export type VariantAlertSummary = {
  id: number;
  variantId: number;
  sku: string;
  productName: string;
  alertType: string;
  currentStock: number | null;
  threshold: number | null;
  resolved: boolean;
};

export type UserNotification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  variantAlert: VariantAlertSummary | null;
};

export type CatalogAlert = {
  id: number;
  productId: number | null;
  variantId: number;
  alertType: CatalogAlertType;
  targetPriceExclTax: number | null;
  active: boolean;
  triggeredAt: string | null;
  createdAt: string;
};

export type CreateCatalogAlertPayload = {
  productId?: number;
  variantId: number;
  alertType: CatalogAlertType;
  targetPriceExclTax?: number;
};

export type UpdateCatalogAlertPayload = {
  targetPriceExclTax?: number;
  active?: boolean;
};

export type CreateAlertFormInput = {
  productId: string;
  variantId: string;
  alertType: CatalogAlertType;
  targetPriceExclTax: string;
};

export type CreateAlertFormErrors = Partial<Record<'variantId' | 'productId' | 'targetPriceExclTax', string>>;

type HttpClient = {
  get: <T>(path: string, options?: { signal?: AbortSignal }) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body?: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readNotificationType(value: unknown): NotificationType {
  if (value === 'VARIANT_ALERT' || value === 'ORDER_UPDATE' || value === 'SYSTEM') {
    return value;
  }
  return 'SYSTEM';
}

function readCatalogAlertType(value: unknown): CatalogAlertType {
  return value === 'PRICE_DROP' ? 'PRICE_DROP' : 'BACK_IN_STOCK';
}

export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'VARIANT_ALERT':
      return 'Alerte produit';
    case 'ORDER_UPDATE':
      return 'Commande';
    case 'SYSTEM':
      return 'Information';
  }
}

export function getCatalogAlertTypeLabel(type: CatalogAlertType): string {
  return type === 'PRICE_DROP' ? 'Baisse de prix' : 'Retour en stock';
}

export function formatPriceExclTax(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')} € HT`;
}

export function parsePositiveIntegerId(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parsePositivePrice(raw: string): number | null {
  const normalized = raw.trim().replace(/\s+/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0.01 ? Math.round(parsed * 100) / 100 : null;
}

export function validateCreateAlertInput(input: CreateAlertFormInput): CreateAlertFormErrors {
  const errors: CreateAlertFormErrors = {};

  if (!parsePositiveIntegerId(input.variantId)) {
    errors.variantId = 'Saisissez un identifiant de variante valide (nombre entier positif).';
  }

  if (input.productId.trim().length > 0 && !parsePositiveIntegerId(input.productId)) {
    errors.productId = 'L’identifiant produit doit être un nombre entier positif.';
  }

  if (input.alertType === 'PRICE_DROP' && !parsePositivePrice(input.targetPriceExclTax)) {
    errors.targetPriceExclTax = 'Saisissez un prix cible HT supérieur ou égal à 0,01 €.';
  }

  return errors;
}

export function validateUpdateAlertPrice(rawPrice: string): string | undefined {
  if (!parsePositivePrice(rawPrice)) {
    return 'Saisissez un prix cible HT supérieur ou égal à 0,01 €.';
  }
  return undefined;
}

export function mapVariantAlertSummary(raw: unknown): VariantAlertSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as Record<string, unknown>;
  return {
    id: readNumber(source.id),
    variantId: readNumber(source.variantId),
    sku: readString(source.sku),
    productName: readString(source.productName),
    alertType: readString(source.alertType),
    currentStock: readNullableNumber(source.currentStock),
    threshold: readNullableNumber(source.threshold),
    resolved: Boolean(source.resolved),
  };
}

export function mapNotificationResponse(raw: unknown): UserNotification {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id: readNumber(source.id),
    type: readNotificationType(source.type),
    title: readString(source.title),
    message: readString(source.message),
    read: Boolean(source.read),
    readAt: readNullableString(source.readAt),
    createdAt: readString(source.createdAt),
    variantAlert: mapVariantAlertSummary(source.variantAlert),
  };
}

export function mapNotificationListResponse(raw: unknown): UserNotification[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(mapNotificationResponse)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
}

export function mapUnreadCountResponse(raw: unknown): number {
  if (!raw || typeof raw !== 'object') return 0;
  const value = (raw as Record<string, unknown>).unreadCount;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

export function mapCatalogAlertResponse(raw: unknown): CatalogAlert {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id: readNumber(source.id),
    productId: readNullableNumber(source.productId),
    variantId: readNumber(source.variantId),
    alertType: readCatalogAlertType(source.alertType),
    targetPriceExclTax: readNullableNumber(source.targetPriceExclTax),
    active: Boolean(source.active),
    triggeredAt: readNullableString(source.triggeredAt),
    createdAt: readString(source.createdAt),
  };
}

export function mapCatalogAlertListResponse(raw: unknown): CatalogAlert[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(mapCatalogAlertResponse)
    .sort((a, b) => Number(b.active) - Number(a.active) || b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
}

export async function fetchNotifications(
  api: HttpClient,
  options: { unreadOnly?: boolean; signal?: AbortSignal } = {}
): Promise<UserNotification[]> {
  const query = options.unreadOnly ? '?unreadOnly=true' : '?unreadOnly=false';
  const data = await api.get<unknown>(`/api/v1/notifications${query}`, { signal: options.signal });
  return mapNotificationListResponse(data);
}

export async function fetchUnreadNotificationsCount(
  api: HttpClient,
  signal?: AbortSignal
): Promise<number> {
  const data = await api.get<unknown>('/api/v1/notifications/unread-count', { signal });
  return mapUnreadCountResponse(data);
}

export async function markNotificationAsRead(
  api: HttpClient,
  id: number
): Promise<UserNotification> {
  const data = await api.patch<unknown>(`/api/v1/notifications/${id}/read`);
  return mapNotificationResponse(data);
}

export async function markAllNotificationsAsRead(api: HttpClient): Promise<void> {
  await api.patch<void>('/api/v1/notifications/read-all');
}

export async function fetchCatalogAlerts(
  api: HttpClient,
  options: { activeOnly?: boolean; signal?: AbortSignal } = {}
): Promise<CatalogAlert[]> {
  const query = options.activeOnly ? '?activeOnly=true' : '?activeOnly=false';
  const data = await api.get<unknown>(`/api/v1/notifications/alerts${query}`, { signal: options.signal });
  return mapCatalogAlertListResponse(data);
}

export async function createCatalogAlert(
  api: HttpClient,
  payload: CreateCatalogAlertPayload
): Promise<CatalogAlert> {
  const data = await api.post<unknown>('/api/v1/notifications/alerts', payload);
  return mapCatalogAlertResponse(data);
}

export async function updateCatalogAlert(
  api: HttpClient,
  id: number,
  payload: UpdateCatalogAlertPayload
): Promise<CatalogAlert> {
  const data = await api.patch<unknown>(`/api/v1/notifications/alerts/${id}`, payload);
  return mapCatalogAlertResponse(data);
}

export async function deleteCatalogAlert(api: HttpClient, id: number): Promise<void> {
  await api.delete<void>(`/api/v1/notifications/alerts/${id}`);
}