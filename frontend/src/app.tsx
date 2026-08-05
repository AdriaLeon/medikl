import { useEffect, useState } from 'react';
import { Patient } from './types/patient';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { PatientVisitsView } from './components/PatientVisits';
import { Navbar } from './components/Navbar';
import { UserProfile } from './components/UserProfile';
import { AuthForm } from './components/AuthForm';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'doctor';
}

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'login' | 'register'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth States
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    refreshPatients();
  }, []);

  const refreshPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients');
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data = await res.json();
      setPatients(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleAuthSuccess = (_token: string, loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleGoHome = () => {
    setSelectedPatientId(null);
    setCurrentView('dashboard');
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL patients?')) return;

    try {
      const res = await fetch('/api/patients', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete patients');
      setError(null);
      refreshPatients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePatient = async (id: number) => {
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete patient #${id}`);
      setError(null);
      refreshPatients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const activeNavView = currentView === 'login' 
    ? 'login' 
    : currentView === 'register'
    ? 'register'
    : currentView === 'profile' 
    ? 'profile' 
    : selectedPatientId !== null 
    ? 'visits' 
    : 'dashboard';

  return (
    <div>
      <Navbar 
        user={user}
        onGoHome={handleGoHome} 
        onOpenLogin={() => setCurrentView('login')}
        onOpenRegister={() => setCurrentView('register')}
        onOpenProfile={() => setCurrentView('profile')}
        onLogout={handleLogout}
        currentView={activeNavView}
      />

      {/* Render Auth View (Login or Register) */}
      {(currentView === 'login' || currentView === 'register') && (
        <AuthForm 
          initialMode={currentView} 
          onAuthSuccess={handleAuthSuccess} 
        />
      )}

      {/* Render Profile View */}
      {currentView === 'profile' && user && <UserProfile />}

      {/* Render Visits View */}
      {currentView === 'dashboard' && selectedPatientId !== null && (
        <PatientVisitsView
          patientId={selectedPatientId}
          onBack={() => setSelectedPatientId(null)}
        />
      )}

      {/* Render Main Dashboard */}
      {currentView === 'dashboard' && selectedPatientId === null && (
        <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
          <h1>Medikl - Patient Management</h1>

          <PatientForm
            onPatientCreated={refreshPatients}
            onError={(err) => setError(err)}
          />

          {error && <p style={{ color: 'red' }}>Error: {error}</p>}

          <h2>Patient List</h2>
          <p style={{ fontSize: '0.9em', color: '#666' }}>Click on a patient to view their visits.</p>

          <PatientList
            patients={patients}
            loading={loading}
            onSelectPatient={(id) => setSelectedPatientId(id)}
            onDeletePatient={handleDeletePatient}
            onDeleteAll={handleDeleteAll}
          />
        </div>
      )}
    </div>
  );
}