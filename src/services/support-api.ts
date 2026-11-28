import { ApiError, getApiErrorMessage } from '@/services/api-client';

export type TicketCategory =
  | 'ORDER'
  | 'DELIVERY'
  | 'RETURN_REFUND'
  | 'PRODUCT'
  | 'ACCOUNT'
  | 'OTHER';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED';

export type MessageAuthorRole = 'CUSTOMER' | 'AGENT';

export type TicketMessage = {
  id: number;
  authorRole: MessageAuthorRole;
  content: string;
  createdAt: string;
};

export type SupportTicketSummary = {
  id: number;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  orderId: number | null;
  orderNumber: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketDetail = {
  id: number;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  orderId: number | null;
  orderNumber: string | null;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
};

export type CreateSupportTicketPayload = {
  subject: string;
  message: string;
  category: TicketCategory;
  orderId?: number;
  orderNumber?: string;
};

export type AddTicketMessagePayload = {
  content: string;
};

export type CreateTicketFormInput = {
  subject: string;
  message: string;
  category: TicketCategory;
  orderId?: number | null;
  orderNumber?: string | null;
  orderCreatedAt?: string | null;
  now?: Date;
};

export type CreateTicketFormErrors = Partial<Record<'subject' | 'message' | 'category' | 'order', string>>;

type HttpClient = {
  get: <T>(path: string, options?: { signal?: AbortSignal }) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
};

export const TICKET_CATEGORIES: readonly TicketCategory[] = [
  'ORDER',
  'DELIVERY',
  'RETURN_REFUND',
  'PRODUCT',
  'ACCOUNT',
  'OTHER',
];

export const ORDER_REQUIRED_CATEGORIES: readonly TicketCategory[] = [
  'ORDER',
  'DELIVERY',
  'RETURN_REFUND',
];

export const SUPPORT_WINDOW_DAYS = 14;
const SUPPORT_WINDOW_MS = SUPPORT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export function isOrderRequiredCategory(category: TicketCategory): boolean {
  return ORDER_REQUIRED_CATEGORIES.includes(category);
}

export function isOrderEligibleForSupport(createdAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!createdAt) return true;
  const parsedMs = Date.parse(createdAt);
  if (!Number.isFinite(parsedMs)) return true;
  return now.getTime() - parsedMs <= SUPPORT_WINDOW_MS;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readTicketCategory(value: unknown): TicketCategory {
  if (
    value === 'ORDER' ||
    value === 'DELIVERY' ||
    value === 'RETURN_REFUND' ||
    value === 'PRODUCT' ||
    value === 'ACCOUNT' ||
    value === 'OTHER'
  ) {
    return value;
  }
  return 'OTHER';
}

function readTicketStatus(value: unknown): TicketStatus {
  if (
    value === 'OPEN' ||
    value === 'IN_PROGRESS' ||
    value === 'WAITING_CUSTOMER' ||
    value === 'RESOLVED' ||
    value === 'CLOSED'
  ) {
    return value;
  }
  return 'OPEN';
}

function readAuthorRole(value: unknown): MessageAuthorRole {
  return value === 'AGENT' ? 'AGENT' : 'CUSTOMER';
}

export function getTicketCategoryLabel(category: TicketCategory): string {
  switch (category) {
    case 'ORDER':
      return 'Commande';
    case 'DELIVERY':
      return 'Livraison';
    case 'RETURN_REFUND':
      return 'Retour & remboursement';
    case 'PRODUCT':
      return 'Produit';
    case 'ACCOUNT':
      return 'Compte';
    case 'OTHER':
      return 'Autre';
  }
}

export function getTicketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case 'OPEN':
      return 'Ouvert';
    case 'IN_PROGRESS':
      return 'En cours';
    case 'WAITING_CUSTOMER':
      return 'Réponse attendue';
    case 'RESOLVED':
      return 'Résolu';
    case 'CLOSED':
      return 'Fermé';
  }
}

export function isTicketActiveStatus(status: TicketStatus): boolean {
  return status === 'OPEN' || status === 'IN_PROGRESS' || status === 'WAITING_CUSTOMER';
}

