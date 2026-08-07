import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

interface AuthFormProps {
  initialMode?: 'login' | 'register';
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login', onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Watches NavBar while AuthForm stays mounted, changes the mode manually
  useEffect(() => { setMode(initialMode); }, [initialMode]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'doctor' | 'admin'>('doctor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        // register() also auto-logs-in on success, matching prior behavior
        await register({ username, email, password, role });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to ${mode}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ marginTop: 0 }}>{mode === 'login' ? 'Log In' : 'Create Account'}</h2>
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        {mode === 'register' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'doctor' | 'admin')}
                style={styles.input}
              >
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Register Account'}
        </button>
      </form>

      <div style={styles.toggleContainer}>
        {mode === 'login' ? (
          <p style={styles.toggleText}>
            Don't have an account?{' '}
            <button type="button" onClick={() => { setError(null); setMode('register'); }} style={styles.toggleBtn}>
              Create one here
            </button>
          </p>
        ) : (
          <p style={styles.toggleText}>
            Already have an account?{' '}
            <button type="button" onClick={() => { setError(null); setMode('login'); }} style={styles.toggleBtn}>
              Log in here
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '24px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#334155',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
  },
  submitBtn: {
    padding: '10px',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  error: {
    color: '#ef4444',
    fontSize: '0.9rem',
  },
  toggleContainer: {
    marginTop: '16px',
    textAlign: 'center',
  },
  toggleText: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#0284c7',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  },
};
