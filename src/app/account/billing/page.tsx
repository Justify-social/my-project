import React from 'react';
import BillingClientComponent from './BillingClientComponent';

// Assuming server-side fetching or authentication checks might happen here if needed.
// For now, it just renders the client component.

export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6">Billing Management</h1>
      <BillingClientComponent />
    </div>
  );
}
