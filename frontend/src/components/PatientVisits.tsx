import React, { useEffect, useState } from 'react';
import { PatientDetails } from '../types/patient';

interface PatientVisitsViewProps {
  patientId: number;
  onBack: () => void;
}

export const PatientVisitsView: React.FC<PatientVisitsViewProps> = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/patients/${patientId}`);
        if (!res.ok) throw new Error('Failed to load patient visits');
        const data = await res.json();
        setPatient(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>{visit.speciality}</span>
                    <span style={{ color: visit.completed ? 'green' : 'orange' }}>
                      {visit.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
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