export function parsePositiveTicketId(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function validateCreateTicketInput(input: CreateTicketFormInput): CreateTicketFormErrors {
  const errors: CreateTicketFormErrors = {};
  const subject = input.subject.trim();
  const message = input.message.trim();
  const hasOrder =
    (typeof input.orderId === 'number' && Number.isFinite(input.orderId) && input.orderId > 0) ||
    (typeof input.orderNumber === 'string' && input.orderNumber.trim().length > 0);

  if (isOrderRequiredCategory(input.category) && !hasOrder) {
    errors.order = `Sélectionnez une commande pour la catégorie « ${getTicketCategoryLabel(input.category)} ».`;
    errors.category = 'Cette catégorie nécessite une commande associée.';
  } else if (hasOrder && input.orderCreatedAt && !isOrderEligibleForSupport(input.orderCreatedAt, input.now)) {
    errors.order = `Le délai de ${SUPPORT_WINDOW_DAYS} jours pour ouvrir un ticket SAV sur cette commande est dépassé.`;
  }

  if (!subject) {
    errors.subject = 'Le sujet du ticket est obligatoire.';
  } else if (subject.length > 200) {
    errors.subject = 'Le sujet ne doit pas dépasser 200 caractères.';
  }

  if (!message) {
    errors.message = 'Décrivez votre demande dans le message initial.';
  } else if (message.length > 5000) {
    errors.message = 'Le message ne doit pas dépasser 5 000 caractères.';
  }

  return errors;
}

export function validateTicketReply(rawContent: string): string | undefined {
  const trimmed = rawContent.trim();
  if (!trimmed) {
    return 'Saisissez un message avant d’envoyer votre réponse.';
  }
  if (trimmed.length > 5000) {
    return 'Le message ne doit pas dépasser 5 000 caractères.';
  }
  return undefined;
}

export function getSupportApiErrorMessage(cause: unknown, timedOut = false): string {
  if (cause instanceof ApiError && cause.code === 'http_error' && (cause.status === 400 || cause.status === 409)) {
    if (cause.data && typeof cause.data === 'object') {
      const payload = cause.data as Record<string, unknown>;
      const serverMessage =
        typeof payload.message === 'string'
          ? payload.message.trim()
          : typeof payload.detail === 'string'
            ? payload.detail.trim()
            : '';
      if (serverMessage) {
        return serverMessage;
      }
    }
  }
  return getApiErrorMessage(cause, timedOut);
}

export function mapTicketMessageResponse(raw: unknown): TicketMessage {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id: readNumber(source.id),
    authorRole: readAuthorRole(source.authorRole),
    content: readString(source.content),
    createdAt: readString(source.createdAt),
  };
}

export function mapTicketSummaryResponse(raw: unknown): SupportTicketSummary {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id: readNumber(source.id),
    subject: readString(source.subject),
    category: readTicketCategory(source.category),
    status: readTicketStatus(source.status),
    orderId: readNullableNumber(source.orderId),
    orderNumber: readNullableString(source.orderNumber),
    messageCount: readNumber(source.messageCount),
    createdAt: readString(source.createdAt),
    updatedAt: readString(source.updatedAt),
  };
}

export function mapTicketSummaryListResponse(raw: unknown): SupportTicketSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(mapTicketSummaryResponse)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id - a.id);
}

export function mapTicketDetailResponse(raw: unknown): SupportTicketDetail {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const rawMessages = Array.isArray(source.messages) ? source.messages : [];
  const messages = rawMessages
    .map(mapTicketMessageResponse)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id);

  return {
    id: readNumber(source.id),
    subject: readString(source.subject),
    category: readTicketCategory(source.category),
    status: readTicketStatus(source.status),
    orderId: readNullableNumber(source.orderId),
    orderNumber: readNullableString(source.orderNumber),
    createdAt: readString(source.createdAt),
    updatedAt: readString(source.updatedAt),
    messages,
  };
}

export async function fetchMySupportTickets(
  api: HttpClient,
  options: { status?: TicketStatus; signal?: AbortSignal } = {}
): Promise<SupportTicketSummary[]> {
  const query = options.status ? `?status=${encodeURIComponent(options.status)}` : '';
  const data = await api.get<unknown>(`/api/v1/support/tickets${query}`, { signal: options.signal });
  return mapTicketSummaryListResponse(data);
}

export async function fetchSupportTicketDetail(
  api: HttpClient,
  ticketId: number,
  signal?: AbortSignal
): Promise<SupportTicketDetail> {
  const data = await api.get<unknown>(`/api/v1/support/tickets/${ticketId}`, { signal });
  return mapTicketDetailResponse(data);
}

export async function createSupportTicket(
  api: HttpClient,
  payload: CreateSupportTicketPayload
): Promise<SupportTicketDetail> {
  const data = await api.post<unknown>('/api/v1/support/tickets', payload);
  return mapTicketDetailResponse(data);
}

export async function addSupportTicketMessage(
  api: HttpClient,
  ticketId: number,
  payload: AddTicketMessagePayload
): Promise<TicketMessage> {
  const data = await api.post<unknown>(`/api/v1/support/tickets/${ticketId}/messages`, payload);
  return mapTicketMessageResponse(data);
}