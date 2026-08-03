import { useEffect, useState } from 'react';
import { Patient } from './types/patient';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { PatientVisitsView } from './components/PatientVisits';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    refreshPatients();
  }, []);

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

  // Render Visits View if a patient is selected
  if (selectedPatientId !== null) {
    return (
      <PatientVisitsView
        patientId={selectedPatientId}
        onBack={() => setSelectedPatientId(null)}
      />
    );
  }

  // Render Main Dashboard
  return (
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
  );
}