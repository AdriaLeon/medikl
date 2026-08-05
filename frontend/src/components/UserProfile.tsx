import React, { useEffect, useState } from 'react';
import { VisitList } from './VisitList';

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'doctor';
  created_at: string;
}

interface UserProfileProps {
  user: {
    id: number;
    username: string;
    role: 'admin' | 'doctor';
  };
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load profile details');
        }

        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>User Profile</h2>

      {error ? (
        <div style={styles.card}>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Role:</strong> {user.role.toUpperCase()}</p>
          <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>
            Could not load full profile details: {error}
          </p>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.row}>
            <span style={styles.label}>User ID:</span>
            <span style={styles.value}>#{profile?.id}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Username:</span>
            <span style={styles.value}>{profile?.username}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Email:</span>
            <span style={styles.value}>{profile?.email}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Role:</span>
            <span style={{ 
              ...styles.badge, 
              backgroundColor: profile?.role === 'admin' ? '#7c3aed' : '#0284c7' 
            }}>
              {profile?.role.toUpperCase()}
            </span>
          </div>

          {profile?.created_at && (
            <div style={styles.row}>
              <span style={styles.label}>Member Since:</span>
              <span style={styles.value}>
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Render visits assigned to this user */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ ...styles.title, fontSize: '1.25rem' }}>Assigned Visits</h3>
        <VisitList doctorId={user.id} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '500px',
    margin: '40px auto',
    fontFamily: 'sans-serif',
  },
  title: {
    color: '#0f172a',
    marginBottom: '16px',
  },
  card: {
    padding: '24px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid #f1f5f9',
  },
  label: {
    fontWeight: 'bold',
    color: '#64748b',
    fontSize: '0.95rem',
  },
  value: {
    color: '#1e293b',
    fontSize: '1rem',
  },
  badge: {
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
};