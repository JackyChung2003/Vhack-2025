import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationCircle, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';
import { charityService, Campaign } from '../../../../services/supabase/charityService';
import { toast } from 'react-toastify';

interface TransactionData {
  id: string | number;
  date: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  donor?: string;
  vendor?: string;
}

const CampaignTransactions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donationStats, setDonationStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  // Fund allocation calculation
  const [fundAllocation, setFundAllocation] = useState({
    availableCampaignSpecific: 0,
    availableAlwaysDonate: 0,
    onHold: 0,
    used: 0,
  });

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Fetch campaign data
        const campaignData = await charityService.getCampaignById(id);
        setCampaign(campaignData);
        
        // Fetch donation statistics
        const stats = await charityService.getCampaignDonationStats(id);
        setDonationStats(stats);
        
        // Fetch transactions and fund allocation
        const { transactions: campaignTransactions, fundAllocation: campaignFundAllocation } = 
          await charityService.getCampaignTransactions(id);
        
        // Use exact database values
        setTransactions(campaignTransactions);
        setFundAllocation(campaignFundAllocation);
        
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        toast.error('Failed to load campaign transaction data');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p>Loading campaign data...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-500">Campaign not found</h1>
      </div>
    );
  }

  // Calculate totals and percentages for chart
  const totalFunds = campaign.current_amount;
  const totalTarget = campaign.target_amount;
  
  // Calculate percentages for the chart using exact values
  const percentages = {
    availableCampaignSpecific: Math.max(0, (fundAllocation.availableCampaignSpecific / totalTarget) * 100),
    availableAlwaysDonate: Math.max(0, (fundAllocation.availableAlwaysDonate / totalTarget) * 100),
    onHold: Math.max(0, (fundAllocation.onHold / totalTarget) * 100),
    used: Math.max(0, (fundAllocation.used / totalTarget) * 100),
    remaining: Math.max(0, ((totalTarget - totalFunds) / totalTarget) * 100)
  };

  // Calculate the stroke dash values for the donut chart
  const calculateStrokeDash = (percentage: number) => {
    const circumference = 2 * Math.PI * 40; // 40 is the radius
    return `${(percentage / 100) * circumference} ${circumference}`;
  };

  // Calculate offsets with extra precision
  const usedOffset = "0";
  const onHoldOffset = `${-(percentages.used / 100) * (2 * Math.PI * 40)}`;
  const availableCampaignSpecificOffset = `${-((percentages.used + percentages.onHold) / 100) * (2 * Math.PI * 40)}`;
  const availableAlwaysDonateOffset = `${-((percentages.used + percentages.onHold + percentages.availableCampaignSpecific) / 100) * (2 * Math.PI * 40)}`;

  // Log values for debugging
  console.log("Donut chart data:", {
    percentages,
    fundAllocation,
    campaign: {
      current_amount: totalFunds,
      target_amount: totalTarget
    },
    offsets: {
      usedOffset,
      onHoldOffset,
      availableCampaignSpecificOffset,
      availableAlwaysDonateOffset
    }
  });

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
          onClick={() => navigate('/charity?tab=funds')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to Fund Management"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{campaign.title}</h1>
          <p className="text-gray-600">Transaction History</p>
        </div>
      </div>

      {/* Fund Allocation Donut Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Fund Allocation</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          {/* Donut Chart */}
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
              {/* Base circle (Remaining Target - Gray) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="16"
              />
              
              {/* Used Funds (Red) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#EF4444"
                strokeWidth="16"
                strokeDasharray={calculateStrokeDash(percentages.used)}
                strokeDashoffset={usedOffset}
              />
              
              {/* On Hold (Yellow) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="16"
                strokeDasharray={calculateStrokeDash(percentages.onHold)}
                strokeDashoffset={onHoldOffset}
              />
              
              {/* Available Funds - Campaign Specific (Green) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10B981"
                strokeWidth="16"
                strokeDasharray={calculateStrokeDash(percentages.availableCampaignSpecific)}
                strokeDashoffset={availableCampaignSpecificOffset}
              />
              
              {/* Available Funds - Always Donate (Light Blue) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="16"
                strokeDasharray={calculateStrokeDash(percentages.availableAlwaysDonate)}
                strokeDashoffset={availableAlwaysDonateOffset}
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
          <div className="flex flex-col gap-4 mt-6 md:mt-0">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
              <div>
                <p className="font-medium text-gray-800">Available Fund (Campaign Specific)</p>
                <p className="text-sm text-gray-600">
                  RM{fundAllocation.availableCampaignSpecific.toLocaleString()} 
                  ({percentages.availableCampaignSpecific.toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#60A5FA]"></div>
              <div>
                <p className="font-medium text-gray-800">Available Fund (Always Donate)</p>
                <p className="text-sm text-gray-600">
                  RM{fundAllocation.availableAlwaysDonate.toLocaleString()} 
                  ({percentages.availableAlwaysDonate.toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-[#FBBF24]"></div>
              <div>
                <p className="font-medium text-gray-800">On Hold</p>
                <p className="text-sm text-gray-600">
                  RM{fundAllocation.onHold.toLocaleString()} 
                  ({percentages.onHold.toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#EF4444]"></div>
              <div>
                <p className="font-medium text-gray-800">Used Funds</p>
                <p className="text-sm text-gray-600">
                  RM{fundAllocation.used.toLocaleString()} 
                  ({percentages.used.toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#E5E7EB]"></div>
              <div>
                <p className="font-medium text-gray-800">Remaining Target</p>
                <p className="text-sm text-gray-600">
                  RM{(totalTarget - totalFunds).toLocaleString()} 
                  ({percentages.remaining.toFixed(1)}%)
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
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
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
                        {transaction.type === 'Donation' ? 
                          `From ${transaction.donor || 'Anonymous'}` : 
                          transaction.description}
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
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No transactions found for this campaign.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignTransactions; 