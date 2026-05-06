import type { User } from '@entities/user/model';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubmitting?: boolean;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  turnstileToken?: string;
  lang?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  lang?: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
  lang?: string;
}

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthResponseData {
  user: User;
  tokens?: AuthTokens;
  token?: string;
}
