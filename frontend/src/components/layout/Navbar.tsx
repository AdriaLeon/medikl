import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    ...styles.button,
    ...(isActive ? styles.activeButton : {}),
  });

  return (
    <header style={styles.nav}>
      <NavLink to="/" end style={styles.logo}>
        Medikl
      </NavLink>

      <div style={styles.actions}>
        {user ? (
          <>
            <NavLink to="/doctors" style={navLinkStyle}>
              Doctors
            </NavLink>
            <NavLink to="/profile" style={navLinkStyle}>
              Profile ({user.username})
            </NavLink>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={navLinkStyle}>
              Log In
            </NavLink>
            <NavLink
              to="/register"
              style={({ isActive }) => ({
                ...styles.registerBtn,
                ...(isActive ? styles.activeRegisterButton : {}),
              })}
            >
              Create Account
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    userSelect: 'none',
    color: '#38bdf8',
    textDecoration: 'none',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#334155',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
  registerBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #0284c7',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #ef4444',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  activeButton: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  activeRegisterButton: {
    backgroundColor: '#0369a1',
    borderColor: '#0369a1',
  },
};
