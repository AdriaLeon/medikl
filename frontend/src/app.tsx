import React, { useEffect, useState } from 'react';

interface Patient {
  id: number;
  name: string;
  age: number;
} 

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all patients on component mount
  const fetchPatients = async () => {
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
    fetchPatients();
  }, []);

  // Handle new patient creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) return;

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age: Number(age) }),
      });

      if (!res.ok) throw new Error('Failed to create patient');

      // Clear input fields and refresh list
      setName('');
      setAge('');
      fetchPatients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Medikl - Patient Management</h1>

      {/* Form to add a new patient */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Patient Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ flex: '2', padding: '8px' }}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
          style={{ flex: '1', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Add Patient
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Patient List */}
      <h2>Patient List</h2>
      {loading ? (
        <p>Loading patients...</p>
      ) : patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {patients.map((p) => (
            <li
              key={p.id}
              style={{
                padding: '10px',
                borderBottom: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span><strong>#{p.id}</strong> {p.name}</span>
              <span>{p.age} years old</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}