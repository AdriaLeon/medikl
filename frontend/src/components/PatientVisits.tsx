import React, { useEffect, useState } from 'react';
import { PatientDetails } from '../types/patient';

interface Doctor {
  id: number;
  username: string;
}

interface PatientVisitsViewProps {
  patientId: number;
  onBack: () => void;
  user: { id: number; username: string; role: 'admin' | 'doctor' } | null;
}

export const PatientVisitsView: React.FC<PatientVisitsViewProps> = ({ patientId, onBack, user }) => {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State for New Visit
  const [speciality, setSpeciality] = useState('');
  const [description, setDescription] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients/${patientId}`);
      if (!res.ok) throw new Error('Failed to load patient details');
      const data = await res.json();
      setPatient(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/users/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err: any) {
      console.error('Failed to load doctors list', err);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
    fetchDoctors();
  }, [patientId]);

  const canManageVisits = user && (user.role === 'admin' || user.role === 'doctor');

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speciality || !visitDate || !selectedDoctorId) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/patients/${patientId}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          speciality,
          description,
          visitDate,
          doctorId: Number(selectedDoctorId),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add visit');
      }

      setSpeciality('');
      setDescription('');
      setVisitDate('');
      setSelectedDoctorId('');
      fetchPatientDetails();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <button
        onClick={onBack}
        style={{
          padding: '6px 12px',
          cursor: 'pointer',
          marginBottom: '20px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        ← Back to Patient List
      </button>

      {loading && <p>Loading details...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {patient && (
        <>
          <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 8px 0' }}>{patient.name}</h2>
            <p style={{ margin: 0 }}><strong>Age:</strong> {patient.age}</p>
            <p style={{ margin: '4px 0 0 0' }}><strong>ID:</strong> #{patient.id}</p>
          </div>

          {/* New Visit Form - Visible only to Logged-in Admins and Doctors */}
          {canManageVisits ? (
            <>
              <h3>Add New Visit</h3>
              <form onSubmit={handleAddVisit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                <input
                  type="text"
                  placeholder="Speciality (e.g. Cardiology, Dermatology)"
                  value={speciality}
                  onChange={(e) => setSpeciality(e.target.value)}
                  required
                  style={{ padding: '8px' }}
                />

                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  required
                  style={{ padding: '8px' }}
                >
                  <option value="">Select Responsible Doctor...</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.username}
                    </option>
                  ))}
                </select>

                <textarea
                  placeholder="Visit description or clinical notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ padding: '8px', fontFamily: 'inherit' }}
                />
                <input
                  type="datetime-local"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  required
                  style={{ padding: '8px' }}
                />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Record Visit
                </button>
              </form>
            </>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '20px' }}>
              Please log in as a Doctor or Admin to record new patient visits.
            </p>
          )}

          <h3>Visits History</h3>

          {!patient.visits || patient.visits.length === 0 ? (
            <p>No visits recorded for this patient.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {patient.visits.map((visit) => (
                <li
                  key={visit.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>{visit.speciality}</span>
                    <span style={{ color: visit.completed ? 'green' : 'orange' }}>
                      {visit.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  
                  <p style={{ margin: '4px 0', fontSize: '0.9em', color: '#0284c7' }}>
                    <strong>Doctor:</strong> Dr. {visit.doctor_name || 'Unassigned'}
                  </p>

                  <p style={{ margin: '8px 0', color: '#444' }}>{visit.description}</p>
                  <small style={{ color: '#888' }}>
                    Date: {new Date(visit.visit_date).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};