export interface UserProfile {
  id: number;
  authProviderId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface UserProfileUpdateRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}