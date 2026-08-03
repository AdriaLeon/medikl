import React, { useState } from 'react';

interface PatientFormProps {
  onPatientCreated: () => void;
  onError: (error: string | null) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onPatientCreated, onError }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) return;

    const ageNumber = Number(age);
    if (ageNumber <= 14) {
      onError('Age must be greater than 14');
      return;
    }

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age: ageNumber }),
      });

      if (!res.ok) throw new Error('Failed to create patient');

      setName('');
      setAge('');
      onError(null);
      onPatientCreated();
    } catch (err: any) {
      onError(err.message);
    }
  };

  return (
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
        min="15"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        required
        style={{ flex: '1', padding: '8px' }}
      />
      <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Add Patient
      </button>
    </form>
  );
};