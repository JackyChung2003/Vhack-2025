import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationCircle, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';
import { mockCampaigns } from '../../../../utils/mockData';

const CampaignTransactions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the campaign
  const campaign = mockCampaigns.find(c => c.id === Number(id));
  
  if (!campaign) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-500">Campaign not found</h1>
      </div>
    );
  }

  // Calculate fund allocation based on campaign data
  const fundAllocation = {
    available: campaign.currentContributions * 0.4, // 40% of funds are available
    onHold: campaign.currentContributions * 0.3,    // 30% of funds are on hold
    used: campaign.currentContributions * 0.3,      // 30% of funds are used
    remaining: campaign.goal - campaign.currentContributions  // Remaining target amount
  };

  // Calculate total funds
  const totalFunds = campaign.currentContributions;
  const totalTarget = campaign.goal;

  // Calculate percentages
  const percentages = {
    available: (fundAllocation.available / totalTarget) * 100,
    onHold: (fundAllocation.onHold / totalTarget) * 100,
    used: (fundAllocation.used / totalTarget) * 100,
    remaining: (fundAllocation.remaining / totalTarget) * 100
  };

  // Mock transactions data
  const transactions = [
    {
      id: 1,
      date: '2024-03-15',
      type: 'Donation',
      amount: 5000,
      status: 'completed',
      description: 'Initial campaign funding',
      donor: 'John Doe'
    },
    {
      id: 2,
      date: '2024-03-20',
      type: 'Vendor Payment',
      amount: 20000,
      status: 'completed',
      description: 'Payment to Medical Supplies Co.',
      vendor: 'Medical Supplies Co.'
    },
    {
      id: 3,
      date: '2024-03-25',
      type: 'Vendor Quotation',
      amount: 30000,
      status: 'on-hold',
      description: 'Quotation from Food Distribution Inc.',
      vendor: 'Food Distribution Inc.'
    }
  ];

  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/Vhack-2025/management?tab=funds', { replace: true })}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to Fund Management"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{campaign.name}</h1>
          <p className="text-gray-600">Transaction History</p>
        </div>
      </div>

      {/* Fund Allocation Donut Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Fund Allocation</h2>
        <div className="flex items-center justify-center gap-12">
          {/* Donut Chart */}
          <div className="relative w-72 h-72">
            <svg viewBox="0 0 100 100" className="transform rotate-90 w-full h-full">
              {/* Base circle (Remaining Target - Gray) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="16"
              />
              
              {/* Available Funds (Green) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10B981"
                strokeWidth="16"
                strokeDasharray={`${20 * 2.51327} ${251.327 - (20 * 2.51327)}`}
                strokeDashoffset="0"
              />
              
              {/* On Hold (Yellow) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#FFF44F"
                strokeWidth="16"
                strokeDasharray={`${15 * 2.51327} ${251.327 - (15 * 2.51327)}`}
                strokeDashoffset={`${-(20 * 2.51327)}`}
              />
              
              {/* Used Funds (Red) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#EF4444"
                strokeWidth="16"
                strokeDasharray={`${15 * 2.51327} ${251.327 - (15 * 2.51327)}`}
                strokeDashoffset={`${-((20 + 15) * 2.51327)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                RM{totalFunds.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">of RM{totalTarget.toLocaleString()}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
              <div>
                <p className="font-medium text-gray-800">Available Funds</p>
                <p className="text-sm text-gray-600">
                  RM{fundAllocation.available.toLocaleString()} ({percentages.available.toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[#FFF44F]"></div>
              <div>
                <p className="font-medium text-gray-800">On Hold</p>
                <p className="text-sm text-gray-600">
                  RM{fundAllocation.onHold.toLocaleString()} ({percentages.onHold.toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#EF4444]"></div>
              <div>
                <p className="font-medium text-gray-800">Used Funds</p>
                <p className="text-sm text-gray-600">
                  RM{fundAllocation.used.toLocaleString()} ({percentages.used.toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#9CA3AF]"></div>
              <div>
                <p className="font-medium text-gray-800">Remaining Target</p>
                <p className="text-sm text-gray-600">
                  RM{fundAllocation.remaining.toLocaleString()} ({percentages.remaining.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
        </div>
        <div className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'Donation' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'Donation' ? (
                      <FaMoneyBillWave className="text-green-600" />
                    ) : (
                      <FaShoppingCart className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {transaction.type === 'Donation' ? 'Donation Received' : 'Campaign Expense'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {transaction.type === 'Donation' ? `From ${transaction.donor}` : transaction.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    transaction.type === 'Donation' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'Donation' ? '+' : '-'}RM{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
              </div>
            </div>
              ))}
        </div>
        </div>
      </motion.div>
  );
};

export default CampaignTransactions; 