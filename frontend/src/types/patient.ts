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
  completed: boolean | number;
}

export interface PatientDetails extends Patient {
  visits: Visit[];
}