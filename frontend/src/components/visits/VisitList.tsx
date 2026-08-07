import React, { useEffect, useState } from 'react';
import { Visit } from '../../types/visit';
import { useFetch } from '../../hooks/useFetch';
import { getDoctorVisits } from '../../api/users';
import { updateVisitCompleted } from '../../api/patients';

interface VisitListProps {
  doctorId?: number;
  initialVisits?: Visit[];
}

type SortField = 'date' | 'name' | 'id';
type SortOrder = 'asc' | 'desc';

export const VisitList: React.FC<VisitListProps> = ({ doctorId, initialVisits }) => {
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);

  const { data: fetchedVisits, loading, error } = useFetch<Visit[]>(
    () => (doctorId ? getDoctorVisits(doctorId, { sortBy, order }) : Promise.resolve(initialVisits ?? [])),
    [doctorId, sortBy, order, initialVisits]
  );

  const [visits, setVisits] = useState<Visit[]>(initialVisits ?? []);

  useEffect(() => {
    if (fetchedVisits) setVisits(fetchedVisits);
  }, [fetchedVisits]);

  // Toggle handler using the existing /patients/:id/visits/:visitId endpoint
  const handleToggleCompleted = async (visit: Visit) => {
    const nextCompleted = !visit.completed;

    // Optimistic UI update
    setVisits((prevVisits) =>
      prevVisits.map((v) => (v.id === visit.id ? { ...v, completed: nextCompleted } : v))
    );

    try {
      await updateVisitCompleted(visit.patient_id!, visit.id, nextCompleted);
    } catch (err: any) {
      // Revert state on failure
      setVisits((prevVisits) =>
        prevVisits.map((v) => (v.id === visit.id ? { ...v, completed: visit.completed } : v))
      );
      alert('Could not update visit status: ' + err.message);
    }
  };

  // Defensive client-side sort for the initialVisits-only path (currently dead code, but safe)
  const sortedVisits = doctorId
    ? visits
    : [...visits].sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'date') cmp = new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime();
        else if (sortBy === 'name') cmp = (a.patient_name || '').localeCompare(b.patient_name || '');
        else cmp = a.id - b.id;
        return order === 'asc' ? cmp : -cmp;
      });

  // Filter to hide completed visits if checkbox is checked
  const displayedVisits = hideCompleted ? sortedVisits.filter((v) => !v.completed) : sortedVisits;

  if (loading) return <p>Loading assigned visits...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)}>
            <option value="date">Date</option>
            <option value="name">Patient Name</option>
            <option value="id">ID</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Order:
          <select value={order} onChange={(e) => setOrder(e.target.value as SortOrder)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
          />
          Hide completed visits
        </label>
      </div>

      {displayedVisits.length === 0 ? (
        <p>No visits found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {displayedVisits.map((visit) => (
            <li
              key={visit.id}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '10px',
                backgroundColor: '#fff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontWeight: 'bold' }}>{visit.speciality}</span>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={visit.completed}
                    onChange={() => handleToggleCompleted(visit)}
                  />
                  <span style={{ color: visit.completed ? 'green' : 'orange', fontWeight: '600' }}>
                    {visit.completed ? 'Completed' : 'Pending'}
                  </span>
                </label>
              </div>

              {visit.patient_name && (
                <p style={{ margin: '4px 0', fontSize: '0.9em', color: '#2563eb' }}>
                  <strong>Patient:</strong> {visit.patient_name} (ID: #{visit.patient_id})
                </p>
              )}

              {visit.doctor_name && (
                <p style={{ margin: '4px 0', fontSize: '0.9em', color: '#0284c7' }}>
                  <strong>Doctor:</strong> Dr. {visit.doctor_name}
                </p>
              )}

              <p style={{ margin: '8px 0', color: '#444' }}>{visit.description}</p>
              <small style={{ color: '#888' }}>
                Date: {new Date(visit.visit_date).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
