import React from 'react';
import BillingClientComponent from './BillingClientComponent';

// Assuming server-side fetching or authentication checks might happen here if needed.
// For now, it just renders the client component.

export default function BillingPage() {
  return (
    <div>
      <h1>Billing Management</h1>
      <BillingClientComponent />
    </div>
  );
}
