import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationCircle, FaMoneyBillWave, FaShoppingCart, FaExternalLinkAlt, FaWallet, FaHandHoldingHeart } from 'react-icons/fa';
import { charityService, Campaign } from '../../../../services/supabase/charityService';
import { toast } from 'react-toastify';
import { getTransactionExplorerUrl } from '../../../../services/blockchain/blockchainService';
import supabase from '../../../../services/supabase/supabaseClient';

interface TransactionData {
  id: string | number;
  date: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  donor?: string;
  vendor?: string;
  transactionHash?: string;
}

const CampaignTransactions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donationStats, setDonationStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isGeneralFund, setIsGeneralFund] = useState(false);

  // Fund allocation calculation
  const [fundAllocation, setFundAllocation] = useState({
    availableCampaignSpecific: 0,
    availableAlwaysDonate: 0,
    onHold: 0,
    used: 0,
  });

  const [generalFundAllocation, setGeneralFundAllocation] = useState({
    available: 0,
    onHold: 0,
    used: 0,
    total: 0
  });

  useEffect(() => {
    // Check if this is the general fund view
    const isGeneralFundView = location.pathname.includes('/general-fund/transactions');
    setIsGeneralFund(isGeneralFundView);

    const fetchCampaignData = async () => {
      try {
        setLoading(true);
        
        if (isGeneralFundView) {
          // Fetch general fund allocation data
          const allocation = await charityService.getGeneralFundAllocation();
          setGeneralFundAllocation(allocation);
          
          // Get current authenticated user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          
          // Fetch general fund donations
          const { data: generalFundDonations } = await supabase
            .from('campaign_donations')
            .select(`
              id,
              amount,
              is_anonymous,
              created_at,
              message,
              status,
              transaction_hash,
              user_id,
              users:user_id (
                id,
                name
              )
            `)
            .eq('charity_id', user.id)
            .is('campaign_id', null)
            .order('created_at', { ascending: false });
            
          // Fetch general fund expenses
          const { data: generalFundExpenses } = await supabase
            .from('campaign_expenses')
            .select(`
              id,
              amount,
              status,
              created_at,
              description,
              vendor_id,
              type
            `)
            .is('campaign_id', null)
            .not('description', 'ilike', '%Campaign%') // Filter out campaign-related expenses
            .not('type', 'eq', 'campaign') // Ensure only general fund expenses
            .order('created_at', { ascending: false });
            
          // Create donation transactions
          const donationTransactions = (generalFundDonations || []).map(donation => ({
            id: donation.id,
            date: new Date(donation.created_at).toISOString().split('T')[0],
            type: 'Donation',
            amount: donation.amount,
            status: donation.status,
            description: donation.message || 'General fund donation',
            donor: donation.is_anonymous ? 
              'Anonymous Donor' : 
              (donation.users && typeof donation.users === 'object' && 'name' in donation.users ? 
                String(donation.users.name) : 'Unknown Donor'),
            transactionHash: donation.transaction_hash || undefined
          }));
          
          // Create expense transactions
          const expenseTransactions = (generalFundExpenses || []).map(expense => ({
            id: expense.id,
            date: new Date(expense.created_at).toISOString().split('T')[0],
            type: expense.status === 'completed' ? 'General Fund Payment' : 'General Fund Expense',
            amount: expense.amount,
            status: expense.status,
            description: expense.description || 'General fund expense',
            vendor: expense.vendor_id ? `Vendor #${expense.vendor_id}` : 'Unknown Vendor'
          }));
          
          // Combine and sort all transactions by date (newest first)
          const allTransactions = [...donationTransactions, ...expenseTransactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
          // Get transaction hashes for donations
          const { data: transactionHashes } = await supabase
            .from('campaign_donations')
            .select('id, transaction_hash')
            .is('campaign_id', null);
            
          // Create a map of donation IDs to transaction hashes
          const donationHashMap: Record<string, string> = {};
          if (transactionHashes) {
            transactionHashes.forEach(donation => {
              if (donation.transaction_hash) {
                donationHashMap[donation.id] = donation.transaction_hash;
              }
            });
          }
          
          // Add transaction hashes to donation transactions
          const enhancedTransactions = allTransactions.map(transaction => {
            if (transaction.type === 'Donation' && donationHashMap[transaction.id]) {
              return {
                ...transaction,
                transactionHash: donationHashMap[transaction.id]
              };
            }
            return transaction;
          });
          
          // Set transactions
          setTransactions(enhancedTransactions);
          
          // Set a dummy campaign for title and header
          setCampaign({
            id: 'general-fund',
            charity_id: '',
            title: 'General Fund',
            description: 'Unrestricted charitable fund',
            target_amount: 0,
            current_amount: allocation.total, // Use total from allocation
            status: 'active',
            created_at: '',
            deadline: ''
          });
        } else if (id) {
          // Regular campaign flow
          // Fetch campaign data
          const campaignData = await charityService.getCampaignById(id);
          setCampaign(campaignData);
          
          // Fetch donation statistics
          const stats = await charityService.getCampaignDonationStats(id);
          setDonationStats(stats);
          
          // Fetch transactions and fund allocation from service
          const { transactions: serviceTransactions, fundAllocation: campaignFundAllocation } = 
            await charityService.getCampaignTransactions(id);
          
          // Fetch donation hashes directly for donation transactions
          const { data: donationsData } = await supabase
            .from('campaign_donations')
            .select('id, transaction_hash')
            .eq('campaign_id', id);
          
          // Create a map of donation IDs to transaction hashes
          const donationHashMap: Record<string, string> = {};
          if (donationsData) {
            donationsData.forEach(donation => {
              if (donation.transaction_hash) {
                donationHashMap[donation.id] = donation.transaction_hash;
              }
            });
          }
          
          // Add transaction hashes to the service transactions
          const enhancedTransactions = serviceTransactions.map(transaction => {
            // Only add transactionHash for donation transactions
            if (transaction.type === 'Donation' && donationHashMap[transaction.id]) {
              return {
                ...transaction,
                transactionHash: donationHashMap[transaction.id]
              };
            }
            return transaction;
          });
          
          // Set the enhanced transactions
          setTransactions(enhancedTransactions);
          setFundAllocation(campaignFundAllocation);
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        toast.error('Failed to load transaction data');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [id, location.pathname]);

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

  // Shorten transaction hash for display
  const shortenHash = (hash?: string) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  // Calculate angles for donut chart
  const calculateDonutChartProps = () => {
    if (isGeneralFund) {
      // For general fund
      const total = generalFundAllocation.total || 1; // Avoid division by zero
      
      const availablePercentage = (generalFundAllocation.available / total) * 100;
      const onHoldPercentage = (generalFundAllocation.onHold / total) * 100;
      const usedPercentage = (generalFundAllocation.used / total) * 100;
      
      // Calculate the circumference
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      
      // Calculate stroke-dasharray values
      const availableDash = `${(availablePercentage / 100) * circumference} ${circumference}`;
      const onHoldDash = `${(onHoldPercentage / 100) * circumference} ${circumference}`;
      const usedDash = `${(usedPercentage / 100) * circumference} ${circumference}`;
      
      // Calculate stroke-dashoffset values
      const usedOffset = "0";
      const onHoldOffset = `${-(usedPercentage / 100) * circumference}`;
      const availableOffset = `${-((usedPercentage + onHoldPercentage) / 100) * circumference}`;
      
      return {
        percentages: {
          available: availablePercentage,
          onHold: onHoldPercentage,
          used: usedPercentage
        },
        dashArrays: {
          available: availableDash,
          onHold: onHoldDash,
          used: usedDash
        },
        offsets: {
          available: availableOffset,
          onHold: onHoldOffset,
          used: usedOffset
        }
      };
    } else {
      // For campaign funds
      return {
        percentages: {
          availableCampaignSpecific: percentages.availableCampaignSpecific,
          availableAlwaysDonate: percentages.availableAlwaysDonate,
          onHold: percentages.onHold,
          used: percentages.used,
          remaining: percentages.remaining,
          // Add these properties to make both return types compatible
          available: 0,
        },
        dashArrays: {
          availableCampaignSpecific: calculateStrokeDash(percentages.availableCampaignSpecific),
          availableAlwaysDonate: calculateStrokeDash(percentages.availableAlwaysDonate),
          onHold: calculateStrokeDash(percentages.onHold),
          used: calculateStrokeDash(percentages.used)
        },
        offsets: {
          availableCampaignSpecific: availableCampaignSpecificOffset,
          availableAlwaysDonate: availableAlwaysDonateOffset,
          onHold: onHoldOffset,
          used: usedOffset
        }
      };
    }
  };

  // Initialize donut chart properties
  const donutProps = calculateDonutChartProps();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/charity-management?tab=funds')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back to Fund Management"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{campaign?.title}</h1>
            <p className="text-gray-600">Transaction History</p>
          </div>
        </div>
        {!isGeneralFund && (
          <button
            onClick={() => navigate(`/charity/${id}`)}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 text-sm"
            aria-label="View Campaign Details"
          >
            <FaExternalLinkAlt />
            <span>View Campaign Details</span>
          </button>
        )}
      </div>

      {/* Fund Allocation Donut Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isGeneralFund ? 'General Fund Allocation' : 'Campaign Fund Allocation'}
        </h2>
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
              
              {isGeneralFund ? (
                // General Fund Donut Chart
                <>
                  {/* Used Funds (Red) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="16"
                    strokeDasharray={donutProps.dashArrays.used}
                    strokeDashoffset={donutProps.offsets.used}
                  />
                  
                  {/* On Hold (Yellow) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="16"
                    strokeDasharray={donutProps.dashArrays.onHold}
                    strokeDashoffset={donutProps.offsets.onHold}
                  />
                  
                  {/* Available Funds (Green) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="16"
                    strokeDasharray={donutProps.dashArrays.available}
                    strokeDashoffset={donutProps.offsets.available}
                  />
                </>
              ) : (
                // Campaign Fund Donut Chart
                <>
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
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                RM{isGeneralFund ? 
                  generalFundAllocation.total.toLocaleString() : 
                  totalFunds.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">
                {isGeneralFund ? 'Total Funds' : `of RM${totalTarget.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-4 mt-6 md:mt-0">
            {isGeneralFund ? (
              // General Fund Legend
              <>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
                  <div>
                    <p className="font-medium text-gray-800">Available Fund</p>
                    <p className="text-sm text-gray-600">
                      RM{generalFundAllocation.available.toLocaleString()} 
                      ({donutProps.percentages.available.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#FBBF24]"></div>
                  <div>
                    <p className="font-medium text-gray-800">On Hold</p>
                    <p className="text-sm text-gray-600">
                      RM{generalFundAllocation.onHold.toLocaleString()} 
                      ({donutProps.percentages.onHold.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#EF4444]"></div>
                  <div>
                    <p className="font-medium text-gray-800">Used Funds</p>
                    <p className="text-sm text-gray-600">
                      RM{generalFundAllocation.used.toLocaleString()} 
                      ({donutProps.percentages.used.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // Campaign Fund Legend
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {isGeneralFund ? (
              <FaWallet className="text-blue-600" />
            ) : (
              <FaHandHoldingHeart className="text-green-600" />
            )}
            <h2 className="text-lg font-semibold text-gray-800">
              {isGeneralFund ? 'General Fund Transaction History' : 'Campaign Transaction History'}
            </h2>
          </div>
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
                        {transaction.type === 'Donation' ? 'Donation Received' : 
                         transaction.type === 'General Fund Payment' ? 'General Fund Payment' :
                         transaction.type === 'General Fund Expense' ? 'General Fund Expense' :
                         transaction.type === 'Vendor Payment' ? 'Campaign Expense' :
                         'Campaign Expense'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transaction.type === 'Donation' ? 
                          `From ${transaction.donor || 'Anonymous'}` : 
                          transaction.description}
                      </p>
                      {transaction.transactionHash && (
                        <p className="text-xs text-gray-500 mt-1">
                          TX: {shortenHash(transaction.transactionHash)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.type === 'Donation' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'Donation' ? '+' : '-'}RM{transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                    {transaction.transactionHash && transaction.type === 'Donation' && (
                      <a
                        href={getTransactionExplorerUrl(transaction.transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center justify-end gap-1 text-blue-600 hover:underline mt-1"
                      >
                        Verify <FaExternalLinkAlt className="text-xs" />
                      </a>
                    )}
                    {/* Link to a dummy page if no hash or not a donation */}
                    {!(transaction.transactionHash && transaction.type === 'Donation') && (
                      <a
                        href="/#" // Link to a dummy/placeholder route
                        className="text-xs flex items-center justify-end gap-1 text-gray-500 hover:text-gray-700 hover:underline mt-1 " // Style as a less prominent link, cursor indicates help/info
                      >
                        Verify <FaExternalLinkAlt className="text-xs" />
                      </a>
                    )}
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