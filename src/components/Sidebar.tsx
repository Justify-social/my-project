import Link from "next/link";
import React from "react";

// Define the User interface.
interface User {
  role: string;
  name?: string;
}

interface SidebarProps {
  user?: User; // The user may be undefined if not logged in.
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  return (
    <nav aria-label="Sidebar Navigation">
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/campaigns">Campaigns</Link>
        </li>
        {/* Render the Admin Tools link only if the user’s role is "admin" */}
        {user && user.role === "admin" && (
          <li>
            <Link href="/admin-tools">Admin Tools</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
