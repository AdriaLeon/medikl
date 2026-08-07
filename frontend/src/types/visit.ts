export interface Visit {
  id: number;
  speciality: string;
  description: string;
  visit_date: string;
  completed: boolean;
  doctor_id: number;
  doctor_name?: string;
  patient_id?: number;
  patient_name?: string;
}
