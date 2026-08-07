import { useNavigate } from 'react-router-dom';
import { UserList } from '../components/users/UserList';

export function DoctorsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Doctors</h1>
      <p style={{ fontSize: '0.9em', color: '#666' }}>Click on a doctor to view their profile and visits.</p>
      <UserList type="doctor" onSelectUser={(id) => navigate(`/doctors/${id}`)} />
    </div>
  );
}
