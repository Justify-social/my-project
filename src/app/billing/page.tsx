"use client";

import React, { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  SparklesIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
} from '@heroicons/react/24/outline';

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

// Enhanced UI Components
const Card = memo(({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6"
  >
    {children}
  </motion.div>
));

const SectionHeader: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}> = memo(({ icon: Icon, title, description }) => (
  <div className="flex items-center mb-6">
    <div className="bg-blue-50 p-3 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div className="ml-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  </div>
));

const PlanCard: React.FC<{
  title: string;
  price: string;
  features: string[];
  isRecommended?: boolean;
  onUpgrade: () => void;
}> = memo(({ title, price, features, isRecommended, onUpgrade }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`p-6 rounded-xl border-2 ${
      isRecommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`}
  >
    {isRecommended && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
        Recommended
      </span>
    )}
    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    <p className="mt-2 text-3xl font-bold text-gray-900">{price}</p>
    <p className="mt-1 text-sm text-gray-500">per month</p>
    <ul className="mt-6 space-y-4">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-gray-600">{feature}</span>
        </li>
      ))}
    </ul>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onUpgrade}
      className={`mt-8 w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
        isRecommended
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
      }`}
    >
      <SparklesIcon className="w-5 h-5 mr-2" />
      Upgrade Plan
    </motion.button>
  </motion.div>
));

