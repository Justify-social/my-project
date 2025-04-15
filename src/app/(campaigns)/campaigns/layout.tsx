// This can likely be a Server Component again

import React from 'react';

// Optional: Add metadata if needed for this section
// export const metadata = { ... };

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  // Simple wrapper, no client-side hooks needed here
  return <div className="campaigns-layout font-body">{children}</div>;
}
