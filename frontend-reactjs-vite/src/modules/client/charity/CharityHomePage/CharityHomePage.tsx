import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaHandHoldingHeart, 
  FaChartLine, 
  FaUserCircle, 
  FaComments, 
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUsers,
  FaShoppingCart,
  FaExchangeAlt,
  FaBullhorn,
  FaPlus,
  FaSearch,
  FaGlobe,
  FaChartPie,
  FaAward,
  FaArrowRight,
  FaInfoCircle,
  FaTrophy,
  FaMapMarkerAlt,
  FaArrowUp,
  FaFilter,
  FaUserFriends,
  FaWallet
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AddCampaignModal from "../../../../components/modals/AddCampaignModal";
import { charityService, Campaign, CharityProfile } from "../../../../services/supabase/charityService";
import { toast } from "react-toastify";
import supabase from '../../../../services/supabase/supabaseClient';

// Define a date formatter function since we don't have date-fns
const formatDate = (date: Date, format: string): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (format === 'yyyy-MM') {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  } else if (format === 'MMM yyyy') {
    return `${months[month]} ${year}`;
  }
  return '';
};

const CharityHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [charityProfile, setCharityProfile] = useState<CharityProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [generalFundBalance, setGeneralFundBalance] = useState(0);
  const [campaignFundsRaised, setCampaignFundsRaised] = useState(0);
  const [fundingLoading, setFundingLoading] = useState(true);
  const [monthlyDonations, setMonthlyDonations] = useState<{month: string; amount: number}[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  
  // Fetch profile when component mounts
  useEffect(() => {
    fetchCharityProfile();
  }, []);
  
  // Fetch campaigns when component mounts
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch funding data when charity profile is loaded
  useEffect(() => {
    if (charityProfile) {
      fetchFundingData();
    }
  }, [charityProfile]);

  // Fetch monthly donations data
  useEffect(() => {
    if (charityProfile) {
      fetchMonthlyDonations();
    }
  }, [charityProfile]);

  const fetchCharityProfile = async () => {
    try {
      setProfileLoading(true);
      const profileData = await charityService.getCharityProfile();
      setCharityProfile(profileData);
    } catch (err: any) {
      console.error("Error fetching charity profile:", err);
      // Don't set error state here to avoid showing error in UI
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const campaignsData = await charityService.getCharityCampaigns();
      setCampaigns(campaignsData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching campaigns:", err);
      setError(err.message || "Failed to load campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFundingData = async () => {
    try {
      setFundingLoading(true);
      
      if (!charityProfile) return;

      // Get general fund (donations where campaign_id is null)
      const generalFundData = await charityService.getCharityGeneralFund(charityProfile.id);
      setGeneralFundBalance(generalFundData.totalAmount);

      // Calculate campaign funds (sum of all campaign donations)
      const campaignTotal = campaigns.reduce((total, campaign) => total + (campaign.current_amount || 0), 0);
      setCampaignFundsRaised(campaignTotal);

    } catch (err) {
      console.error("Error fetching funding data:", err);
      // Don't set error state to avoid showing error in UI
    } finally {
      setFundingLoading(false);
    }
  };

  // Fetch monthly donations data
  const fetchMonthlyDonations = async () => {
    try {
      setDonationsLoading(true);
      
      if (!charityProfile) return;

      // Get current date and calculate dates for last 3 months
      const now = new Date();
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(formatDate(date, 'yyyy-MM'));
      }

      // Create an array to hold monthly data
      const monthlyData: {month: string; amount: number}[] = [];

      // For each month, calculate total donations (both campaign and general)
      for (const month of months) {
        const startDate = `${month}-01`;
        const endMonth = month.split('-')[1];
        const endYear = month.split('-')[0];
        // Calculate last day of month (accounting for different month lengths)
        const lastDay = new Date(parseInt(endYear), parseInt(endMonth), 0).getDate();
        const endDate = `${month}-${lastDay}`;

        // Get ALL donations for this month (both campaign donations and general fund donations)
        // We don't filter by campaign_id, so we get all donations to the charity
        const { data: allDonations, error: donationsError } = await supabase
          .from('campaign_donations')
          .select('amount, created_at')
          .eq('charity_id', charityProfile.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);

        if (donationsError) {
          console.error("Error fetching donations:", donationsError);
          continue;
        }

        // Calculate total amount for this month (all donations)
        const totalAmount = allDonations?.reduce((sum: number, donation: {amount: number}) => 
          sum + donation.amount, 0) || 0;
        
        // Format month for display
        const displayMonth = formatDate(new Date(month + '-01'), 'MMM yyyy');
        
        // Add to monthly data
        monthlyData.push({
          month: displayMonth,
          amount: totalAmount
        });
      }

      setMonthlyDonations(monthlyData);
    } catch (err) {
      console.error("Error fetching monthly donations:", err);
    } finally {
      setDonationsLoading(false);
    }
  };

  // Calculate statistics
  const activeCampaigns = campaigns.filter(campaign => 
    campaign.status === 'active'
  ).length;

  // Get general fund from organization data
  const supporters = Math.floor(campaignFundsRaised / 500); // Rough estimate of supporters

  // Mock data for vendor activity
  const pendingVendorChats = 3;
  const recentTransactions = 2;

  // Navigation handlers
  const handleNavigate = (path: string) => {
    if (path === "/create-campaign") {
      setShowAddCampaignModal(true);
    } else {
      navigate(path);
    }
  };

  // Handle creating a new campaign
  const handleSaveCampaign = async (campaignData: FormData) => {
    try {
      await charityService.createCampaign(campaignData);
      toast.success("Campaign created successfully!");
      setShowAddCampaignModal(false);
      // Refresh campaigns
      fetchCampaigns();
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      toast.error(err.message || "Failed to create campaign. Please try again.");
    }
  };

  // Get the latest 3 active campaigns
  const latestActiveCampaigns = campaigns
    .filter(campaign => campaign.status === 'active')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Helper function to determine bar height based on amount
  const getBarHeight = (amount: number, maxAmount: number) => {
    if (maxAmount <= 0) return 20; // Minimum height if no donations
    // Scale height between 40px and 200px
    return Math.max(40, Math.min(200, (amount / maxAmount) * 180 + 20));
  };

  return (
    <div className="p-6 bg-[var(--background)] text-[var(--paragraph)] max-w-7xl mx-auto min-h-screen">
      {/* Header with gradient background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] rounded-xl p-8 mb-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white opacity-5 z-0">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center">
            <FaGlobe className="text-white opacity-80 mr-3 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold">
              {profileLoading ? "Welcome" : `Welcome, ${charityProfile?.name || "Charity"}`}
            </h1>
          </div>
          <div className="flex items-start mt-3">
            <div className="min-w-4 h-4 rounded-full bg-blue-500 mr-2 mt-1"></div>
            <p className="opacity-90 text-white">
              <span className="font-medium">About {charityProfile?.name || "Global Relief"}</span>{" "}
              {charityProfile?.description || 
               "Global Relief is a Malaysia-based humanitarian organization committed to providing rapid and compassionate aid to communities affected by disasters, poverty, and health crises. We work across the country to deliver clean water, food, medical support, and education resources—reaching those who need it most, when they need it most."}
            </p>
          </div>
          <div className="flex mt-6 gap-3">
            <button 
              onClick={() => handleNavigate("/charity-management")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all"
            >
              <FaChartLine size={14} /> Management Portal
            </button>
            <button 
              onClick={() => handleNavigate("/Vhack-2025/charity/vendor-page")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all"
            >
              <FaUserFriends size={14} /> Vendor Portal
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-gray-600">Finance</div>
            <FaMoneyBillWave className="text-green-500" />
                </div>
          <div className="mt-2">
            <div className="text-gray-800 font-bold text-2xl">RM{(generalFundBalance + campaignFundsRaised).toLocaleString()}</div>
            <div className="text-gray-700 text-sm">Total Funds</div>
                </div>
              </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-gray-600">Growing</div>
            <FaHandHoldingHeart className="text-blue-500" />
                        </div>
          <div className="mt-2">
            <div className="text-gray-800 font-bold text-2xl">{activeCampaigns}</div>
            <div className="text-gray-700 text-sm">Active Campaigns</div>
                        </div>
                      </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-gray-600">Community</div>
            <FaUsers className="text-purple-500" />
                  </div>
          <div className="mt-2">
            <div className="text-gray-800 font-bold text-2xl">{supporters}</div>
            <div className="text-gray-700 text-sm">Supporters</div>
                </div>
              </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-gray-600">Unread</div>
            <FaComments className="text-yellow-500" />
          </div>
          <div className="mt-2">
            <div className="text-gray-800 font-bold text-2xl">{pendingVendorChats}</div>
            <div className="text-gray-700 text-sm">Vendor Messages</div>
              </div>
            </div>
          </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Campaigns and Trends */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Active Campaigns */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3">
                  <FaHandHoldingHeart className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Active Campaigns</h2>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleNavigate("/charity-management")}
                  className="flex items-center gap-1 text-sm text-[var(--highlight)] hover:underline group"
                >
                  View All <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => handleNavigate("/create-campaign")}
                  className="flex items-center gap-1 px-3 py-1 bg-[var(--highlight)] text-white rounded-lg text-sm hover:bg-opacity-90 transition-all"
                >
                  <FaPlus size={12} /> New
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)]"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    {error}
                  </div>
                ) : latestActiveCampaigns.length > 0 ? (
                  latestActiveCampaigns.map((campaign) => {
                    const progress = Math.min(100, (campaign.current_amount / campaign.target_amount) * 100);
                  return (
                    <div 
                      key={campaign.id}
                        className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleNavigate(`/campaign/${campaign.id}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          {progress >= 75 ? (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <FaTrophy className="text-green-600" />
                            </div>
                          ) : progress >= 50 ? (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <FaChartLine className="text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                              <FaHandHoldingHeart className="text-yellow-600" />
                            </div>
                          )}
                          <div>
                              <h3 className="font-medium text-[var(--headline)]">{campaign.title}</h3>
                            <div className="flex items-center text-xs text-[var(--paragraph)] mt-1">
                              <FaCalendarAlt className="mr-1" />
                              <span>Ends: {new Date(campaign.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[var(--headline)]">
                              RM{campaign.current_amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-[var(--paragraph)]">
                              of RM{campaign.target_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            progress >= 75 ? 'bg-green-500' : 
                            progress >= 50 ? 'bg-blue-500' : 
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[var(--paragraph)]">No active campaigns found.</p>
                    <button
                      onClick={() => handleNavigate("/create-campaign")}
                      className="mt-4 px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-all"
                    >
                      Create Your First Campaign
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Donation */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3">
                  <FaChartLine className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Monthly Donation (General Fund)</h2>
              </div>
            </div>
            <div className="p-8">
              {donationsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)]"></div>
                </div>
              ) : monthlyDonations.length > 0 ? (
                <div className="flex flex-col h-64">
                  <div className="flex justify-between items-end h-64">
                    {monthlyDonations.map((data, index) => {
                      const maxAmount = Math.max(...monthlyDonations.map(d => d.amount));
                      const barHeight = getBarHeight(data.amount, maxAmount);
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-24 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 ease-in-out shadow-md hover:from-blue-700 hover:to-blue-500 hover:scale-105 hover:shadow-lg cursor-pointer transform-gpu"
                            style={{ height: `${barHeight}px` }}
                          >
                            {/* Tooltip on hover */}
                            <div className="opacity-0 hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap transition-opacity duration-200">
                              RM{data.amount.toLocaleString()}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-col items-center">
                            <p className="text-sm font-medium text-gray-600">{data.month}</p>
                            <p className="text-sm font-bold text-[var(--headline)]">RM{data.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  <p>No donation data available for the last three months.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Fund Summary and Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Fund Summary Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#FDB022] rounded-lg"></div>
                <h2 className="text-xl font-semibold text-[var(--headline)]">Fund Summary</h2>
              </div>
              <button 
                onClick={() => handleNavigate("/charity-management?tab=funds")}
                className="text-[#FF784D] hover:text-[#FF784D]/90 font-medium flex items-center gap-1"
              >
                View Details <FaArrowRight size={12} />
              </button>
            </div>
            <div className="p-6">
                <div className="flex flex-col items-center">
                {fundingLoading ? (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)]"></div>
                  </div>
                ) : (
                  <>
                    <div className="relative w-48 h-48 mb-6">
                      {(() => {
                        const totalFunds = generalFundBalance + campaignFundsRaised;
                        const generalPercentage = totalFunds > 0 ? (generalFundBalance / totalFunds) * 100 : 0;
                        const campaignPercentage = totalFunds > 0 ? (campaignFundsRaised / totalFunds) * 100 : 0;
                        const circumference = 2 * Math.PI * 40;
                        
                        // Calculate the dash offsets for both sections
                        const generalDash = (generalPercentage / 100) * circumference;
                        const campaignDash = (campaignPercentage / 100) * circumference;
                        
                        return (
                          <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="12"
                            />
                            {/* General Fund circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#2563EB"
                              strokeWidth="12"
                              strokeDasharray={`${generalDash} ${circumference}`}
                              className="transition-all duration-1000 ease-in-out"
                            />
                            {/* Campaign Fund circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#22C55E"
                              strokeWidth="12"
                              strokeDasharray={`${campaignDash} ${circumference}`}
                              strokeDashoffset={-generalDash}
                              className="transition-all duration-1000 ease-in-out"
                            />
                          </svg>
                        );
                      })()}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[#1B4B43]">
                          RM{(generalFundBalance + campaignFundsRaised).toLocaleString()}
                        </span>
                        <span className="text-sm text-[#475467]">Total Funds</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#2563EB] mr-2"></div>
                          <span className="text-sm text-[#475467]">General Fund: <span className="text-[#1B4B43] font-medium">RM{generalFundBalance.toLocaleString()}</span></span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#22C55E] mr-2"></div>
                          <span className="text-sm text-[#475467]">Campaign Fund: <span className="text-[#1B4B43] font-medium">RM{campaignFundsRaised.toLocaleString()}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-[#22C55E] font-medium">
                        <FaArrowUp className="mr-1" /> 12% increase from last month
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3">
                  <FaExchangeAlt className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Recent Transactions</h2>
              </div>
              <button 
                onClick={() => handleNavigate("/charity-management")}
                className="flex items-center gap-1 text-sm text-[var(--highlight)] hover:underline"
              >
                View All <FaArrowRight size={12} />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <FaMoneyBillWave className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--headline)]">Donation Received</p>
                      <p className="text-xs text-[var(--paragraph)]">From John Doe</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+RM5,000</p>
                    <p className="text-xs text-[var(--paragraph)]">2025-03-20</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <FaShoppingCart className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--headline)]">Campaign Expense</p>
                      <p className="text-xs text-[var(--paragraph)]">Clean Water Initiative</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">-RM2,500</p>
                    <p className="text-xs text-[var(--paragraph)]">2025-03-18</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Campaign Modal */}
      <AnimatePresence>
        {showAddCampaignModal && (
          <AddCampaignModal
            onClose={() => setShowAddCampaignModal(false)}
            onSave={handleSaveCampaign}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharityHomePage;