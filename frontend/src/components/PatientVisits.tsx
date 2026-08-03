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

  // Form State for New Visit
  const [speciality, setSpeciality] = useState('');
  const [description, setDescription] = useState('');
  const [visitDate, setVisitDate] = useState("");

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients/${patientId}`);
      if (!res.ok) throw new Error('Failed to load patient details');
      const data = await res.json();
      setPatient(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speciality) return;

    try {
      const res = await fetch(`/api/patients/${patientId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speciality, description, visitDate }),
      });

      if (!res.ok) throw new Error('Failed to add visit');

      // Reset form and reload patient details to see the new visit
      setSpeciality('');
      setDescription('');
      setVisitDate('');
      fetchPatientDetails();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleCompleted = async (
    visitId: number,
    completed: boolean
  ) => {
    try {
      const res = await fetch(
        `/api/patients/${patientId}/visits/${visitId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !completed,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update visit");

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

          {/* New Visit Form */}
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
            style={{ padding: "8px" }}
            />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Record Visit
            </button>
          </form>

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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span>{visit.speciality}</span>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        color: Boolean(visit.completed) ? "green" : "orange",
                      }}
                    >
                      {Boolean(visit.completed) ? "Completed" : "Pending"}
                    </span>

                    <input
                      type="checkbox"
                      checked={Boolean(visit.completed)}
                      onChange={() =>
                        handleToggleCompleted(visit.id, Boolean(visit.completed))
                      }
                    />
                  </div>
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