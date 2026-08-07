import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getPatients, deletePatient, deleteAllPatients } from '../api/patients';
import { PatientForm } from '../components/patients/PatientForm';
import { PatientList } from '../components/patients/PatientList';

export function DashboardPage() {
  const { data: patients, loading, error: fetchError, refetch } = useFetch(getPatients, []);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDeletePatient = async (id: number) => {
    try {
      await deletePatient(id);
      setActionError(null);
      refetch();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL patients?')) return;

    try {
      await deleteAllPatients();
      setActionError(null);
      refetch();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const error = actionError || fetchError;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Medikl - Patient Management</h1>

      <PatientForm
        onPatientCreated={() => {
          setActionError(null);
          refetch();
        }}
        onError={setActionError}
      />

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <h2>Patient List</h2>
      <p style={{ fontSize: '0.9em', color: '#666' }}>Click on a patient to view their visits.</p>

      <PatientList
        patients={patients ?? []}
        loading={loading}
        onDeletePatient={handleDeletePatient}
        onDeleteAll={handleDeleteAll}
      />
    </div>
  );
}
