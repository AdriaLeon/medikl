import { Visit } from './visit';

export interface Patient {
  id: number;
  name: string;
  age: number;
}

export interface PatientDetails extends Patient {
  visits: Visit[];
}
