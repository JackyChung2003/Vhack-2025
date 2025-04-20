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
import { mockCampaigns, mockOrganizations } from "../../../../utils/mockData";
import AddCampaignModal from "../../../../components/modals/AddCampaignModal";
import { charityService } from "../../../../services/supabase/charityService";
import { toast } from "react-toastify";

// Mock current charity organization ID (Global Relief)
const CURRENT_CHARITY_ORG_ID = 1;

const CharityHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  
  // Get the current organization
  const currentOrganization = mockOrganizations.find(org => org.id === CURRENT_CHARITY_ORG_ID);
  
  // Filter campaigns to only show those belonging to the current charity organization
  const organizationCampaigns = mockCampaigns.filter(
    campaign => campaign.organizationId === CURRENT_CHARITY_ORG_ID
  );

  // Calculate statistics
  const activeCampaigns = organizationCampaigns.filter(campaign => 
    new Date(campaign.deadline) > new Date() && campaign.currentContributions < campaign.goal
  ).length;

  // Calculate total raised from campaigns
  const campaignFundsRaised = organizationCampaigns.reduce(
    (sum, campaign) => sum + campaign.currentContributions, 0
  );

  // Get general fund from organization data
  const generalFundBalance = currentOrganization?.totalRaised || 0;

  const supporters = Math.floor(generalFundBalance / 500); // Rough estimate of supporters

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
      window.dispatchEvent(new CustomEvent('refreshCampaigns'));
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      toast.error(err.message || "Failed to create campaign. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-[var(--background)] text-[var(--paragraph)] max-w-7xl mx-auto min-h-screen">
      {/* Welcome Header */}
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
              Welcome, {currentOrganization?.name || "Charity Organization"}
            </h1>
          </div>
          <p className="mt-3 opacity-90 max-w-2xl">
            Your centralized dashboard for managing campaigns, funds, and vendor relationships.
          </p>
          <div className="flex mt-6 gap-4">
            <button 
              onClick={() => handleNavigate("/charity-management")}
              className="flex items-center gap-2 bg-white text-[var(--highlight)] px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-md"
            >
              <FaChartLine size={14} /> Management Portal
            </button>
            <button 
              onClick={() => handleNavigate("/Vhack-2025/charity/vendor-page")}
              className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-30 transition-all"
            >
              <FaUserFriends size={14} /> Vendor Portal
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Overview */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <StatCard 
          icon={<FaMoneyBillWave className="text-green-500" />} 
          title="Total Funds" 
          value={`RM${(generalFundBalance + campaignFundsRaised).toLocaleString()}`}
          onClick={() => handleNavigate("/charity-management?tab=funds")}
          colorClass="from-green-50 to-green-100"
          iconBg="bg-green-100"
          badge="Finance"
        />
        <StatCard 
          icon={<FaHandHoldingHeart className="text-blue-500" />} 
          title="Active Campaigns" 
          value={activeCampaigns.toString()}
          onClick={() => handleNavigate("/charity-management")}
          colorClass="from-blue-50 to-blue-100"
          iconBg="bg-blue-100"
          badge={activeCampaigns > 2 ? "Growing" : "Active"}
        />
        <StatCard 
          icon={<FaUsers className="text-purple-500" />} 
          title="Supporters" 
          value={supporters.toString()}
          onClick={() => handleNavigate("/Vhack-2025/charity/profile")}
          colorClass="from-purple-50 to-purple-100"
          iconBg="bg-purple-100"
          badge="Community"
        />
        <StatCard 
          icon={<FaComments className="text-yellow-500" />} 
          title="Vendor Messages" 
          value={pendingVendorChats.toString()}
          onClick={() => handleNavigate("/Vhack-2025/charity/vendor-page?tab=chats")}
          colorClass="from-yellow-50 to-yellow-100"
          iconBg="bg-yellow-100"
          badge={pendingVendorChats > 0 ? "Unread" : "Clear"}
        />
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Financial Information */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Fund Summary */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors duration-300">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3 group-hover:bg-opacity-20 transition-all duration-300">
                  <FaMoneyBillWave className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Fund Summary</h2>
              </div>
              <button 
                onClick={() => handleNavigate("/charity-management?tab=funds")}
                className="flex items-center gap-1 text-sm text-[var(--highlight)] hover:underline group"
              >
                View Details <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            <div className="p-5 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 hover:from-blue-50/30 hover:to-blue-100/20 transition-all duration-300">
              {/* Legend moved to top and aligned horizontally */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center hover:scale-105 transition-transform duration-300">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                    <span className="text-sm font-medium">General Fund</span>
                  </div>
                  <div className="flex items-center hover:scale-105 transition-transform duration-300">
                    <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                    <span className="text-sm font-medium">Campaign Fund</span>
                  </div>
                </div>
              </div>
              {/* Fund allocation donut chart */}
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-2">
                  {(() => {
                    const total = generalFundBalance + campaignFundsRaised;
                    const generalPercentage = (generalFundBalance / total) * 100 || 0;
                    
                    // Calculate the circumference of the circle
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius;
                    
                    // Calculate the stroke dasharray and offset
                    const generalStrokeDasharray = `${(generalPercentage * circumference) / 100} ${circumference}`;
                    const campaignStrokeDasharray = `${((100 - generalPercentage) * circumference) / 100} ${circumference}`;
                    
                    return (
              <div className="relative">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="10"
                          />
                          {/* General Fund (Blue) */}
                          <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="10"
                            strokeDasharray={generalStrokeDasharray}
                            strokeDashoffset="0"
                            className="transition-all duration-500"
                          />
                          {/* Campaign Fund (Green) */}
                          <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="10"
                            strokeDasharray={campaignStrokeDasharray}
                            strokeDashoffset={`${-(generalPercentage * circumference) / 100}`}
                            className="transition-all duration-500"
                          />
                        </svg>
                        {/* Fund amounts */}
                        <div className="absolute top-1/4 -left-16 transform -translate-y-1/2 text-right">
                          <span className="text-sm font-medium text-[#10b981]">RM{campaignFundsRaised.toLocaleString()}</span>
              </div>
                        <div className="absolute bottom-1/4 -right-16 transform translate-y-1/2 text-left">
                          <span className="text-sm font-medium text-[#3b82f6]">RM{generalFundBalance.toLocaleString()}</span>
              </div>
                      </div>
                    );
                  })()}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--headline)]">RM{(generalFundBalance + campaignFundsRaised).toLocaleString()}</span>
                    <span className="text-sm text-[var(--paragraph)]">Total Funds</span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <FaArrowUp className="mr-1" /> 12% increase from last month
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors duration-300">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3 group-hover:bg-opacity-20 transition-all duration-300">
                  <FaExchangeAlt className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Recent Transactions</h2>
              </div>
              <button 
                onClick={() => handleNavigate("/charity-management")}
                className="flex items-center gap-1 text-sm text-[var(--highlight)] hover:underline group"
              >
                View All <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 hover:from-blue-50/30 hover:to-blue-100/20 transition-all duration-300">
              <div className="space-y-4">
                {/* Mock recent transactions */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm hover:shadow-md transition-all">
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
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white to-red-50 rounded-lg shadow-sm hover:shadow-md transition-all">
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

        {/* Right Column - Campaigns and Activities */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Active Campaigns */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors duration-300">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3 group-hover:bg-opacity-20 transition-all duration-300">
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
            <div className="p-4 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 hover:from-blue-50/30 hover:to-blue-100/20 transition-all duration-300">
                <div className="space-y-4">
                  {organizationCampaigns.slice(0, 3).map((campaign, index) => {
                    const progress = Math.min(100, (campaign.currentContributions / campaign.goal) * 100);
                    return (
                    <div 
                        key={campaign.id}
                      className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
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
                              <h3 className="font-medium text-[var(--headline)]">{campaign.name}</h3>
                              <div className="flex items-center text-xs text-[var(--paragraph)] mt-1">
                                <FaCalendarAlt className="mr-1" />
                                <span>Ends: {new Date(campaign.deadline).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        <div className="text-right">
                          <p className="font-bold text-[var(--headline)]">
                            RM{campaign.currentContributions.toLocaleString()}
                          </p>
                          <p className="text-xs text-[var(--paragraph)]">
                            of RM{campaign.goal.toLocaleString()}
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
                  })}
                </div>
            </div>
          </div>
          
          {/* Monthly Donation Trends */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors duration-300">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3 group-hover:bg-opacity-20 transition-all duration-300">
                  <FaChartLine className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Monthly Donation Trends</h2>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 hover:from-blue-50/30 hover:to-blue-100/20 transition-all duration-300">
              <div className="flex justify-between items-end h-40">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-24 bg-blue-500 rounded-t-lg"></div>
                  <p className="text-xs mt-2">2025-01</p>
                  <p className="text-xs font-medium">RM48,000</p>
                      </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-32 bg-blue-500 rounded-t-lg"></div>
                  <p className="text-xs mt-2">2025-02</p>
                  <p className="text-xs font-medium">RM52,000</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-28 bg-blue-500 rounded-t-lg"></div>
                  <p className="text-xs mt-2">2025-03</p>
                  <p className="text-xs font-medium">RM45,000</p>
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

// StatCard component
const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  onClick: () => void;
  colorClass: string;
  iconBg: string;
  badge: string;
}> = ({ icon, title, value, onClick, colorClass, iconBg, badge }) => (
    <motion.div 
    whileHover={{ y: -5 }}
    className={`bg-gradient-to-br ${colorClass} rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer`}
      onClick={onClick}
    >
    <div className="flex justify-between items-start">
      <div className={`${iconBg} p-2 rounded-lg`}>
        {icon}
      </div>
      <span className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full">
        {badge}
      </span>
    </div>
    <div className="mt-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </motion.div>
  );

export default CharityHomePage;