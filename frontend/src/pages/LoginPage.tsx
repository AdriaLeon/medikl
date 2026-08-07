import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';

export function LoginPage() {
  const navigate = useNavigate();
  return <AuthForm initialMode="login" onSuccess={() => navigate('/')} />;
}
