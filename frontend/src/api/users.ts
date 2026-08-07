import { apiFetch } from './client';
import { DoctorSummary, UserProfile } from '../types/user';
import { Visit } from '../types/visit';

export function fetchMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me');
}

export function fetchUserById(id: number): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${id}`);
}

export function getDoctors(): Promise<DoctorSummary[]> {
  return apiFetch<DoctorSummary[]>('/users/doctors');
}

export interface DoctorVisitsQuery {
  sortBy?: 'date' | 'name' | 'id';
  order?: 'asc' | 'desc';
}

export function getDoctorVisits(doctorId: number, query: DoctorVisitsQuery = {}): Promise<Visit[]> {
  const params = new URLSearchParams();
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.order) params.set('order', query.order);
  const qs = params.toString();
  return apiFetch<Visit[]>(`/users/${doctorId}/visits${qs ? `?${qs}` : ''}`);
}
