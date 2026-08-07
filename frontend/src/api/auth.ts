import { apiFetch } from './client';
import { User } from '../types/user';

export interface AuthResponse {
  token: string;
  user: User;
}

export function login(username: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/users/login', {
    method: 'POST',
    body: { username, password },
  });
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: 'doctor' | 'admin';
}

export interface RegisterResponse {
  message: string;
  id: number;
  role: string;
}

export function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/users/register', {
    method: 'POST',
    body: payload,
  });
}
