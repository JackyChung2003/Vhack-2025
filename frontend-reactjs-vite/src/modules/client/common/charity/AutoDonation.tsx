import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaTimes,
  FaPlus,
  FaCreditCard,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaBuilding,
  FaHandHoldingHeart,
  FaExternalLinkAlt,
  FaRegCreditCard,
  FaCoins,
  FaClock,
  FaReceipt,
  FaHistory,
  FaEdit,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaRegCalendarAlt,
  FaLock
} from "react-icons/fa";
import { mockDonorAutoDonations } from "../../../../utils/mockData";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Define auto donation edit modal component
const EditRecurringDonationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onEditComplete: (amount: number) => void;
  initialValues?: {
    amount: number;
    recipientName: string;
    recipientType: 'campaign' | 'organization';
  };
}> = ({ isOpen, onClose, onEditComplete, initialValues }) => {
  const predefinedAmounts = [10, 25, 50, 100, 250];
  const [amount, setAmount] = useState<number | ''>(initialValues?.amount || predefinedAmounts[0]);
  const [customAmount, setCustomAmount] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset form values when modal opens with initialValues
  useEffect(() => {
    if (isOpen && initialValues) {
      setAmount(initialValues.amount);
      setCustomAmount(!predefinedAmounts.includes(initialValues.amount));
    }
  }, [isOpen, initialValues]);

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount(false);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      // Ensure minimum of RM 10 when confirming, but allow typing any value
      setAmount(value === '' ? '' : parseFloat(value));
    }
  };

  const handleSubmit = () => {
    if (typeof amount === 'number' && amount < 10) {
      toast.error("Minimum donation amount is RM 10");
      return;
    }

    if (amount) {
      setIsProcessing(true);

      // Simulate API call
      setTimeout(() => {
        onEditComplete(typeof amount === 'number' ? amount : 10);
        setIsProcessing(false);
        onClose();
      }, 1500);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-[#006838] flex items-center gap-2">
            <span className="text-[#F9A826]">💰</span>
            Edit Monthly Donation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-6">
            {/* Recipient Info */}
            {initialValues && (
              <div className="bg-[#FFFAF0] p-4 rounded-lg border border-[#F9A826] border-opacity-30">
                <div className="flex items-center gap-3">
                  {initialValues.recipientType === 'campaign' ? (
                    <div className="w-10 h-10 rounded-full bg-[#F9A826] bg-opacity-20 flex items-center justify-center">
                      <FaHandHoldingHeart className="text-[#F9A826]" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#006838] bg-opacity-20 flex items-center justify-center">
                      <FaBuilding className="text-[#006838]" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-[#006838]">
                      {initialValues.recipientName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Monthly donation to {initialValues.recipientType === 'campaign' ? 'campaign' : 'organization'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Donation Amount */}
            <div>
              <h3 className="text-md font-semibold text-[#006838] mb-2">Donation Amount</h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {predefinedAmounts.map((predefinedAmount) => (
                  <motion.button
                    key={predefinedAmount}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAmountSelect(predefinedAmount)}
                    className={`py-2 rounded-lg ${amount === predefinedAmount && !customAmount
                      ? 'bg-[#F9A826] text-white'
                      : 'border border-gray-300 hover:border-[#F9A826] text-gray-700'
                      }`}
                  >
                    RM{predefinedAmount}<span className="text-xs">/month</span>
                  </motion.button>
                ))}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCustomAmount(true);
                    setAmount('');
                  }}
                  className={`py-2 rounded-lg ${customAmount
                    ? 'bg-[#F9A826] text-white'
                    : 'border border-gray-300 hover:border-[#F9A826] text-gray-700'
                    }`}
                >
                  Custom
                </motion.button>
              </div>

              {customAmount && (
                <div className="mt-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">RM</span>
                    </div>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleCustomAmountChange}
                      className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F9A826] focus:border-[#F9A826]"
                      placeholder="Enter amount (min RM10)"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">/month</span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Minimum donation amount is RM10</div>
                </div>
              )}
            </div>

            {/* Information section */}
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-2 text-sm">
              <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-blue-700 font-medium mb-1">About Monthly Donations</p>
                <p className="text-blue-600">
                  Your recurring donation provides reliable support to causes you care about.
                  You can cancel at any time from the Donation Management dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!amount || isProcessing}
            className={`px-6 py-2 rounded-lg ${!amount
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#F9A826] text-white hover:bg-[#e99615]'
              } transition-colors flex items-center justify-center min-w-[120px]`}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            ) : (
              'Update Donation'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Simplified distribution detail component for inline display
const InlineDistributionItem: React.FC<{
  date: string;
  amount: number;
  recipientName: string;
  onViewTransaction: () => void;
}> = ({ date, amount, recipientName, onViewTransaction }) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#F9A826]"></div>
        <span className="text-sm text-[var(--paragraph)]">
          {new Date(date).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-[#F9A826]">
          RM{amount}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewTransaction();
          }}
          className="p-1.5 bg-[var(--background)] rounded border border-[var(--stroke)] text-[var(--paragraph)] hover:text-[#F9A826] hover:border-[#F9A826] transition-colors"
          title="View Receipt"
        >
          <FaReceipt size={12} />
        </button>
      </div>
    </div>
  );
};

const RecurringDonations: React.FC = () => {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<number[]>([]);
  const navigate = useNavigate();

  // Filter out category-based donations
  const autoDonations = mockDonorAutoDonations.filter(donation =>
    donation.donationType === 'direct'
  );

  // Calculate summary information
  const totalActiveDonations = autoDonations.length;
  const totalMonthlyAmount = autoDonations.reduce((sum, donation) => {
    // All donations are now monthly, so no need to divide quarterly
    return sum + donation.amount;
  }, 0);

  // Total donated so far (mock calculation)
  const totalDonatedSoFar = autoDonations.reduce((sum, donation) => {
    // Count 3 months of donations for demo purposes
    const monthsActive = 3;
    return sum + (donation.amount * monthsActive);
  }, 0);

  // Find the closest upcoming donation date
  const getNextDonationDate = () => {
    if (autoDonations.length === 0) return null;

    const upcomingDates = autoDonations
      .filter(d => d.nextDonationDate)
      .map(d => new Date(d.nextDonationDate))
      .sort((a, b) => a.getTime() - b.getTime())
      .filter(date => date > new Date());

    return upcomingDates.length > 0 ? upcomingDates[0] : null;
  };

  const nextDonationDate = getNextDonationDate();

  const handleSetupComplete = (amount: number) => {
    console.log(`Recurring donation setup: RM${amount} monthly`);
    // In a real app, this would call an API to set up the auto donation
    // Potentially trigger a fetch/update of the autoDonations list
  };

  const handleEditDonation = (donation: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from toggling history
    setSelectedDonation(donation);
    setIsEditModalOpen(true);
  };

  const handleCancelDonation = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from toggling history
    console.log(`Cancelling recurring donation with ID: ${id}`);
    // In a real app, this would call an API to cancel the donation
  };

  const handleToggleHistory = (donationId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // If triggered by button instead of row click

    setExpandedHistoryIds(prev =>
      prev.includes(donationId)
        ? prev.filter(id => id !== donationId)
        : [...prev, donationId]
    );
  };

  const handleViewRecipient = (recipient: {
    id: number;
    type: 'campaign' | 'organization';
  }, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from toggling history
    if (recipient.type === 'campaign') {
      navigate(`/charity/${recipient.id}`);
    } else {
      navigate(`/charity/organization/${recipient.id}`);
    }
  };

  const handleEditComplete = (amount: number) => {
    console.log(`Updating donation ID ${selectedDonation?.id} to: RM${amount} monthly`);
    toast.success(`Donation amount updated to RM${amount}/month`);
    // In a real app, this would call an API to update the donation
  };

  const handleViewTransaction = (distributionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would navigate to a detailed receipt view or open a modal
    toast.info(`Viewing receipt for transaction from ${new Date(distributionId).toLocaleDateString()}`);
  };

  return (
    <div className="bg-[var(--background)] rounded-xl">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-8 rounded-t-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Donation Management</h2>
            <p className="text-white text-opacity-90 max-w-xl">
              Manage your recurring donations and track your charitable impact over time.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <FaMoneyBillWave className="text-white" />
              </div>
              <h3 className="text-white font-medium">Active Donations</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{totalActiveDonations}</span>
              <span className="text-white text-sm opacity-80">active</span>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <FaCoins className="text-white" />
              </div>
              <h3 className="text-white font-medium">Monthly Contribution</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">RM{totalMonthlyAmount.toFixed(2)}</span>
              <span className="text-white text-sm opacity-80">/month</span>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <FaChartLine className="text-white" />
              </div>
              <h3 className="text-white font-medium">Total Impact</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">RM{totalDonatedSoFar.toFixed(2)}</span>
              <span className="text-white text-sm opacity-80">donated</span>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <FaClock className="text-white" />
              </div>
              <h3 className="text-white font-medium">Next Donation</h3>
            </div>
            <div className="flex items-baseline gap-1">
              {nextDonationDate ? (
                <span className="text-3xl font-bold text-white">{nextDonationDate.toLocaleDateString()}</span>
              ) : (
                <span className="text-xl text-white opacity-80">No upcoming</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Active donations section */}
        <div className="bg-white rounded-xl border border-[var(--stroke)] overflow-hidden mb-8 shadow-sm">
          <div className="p-6 border-b border-[var(--stroke)] flex justify-between items-center">
            <h3 className="text-lg font-bold text-[var(--headline)] flex items-center gap-2">
              <FaMoneyBillWave className="text-[#F9A826]" />
              Active Recurring Donations
            </h3>
          </div>

          {autoDonations.length > 0 ? (
            <div className="p-6">
              <div className="overflow-hidden border border-[var(--stroke)] rounded-xl">
                <table className="min-w-full divide-y divide-[var(--stroke)]">
                  <thead className="bg-[var(--background)]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--paragraph)] uppercase tracking-wider">
                        Recipient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--paragraph)] uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--paragraph)] uppercase tracking-wider">
                        Next Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--paragraph)] uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[var(--paragraph)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[var(--stroke)]">
                    {autoDonations.map((donation) => (
                      <React.Fragment key={donation.id}>
                        <tr
                          className={`hover:bg-[var(--background)] transition-colors cursor-pointer ${expandedHistoryIds.includes(donation.id) ? 'bg-[var(--background)]' : ''
                            }`}
                          onClick={() => handleToggleHistory(donation.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {donation.directRecipient && (
                              <div className="flex items-center gap-3" onClick={(e) => handleViewRecipient(donation.directRecipient!, e)} style={{ cursor: 'pointer' }}>
                                {donation.directRecipient.type === 'campaign' ? (
                                  <div className="w-8 h-8 rounded-full bg-[#F9A826] bg-opacity-10 flex items-center justify-center">
                                    <FaHandHoldingHeart className="text-[#F9A826]" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[var(--secondary)] bg-opacity-10 flex items-center justify-center">
                                    <FaBuilding className="text-[var(--secondary)]" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-[var(--headline)]">{donation.directRecipient.name}</div>
                                  <div className="text-xs text-[var(--paragraph)]">
                                    {donation.directRecipient.type === 'campaign' ? 'Campaign' : 'Organization'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-[#F9A826]">RM{donation.amount}</span>
                            <span className="text-xs text-[var(--paragraph)]">/month</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-[var(--paragraph)] text-opacity-50" size={12} />
                              <span className="text-sm">{new Date(donation.nextDonationDate).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <FaCheckCircle className="text-green-500" size={12} />
                              <span className="text-xs font-medium text-green-500">Active</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => handleToggleHistory(donation.id, e)}
                                className={`p-1.5 rounded border text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors ${expandedHistoryIds.includes(donation.id)
                                  ? 'bg-[#F9A826] bg-opacity-10 border-[#F9A826] text-[#F9A826]'
                                  : 'bg-[var(--background)] border-[var(--stroke)]'
                                  }`}
                                title={expandedHistoryIds.includes(donation.id) ? 'Hide History' : 'View History'}
                              >
                                <FaHistory size={14} />
                              </button>
                              <button
                                onClick={(e) => handleEditDonation(donation, e)}
                                className="p-1.5 bg-[var(--background)] rounded border border-[var(--stroke)] text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors"
                                title="Edit Donation"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={(e) => handleCancelDonation(donation.id, e)}
                                className="p-1.5 bg-[var(--background)] rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                title="Cancel Donation"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded history row - appears directly below the donation row */}
                        {expandedHistoryIds.includes(donation.id) && donation.distributions.length > 0 && (
                          <tr className="bg-[var(--background)] bg-opacity-50">
                            <td colSpan={5} className="px-0 animate-fadeIn">
                              <div className="border-t border-[var(--stroke)] border-dashed">
                                <div className="px-6 py-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-sm font-semibold text-[var(--headline)] flex items-center gap-2">
                                      <FaReceipt className="text-[#F9A826]" />
                                      Donation History
                                    </h5>
                                    <div className="text-xs text-[var(--paragraph)]">
                                      {donation.distributions.length} past donation{donation.distributions.length !== 1 ? 's' : ''}
                                    </div>
                                  </div>

                                  <div className="bg-white rounded-lg border border-[var(--stroke)] divide-y divide-[var(--stroke)] overflow-hidden">
                                    {donation.distributions.map((distribution, index) => (
                                      <InlineDistributionItem
                                        key={index}
                                        date={distribution.date}
                                        amount={distribution.recipients[0].amount}
                                        recipientName={distribution.recipients[0].name}
                                        onViewTransaction={() => handleViewTransaction(distribution.date, event as React.MouseEvent)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="w-20 h-20 mx-auto bg-[var(--background)] rounded-full flex items-center justify-center mb-4">
                <FaMoneyBillWave className="text-4xl text-[var(--paragraph)] opacity-50" />
              </div>
              <p className="text-lg font-medium text-[var(--headline)]">No active recurring donations</p>
              <p className="text-[var(--paragraph)] mb-6">You can set up recurring donations from a campaign or organization page.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit donation modal */}
      {selectedDonation && (
        <EditRecurringDonationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEditComplete={handleEditComplete}
          initialValues={{
            amount: selectedDonation.amount,
            recipientName: selectedDonation.directRecipient?.name || "Recipient",
            recipientType: selectedDonation.directRecipient?.type || "organization"
          }}
        />
      )}
    </div>
  );
};

export default RecurringDonations;

// Add this to your CSS or styles file
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

// Inject the styles
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);