const CreditPackageCard: React.FC<{
  credits: number;
  price: string;
  isSelected: boolean;
  onSelect: () => void;
}> = memo(({ credits, price, isSelected, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    onClick={onSelect}
    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold text-gray-900">{credits} Credits</h4>
        <p className="text-sm text-gray-500">Best value</p>
      </div>
      <p className="text-xl font-bold text-gray-900">{price}</p>
    </div>
  </motion.div>
));

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>
        {children}
      </motion.div>
    </div>
  );
};

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900"
            >
              Subscription & Billing
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-gray-500"
            >
              Manage your subscription, billing, and credits
            </motion.p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewBillingHistory}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
                transition-colors duration-200 font-medium flex items-center"
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Billing History
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdatePaymentMethod}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors duration-200 font-medium flex items-center"
            >
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Update Payment
            </motion.button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-1" aria-label="Billing navigation">
            {['overview', 'credits'].map((tab) => {
              const isActive = activeTab === tab;
              const Icon = tab === 'overview' ? CreditCardIcon : CurrencyDollarIcon;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "overview" | "credits")}
                  className={`
                    relative py-4 px-6 flex items-center transition-all duration-200
                    ${isActive 
                      ? 'text-blue-600 bg-blue-50/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                    rounded-t-lg
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="font-medium capitalize">
                    {tab === 'overview' ? 'Subscription Overview' : 'Credits & Purchase'}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {activeTab === "overview" ? (
            <>
              {/* Current Plan Card */}
              <Card>
                <SectionHeader
                  icon={SparklesIcon}
                  title="Current Plan"
                  description="Your current subscription plan and features"
                />
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{subscriptionPlan}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Next payment: {nextPaymentAmount} on {renewalDate}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleChangePlan}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                        transition-colors duration-200 font-medium flex items-center"
                    >
                      <ArrowPathIcon className="w-5 h-5 mr-2" />
                      Change Plan
                    </motion.button>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {subscriptionFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Payment Methods Card */}
              <Card>
                <SectionHeader
                  icon={CreditCardIcon}
                  title="Payment Methods"
                  description="Manage your payment methods and billing information"
                />
                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <CreditCardIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {method.cardType} •••• {method.last4}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires {method.expiry}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUpdatePaymentModalOpen(true)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <ArrowPathIcon className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (paymentMethods.length <= 1) {
                              alert("Warning: Cannot remove last payment method.");
                              return;
                            }
                            setPaymentMethods(paymentMethods.filter(m => m.id !== method.id));
                            setToastMessage("Payment method removed successfully!");
                            setTimeout(() => setToastMessage(""), 3000);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAddPaymentModalOpen(true)}
                    className="mt-4 px-4 py-2 border-2 border-dashed border-gray-300 
                      text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-500 
                      transition-colors duration-200 w-full flex items-center justify-center"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Payment Method
                  </motion.button>
                </div>
              </Card>

              {/* Billing History Card */}
              <Card>
                <SectionHeader
                  icon={DocumentTextIcon}
                  title="Billing History"
                  description="View and download your past invoices"
                />
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map(tx => (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tx.billNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tx.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{tx.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tx.amount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${tx.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {tx.status === 'Completed' ? (
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                              ) : (
                                <ClockIcon className="w-4 h-4 mr-1" />
                              )}
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => alert("Downloading invoice...")}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Download Invoice"
                              >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                              </motion.button>
                              {tx.status === 'Pending' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => alert("Retrying payment...")}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                  title="Retry Payment"
                                >
                                  <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Credits Balance Card */}
              <Card>
                <SectionHeader
                  icon={CurrencyDollarIcon}
                  title="Credits Balance"
                  description="View and manage your credits"
                />
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Available Credits</p>
                      <h3 className="text-4xl font-bold mt-1">{creditsBalance}</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setBuyCreditsModalOpen(true)}
                      className="px-4 py-2 bg-white text-blue-600 rounded-lg 
                        hover:bg-blue-50 transition-colors duration-200 font-medium 
                        flex items-center"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Buy Credits
                    </motion.button>
                  </div>
                  {creditsBalance < 10 && (
                    <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-3 flex items-center">
                      <XCircleIcon className="w-5 h-5 mr-2" />
                      <p className="text-sm">
                        Low balance warning! Purchase more credits to avoid service interruption.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Credit Packages Card */}
              <Card>
                <SectionHeader
                  icon={SparklesIcon}
                  title="Credit Packages"
                  description="Choose a credit package that suits your needs"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creditPackages.map(pkg => (
                    <CreditPackageCard
                      key={pkg.credits}
                      credits={pkg.credits}
                      price={pkg.price}
                      isSelected={selectedCreditPackage === pkg.credits}
                      onSelect={() => setSelectedCreditPackage(pkg.credits)}
                    />
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBuyCreditsModalOpen(true)}
                  className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-lg 
                    hover:bg-blue-700 transition-colors duration-200 font-medium 
                    flex items-center justify-center"
                >
                  <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                  Purchase Credits
                </motion.button>
              </Card>
            </>
          )}
        </div>

        {/* Modals */}
        <Modal
          isOpen={updatePaymentModalOpen}
          onClose={() => {
            setUpdatePaymentModalOpen(false);
            setPaymentMethodError("");
          }}
        >
          <h3 className="text-lg font-semibold mb-4">Update Payment Method</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={newCardNumber}
                onChange={(e) => setNewCardNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                    focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={newCVV}
                  onChange={(e) => setNewCVV(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                    focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                />
              </div>
            </div>
            {paymentMethodError && (
              <p className="text-sm text-red-600 flex items-center">
                <XCircleIcon className="w-5 h-5 mr-1" />
                {paymentMethodError}
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setUpdatePaymentModalOpen(false);
                setPaymentMethodError("");
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
                transition-colors duration-200"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddPaymentMethod}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors duration-200"
            >
              Update Payment Method
            </motion.button>
          </div>
        </Modal>

        <Modal
          isOpen={buyCreditsModalOpen}
          onClose={() => setBuyCreditsModalOpen(false)}
        >
          <h3 className="text-lg font-semibold mb-4">Purchase Credits</h3>
          <div className="space-y-4">
            {creditPackages.map(pkg => (
              <div
                key={pkg.credits}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedCreditPackage === pkg.credits
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
                onClick={() => setSelectedCreditPackage(pkg.credits)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{pkg.credits} Credits</h4>
                    <p className="text-sm text-gray-500">Best value</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{pkg.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setBuyCreditsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
                transition-colors duration-200"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmBuyCredits}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors duration-200"
            >
              Confirm Purchase
            </motion.button>
          </div>
        </Modal>

        {/* Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg 
                shadow-lg flex items-center"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SubscriptionBillingPage;
