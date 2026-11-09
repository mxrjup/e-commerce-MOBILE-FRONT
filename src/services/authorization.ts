import type { User } from './keycloak';

export function canAccessDashboard(user: User | null) {
  return !!user?.roles?.some(role => ['admin', 'collaborator'].includes(role.toLowerCase()));
}

// UI visibility only; protected APIs must enforce authorization on the server.
export function tokenRoles(token: string, clientId: string): string[] {
  try {
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(segment.padEnd(Math.ceil(segment.length / 4) * 4, '=')));
    return [...(claims.realm_access?.roles ?? []), ...(claims.resource_access?.[clientId]?.roles ?? [])]
      .filter((role): role is string => typeof role === 'string');
  } catch { return []; }
}
