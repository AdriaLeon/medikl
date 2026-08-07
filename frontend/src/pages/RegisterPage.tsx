import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';

export function RegisterPage() {
  const navigate = useNavigate();
  return <AuthForm initialMode="register" onSuccess={() => navigate('/')} />;
}
