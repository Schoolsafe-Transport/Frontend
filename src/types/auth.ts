export type UserRole =
  | 'PARENT'
  | 'STUDENT'
  | 'SCHOOL_ADMIN'
  | 'TRANSPORT_PROVIDER'
  | 'DRIVER'
  | 'BUSINESS'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

// The 5 Canonical MVP Actor Categories
export type MVPActor =
  | 'PARENT'
  | 'STUDENT'
  | 'TRANSPORT_PROVIDER_DRIVER'
  | 'BUSINESS'
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

/**
 * Returns the exact user-facing display name according to the 5 SchoolSafe MVP actors.
 */
export const getActorDisplayName = (role: UserRole | string): string => {
  switch (role) {
    case 'PARENT':
      return 'Parent / Guardian';
    case 'STUDENT':
      return 'Student';
    case 'TRANSPORT_PROVIDER':
    case 'DRIVER':
      return 'Transport Provider / Driver';
    case 'BUSINESS':
      return 'Business / Advertiser';
    case 'ADMIN':
    case 'SUPER_ADMIN':
    case 'SCHOOL_ADMIN':
      return 'System Administrator';
    default:
      return 'Parent / Guardian';
  }
};

/**
 * Normalizes backend role variations into the 5 core MVP actor keys.
 */
export const normalizeToMVPActor = (role: UserRole | string): MVPActor => {
  switch (role) {
    case 'PARENT':
      return 'PARENT';
    case 'STUDENT':
      return 'STUDENT';
    case 'TRANSPORT_PROVIDER':
    case 'DRIVER':
      return 'TRANSPORT_PROVIDER_DRIVER';
    case 'BUSINESS':
      return 'BUSINESS';
    default:
      return 'ADMIN';
  }
};
