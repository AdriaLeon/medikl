import { useEffect, useState } from 'react';
import { Patient } from './types/patient';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { PatientVisitsView } from './components/PatientVisits';
import { Navbar } from './components/Navbar';
import { UserProfile } from './components/UserProfile';
import { AuthForm } from './components/AuthForm';
import { UserList } from './components/UserList';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'doctor';
}

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'login' | 'register' | 'doctors'>('dashboard');
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
    setSelectedDoctorId(null);
    setCurrentView('dashboard');
  };

  const handleOpenDoctors = () => {
    setSelectedDoctorId(null);
    setCurrentView('doctors');
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
    : currentView === 'doctors'
    ? 'doctors'
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
        onOpenDoctors={handleOpenDoctors}
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

      {/* Render Visits View */}
      {currentView === 'dashboard' && selectedPatientId !== null && (
        <PatientVisitsView
          patientId={selectedPatientId}
          user={user}
          onBack={() => setSelectedPatientId(null)}
        />
      )}

      {/* Render Profile View with VisitList integration */}
      {currentView === 'profile' && user && <UserProfile user={user} />}

      {/* Render Doctors List */}
      {currentView === 'doctors' && selectedDoctorId === null && (
        <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
          <h1>Doctors</h1>
          <p style={{ fontSize: '0.9em', color: '#666' }}>Click on a doctor to view their profile and visits.</p>
          <UserList type="doctor" onSelectUser={setSelectedDoctorId} />
        </div>
      )}

      {/* Render Selected Doctor's Profile with their Visits */}
      {currentView === 'doctors' && selectedDoctorId !== null && (
        <UserProfile
          user={user}
          viewUserId={selectedDoctorId}
          onBack={() => setSelectedDoctorId(null)}
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
            user={user}
            onSelectPatient={(id) => setSelectedPatientId(id)}
            onDeletePatient={handleDeletePatient}
            onDeleteAll={handleDeleteAll}
          />
        </div>
      )}
    </div>
  );
}