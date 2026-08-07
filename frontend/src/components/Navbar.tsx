import React from 'react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'doctor';
}

interface NavbarProps {
  user: User | null;
  onGoHome: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenProfile: () => void;
  onOpenDoctors: () => void;
  onLogout: () => void;
  currentView: 'dashboard' | 'profile' | 'login' | 'register' | 'visits' | 'doctors';
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onGoHome,
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  onOpenDoctors,
  onLogout,
  currentView,
}) => {
  return (
    <header style={styles.nav}>
      <div 
        onClick={onGoHome} 
        style={styles.logo}
        role="button"
        tabIndex={0}
      >
        Medikl
      </div>

      <div style={styles.actions}>
        {user ? (
          <>
            <button
              onClick={onOpenDoctors}
              style={{
                ...styles.button,
                ...(currentView === 'doctors' ? styles.activeButton : {})
              }}
            >
              Doctors
            </button>
            <button
              onClick={onOpenProfile}
              style={{
                ...styles.button,
                ...(currentView === 'profile' ? styles.activeButton : {})
              }}
            >
              Profile ({user.username})
            </button>
            <button onClick={onLogout} style={styles.logoutBtn}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={onOpenLogin} 
              style={{
                ...styles.button,
                ...(currentView === 'login' ? styles.activeButton : {})
              }}
            >
              Log In
            </button>
            <button 
              onClick={onOpenRegister} 
              style={{
                ...styles.registerBtn,
                ...(currentView === 'register' ? styles.activeRegisterButton : {})
              }}
            >
              Create Account
            </button>
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
    cursor: 'pointer',
    userSelect: 'none',
    color: '#38bdf8',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#334155',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.9rem',
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