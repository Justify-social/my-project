// pages/dashboard.tsx
import React from 'react';
import Sidebar from '../src/components/Sidebar';

const DashboardPage: React.FC = () => {
  const user = { role: 'admin', name: 'Ed Adams' };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Dashboard Overview</h1> {/* Changed the heading */}
        <p>Welcome, {user.name}!</p>
      </main>
    </div>
  );
};

export default DashboardPage;
