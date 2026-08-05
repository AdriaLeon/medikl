import React from 'react';

export const UserProfile: React.FC = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>User Profile</h2>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <p><strong>Username:</strong> doctor_john</p>
        <p><strong>Role:</strong> Doctor</p>
        <p><strong>Email:</strong> john.doe@medikl.com</p>
      </div>
    </div>
  );
};