import React, { useEffect, useState } from 'react';

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
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const endpoint = type === 'doctor' ? '/api/users/doctors' : '/api/patients';
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Failed to load ${type}s`);
        const data = await res.json();

        const normalized: ListItem[] =
          type === 'doctor'
            ? data.map((d: any) => ({ id: d.id, label: d.username, sublabel: d.email }))
            : data.map((p: any) => ({ id: p.id, label: p.name, sublabel: `${p.age} years old` }));

        setItems(normalized);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [type]);

  if (loading) return <p>Loading {type}s...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (items.length === 0) return <p>No {type}s found.</p>;

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
