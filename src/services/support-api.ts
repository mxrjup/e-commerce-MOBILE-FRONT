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
};

export type CreateTicketFormErrors = Partial<Record<'subject' | 'message', string>>;

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