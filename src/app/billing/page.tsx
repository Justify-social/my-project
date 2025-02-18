"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentMethod {
  id: number;
  cardType: string;
  last4: string;
  expiry: string;
}

interface Transaction {
  id: number;
  billNumber: string;
  date: string;
  description: string;
  amount: string;
  status: "Pending" | "Completed";
}

const SubscriptionBillingPage: React.FC = () => {
  const router = useRouter();

  // Active Tab: "overview" or "credits"
  const [activeTab, setActiveTab] = useState<"overview" | "credits">("overview");

  // Modal states
  const [updatePaymentModalOpen, setUpdatePaymentModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [buyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  // Subscription overview details
  const subscriptionPlan = "Premium";
  const subscriptionFeatures = [
    "24/7 Support",
    "All Features",
    "Personalised Recommendations",
    "Dedicated Account Manager",
  ];
  const renewalDate = "January 15, 2025";
  const nextPaymentAmount = "$29.99";
  const creditsBalance = 135;

  // Payment methods (dummy data)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 1, cardType: "VISA", last4: "1234", expiry: "23 Dec 2025" },
    { id: 2, cardType: "VISA", last4: "3413", expiry: "25 Feb 2025" },
  ]);

  // Billing history transactions (dummy data)
  const [transactions] = useState<Transaction[]>([
    { id: 1, billNumber: "#JS1234567", date: "01/05/24", description: "Monthly Subscription", amount: "$29.99", status: "Pending" },
    { id: 2, billNumber: "#JS1234584", date: "15/04/24", description: "Monthly Subscription", amount: "$29.99", status: "Completed" },
    { id: 3, billNumber: "#JS1234624", date: "20/03/24", description: "Credit Purchase", amount: "$135", status: "Completed" },
  ]);

  // New payment method form fields
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newCVV, setNewCVV] = useState("");
  const [paymentMethodError, setPaymentMethodError] = useState("");

  // Plan upgrade selection
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<"Normal" | "Advanced" | null>(null);

  // Credits purchase modal selection
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<number | null>(null);
  const creditPackages = [
    { credits: 50, price: "$10" },
    { credits: 100, price: "$18" },
    { credits: 250, price: "$40" },
    { credits: 500, price: "$75" },
  ];

  // Handlers for primary action buttons
  const handleViewBillingHistory = () => {
    const element = document.getElementById("billingHistory");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleUpdatePaymentMethod = () => {
    setUpdatePaymentModalOpen(true);
  };

  const handleChangePlan = () => {
    const element = document.getElementById("planUpgrade");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddPaymentMethod = () => {
    if (!/^\d{16}$/.test(newCardNumber)) {
      setPaymentMethodError("Error: Please enter a valid card number.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(newExpiry)) {
      setPaymentMethodError("Error: Please enter a valid expiry date (MM/YY).");
      return;
    }
    if (!/^\d{3}$/.test(newCVV)) {
      setPaymentMethodError("Error: CVV must be 3 digits.");
      return;
    }
    const newPayment: PaymentMethod = {
      id: Date.now(),
      cardType: "VISA",
      last4: newCardNumber.slice(-4),
      expiry: newExpiry,
    };
    setPaymentMethods([...paymentMethods, newPayment]);
    setUpdatePaymentModalOpen(false);
    setAddPaymentModalOpen(false);
    setNewCardNumber("");
    setNewExpiry("");
    setNewCVV("");
    setPaymentMethodError("");
    setToastMessage("Payment method added successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleConfirmUpgrade = () => {
    setUpgradeModalOpen(false);
    setToastMessage("Plan upgraded successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleConfirmBuyCredits = () => {
    if (selectedCreditPackage === null) {
      alert("Please select a credit package.");
      return;
    }
    setBuyCreditsModalOpen(false);
    setToastMessage("Credits added successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page Title & Primary Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#333333]">Subscription & Billing</h1>
        <div className="space-x-2">
          <button
            onClick={handleViewBillingHistory}
            className="w-36 h-10 bg-blue-500 text-white rounded"
            aria-label="View Billing History"
          >
            Billing History
          </button>
          <button
            onClick={handleUpdatePaymentMethod}
            className="w-36 h-10 bg-blue-500 text-white rounded"
            aria-label="Update Payment Method"
          >
            Update
          </button>
          <button
            onClick={handleChangePlan}
            className="w-36 h-10 bg-blue-500 text-white rounded"
            aria-label="Change Plan"
          >
            Change
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-300">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-4 ${
              activeTab === "overview" ? "font-bold border-b-2 border-blue-500" : "text-blue-500 hover:underline"
            }`}
            aria-current={activeTab === "overview" ? "page" : undefined}
          >
            Subscription Overview
          </button>
          <button
            onClick={() => setActiveTab("credits")}
            className={`py-2 px-4 ${
              activeTab === "credits" ? "font-bold border-b-2 border-blue-500" : "text-blue-500 hover:underline"
            }`}
          >
            Credits & Purchase
          </button>
        </nav>
      </div>

      {/* Main Content based on active tab */}
      {activeTab === "overview" ? (
        <>
          {/* Subscription Overview Section */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Plan</h2>
            <div className="p-4 border rounded mb-2 font-bold break-words whitespace-normal">
              {subscriptionPlan}
            </div>
            <ul className="mb-2 space-y-1 break-words">
              {subscriptionFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="mr-2">✅</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <p className="break-words">
              <strong>Renewal Date:</strong> {renewalDate}
            </p>
            <p className="break-words">
              <strong>Next Payment Amount:</strong> {nextPaymentAmount}
            </p>
          </section>

          {/* Credits Balance Section */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Credits Balance</h2>
            <div className="p-4 border rounded font-bold break-words whitespace-normal">
              {creditsBalance} remaining
            </div>
            {creditsBalance < 10 && (
              <p className="text-red-500 mt-2 break-words">
                Warning: Low credit balance! Purchase more to avoid service interruptions.
              </p>
            )}
          </section>

          {/* Payment Methods Section */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
            <ul className="mb-4 space-y-2">
              {paymentMethods.map(method => (
                <li key={method.id} className="flex flex-wrap items-center">
                  <span className="break-words">
                    {method.cardType} {method.last4} - Expires on {method.expiry}
                  </span>
                  <button
                    onClick={() => setUpdatePaymentModalOpen(true)}
                    className="ml-4 w-24 h-8 bg-blue-500 text-white rounded"
                    aria-label="Edit payment method"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (paymentMethods.length <= 1) {
                        alert("Warning: No active payment methods. Add a card to continue.");
                        return;
                      }
                      setPaymentMethods(paymentMethods.filter(m => m.id !== method.id));
                      setToastMessage("Payment method removed.");
                      setTimeout(() => setToastMessage(""), 3000);
                    }}
                    className="ml-2 w-24 h-8 bg-red-500 text-white rounded"
                    aria-label="Remove payment method"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setAddPaymentModalOpen(true)}
              className="w-36 h-10 bg-blue-500 text-white rounded"
              aria-label="Add payment method"
            >
              Add
            </button>
          </section>

          {/* Plan Upgrade Section */}
          <section id="planUpgrade" className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Plan Upgrade Options</h2>
            <div className="mb-4 p-4 border rounded break-words whitespace-normal">
              <h3 className="font-bold">Normal Plan</h3>
              <p>$9.99/month or $99/year</p>
              <ul className="mb-2 space-y-1 break-words">
                <li>Basic Support</li>
                <li>Limited Access</li>
                <li>Access to standard content</li>
                <li>Single device login</li>
              </ul>
              <button
                onClick={() => { setSelectedUpgradePlan("Normal"); setUpgradeModalOpen(true); }}
                className="w-36 h-10 bg-blue-500 text-white rounded"
                aria-label="Upgrade to Normal Plan"
              >
                Upgrade
              </button>
            </div>
            <div className="mb-4 p-4 border rounded break-words whitespace-normal">
              <h3 className="font-bold">Advanced Plan</h3>
              <p>$19.99/month or $199/year</p>
              <ul className="mb-2 space-y-1 break-words">
                <li>Priority Support</li>
                <li>Unlimited Access</li>
                <li>Early access to new features</li>
                <li>Multi-device login</li>
              </ul>
              <button
                onClick={() => { setSelectedUpgradePlan("Advanced"); setUpgradeModalOpen(true); }}
                className="w-36 h-10 bg-blue-500 text-white rounded"
                aria-label="Upgrade to Advanced Plan"
              >
                Upgrade
              </button>
            </div>
          </section>

          {/* Purchase Extra Credits Section */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Need more credits? Top up instantly and keep going!
            </h2>
            <button
              onClick={() => setBuyCreditsModalOpen(true)}
              className="w-36 h-10 bg-blue-500 text-white rounded"
              aria-label="Buy More Credits"
            >
              Buy
            </button>
          </section>

          {/* Billing History Section */}
          <section id="billingHistory" className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Billing History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-bold border break-words">Bill Number</th>
                    <th className="p-2 text-left font-bold border break-words">Date</th>
                    <th className="p-2 text-left font-bold border break-words">Description</th>
                    <th className="p-2 text-left font-bold border break-words">Amount</th>
                    <th className="p-2 text-left font-bold border break-words">Status</th>
                    <th className="p-2 text-left font-bold border break-words">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-100">
                      <td className="p-2 border break-words">{tx.billNumber}</td>
                      <td className="p-2 border break-words">{tx.date}</td>
                      <td className="p-2 border break-words">{tx.description}</td>
                      <td className="p-2 border break-words">{tx.amount}</td>
                      <td className="p-2 border break-words">
                        {tx.status === "Pending" ? (
                          <span className="bg-yellow-300 px-2 py-1 rounded break-words">⚠ Pending</span>
                        ) : (
                          <span className="bg-green-500 text-white px-2 py-1 rounded break-words">✓ Completed</span>
                        )}
                      </td>
                      <td className="p-2 border break-words">
                        <button
                          onClick={() => alert("Downloading invoice...")}
                          className="mr-2 w-28 h-8 bg-blue-500 text-white rounded"
                          aria-label="Download Invoice"
                        >
                          Download
                        </button>
                        {tx.status === "Pending" && (
                          <button
                            onClick={() => alert("Retrying payment...")}
                            className="w-28 h-8 bg-yellow-300 text-black rounded"
                            aria-label="Retry Payment"
                          >
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        // Credits & Purchase Tab Content
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Credits & Purchase</h2>
          <p className="mb-4 break-words">
            This section will allow you to purchase extra credits and view your credit history.
          </p>
          <button
            onClick={() => setBuyCreditsModalOpen(true)}
            className="w-36 h-10 bg-blue-500 text-white rounded"
            aria-label="Buy More Credits"
          >
            Buy
          </button>
        </section>
      )}

      {/* Modals */}
      {/* Update Payment Method Modal */}
      {updatePaymentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Update Payment Method</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Card Number</label>
                <input
                  type="text"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  placeholder="16-digit card number"
                  className="border p-2 w-full break-words"
                  aria-label="Card Number"
                />
              </div>
              <div>
                <label className="block mb-1">Expiry Date (MM/YY)</label>
                <input
                  type="text"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="border p-2 w-full break-words"
                  aria-label="Expiry Date"
                />
              </div>
              <div>
                <label className="block mb-1">CVV</label>
                <input
                  type="text"
                  value={newCVV}
                  onChange={(e) => setNewCVV(e.target.value)}
                  placeholder="3-digit CVV"
                  className="border p-2 w-full break-words"
                  aria-label="CVV"
                />
              </div>
              {paymentMethodError && <p className="text-red-500 break-words">{paymentMethodError}</p>}
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => { setUpdatePaymentModalOpen(false); setPaymentMethodError(""); }}
                className="w-28 h-10 bg-gray-500 text-white rounded"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                className="w-28 h-10 bg-blue-500 text-white rounded"
                aria-label="Save Payment Method"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {addPaymentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Add Payment Method</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Card Number</label>
                <input
                  type="text"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  placeholder="16-digit card number"
                  className="border p-2 w-full break-words"
                  aria-label="Card Number"
                />
              </div>
              <div>
                <label className="block mb-1">Expiry Date (MM/YY)</label>
                <input
                  type="text"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="border p-2 w-full break-words"
                  aria-label="Expiry Date"
                />
              </div>
              <div>
                <label className="block mb-1">CVV</label>
                <input
                  type="text"
                  value={newCVV}
                  onChange={(e) => setNewCVV(e.target.value)}
                  placeholder="3-digit CVV"
                  className="border p-2 w-full break-words"
                  aria-label="CVV"
                />
              </div>
              {paymentMethodError && <p className="text-red-500 break-words">{paymentMethodError}</p>}
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => { setAddPaymentModalOpen(false); setPaymentMethodError(""); }}
                className="w-28 h-10 bg-gray-500 text-white rounded"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                className="w-28 h-10 bg-blue-500 text-white rounded"
                aria-label="Add Payment Method"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {upgradeModalOpen && selectedUpgradePlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Upgrade</h2>
            <p className="mb-4 break-words">
              Confirm Upgrade? Your new billing cycle will start immediately.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-28 h-10 bg-gray-500 text-white rounded"
                aria-label="Cancel Upgrade"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="w-28 h-10 bg-blue-500 text-white rounded"
                aria-label="Confirm Upgrade"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Credits Modal */}
      {buyCreditsModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Buy More Credits</h2>
            <p className="mb-4 break-words">Select a credit package:</p>
            <div className="space-y-2">
              {creditPackages.map(pkg => (
                <div key={pkg.credits} className="flex items-center">
                  <input
                    type="radio"
                    name="creditPackage"
                    value={pkg.credits}
                    checked={selectedCreditPackage === pkg.credits}
                    onChange={() => setSelectedCreditPackage(pkg.credits)}
                    className="mr-2"
                    aria-label={`${pkg.credits} Credits`}
                  />
                  <span className="break-words">
                    {pkg.credits} Credits - {pkg.price}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setBuyCreditsModalOpen(false)}
                className="w-28 h-10 bg-gray-500 text-white rounded"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBuyCredits}
                className="w-28 h-10 bg-blue-500 text-white rounded"
                aria-label="Confirm Purchase"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded break-words">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SubscriptionBillingPage;
