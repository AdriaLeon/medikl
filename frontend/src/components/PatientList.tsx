import React from 'react';
import { Patient } from '../types/patient';

interface PatientListProps {
  patients: Patient[];
  loading: boolean;
  onSelectPatient: (id: number) => void;
  onDeletePatient: (id: number) => void;
  onDeleteAll: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  loading,
  onSelectPatient,
  onDeletePatient,
  onDeleteAll,
}) => {
  if (loading) return <p>Loading patients...</p>;
  if (patients.length === 0) return <p>No patients found.</p>;

  return (
    <>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {patients.map((p) => (
          <li
            key={p.id}
            onClick={() => onSelectPatient(p.id)}
            style={{
              padding: '12px',
              borderBottom: '1px solid #ccc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div>
              <span><strong>#{p.id}</strong> {p.name}</span>
              <span style={{ marginLeft: '12px', color: '#666' }}>{p.age} years old</span>
            </div>

            <button
              onClick={(e) => {
                // Prevent clicking the button from triggering onSelectPatient on the parent <li>
                e.stopPropagation();
                if (window.confirm(`Delete patient #${p.id} (${p.name}) and all their visits?`)) {
                  onDeletePatient(p.id);
                }
              }}
              style={{
                backgroundColor: '#ff4d4f',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85em',
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          onClick={onDeleteAll}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Delete All
        </button>
      </div>
    </>
  );
};