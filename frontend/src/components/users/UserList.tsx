import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getDoctors } from '../../api/users';
import { getPatients } from '../../api/patients';

interface UserListProps {
  type: 'doctor' | 'patient';
  onSelectUser?: (id: number) => void;
}

interface ListItem {
  id: number;
  label: string;
  sublabel?: string;
}

export const UserList: React.FC<UserListProps> = ({ type, onSelectUser }) => {
  const { data: items, loading, error } = useFetch<ListItem[]>(async () => {
    if (type === 'doctor') {
      const doctors = await getDoctors();
      return doctors.map((d) => ({ id: d.id, label: d.username, sublabel: d.email }));
    }
    const patients = await getPatients();
    return patients.map((p) => ({ id: p.id, label: p.name, sublabel: `${p.age} years old` }));
  }, [type]);

  if (loading) return <p>Loading {type}s...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!items || items.length === 0) return <p>No {type}s found.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => onSelectUser?.(item.id)}
          style={{
            padding: '12px',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: onSelectUser ? 'pointer' : 'default',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div>
            <span><strong>#{item.id}</strong> {item.label}</span>
            {item.sublabel && (
              <span style={{ marginLeft: '12px', color: '#666' }}>{item.sublabel}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
