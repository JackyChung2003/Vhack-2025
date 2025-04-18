import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaHandHoldingHeart, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaChevronDown, 
  FaChevronUp, 
  FaTimes,
  FaGlobe,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaWallet,
  FaChartPie,
  FaInfoCircle,
  FaExchangeAlt,
  FaArrowRight,
  FaUsers,
  FaComments,
  FaBuilding,
  FaHistory,
  FaChartLine,
  FaTrophy,
  FaMapMarkerAlt,
  FaArrowUp,
  FaUserFriends,
  FaShoppingCart,
  FaBoxOpen,
  FaEnvelope,
  FaPhone,
  FaLink,
  FaTag,
  FaPercentage,
  FaArrowLeft
} from "react-icons/fa";
import { toast } from "react-toastify";
import { mockCampaigns, mockOrganizations, Campaign, mockDonationTrackers } from "../../../../utils/mockData";
import AddCampaignModal from "../../../../components/modals/AddCampaignModal";
import { motion, AnimatePresence } from "framer-motion";

// Mock current charity organization ID (Global Relief)
const CURRENT_CHARITY_ORG_ID = 1;

const CharityManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'deadline' | 'goal' | 'progress'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showFundDetails, setShowFundDetails] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'funds' | 'vendors' | 'supporters'>('campaigns');
  
  // Get the current organization
  const currentOrganization = mockOrganizations.find(org => org.id === CURRENT_CHARITY_ORG_ID);
  
  // Filter campaigns to only show those belonging to the current charity organization
  const organizationCampaigns = mockCampaigns.filter(
    campaign => campaign.organizationId === CURRENT_CHARITY_ORG_ID
  );
  
  // Calculate fund statistics
  const campaignFundsRaised = organizationCampaigns.reduce(
    (sum, campaign) => sum + campaign.currentContributions, 0
  );
  
  // Get general fund from organization data
  const generalFundBalance = currentOrganization?.totalRaised || 0;
  
  // Calculate total funds (general + campaign specific)
  const totalFunds = generalFundBalance + campaignFundsRaised;

  // Get donation tracker data for this organization
  const donationTracker = mockDonationTrackers.find(
    tracker => tracker.recipientId === CURRENT_CHARITY_ORG_ID && tracker.recipientType === 'organization'
  );

  // Calculate percentages for the fund allocation chart
  const generalFundPercentage = Math.round((generalFundBalance / totalFunds) * 100) || 0;
  const campaignFundPercentage = Math.round((campaignFundsRaised / totalFunds) * 100) || 0;

  // Calculate individual campaign percentages of total campaign funds
  const campaignPercentages = organizationCampaigns.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    amount: campaign.currentContributions,
    percentage: Math.round((campaign.currentContributions / campaignFundsRaised) * 100) || 0
  })).sort((a, b) => b.amount - a.amount);

  // Handle creating a new campaign
  const handleSaveCampaign = async (campaignData: FormData) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Campaign created successfully!");
      setShowAddCampaignModal(false);
      // Refresh campaigns
      window.dispatchEvent(new CustomEvent('refreshCampaigns'));
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      toast.error(err.message || "Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting campaigns
  const handleSort = (field: 'deadline' | 'goal' | 'progress') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: 'deadline' | 'goal' | 'progress') => {
    if (sortBy !== field) return <FaSort className="opacity-50" />;
    return sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />;
  };

  return (
    <div className="p-6 bg-[var(--background)] text-[var(--paragraph)] max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--headline)]">
              {currentOrganization?.name || "Your Charity Organization"}
            </h1>
            <p className="text-[var(--paragraph)]">
              {currentOrganization?.description || "Manage your campaigns"}
            </p>
          </div>
          <button
            onClick={() => navigate('/charity')}
            className="px-4 py-2 bg-[var(--highlight)] bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition-all flex items-center gap-2"
          >
            <FaGlobe />
            View Public Charity Page
          </button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between border-b border-gray-200">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-4 px-6 relative font-medium text-base transition-all flex-1 text-center ${
              activeTab === 'campaigns'
                ? 'text-[#004D40]'
                : 'text-gray-500 hover:text-[#004D40]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FaHandHoldingHeart className={activeTab === 'campaigns' ? 'text-[#004D40]' : 'text-gray-500'} />
              <span className="font-bold">Campaigns</span>
            </div>
            {activeTab === 'campaigns' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFA726]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('funds')}
            className={`py-4 px-6 relative font-medium text-base transition-all flex-1 text-center ${
              activeTab === 'funds'
                ? 'text-[#004D40]'
                : 'text-gray-500 hover:text-[#004D40]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FaMoneyBillWave className={activeTab === 'funds' ? 'text-[#004D40]' : 'text-gray-500'} />
              <span className="font-bold">Funds</span>
            </div>
            {activeTab === 'funds' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFA726]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`py-4 px-6 relative font-medium text-base transition-all flex-1 text-center ${
              activeTab === 'vendors'
                ? 'text-[#004D40]'
                : 'text-gray-500 hover:text-[#004D40]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FaBuilding className={activeTab === 'vendors' ? 'text-[#004D40]' : 'text-gray-500'} />
              <span className="font-bold">Vendors</span>
            </div>
            {activeTab === 'vendors' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFA726]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('supporters')}
            className={`py-4 px-6 relative font-medium text-base transition-all flex-1 text-center ${
              activeTab === 'supporters'
                ? 'text-[#004D40]'
                : 'text-gray-500 hover:text-[#004D40]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FaUsers className={activeTab === 'supporters' ? 'text-[#004D40]' : 'text-gray-500'} />
              <span className="font-bold">Supporters</span>
            </div>
            {activeTab === 'supporters' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFA726]"></div>
            )}
          </button>
          </div>
        </div>
        
      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'campaigns' && (
          <motion.div
            key="campaigns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Campaign Management Section */}
            <div className="bg-white rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden">
              <div className="p-4 border-b border-[var(--stroke)] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-[var(--headline)]">Campaign Management</h2>
                  <button
                    onClick={() => setShowAddCampaignModal(true)}
                    className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
                  >
                    <FaPlus /> New Campaign
                  </button>
            </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      className="pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 border border-[var(--stroke)] rounded-lg hover:bg-[var(--highlight)] hover:bg-opacity-10 transition-all"
                  >
                    <FaFilter />
                  </button>
          </div>
        </div>
        
              {/* Filters */}
              {showFilters && (
                <div className="p-4 border-b border-[var(--stroke)] bg-gray-50">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Status:</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-[var(--stroke)] rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="draft">Draft</option>
                      </select>
            </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Sort by:</label>
                      <button
                        onClick={() => handleSort('deadline')}
                        className="flex items-center gap-1 px-3 py-1 border border-[var(--stroke)] rounded-lg hover:bg-[var(--highlight)] hover:bg-opacity-10 transition-all"
                      >
                        Deadline {getSortIcon('deadline')}
                      </button>
                      <button
                        onClick={() => handleSort('goal')}
                        className="flex items-center gap-1 px-3 py-1 border border-[var(--stroke)] rounded-lg hover:bg-[var(--highlight)] hover:bg-opacity-10 transition-all"
                      >
                        Goal {getSortIcon('goal')}
                      </button>
                      <button
                        onClick={() => handleSort('progress')}
                        className="flex items-center gap-1 px-3 py-1 border border-[var(--stroke)] rounded-lg hover:bg-[var(--highlight)] hover:bg-opacity-10 transition-all"
                      >
                        Progress {getSortIcon('progress')}
                      </button>
            </div>
          </div>
        </div>
              )}

              {/* Campaign List */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organizationCampaigns.map((campaign) => {
                    const progress = Math.min(100, (campaign.currentContributions / campaign.goal) * 100);
                    return (
                      <div
                        key={campaign.id}
                        className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] transition-all cursor-pointer"
                        onClick={() => navigate(`/campaign/${campaign.id}`)}
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
          </motion.div>
        )}
        
        {activeTab === 'funds' && (
            <motion.div
            key="funds"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
          >
            {/* Fund Management Section */}
            <div className="bg-white rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden">
              <div className="p-4 border-b border-[var(--stroke)]">
                <h2 className="text-xl font-bold text-[var(--headline)]">Fund Management</h2>
              </div>

              {/* Fund Summary */}
              <div className="p-4 border-b border-[var(--stroke)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[var(--background)] p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-[var(--headline)]">General Fund</h3>
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Unrestricted
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--headline)]">
                      RM{generalFundBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-[var(--paragraph)] mt-2">
                      Available for any charitable purpose
                    </p>
                  </div>
                  <div className="bg-[var(--background)] p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-[var(--headline)]">Campaign Funds</h3>
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Restricted
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--headline)]">
                      RM{campaignFundsRaised.toLocaleString()}
                    </p>
                    <p className="text-sm text-[var(--paragraph)] mt-2">
                      Designated for specific campaigns
                    </p>
                        </div>
                      </div>
                    </div>
                    
              {/* Fund Allocation Chart */}
              <div className="p-4 border-b border-[var(--stroke)]">
                <h3 className="text-lg font-medium text-[var(--headline)] mb-4">Fund Allocation</h3>
                <div className="flex items-center justify-center h-40">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeDasharray={`${generalFundPercentage} 100`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray={`${campaignFundPercentage} 100`}
                        strokeDashoffset={`-${generalFundPercentage}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{totalFunds.toLocaleString()}</span>
                      <span className="text-sm text-[var(--paragraph)]">Total Funds</span>
                    </div>
                  </div>
                  <div className="ml-8">
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                      <span>General Fund ({generalFundPercentage}%)</span>
                        </div>
                        <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span>Campaign Funds ({campaignFundPercentage}%)</span>
                    </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Campaign Fund Breakdown */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-[var(--headline)] mb-4">Campaign Fund Breakdown</h3>
                <div className="space-y-4">
                  {campaignPercentages.map((campaign) => (
                    <div key={campaign.id} className="bg-[var(--background)] p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-[var(--headline)]">{campaign.name}</h4>
                        <span className="text-sm font-medium">{campaign.percentage}%</span>
                          </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                          className="h-2 rounded-full bg-green-500"
                              style={{ width: `${campaign.percentage}%` }}
                            ></div>
                          </div>
                      <p className="text-sm text-[var(--paragraph)] mt-2">
                            RM{campaign.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'vendors' && (
          <motion.div
            key="vendors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Vendor Management Section */}
            <div className="bg-white rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden">
              <div className="p-4 border-b border-[var(--stroke)]">
                <h2 className="text-xl font-bold text-[var(--headline)]">Vendor Management</h2>
              </div>

              {/* Vendor Search */}
              <div className="p-4 border-b border-[var(--stroke)]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    className="w-full pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
              {/* Vendor List */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mock vendor data */}
                  <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                        MS
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--headline)]">Medical Supplies Co.</h3>
                        <p className="text-sm text-[var(--paragraph)]">Medical Equipment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)]">
                      <FaEnvelope className="text-gray-400" />
                      <span>contact@medicalsupplies.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)] mt-1">
                      <FaPhone className="text-gray-400" />
                      <span>+60 12-345-6789</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)] mt-1">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span>Kuala Lumpur, Malaysia</span>
                                </div>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1 bg-[var(--highlight)] text-white rounded-lg text-sm hover:bg-opacity-90 transition-all">
                        Message
                      </button>
                      <button className="px-3 py-1 border border-[var(--stroke)] rounded-lg text-sm hover:bg-[var(--highlight)] hover:bg-opacity-10 transition-all">
                        View Profile
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium mr-3">
                        FD
                                </div>
                      <div>
                        <h3 className="font-medium text-[var(--headline)]">Food Distribution Inc.</h3>
                        <p className="text-sm text-[var(--paragraph)]">Food Supplies</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)]">
                      <FaEnvelope className="text-gray-400" />
                      <span>info@fooddist.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)] mt-1">
                      <FaPhone className="text-gray-400" />
                      <span>+60 12-987-6543</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)] mt-1">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span>Penang, Malaysia</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1 bg-[var(--highlight)] text-white rounded-lg text-sm hover:bg-opacity-90 transition-all">
                        Message
                      </button>
                      <button className="px-3 py-1 border border-[var(--stroke)] rounded-lg text-sm hover:bg-[var(--highlight)] hover:bg-opacity-10 transition-all">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </motion.div>
          )}

        {activeTab === 'supporters' && (
      <motion.div
            key="supporters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Supporter Management Section */}
            <div className="bg-white rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden">
              <div className="p-4 border-b border-[var(--stroke)]">
                <h2 className="text-xl font-bold text-[var(--headline)]">Supporter Management</h2>
              </div>

              {/* Supporter Search */}
              <div className="p-4 border-b border-[var(--stroke)]">
                <div className="relative">
              <input
                type="text"
                    placeholder="Search supporters..."
                    className="w-full pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
              {/* Supporter List */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mock supporter data */}
                  <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3">
                        JD
                  </div>
                  <div>
                        <h3 className="font-medium text-[var(--headline)]">John Doe</h3>
                        <p className="text-sm text-[var(--paragraph)]">Regular Donor</p>
                  </div>
                </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)]">
                      <FaEnvelope className="text-gray-400" />
                      <span>john.doe@email.com</span>
        </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)] mt-1">
                      <FaMoneyBillWave className="text-gray-400" />
                      <span>Total Donated: RM5,000</span>
                      </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)] mt-1">
                      <FaHandHoldingHeart className="text-gray-400" />
                      <span>3 Active Campaigns</span>
                        </div>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1 bg-[var(--highlight)] text-white rounded-lg text-sm hover:bg-opacity-90 transition-all">
                        Message
                      </button>
                      <button className="px-3 py-1 border border-[var(--stroke)] rounded-lg text-sm hover:bg-[var(--highlight)] hover:bg-opacity-10 transition-all">
                        View Profile
                      </button>
                        </div>
                      </div>
                      
                  <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium mr-3">
                        JS
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--headline)]">Jane Smith</h3>
                        <p className="text-sm text-[var(--paragraph)]">Major Donor</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)]">
                      <FaEnvelope className="text-gray-400" />
                      <span>jane.smith@email.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)] mt-1">
                      <FaMoneyBillWave className="text-gray-400" />
                      <span>Total Donated: RM15,000</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--paragraph)] mt-1">
                      <FaHandHoldingHeart className="text-gray-400" />
                      <span>5 Active Campaigns</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1 bg-[var(--highlight)] text-white rounded-lg text-sm hover:bg-opacity-90 transition-all">
                        Message
                      </button>
                      <button className="px-3 py-1 border border-[var(--stroke)] rounded-lg text-sm hover:bg-[var(--highlight)] hover:bg-opacity-10 transition-all">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          )}
      </AnimatePresence>

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

export default CharityManagementPage; 