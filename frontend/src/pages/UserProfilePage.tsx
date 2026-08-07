import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { fetchMe, fetchUserById } from '../api/users';
import { VisitList } from '../components/visits/VisitList';

export function UserProfilePage() {
  const { doctorId } = useParams<{ doctorId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const viewUserId = doctorId ? Number(doctorId) : undefined;
  const targetId = viewUserId ?? user?.id;
  const showBackButton = viewUserId !== undefined;

  const { data: profile, loading, error } = useFetch(
    () => (viewUserId !== undefined ? fetchUserById(viewUserId) : fetchMe()),
    [viewUserId]
  );

  if (loading) {
    return (
      <div style={styles.container}>
        {showBackButton && (
          <button onClick={() => navigate('/doctors')} style={styles.backButton}>
            &larr; Back
          </button>
        )}
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {showBackButton && (
        <button onClick={() => navigate('/doctors')} style={styles.backButton}>
          &larr; Back
        </button>
      )}

      <h2 style={styles.title}>User Profile</h2>

      {error ? (
        <div style={styles.card}>
          {!showBackButton && user && (
            <>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Role:</strong> {user.role.toUpperCase()}</p>
            </>
          )}
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
        <VisitList doctorId={targetId} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '500px',
    margin: '40px auto',
    fontFamily: 'sans-serif',
  },
  backButton: {
    padding: '6px 14px',
    marginBottom: '16px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
