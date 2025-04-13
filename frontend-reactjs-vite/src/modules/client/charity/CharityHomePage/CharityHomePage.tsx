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

  // Animation variants for staggered child animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2 
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-[var(--background)] text-[var(--paragraph)] min-h-screen"
    >
      {/* AddCampaignModal */}
      {showAddCampaignModal && (
        <AddCampaignModal 
          onClose={() => setShowAddCampaignModal(false)}
          onSave={handleSaveCampaign}
        />
      )}
      
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
            Your centralized dashboard for managing campaigns, funds, and vendor relationships. Track progress, connect with vendors, and make a difference.
          </p>
          <div className="flex mt-6 gap-4">
            <button 
              onClick={() => handleNavigate("/create-campaign")}
              className="flex items-center gap-2 bg-white text-[var(--highlight)] px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-md"
            >
              <FaPlus size={14} /> New Campaign
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
          onClick={() => handleNavigate("/charity-management")}
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

      {/* Main Dashboard Grid - Reorganized into 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Financial Information */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Fund Summary */}
          <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden hover:shadow-lg transition-all">
            <div className="p-4 border-b border-[var(--stroke)] flex justify-between items-center bg-gradient-to-r from-[var(--background)] to-[var(--main)]">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3">
                  <FaMoneyBillWave className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Fund Summary</h2>
              </div>
              <button 
                onClick={() => handleNavigate("/charity-management")}
                className="flex items-center gap-1 text-sm text-[var(--highlight)] hover:underline"
              >
                View Details <FaArrowRight size={12} />
              </button>
            </div>
            <div className="p-5">
              {/* Total funds overview */}
              <div className="mb-4 p-3 bg-[var(--background)] bg-opacity-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[var(--paragraph)]">Total Available Funds</span>
                  <span className="text-sm font-medium text-[var(--highlight)]">Combined Balance</span>
                </div>
                <div className="text-3xl font-bold text-[var(--headline)] mb-1">
                  RM{(generalFundBalance + campaignFundsRaised).toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <FaArrowUp className="mr-1" /> 12% increase from last month
                </div>
              </div>
              
              <div className="space-y-4">
                {/* General Fund */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)] hover:border-blue-300 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <FaWallet className="text-blue-600" />
                      </div>
                      <h3 className="font-medium text-[var(--headline)]">General Fund</h3>
                    </div>
                    <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                      <FaInfoCircle className="mr-1 text-xs" /> Unrestricted
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--headline)] mb-1">
                    RM{generalFundBalance.toLocaleString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[var(--paragraph)]">
                      Available for any charitable purpose
                    </p>
                    <button className="text-xs text-blue-600 hover:underline">Allocate Funds</button>
                  </div>
                </div>
                
                {/* Campaign Funds */}
                <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)] hover:border-green-300 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <FaHandHoldingHeart className="text-green-600" />
                      </div>
                      <h3 className="font-medium text-[var(--headline)]">Campaign Funds</h3>
                    </div>
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
                      <FaInfoCircle className="mr-1 text-xs" /> Restricted
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--headline)] mb-1">
                    RM{campaignFundsRaised.toLocaleString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[var(--paragraph)]">
                      Designated for specific campaigns
                    </p>
                    <button className="text-xs text-green-600 hover:underline">View Breakdown</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vendor Search */}
          <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden hover:shadow-lg transition-all">
            <div className="p-4 border-b border-[var(--stroke)] flex justify-between items-center bg-gradient-to-r from-[var(--background)] to-[var(--main)]">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3">
                  <FaSearch className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Find Vendors</h2>
              </div>
              <button 
                onClick={() => handleNavigate("/Vhack-2025/charity/vendor-page?tab=search")}
                className="flex items-center gap-1 text-sm text-[var(--highlight)] hover:underline"
              >
                Advanced Search <FaArrowRight size={12} />
              </button>
            </div>
            <div className="p-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vendors by name, location, or service..."
                  className="w-full p-3 pr-10 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] bg-[var(--background)]"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--paragraph)] p-1 hover:bg-[var(--highlight)] hover:bg-opacity-10 rounded-full transition-colors">
                  <FaSearch />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="flex items-center gap-1 px-3 py-2 bg-[var(--background)] rounded-full text-sm border border-[var(--stroke)] hover:border-[var(--highlight)] hover:text-[var(--highlight)] transition-colors">
                  <FaShoppingCart className="text-xs" /> Food Suppliers
                </button>
                <button className="flex items-center gap-1 px-3 py-2 bg-[var(--background)] rounded-full text-sm border border-[var(--stroke)] hover:border-[var(--highlight)] hover:text-[var(--highlight)] transition-colors">
                  <FaUserFriends className="text-xs" /> Medical Supplies
                </button>
                <button className="flex items-center gap-1 px-3 py-2 bg-[var(--background)] rounded-full text-sm border border-[var(--stroke)] hover:border-[var(--highlight)] hover:text-[var(--highlight)] transition-colors">
                  <FaExchangeAlt className="text-xs" /> Logistics
                </button>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-[var(--headline)] mb-2">Recommended Vendors</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] transition-all cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 text-xs font-medium">
                        RW
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--headline)]">Relief Waters</p>
                        <p className="text-xs text-[var(--paragraph)]">Clean Water</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] transition-all cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-2 text-xs font-medium">
                        GT
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--headline)]">Global Transit</p>
                        <p className="text-xs text-[var(--paragraph)]">Transport</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden hover:shadow-lg transition-all">
            <div className="p-4 border-b border-[var(--stroke)] flex justify-between items-center bg-gradient-to-r from-[var(--background)] to-[var(--main)]">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3">
                  <FaExchangeAlt className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Recent Transactions</h2>
              </div>
              <button 
                onClick={() => handleNavigate("/Vhack-2025/charity/vendor-page?tab=transactions")}
                className="flex items-center gap-1 text-sm text-[var(--highlight)] hover:underline"
              >
                View All <FaArrowRight size={12} />
              </button>
            </div>
            <div className="p-5">
              {recentTransactions > 0 ? (
                <div className="space-y-3">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-[var(--background)] rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          <FaShoppingCart />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--headline)]">Medical Supplies Co.</p>
                          <div className="flex items-center mt-1 text-xs text-[var(--paragraph)]">
                            <FaCalendarAlt className="mr-1" />
                            <span>Yesterday at 2:30 PM</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-red-500 block">-RM1,250.00</span>
                        <span className="text-xs text-[var(--paragraph)] bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">Purchase</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-dashed border-[var(--stroke)]">
                      <div className="flex justify-between items-center text-xs text-[var(--paragraph)]">
                        <span>Order #: MS-12345</span>
                        <button className="text-[var(--highlight)] hover:underline">View Details</button>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-4 bg-[var(--background)] rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <FaShoppingCart />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--headline)]">Food Distribution Inc.</p>
                          <div className="flex items-center mt-1 text-xs text-[var(--paragraph)]">
                            <FaCalendarAlt className="mr-1" />
                            <span>Oct 15, 2023 at 10:15 AM</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-red-500 block">-RM3,750.00</span>
                        <span className="text-xs text-[var(--paragraph)] bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">Purchase</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-dashed border-[var(--stroke)]">
                      <div className="flex justify-between items-center text-xs text-[var(--paragraph)]">
                        <span>Order #: FD-98765</span>
                        <button className="text-[var(--highlight)] hover:underline">View Details</button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <FaExchangeAlt className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-[var(--paragraph)]">No recent transactions</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Campaigns and Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Active Campaigns */}
          <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden hover:shadow-lg transition-all">
            <div className="p-4 border-b border-[var(--stroke)] flex justify-between items-center bg-gradient-to-r from-[var(--background)] to-[var(--main)]">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3">
                  <FaHandHoldingHeart className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Active Campaigns</h2>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleNavigate("/charity-management")}
                  className="flex items-center gap-1 text-sm text-[var(--highlight)] hover:underline"
                >
                  View All <FaArrowRight size={12} />
                </button>
                <button
                  onClick={() => handleNavigate("/create-campaign")}
                  className="flex items-center gap-1 px-3 py-1 bg-[var(--highlight)] text-white rounded-lg text-sm hover:bg-opacity-90 transition-all"
                >
                  <FaPlus size={12} /> New
                </button>
              </div>
            </div>
            <div className="p-5">
              {organizationCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {organizationCampaigns.slice(0, 3).map((campaign, index) => {
                    const progress = Math.min(100, (campaign.currentContributions / campaign.goal) * 100);
                    // Create a mock location property for demonstration purposes
                    const campaignLocation = campaign.id % 2 === 0 ? "Global" : "Local";
                    return (
                      <motion.div 
                        key={campaign.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        className="p-4 bg-[var(--background)] rounded-lg border border-[var(--stroke)] hover:shadow-md hover:border-[var(--highlight)] transition-all cursor-pointer"
                        onClick={() => handleNavigate(`/charity/${campaign.id}`)}
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
                          <div className="flex items-center">
                            <div className="flex items-center text-xs text-[var(--paragraph)] bg-gray-100 rounded-full px-2 py-1 mr-2">
                              <FaMapMarkerAlt className="mr-1" />
                              <span>{campaignLocation}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              progress >= 75 ? "bg-green-100 text-green-800" : 
                              progress >= 50 ? "bg-blue-100 text-blue-800" : 
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {progress >= 75 ? "Almost There" : progress >= 50 ? "On Track" : "Needs Support"}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                          <div 
                            className={`h-2.5 rounded-full ${
                              progress >= 75 ? "bg-green-500" : 
                              progress >= 50 ? "bg-blue-500" : 
                              "bg-yellow-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-[var(--paragraph)]">
                          <div className="flex items-center">
                            <FaMoneyBillWave className="mr-1" />
                            <span>RM{campaign.currentContributions.toLocaleString()} raised</span>
                          </div>
                          <div className="flex items-center font-medium">
                            <span>{Math.round(progress)}% of RM{campaign.goal.toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <FaHandHoldingHeart className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-[var(--paragraph)] mb-3">No active campaigns</p>
                  <button
                    onClick={() => handleNavigate("/create-campaign")}
                    className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-all"
                  >
                    Create Campaign
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Vendor Communications */}
          <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden hover:shadow-lg transition-all">
            <div className="p-4 border-b border-[var(--stroke)] flex justify-between items-center bg-gradient-to-r from-[var(--background)] to-[var(--main)]">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--highlight)] bg-opacity-10 mr-3">
                  <FaComments className="text-[var(--highlight)] text-xl" />
                </div>
                <h2 className="text-lg font-bold text-[var(--headline)]">Vendor Communications</h2>
              </div>
              <button 
                onClick={() => handleNavigate("/Vhack-2025/charity/vendor-page?tab=chats")}
                className="flex items-center gap-1 text-sm text-[var(--highlight)] hover:underline"
              >
                View All <FaArrowRight size={12} />
              </button>
            </div>
            <div className="p-5">
              {pendingVendorChats > 0 ? (
                <div className="space-y-3">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between items-center p-4 bg-[var(--background)] rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleNavigate("/Vhack-2025/charity/vendor-page?tab=chats&id=1")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        MS
                      </div>
                      <div>
                        <p className="font-medium text-[var(--headline)]">Medical Supplies Co.</p>
                        <p className="text-xs text-[var(--paragraph)] mt-1">Regarding your recent order #12345</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaCalendarAlt className="mr-1" />
                          <span>Today at 2:30 PM</span>
                        </div>
                      </div>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">New</span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex justify-between items-center p-4 bg-[var(--background)] rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleNavigate("/Vhack-2025/charity/vendor-page?tab=chats&id=2")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                        FD
                      </div>
                      <div>
                        <p className="font-medium text-[var(--headline)]">Food Distribution Inc.</p>
                        <p className="text-xs text-[var(--paragraph)] mt-1">Quote for emergency food supplies</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaCalendarAlt className="mr-1" />
                          <span>Yesterday at 10:15 AM</span>
                        </div>
                      </div>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">New</span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex justify-between items-center p-4 bg-[var(--background)] rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleNavigate("/Vhack-2025/charity/vendor-page?tab=chats&id=3")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                        TL
                      </div>
                      <div>
                        <p className="font-medium text-[var(--headline)]">Transport Logistics</p>
                        <p className="text-xs text-[var(--paragraph)] mt-1">Delivery schedule update</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaCalendarAlt className="mr-1" />
                          <span>Oct 18, 2023 at 3:45 PM</span>
                        </div>
                      </div>
                    </div>
                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Seen</span>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <FaComments className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-[var(--paragraph)]">No pending messages</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// StatCard component
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  onClick: () => void;
  colorClass: string;
  iconBg: string;
  badge: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, onClick, colorClass, iconBg, badge }) => {
  return (
    <motion.div 
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        borderColor: "var(--highlight)" 
      }}
      transition={{ duration: 0.2 }}
      className={`bg-gradient-to-br from-[var(--main)] to-[var(--background)] p-4 rounded-lg border border-[var(--stroke)] flex items-center gap-4 cursor-pointer transition-all ${colorClass}`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-[var(--paragraph)]">{title}</h3>
        <p className="text-xl font-bold text-[var(--headline)]">{value}</p>
        <span className="text-xs text-[var(--paragraph)]">{badge}</span>
      </div>
    </motion.div>
  );
};

export default CharityHomePage;