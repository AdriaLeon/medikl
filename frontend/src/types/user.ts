export interface User {
  id: number;
  username: string;
  role: 'admin' | 'doctor';
}

export interface UserProfile extends User {
  email: string;
  created_at: string;
}

export interface DoctorSummary {
  id: number;
  username: string;
  email?: string;
}
