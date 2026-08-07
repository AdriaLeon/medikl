import { apiFetch } from './client';
import { Patient, PatientDetails } from '../types/patient';

export function getPatients(): Promise<Patient[]> {
  return apiFetch<Patient[]>('/patients');
}

export function getPatient(id: number): Promise<PatientDetails> {
  return apiFetch<PatientDetails>(`/patients/${id}`);
}

export interface CreatePatientInput {
  name: string;
  age: number;
}

export function createPatient(input: CreatePatientInput): Promise<{ message: string; id: number }> {
  return apiFetch('/patients', { method: 'POST', body: input });
}

export function deletePatient(id: number): Promise<{ message: string }> {
  return apiFetch(`/patients/${id}`, { method: 'DELETE' });
}

export function deleteAllPatients(): Promise<{ message: string }> {
  return apiFetch('/patients', { method: 'DELETE' });
}

export interface AddVisitInput {
  speciality: string;
  description?: string;
  visitDate: string;
  doctorId: number;
}

export function addVisit(patientId: number, input: AddVisitInput): Promise<{ message: string; visitId: number }> {
  return apiFetch(`/patients/${patientId}/visits`, { method: 'POST', body: input });
}

export function updateVisitCompleted(
  patientId: number,
  visitId: number,
  completed: boolean
): Promise<{ message: string }> {
  return apiFetch(`/patients/${patientId}/visits/${visitId}`, {
    method: 'PATCH',
    body: { completed },
  });
}
