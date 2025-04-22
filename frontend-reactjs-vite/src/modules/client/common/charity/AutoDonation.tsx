import React, { useState } from "react";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTimes,
  FaPlus,
  FaInfoCircle,
  FaClock,
  FaHandHoldingHeart,
  FaEdit,
  FaTrash,
  FaPause,
  FaPlay,
  FaDonate
} from "react-icons/fa";
import { mockDonorAutoDonations } from "../../../../utils/mockData";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

// Define simplified direct donation setup modal
const DirectDonationSetupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: (amount: number, frequency: string) => void;
  initialValues?: {
    amount: number;
    frequency: 'monthly' | 'quarterly';
  };
  isEditing?: boolean;
}> = ({ isOpen, onClose, onSetupComplete, initialValues, isEditing = false }) => {
  const [amount, setAmount] = useState<number>(initialValues?.amount || 25);
  const [frequency, setFrequency] = useState<string>(initialValues?.frequency || 'monthly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Reset form values when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (!initialValues) {
        setAmount(25);
        setFrequency('monthly');
      } else {
        setAmount(initialValues.amount);
        setFrequency(initialValues.frequency);
      }
      setIsProcessing(false);
    }
  }, [isOpen, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final submission
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      onSetupComplete(amount, frequency);
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] p-4" onClick={(e) => {
      // Only close if clicking directly on the backdrop
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-[#006838] flex items-center gap-2">
            <span className="text-[#F9A826]">🔄</span>
            {isEditing ? 'Edit Recurring Donation' : 'Setup Direct Recurring Donation'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Amount */}
            <div>
              <h3 className="text-md font-semibold text-[#006838] mb-2 flex items-center">
                <span className="bg-[#F9A826] text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">1</span>
                Choose Your Donation Amount
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Set the amount you'd like to donate on a recurring basis.
              </p>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">RM</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="5"
                    max="10000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F9A826] focus:border-[#F9A826] text-xl font-bold text-[#006838]"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[10, 25, 50, 100, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`py-2 px-4 rounded-lg transition-colors ${amount === preset
                        ? 'bg-[#F9A826] text-white'
                        : 'border border-gray-300 hover:border-[#F9A826] text-gray-700'
                        }`}
                    >
                      RM{preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <h3 className="text-md font-semibold text-[#006838] mb-2 flex items-center">
                <span className="bg-[#F9A826] text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">2</span>
                Choose Donation Frequency
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select how often you would like your donation to be processed.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${frequency === 'monthly'
                    ? 'border-2 border-[#006838] bg-[#006838]/5'
                    : 'border border-gray-200 hover:border-[#006838]/30'
                    }`}
                  onClick={() => setFrequency('monthly')}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${frequency === 'monthly' ? 'bg-[#006838]/20 text-[#006838]' : 'bg-gray-100 text-gray-400'
                      }`}>
                      <FaCalendarAlt size={20} />
                    </div>
                    <h4 className={`font-bold ${frequency === 'monthly' ? 'text-[#006838]' : 'text-gray-700'}`}>
                      Monthly
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Donate RM{amount} every month
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${frequency === 'quarterly'
                    ? 'border-2 border-[#006838] bg-[#006838]/5'
                    : 'border border-gray-200 hover:border-[#006838]/30'
                    }`}
                  onClick={() => setFrequency('quarterly')}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${frequency === 'quarterly' ? 'bg-[#006838]/20 text-[#006838]' : 'bg-gray-100 text-gray-400'
                      }`}>
                      <FaClock size={20} />
                    </div>
                    <h4 className={`font-bold ${frequency === 'quarterly' ? 'text-[#006838]' : 'text-gray-700'}`}>
                      Quarterly
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Donate RM{amount} every 3 months
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-[#006838] mb-2">Summary</h4>
              <p className="text-sm text-gray-700">
                You will donate <strong>RM{amount}</strong> {frequency === 'monthly' ? 'every month' : 'every 3 months'} to support charity campaigns.
              </p>
            </div>

            {/* Info note */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-blue-600 mr-2 mt-1 flex-shrink-0">
                  <FaInfoCircle />
                </div>
                <div>
                  <p className="text-sm text-blue-800">
                    You can pause or cancel your recurring donation at any time from your donation management dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className={`px-6 py-2 rounded-lg ${isProcessing
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
                isEditing ? 'Update' : 'Complete Setup'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AutoDonation: React.FC = () => {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const navigate = useNavigate();

  // Modified mock data to remove categories
  const autoDonations = mockDonorAutoDonations.map(donation => ({
    ...donation,
    categories: []  // Emptying categories as we're removing category-based donations
  }));

  // Calculate summary information
  const totalActiveDonations = autoDonations.filter(d => d.status === 'active').length;
  const totalMonthlyAmount = autoDonations
    .filter(d => d.status === 'active')
    .reduce((sum, donation) => {
      // Handle quarterly donations by dividing by 3 to get monthly equivalent
      const monthlyAmount = donation.frequency === 'quarterly' ? donation.amount / 3 : donation.amount;
      return sum + monthlyAmount;
    }, 0);

  // Next scheduled donation date
  const getNextDonationDate = () => {
    if (autoDonations.length === 0) return "No upcoming donations";

    const upcomingDates = autoDonations
      .filter(d => d.status === 'active' && d.nextCharge)
      .map(d => new Date(d.nextCharge));

    if (upcomingDates.length === 0) return "No upcoming donations";

    const nextDate = new Date(Math.min(...upcomingDates.map(d => d.getTime())));
    return nextDate.toLocaleDateString();
  };

  const handleSetupComplete = (amount: number, frequency: string) => {
    // Create a new recurring donation
    const newDonation = {
      id: `rd-${Date.now()}`,
      amount,
      frequency: frequency as 'monthly' | 'quarterly',
      categories: [],
      status: 'active',
      startDate: new Date().toLocaleDateString(),
      nextCharge: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      totalContributed: 0,
    };

    // Show toast notification
    toast({
      title: 'Recurring Donation Set Up',
      description: 'Your recurring donation has been set up successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleEditComplete = (amount: number, frequency: string) => {
    if (!selectedDonation) return;

    // Update the selected donation
    const updatedDonations = autoDonations.map(donation =>
      donation.id === selectedDonation.id
        ? {
          ...donation,
          amount,
          frequency: frequency as 'monthly' | 'quarterly'
        }
        : donation
    );

    // Show toast notification
    toast({
      title: 'Recurring Donation Updated',
      description: 'Your recurring donation has been updated successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  // Function to handle donation status toggle (pause/resume)
  const handleToggleDonationStatus = (donationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    // Show toast notification
    toast({
      title: `Donation ${newStatus === 'active' ? 'Resumed' : 'Paused'}`,
      description: `Your recurring donation has been ${newStatus === 'active' ? 'resumed' : 'paused'} successfully.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  // Function to handle donation deletion with confirmation
  const handleDeleteDonation = (donationId: string) => {
    // Show confirmation dialog
    if (confirm("Are you sure you want to cancel this recurring donation? This action cannot be undone.")) {
      // Show toast notification
      toast({
        title: "Donation Cancelled",
        description: "Your recurring donation has been cancelled successfully.",
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Active Plans Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#006838]/20 to-[#006838]/10 flex items-center justify-center mr-4">
              <FaHandHoldingHeart className="text-[#006838] text-xl" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Active Plans</h3>
              <p className="text-2xl font-bold text-[#006838]">{totalActiveDonations}</p>
            </div>
          </div>
        </div>

        {/* Monthly Impact Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F9A826]/20 to-[#F9A826]/10 flex items-center justify-center mr-4">
              <FaMoneyBillWave className="text-[#F9A826] text-xl" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Monthly Impact</h3>
              <p className="text-2xl font-bold text-[#F9A826]">
                RM{totalMonthlyAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Next Donation Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center mr-4">
              <FaCalendarAlt className="text-blue-500 text-xl" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Next Donation</h3>
              <p className="text-2xl font-bold text-blue-500">{getNextDonationDate()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Donations Section */}
      <div className="mb-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#006838] flex items-center">
            <FaDonate className="mr-2 text-[#F9A826]" />
            Your Direct Recurring Donations
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F9A826] text-white rounded-lg shadow-md hover:bg-[#e59415] transition-colors"
          >
            <FaPlus size={14} />
            <span>New Donation</span>
          </motion.button>
        </div>

        {/* Donation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {autoDonations.map((donation) => (
            <motion.div
              key={donation.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`h-2 ${donation.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#006838]">{donation.frequency === 'monthly' ? 'Monthly' : 'Quarterly'} Donation</h3>
                    <p className="text-sm text-gray-500">Started {donation.startDate}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${donation.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'}`
                  }>
                    {donation.status === 'active' ? 'Active' : 'Paused'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-5">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 text-sm">Amount:</span>
                    <span className="font-semibold">RM{donation.amount.toFixed(2)}/{donation.frequency === 'monthly' ? 'month' : 'quarter'}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 text-sm">Next charge:</span>
                    <span className="font-semibold">{donation.nextCharge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Total contributed:</span>
                    <span className="font-semibold text-[#006838]">RM{donation.totalContributed.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between gap-2 mt-4">
                  <button
                    onClick={() => {
                      setSelectedDonation(donation);
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <FaEdit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleToggleDonationStatus(donation.id.toString(), donation.status)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg transition-colors
                      ${donation.status === 'active'
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                        : 'bg-green-100 hover:bg-green-200 text-green-800'}`
                    }
                  >
                    {donation.status === 'active' ? <FaPause size={14} /> : <FaPlay size={14} />}
                    <span>{donation.status === 'active' ? 'Pause' : 'Resume'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDonation(donation.id.toString())}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {autoDonations.length === 0 && (
            <div className="col-span-full bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaMoneyBillWave className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No recurring donations yet</h3>
              <p className="text-gray-500 mb-4">Set up your first recurring donation to start making a regular impact</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSetupModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F9A826] text-white rounded-lg"
              >
                <FaPlus size={12} />
                <span>New Donation</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Section (simplified) */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#006838] mb-4 flex items-center">
          <FaCalendarAlt className="mr-2 text-[#F9A826]" />
          Recent Transactions
        </h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="space-y-2">
            {/* Mock transactions */}
            {Array.from({ length: 5 }).map((_, idx) => {
              const date = new Date();
              date.setDate(date.getDate() - (idx * 30));
              return (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-[#006838]">{idx % 2 === 0 ? 'Monthly' : 'Quarterly'} Donation</div>
                    <div className="text-sm text-gray-500">{date.toLocaleDateString()}</div>
                  </div>
                  <div className="font-semibold text-[#006838]">RM{(25 + idx * 5).toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      <DirectDonationSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSetupComplete={handleSetupComplete}
      />

      {/* Edit Modal */}
      {selectedDonation && (
        <DirectDonationSetupModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialValues={{
            amount: selectedDonation.amount,
            frequency: selectedDonation.frequency,
          }}
          isEditing={true}
          onSetupComplete={handleEditComplete}
        />
      )}
    </div>
  );
};

export default AutoDonation; 