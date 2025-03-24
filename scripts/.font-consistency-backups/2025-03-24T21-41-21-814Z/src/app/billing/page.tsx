"use client";

import React, { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { iconComponentFactory } from '@/components/ui/icons';
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
const Card = memo(({
  children
}: {
  children: React.ReactNode;
}) => <motion.div initial={{
  opacity: 0,
  y: 20
}} animate={{
  opacity: 1,
  y: 0
}} transition={{
  duration: 0.3
}} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-[var(--divider-color)]">

    {children}
  </motion.div>);
const SectionHeader: React.FC<{
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description?: string;
}> = memo(({
  icon: Icon,
  title,
  description
}) => <div className="flex items-center mb-6">
    <div className="bg-[var(--background-color)] p-3 rounded-lg">
      <Icon className="w-6 h-6 text-[var(--accent-color)]" solid={false} />
    </div>
    <div className="ml-4">
      <h2 className="text-xl font-semibold text-[var(--primary-color)]">{title}</h2>
      {description && <p className="mt-1 text-sm text-[var(--secondary-color)]">{description}</p>}
    </div>
  </div>);
const PlanCard: React.FC<{
  title: string;
  price: string;
  features: string[];
  isRecommended?: boolean;
  onUpgrade: () => void;
}> = memo(({
  title,
  price,
  features,
  isRecommended,
  onUpgrade
}) => <motion.div whileHover={{
  scale: 1.02
}} className={`p-6 rounded-xl border-2 ${isRecommended ? 'border-[var(--accent-color)] bg-[var(--background-color)]' : 'border-[var(--divider-color)]'}`}>

    {isRecommended && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--background-color)] text-[var(--accent-color)] mb-4 border border-[var(--accent-color)]">
        Recommended
      </span>}
    <h3 className="text-xl font-bold text-[var(--primary-color)]">{title}</h3>
    <p className="mt-2 text-3xl font-bold text-[var(--primary-color)]">{price}</p>
    <p className="mt-1 text-sm text-[var(--secondary-color)]">per month</p>
    <ul className="mt-6 space-y-4">
      {features.map((feature, idx) => <li key={idx} className="flex items-start">
          <Icon name="faCheckCircle" className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" solid={false} />
          <span className="text-[var(--secondary-color)]">{feature}</span>
        </li>)}
    </ul>
    <motion.button whileHover={{
    scale: 1.05
  }} whileTap={{
    scale: 0.95
  }} onClick={onUpgrade} className={`mt-8 w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${isRecommended ? 'bg-[var(--accent-color)] text-white hover:opacity-90' : 'bg-white text-[var(--accent-color)] border-2 border-[var(--accent-color)] hover:bg-[var(--background-color)]'}`}>

      <Icon name="faLightning" solid className="w-5 h-5 mr-2" />
      Upgrade Plan
    </motion.button>
  </motion.div>);
