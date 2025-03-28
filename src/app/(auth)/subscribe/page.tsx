
// Static content - long-term cache
export const revalidate = 86400; // Revalidate once per day
export const fetchCache = 'force-cache'; // Use cache but revalidate according to the revalidate option
// src/app/subscribe/page.tsx
"use client";

import React from "react";

export default function Subscribe() {
  const handleCheckout = async () => {
    // In a real integration, you would call your API endpoint to create a checkout session.
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST"
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Subscriptions Coming Soon (Beta).");
    }
  };

  return (
    <div style={{ padding: "2rem" }} className="font-work-sans">
      <h1 className="font-sora">Subscribe</h1>
      <button onClick={handleCheckout} className="font-work-sans">Test Checkout</button>
    </div>);

}