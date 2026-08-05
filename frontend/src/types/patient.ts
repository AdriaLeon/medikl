export interface Patient {
  id: number;
  name: string;
  age: number;
}

export interface Visit {
  id: number;
  speciality: string;
  description: string;
  visit_date: string;
  completed: boolean;
  doctor_id: number;
  doctor_name?: string;
}

export interface PatientDetails extends Patient {
  visits: Visit[];
}