const CreditPackageCard: React.FC<{
  credits: number;
  price: string;
  isSelected: boolean;
  onSelect: () => void;
}> = memo(({
  credits,
  price,
  isSelected,
  onSelect
}) => <motion.div whileHover={{
  scale: 1.02
}} onClick={onSelect} className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${isSelected ? 'border-[var(--accent-color)] bg-[var(--background-color)]' : 'border-[var(--divider-color)] hover:border-[var(--accent-color)]'}`}>

    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold text-[var(--primary-color)]">{credits} Credits</h4>
        <p className="text-sm text-[var(--secondary-color)]">Best value</p>
      </div>
      <p className="text-xl font-bold text-[var(--primary-color)]">{price}</p>
    </div>
  </motion.div>);
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({
  isOpen,
  onClose,
  children
}) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} exit={{
      opacity: 0,
      scale: 0.95
    }} className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative">

        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--secondary-color)] hover:text-[var(--primary-color)]">

          <Icon name="faXCircle" className="w-5 h-5" solid={false} />
        </button>
        {children}
      </motion.div>
    </div>;
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
  const subscriptionFeatures = ["24/7 Support", "All Features", "Personalised Recommendations", "Dedicated Account Manager"];
  const renewalDate = "January 15, 2025";
  const nextPaymentAmount = "$29.99";
  const creditsBalance = 135;

  // Payment methods (dummy data)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([{
    id: 1,
    cardType: "VISA",
    last4: "1234",
    expiry: "23 Dec 2025"
  }, {
    id: 2,
    cardType: "VISA",
    last4: "3413",
    expiry: "25 Feb 2025"
  }]);

  // Billing history transactions (dummy data)
  const [transactions] = useState<Transaction[]>([{
    id: 1,
    billNumber: "#JS1234567",
    date: "01/05/24",
    description: "Monthly Subscription",
    amount: "$29.99",
    status: "Pending"
  }, {
    id: 2,
    billNumber: "#JS1234584",
    date: "15/04/24",
    description: "Monthly Subscription",
    amount: "$29.99",
    status: "Completed"
  }, {
    id: 3,
    billNumber: "#JS1234624",
    date: "20/03/24",
    description: "Credit Purchase",
    amount: "$135",
    status: "Completed"
  }]);

  // New payment method form fields
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newCVV, setNewCVV] = useState("");
  const [paymentMethodError, setPaymentMethodError] = useState("");

  // Plan upgrade selection
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<"Normal" | "Advanced" | null>(null);

  // Credits purchase modal selection
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<number | null>(null);
  const creditPackages = [{
    credits: 50,
    price: "$10"
  }, {
    credits: 100,
    price: "$18"
  }, {
    credits: 250,
    price: "$40"
  }, {
    credits: 500,
    price: "$75"
  }];

  // Handlers for primary action buttons
  const handleViewBillingHistory = () => {
    const element = document.getElementById("billingHistory");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  const handleUpdatePaymentMethod = () => {
    setUpdatePaymentModalOpen(true);
  };
  const handleChangePlan = () => {
    const element = document.getElementById("planUpgrade");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
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
      expiry: newExpiry
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
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="min-h-screen bg-[var(--background-color)]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <motion.h1 initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="text-3xl font-bold text-[var(--primary-color)]">

              Subscription & Billing
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.1
          }} className="mt-2 text-[var(--secondary-color)]">

              Manage your subscription, billing, and credits
            </motion.p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/pricing">
              <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} className="px-4 py-2 bg-white text-[var(--accent-color)] rounded-lg border border-[var(--accent-color)] 
                  transition-colors duration-200 font-medium flex items-center">



                <Icon name="faArrowRight" className="w-5 h-5 mr-2" solid={false} />
                View Pricing
              </motion.button>
            </Link>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={handleUpdatePaymentMethod} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 
                transition-colors duration-200 font-medium flex items-center">



              <Icon name="faCreditCard" className="w-5 h-5 mr-2" solid={false} />
              Update Payment
            </motion.button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-[var(--divider-color)]">
          <nav className="flex space-x-1" aria-label="Billing navigation">
            {['overview', 'credits'].map(tab => {
            const isActive = activeTab === tab;
            const IconComponent = tab === 'overview' ? (props: any) => <Icon name="faCreditCard" {...props} solid={false} className="text-[var(--secondary-color)]" /> : (props: any) => <Icon name="faMoney" {...props} solid={false} className="text-[var(--secondary-color)]" />;
            return <button key={tab} onClick={() => setActiveTab(tab as "overview" | "credits")} className={`
                    relative flex-1 min-w-0 py-3 px-4 text-sm font-medium
                    ${isActive ? 'bg-white text-[var(--accent-color)] shadow-sm z-10' : 'text-[var(--secondary-color)] hover:text-[var(--primary-color)] bg-[var(--background-color)]'}
                    border border-[var(--divider-color)]
                    ${tab === 'overview' ? 'rounded-l-md' : 'rounded-r-md'}
                  `} aria-current={isActive ? 'page' : undefined}>

                  <IconComponent className="w-5 h-5 mr-2" />
                  <span className="font-medium capitalize">
                    {tab === 'overview' ? 'Subscription Overview' : 'Credits & Purchase'}
                  </span>
                </button>;
          })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {activeTab === "overview" ? <>
              {/* Current Plan Card */}
              <Card>
                <SectionHeader icon={props => <Icon name="faLightning" {...props} solid={false} className="text-[var(--secondary-color)]" />} title="Current Plan" description="Your current subscription plan and features" />

                <div className="bg-[var(--background-color)] rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--primary-color)]">{subscriptionPlan}</h3>
                      <p className="mt-1 text-sm text-[var(--secondary-color)]">
                        Next payment: {nextPaymentAmount} on {renewalDate}
                      </p>
                    </div>
                    <motion.button whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} onClick={handleChangePlan} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 
                        transition-colors duration-200 font-medium flex items-center">



                      <Icon name="faArrowRight" className="w-5 h-5 mr-2" solid={false} />
                      Change Plan
                    </motion.button>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {subscriptionFeatures.map((feature, idx) => <div key={idx} className="flex items-center">
                        <Icon name="faCheckCircle" className="w-5 h-5 text-green-500 mr-2" solid={false} />
                        <span className="text-[var(--secondary-color)]">{feature}</span>
                      </div>)}
                  </div>
                </div>
              </Card>

              {/* Payment Methods Card */}
              <Card>
                <SectionHeader icon={props => <Icon name="faCreditCard" {...props} solid={false} className="text-[var(--secondary-color)]" />} title="Payment Methods" description="Manage your payment methods and billing information" />

                <div className="space-y-4">
                  {paymentMethods.map(method => <div key={method.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--divider-color)]">

                      <div className="flex items-center">
                        <div className="bg-[var(--background-color)] p-2 rounded-lg">
                          <Icon name="faCreditCard" className="w-6 h-6 text-[var(--accent-color)]" solid={false} />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-[var(--primary-color)]">
                            {method.cardType} •••• {method.last4}
                          </p>
                          <p className="text-sm text-[var(--secondary-color)]">
                            Expires {method.expiry}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button whileHover={{
                    scale: 1.05
                  }} whileTap={{
                    scale: 0.95
                  }} onClick={() => setUpdatePaymentModalOpen(true)} className="p-2 text-[var(--accent-color)] hover:bg-[var(--background-color)] rounded-lg">

                          <Icon name="faArrowRight" className="w-5 h-5" solid={false} />
                        </motion.button>
                        <motion.button whileHover={{
                    scale: 1.05
                  }} whileTap={{
                    scale: 0.95
                  }} onClick={() => {
                    if (paymentMethods.length <= 1) {
                      alert("Warning: Cannot remove last payment method.");
                      return;
                    }
                    setPaymentMethods(paymentMethods.filter(m => m.id !== method.id));
                    setToastMessage("Payment method removed successfully!");
                    setTimeout(() => setToastMessage(""), 3000);
                  }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">

                          <Icon name="faXCircle" className="w-5 h-5" solid={false} />
                        </motion.button>
                      </div>
                    </div>)}
                  <motion.button whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={() => setAddPaymentModalOpen(true)} className="mt-4 px-4 py-2 border-2 border-dashed border-[var(--divider-color)] 
                      text-[var(--secondary-color)] rounded-lg hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] 
                      transition-colors duration-200 w-full flex items-center justify-center">





                    <Icon name="faPlus" className="w-5 h-5 mr-2" solid={false} />
                    Add Payment Method
                  </motion.button>
                </div>
              </Card>

              {/* Billing History Card */}
              <Card>
                <SectionHeader icon={props => <Icon name="faDocumentText" {...props} solid={false} className="text-[var(--secondary-color)]" />} title="Billing History" description="View and download your past invoices" />

                <div className="overflow-hidden rounded-lg border border-[var(--divider-color)]">
                  <table className="min-w-full divide-y divide-[var(--divider-color)]">
                    <thead className="bg-[var(--background-color)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[var(--divider-color)]">
                      {transactions.map(tx => <motion.tr key={tx.id} initial={{
                    opacity: 0
                  }} animate={{
                    opacity: 1
                  }} className="hover:bg-[var(--background-color)]">

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[var(--primary-color)]">
                              {tx.billNumber}
                            </div>
                            <div className="text-sm text-[var(--secondary-color)]">
                              {tx.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[var(--primary-color)]">{tx.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[var(--primary-color)]">
                              {tx.amount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>

                              {tx.status === 'Completed' ? <Icon name="faCheckCircle" className="w-5 h-5 mr-2" solid={false} /> : <Icon name="faClock" className="w-5 h-5 mr-2" solid={false} />}
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--secondary-color)]">
                            <div className="flex space-x-2">
                              <motion.button whileHover={{
                          scale: 1.05
                        }} whileTap={{
                          scale: 0.95
                        }} onClick={() => alert("Downloading invoice...")} className="p-2 text-[var(--accent-color)] hover:bg-[var(--background-color)] rounded-lg" title="Download Invoice">

                                <Icon name="faDownload" className="w-5 h-5" solid={false} />
                              </motion.button>
                              {tx.status === 'Pending' && <motion.button whileHover={{
                          scale: 1.05
                        }} whileTap={{
                          scale: 0.95
                        }} onClick={() => alert("Retrying payment...")} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Retry Payment">

                                  <Icon name="faArrowRight" className="w-5 h-5" solid={false} />
                                </motion.button>}
                            </div>
                          </td>
                        </motion.tr>)}
                    </tbody>
                  </table>
                </div>
              </Card>
            </> : <>
              {/* Credits Balance Card */}
              <Card>
                <SectionHeader icon={props => <Icon name="faMoney" {...props} solid={false} className="text-[var(--secondary-color)]" />} title="Credits Balance" description="View and manage your credits" />

                <div className="bg-gradient-to-r from-[var(--accent-color)] to-[#0099cc] rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Available Credits</p>
                      <h3 className="text-4xl font-bold mt-1">{creditsBalance}</h3>
                    </div>
                    <motion.button whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} onClick={() => setBuyCreditsModalOpen(true)} className="px-4 py-2 bg-white text-[var(--accent-color)] rounded-lg 
                        hover:bg-[var(--background-color)] transition-colors duration-200 font-medium 
                        flex items-center">





                      <Icon name="faPlus" className="w-5 h-5 mr-2" solid={false} />
                      Buy Credits
                    </motion.button>
                  </div>
                  {creditsBalance < 10 && <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-3 flex items-center">
                      <Icon name="faXCircle" className="w-5 h-5 mr-2" solid={false} />
                      <p className="text-sm">
                        Low balance warning! Purchase more credits to avoid service interruption.
                      </p>
                    </div>}
                </div>
              </Card>

              {/* Credit Packages Card */}
              <Card>
                <SectionHeader icon={props => <Icon name="faLightning" {...props} solid={false} className="text-[var(--secondary-color)]" />} title="Credit Packages" description="Choose a credit package that suits your needs" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creditPackages.map(pkg => <CreditPackageCard key={pkg.credits} credits={pkg.credits} price={pkg.price} isSelected={selectedCreditPackage === pkg.credits} onSelect={() => setSelectedCreditPackage(pkg.credits)} />)}
                </div>
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => setBuyCreditsModalOpen(true)} className="mt-6 w-full px-4 py-3 bg-[var(--accent-color)] text-white rounded-lg 
                    hover:opacity-90 transition-colors duration-200 font-medium 
                    flex items-center justify-center">





                  <Icon name="faMoney" className="w-5 h-5 mr-2" solid={false} />
                  Purchase Credits
                </motion.button>
              </Card>
            </>}
        </div>

        {/* Modals */}
        <Modal isOpen={updatePaymentModalOpen} onClose={() => {
        setUpdatePaymentModalOpen(false);
        setPaymentMethodError("");
      }}>

          <h3 className="text-lg font-semibold mb-4 text-[var(--primary-color)]">Update Payment Method</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--secondary-color)] mb-1">
                Card Number
              </label>
              <input type="text" value={newCardNumber} onChange={e => setNewCardNumber(e.target.value)} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
                  focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" placeholder="1234 5678 9012 3456" />

            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-color)] mb-1">
                  Expiry Date
                </label>
                <input type="text" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
                    focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" placeholder="MM/YY" />

              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-color)] mb-1">
                  CVV
                </label>
                <input type="text" value={newCVV} onChange={e => setNewCVV(e.target.value)} className="w-full px-3 py-2 border border-[var(--divider-color)] rounded-md 
                    focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" placeholder="123" />

              </div>
            </div>
            {paymentMethodError && <p className="text-sm text-red-600 flex items-center">
                <Icon name="faXCircle" className="w-5 h-5 mr-1" solid={false} />
                {paymentMethodError}
              </p>}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={() => {
            setUpdatePaymentModalOpen(false);
            setPaymentMethodError("");
          }} className="px-4 py-2 text-[var(--secondary-color)] bg-[var(--background-color)] rounded-lg hover:bg-[var(--divider-color)] 
                transition-colors duration-200">



              Cancel
            </motion.button>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={handleAddPaymentMethod} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90
                transition-colors duration-200">



              Update Payment Method
            </motion.button>
          </div>
        </Modal>

        <Modal isOpen={buyCreditsModalOpen} onClose={() => setBuyCreditsModalOpen(false)}>

          <h3 className="text-lg font-semibold mb-4 text-[var(--primary-color)]">Purchase Credits</h3>
          <div className="space-y-4">
            {creditPackages.map(pkg => <div key={pkg.credits} className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedCreditPackage === pkg.credits ? 'border-[var(--accent-color)] bg-[var(--background-color)]' : 'border-[var(--divider-color)] hover:border-[var(--accent-color)]'}`} onClick={() => setSelectedCreditPackage(pkg.credits)}>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[var(--primary-color)]">{pkg.credits} Credits</h4>
                    <p className="text-sm text-[var(--secondary-color)]">Best value</p>
                  </div>
                  <p className="text-xl font-bold text-[var(--primary-color)]">{pkg.price}</p>
                </div>
              </div>)}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={() => setBuyCreditsModalOpen(false)} className="px-4 py-2 text-[var(--secondary-color)] bg-[var(--background-color)] rounded-lg hover:bg-[var(--divider-color)] 
                transition-colors duration-200">



              Cancel
            </motion.button>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={handleConfirmBuyCredits} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 
                transition-colors duration-200">



              Confirm Purchase
            </motion.button>
          </div>
        </Modal>

        {/* Toast Message */}
        <AnimatePresence>
          {toastMessage && <motion.div initial={{
          opacity: 0,
          y: 50
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: 50
        }} className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg 
                shadow-lg flex items-center">



              <Icon name="faCheckCircle" className="w-5 h-5 mr-2" solid={false} />
              {toastMessage}
            </motion.div>}
        </AnimatePresence>
      </div>
    </motion.div>;
};
export default SubscriptionBillingPage;