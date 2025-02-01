// src/components/Sidebar.tsx
import React from 'react';
import Link from 'next/link';

interface User {
  role: string;
}

interface SidebarProps {
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  return (
    <nav aria-label="Main navigation">
      <ul>
        <li>
          <Link href="/dashboard">Dashboard Home</Link>
        </li>
        <li>
          <Link href="/campaigns">Campaigns</Link>
        </li>
        {user && user.role === 'admin' && (
          <li>
            <Link href="/admin-tools">Admin Tools</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
