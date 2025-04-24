import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { mockCampaigns, mockOrganizations, Campaign as MockCampaign, mockDonationTrackers } from "../../../../utils/mockData";
import AddCampaignModal from "../../../../components/modals/AddCampaignModal";
import { motion, AnimatePresence } from "framer-motion";
import { charityService, Campaign } from "../../../../services/supabase/charityService";

// Mock current charity organization ID (Global Relief)
const CURRENT_CHARITY_ORG_ID = 1;

// Interface for formatted campaigns matching the UI structure
interface FormattedCampaign {
  id: string | number;
  name: string;
  organizationId: string | number;
  goal: number;
  currentContributions: number;
  deadline: string;
  description?: string;
  status: string;
}

const CharityManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'deadline' | 'goal' | 'progress'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showFundDetails, setShowFundDetails] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'funds'>('campaigns');
  const [charityProfile, setCharityProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<FormattedCampaign[]>([]);
  const [fundData, setFundData] = useState({
    totalFunds: 0,
    generalFundBalance: 0,
    campaignFundsRaised: 0
  });
  
  // Add state for detailed campaign fund allocation
  const [campaignFundDetails, setCampaignFundDetails] = useState<Record<string, { available: number; onHold: number; used: number; }>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Add state for campaign fund allocation
  const [campaignFundAllocation, setCampaignFundAllocation] = useState<{ 
    campaignId: string;
    name: string;
    amount: number;
    percentage: number;
  }[]>([]);
  
  // Fetch charity profile data from database
  useEffect(() => {
    const fetchCharityProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await charityService.getCharityProfile();
        setCharityProfile(profileData);
        
        // Fetch funds data
        const fundsData = await charityService.getTotalFunds();
        setFundData(fundsData);
      } catch (error) {
        console.error("Error fetching charity profile:", error);
        toast.error("Failed to fetch charity profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCharityProfile();
  }, []);
  
  // Fetch campaigns data from database
  useEffect(() => {
    const fetchCampaignsAndDetails = async () => {
      try {
        setIsLoading(true);
        setDetailsLoading(true); // Start details loading
        const campaignsData = await charityService.getCharityCampaigns();
        
        // Format campaigns to match the structure expected by the UI
        const formattedCampaigns: FormattedCampaign[] = campaignsData.map(campaign => ({
          id: campaign.id,
          name: campaign.title,
          organizationId: campaign.charity_id,
          goal: campaign.target_amount,
          currentContributions: campaign.current_amount,
          deadline: campaign.deadline,
          description: campaign.description,
          status: campaign.status
        }));
        
        setCampaigns(formattedCampaigns);
        setIsLoading(false); // Campaigns list is loaded

        // Fetch fund details for each campaign
        const detailsMap: Record<string, { available: number; onHold: number; used: number; }> = {};
        await Promise.all(formattedCampaigns.map(async (campaign) => {
          try {
            const { fundAllocation } = await charityService.getCampaignTransactions(campaign.id.toString());
            const totalAvailable = fundAllocation.availableCampaignSpecific + fundAllocation.availableAlwaysDonate;
            detailsMap[campaign.id] = {
              available: totalAvailable, 
              onHold: fundAllocation.onHold,
              used: fundAllocation.used
            };
          } catch (detailsError) {
            console.error(`Error fetching fund details for campaign ${campaign.id}:`, detailsError);
            // Set default/error state for this campaign's details
            detailsMap[campaign.id] = { available: 0, onHold: 0, used: 0 };
          }
        }));
        setCampaignFundDetails(detailsMap);
        setDetailsLoading(false); // Details are loaded
        
        // Update overall fund data
        const fundsData = await charityService.getTotalFunds();
        setFundData(fundsData);
        
        // Fetch aggregated campaign fund allocation for the chart
        const allocationChartData = await charityService.getCampaignFundAllocation();
        setCampaignFundAllocation(allocationChartData);

      } catch (error) {
        console.error("Error fetching campaigns or details:", error);
        toast.error("Failed to fetch campaigns or fund details");
        setIsLoading(false); // Ensure loading is off on error
        setDetailsLoading(false);
      }
    };
    
    fetchCampaignsAndDetails();
    
    // Add event listener for refreshing campaigns
    window.addEventListener('refreshCampaigns', fetchCampaignsAndDetails);
    
    return () => {
      window.removeEventListener('refreshCampaigns', fetchCampaignsAndDetails);
    };
  }, []);
  
  // Handle URL parameters for active tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['campaigns', 'funds'].includes(tabParam)) {
      setActiveTab(tabParam as 'campaigns' | 'funds');
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);
  
  // Get the current organization
  const currentOrganization = charityProfile || mockOrganizations.find(org => org.id === CURRENT_CHARITY_ORG_ID);
  
  // Filter campaigns to only show those belonging to the current charity organization
  const organizationCampaigns = campaigns.length > 0 
    ? campaigns 
    : mockCampaigns.filter(campaign => campaign.organizationId === CURRENT_CHARITY_ORG_ID);
  
  // Apply filters
  const filteredCampaigns = organizationCampaigns
    .filter(campaign => {
      // Filter by status
      if (filterStatus !== 'all') {
        // Check if status exists in the object and matches the filter
        if (!('status' in campaign) || campaign['status'] !== filterStatus) {
          return false;
        }
      }
      
      // Filter by search term
      if (searchTerm.trim() !== '') {
        return campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      
      return true;
    });
  
  // Apply sorting
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortBy === 'deadline') {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'goal') {
      return sortOrder === 'asc' ? a.goal - b.goal : b.goal - a.goal;
    } else if (sortBy === 'progress') {
      const progressA = (a.currentContributions / a.goal) * 100;
      const progressB = (b.currentContributions / b.goal) * 100;
      return sortOrder === 'asc' ? progressA - progressB : progressB - progressA;
    }
    return 0;
  });
  
  // Get donation tracker data for this organization
  const donationTracker = mockDonationTrackers.find(
    tracker => tracker.recipientId === CURRENT_CHARITY_ORG_ID && tracker.recipientType === 'organization'
  );

  // Calculate percentages for the fund allocation chart
  const generalFundPercentage = Math.round((fundData.generalFundBalance / fundData.totalFunds) * 100) || 0;
  const campaignFundPercentage = Math.round((fundData.campaignFundsRaised / fundData.totalFunds) * 100) || 0;

  // Calculate individual campaign percentages of total campaign funds
  const campaignPercentages = organizationCampaigns.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    amount: campaign.currentContributions,
    percentage: Math.round((campaign.currentContributions / fundData.campaignFundsRaised) * 100) || 0
  })).sort((a, b) => b.amount - a.amount);

  // Handle creating a new campaign
  const handleSaveCampaign = async (campaignData: FormData) => {
    try {
      setLoading(true);
      await charityService.createCampaign(campaignData);
      toast.success("Campaign created successfully!");
      setShowAddCampaignModal(false);
      
      // Refresh campaigns and fund data
      window.dispatchEvent(new CustomEvent('refreshCampaigns'));
      
      // Also directly update fund data
      const fundsData = await charityService.getTotalFunds();
      setFundData(fundsData);
      
      // Fetch updated campaign fund allocation from service
      const allocation = await charityService.getCampaignFundAllocation();
      setCampaignFundAllocation(allocation);
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

  // Handle tab changes
  const handleTabChange = (tab: 'campaigns' | 'funds') => {
    setActiveTab(tab);
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle viewing campaign transactions
  const handleViewCampaignTransactions = (campaignId: string) => {
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/campaign/${campaignId}/transactions`);
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[var(--headline)]">
              {currentOrganization?.name || "Your Charity Organization"}
            </h1>
            <p className="text-[var(--paragraph)] mt-1">
              {currentOrganization?.description || "Manage your campaigns"}
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/charity')}
              className="px-4 py-2 bg-[#FFA726] text-white rounded-full hover:bg-[#FF9800] transition-all flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <FaGlobe />
              <span>View Public Charity Page</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between border-b border-gray-200">
          <button
            onClick={() => handleTabChange('campaigns')}
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
            onClick={() => handleTabChange('funds')}
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
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Loading campaigns...</p>
                  </div>
                ) : sortedCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedCampaigns.map((campaign) => {
                      const progress = Math.min(100, (campaign.currentContributions / campaign.goal) * 100);
                      return (
                        <div
                          key={campaign.id}
                          className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer"
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            navigate(`/charity/${campaign.id}`);
                          }}
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
                ) : (
                  <div className="text-center py-8">
                    <p>No campaigns found. Create your first campaign!</p>
                  </div>
                )}
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
              <div className="bg-white rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden">
                {/* Fund Management Section */}
                <div className="p-4 border-b border-[var(--stroke)]">
                  <h2 className="text-xl font-bold text-[var(--headline)]">Fund Management</h2>
                </div>

                {/* Total Fund Display */}
                <div className="p-4 border-b border-[var(--stroke)] bg-gradient-to-r from-[#004D99] to-[#0066CC] text-white">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2 text-[#92C5F9]">Total Funds</h3>
                    <p className="text-4xl font-bold">RM{fundData.totalFunds.toLocaleString()}</p>
                    <p className="text-sm mt-2 text-[#92C5F9]">Combined General and Campaign Funds</p>
                  </div>
                </div>

                {/* Fund Summary */}
                <div className="p-4 border-b border-[var(--stroke)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-white to-blue-50 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-[var(--headline)]">General Fund</h3>
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Unrestricted
                      </span>
                    </div>
                      <p className="text-2xl font-bold text-[var(--headline)]">
                      RM{fundData.generalFundBalance.toLocaleString()}
                    </p>
                      <p className="text-sm text-[var(--paragraph)] mt-2">
                      Available for any charitable purpose
                    </p>
                    </div>
                    <div className="bg-gradient-to-br from-white to-green-50 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-[var(--headline)]">Campaign Funds</h3>
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Restricted
                      </span>
                    </div>
                      <p className="text-2xl font-bold text-[var(--headline)]">
                      RM{fundData.campaignFundsRaised.toLocaleString()}
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
                  <div className="relative flex justify-center">
                    {/* Legend positioned absolutely */}
                    <div className="absolute left-12 top-0 flex flex-col gap-2">
                      {campaignFundAllocation
                        .filter((campaign, index) => index < 4) // Limit to 4 campaigns to avoid overcrowding
                        .map((campaign, index) => {
                          const color = [
                            '#fd7979', '#ffa77f', '#ffcc8f', '#7dc9ff'
                          ][index % 4];
                          
                          return (
                            <div key={campaign.campaignId} className="flex items-center hover:scale-105 transition-transform duration-300">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                              <span className="text-sm whitespace-nowrap">{campaign.name} ({campaign.percentage}%)</span>
                          </div>
                          );
                      })}
                        </div>
                    <div className="relative w-48 h-48">
                      {(() => {
                        // Calculate the circumference of the circle
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        
                        // Get active campaigns and their percentages, limited to 4 for the donut
                        const activeAllocation = campaignFundAllocation.slice(0, 4);
                        
                        // Define campaign colors
                        const campaignColors = [
                          '#fd7979', // coral red
                          '#ffa77f', // peach
                          '#ffcc8f', // light orange
                          '#7dc9ff'  // light blue
                        ];

                        // Calculate cumulative offset for positioning each segment
                        let cumulativePercentage = 0;
                        
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
                              {/* Campaign segments */}
                              {activeAllocation.map((campaign, index) => {
                                const strokeDasharray = `${(campaign.percentage * circumference) / 100} ${circumference}`;
                                const strokeDashoffset = `${-(cumulativePercentage * circumference) / 100}`;
                                cumulativePercentage += campaign.percentage;
                                
                                return (
                                  <circle
                                    key={campaign.campaignId}
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke={campaignColors[index % campaignColors.length]}
                                    strokeWidth="10"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-500"
                                  />
                                );
                              })}
                            </svg>
                            {/* Fund amounts */}
                            {activeAllocation.length > 0 ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-[var(--headline)]">RM{fundData.campaignFundsRaised.toLocaleString()}</span>
                                <span className="text-sm text-[var(--paragraph)]">Campaign Funds</span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-sm text-[var(--paragraph)]">No active campaigns</span>
                              </div>
                            )}
                            
                            {/* Money labels for each segment */}
                            {activeAllocation.map((campaign, index) => {
                              // Calculate position for money labels
                              let segmentStart = 0;
                              for (let i = 0; i < index; i++) {
                                segmentStart += activeAllocation[i].percentage;
                              }
                              
                              // Position the label in the middle of the segment
                              // -90 degrees is the starting position (top of the circle)
                              // Then we add the segmentStart and half the current segment's percentage
                              // Multiply by 3.6 to convert percentage to degrees
                              const angle = -90 + (segmentStart + campaign.percentage / 2) * 3.6;
                              
                              // Label positioning - outer edge of the donut
                              const labelRadius = 70; // Slightly outside the donut
                              const x = 50 + labelRadius * Math.cos(angle * Math.PI / 180);
                              const y = 50 + labelRadius * Math.sin(angle * Math.PI / 180);
                              
                              return (
                                <div
                                  key={`label-${campaign.campaignId}`}
                                  className="absolute transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold bg-white px-2 py-1 rounded-md shadow-sm whitespace-nowrap"
                                  style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    color: campaignColors[index % campaignColors.length]
                                  }}
                                >
                                  RM{campaign.amount.toLocaleString()}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                {/* Campaign Fund Details */}
                <div className="p-4">
                  <h3 className="text-lg font-medium text-[var(--headline)] mb-4">Campaign Fund Details</h3>
                  {detailsLoading ? (
                    <div className="text-center py-6">Loading fund details...</div>
                  ) : (
                    <div className="space-y-6">
                      {sortedCampaigns
                        .filter(campaign => new Date(campaign.deadline) > new Date()) // Keep filtering active campaigns if desired
                        .map((campaign) => {
                          // Get actual fund details for this campaign
                          const details = campaignFundDetails[campaign.id] || { available: 0, onHold: 0, used: 0 };
                          const { available, onHold, used } = details;
                          const totalAllocated = available + onHold + used;
                          const remainingTarget = Math.max(0, campaign.goal - campaign.currentContributions);
                          const goal = campaign.goal > 0 ? campaign.goal : 1; // Avoid division by zero

                          // Calculate percentages based on the campaign GOAL
                          const availablePercentage = (available / goal * 100);
                          const onHoldPercentage = (onHold / goal * 100);
                          const usedPercentage = (used / goal * 100);
                          const remainingPercentage = Math.max(0, 100 - availablePercentage - onHoldPercentage - usedPercentage);

                          return (
                            <div 
                              key={campaign.id} 
                              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 active:translate-y-0"
                              onClick={() => handleViewCampaignTransactions(campaign.id.toString())}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FaChartPie className="text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-[var(--headline)]">{campaign.name}</h4>
                                  <div className="flex items-center text-sm text-[var(--paragraph)]">
                                    <FaCalendarAlt className="mr-1" />
                                    <span>Ends: {new Date(campaign.deadline).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="ml-auto text-right">
                                  <p className="font-bold text-[var(--headline)]">
                                    RM{campaign.currentContributions.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-[var(--paragraph)]">
                                    of RM{campaign.goal.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                      
                              {/* Fund Status Bar - Updated with actual percentages */}
                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex" title={`Available: ${availablePercentage.toFixed(1)}%, On Hold: ${onHoldPercentage.toFixed(1)}%, Used: ${usedPercentage.toFixed(1)}%, Remaining Goal: ${remainingPercentage.toFixed(1)}%`}>
                                <div 
                                  className="h-full bg-green-500 transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
                                  style={{ width: `${availablePercentage}%` }}
                                  title={`Available: RM${available.toLocaleString()}`}
                                >
                                  {availablePercentage > 10 ? `${availablePercentage.toFixed(0)}%` : ''}
                                </div>
                                <div 
                                  className="h-full bg-yellow-400 transition-all duration-300 flex items-center justify-center text-black text-xs font-bold"
                                  style={{ width: `${onHoldPercentage}%` }}
                                  title={`On Hold: RM${onHold.toLocaleString()}`}
                                >
                                 {onHoldPercentage > 10 ? `${onHoldPercentage.toFixed(0)}%` : ''}
                                </div>
                                <div 
                                  className="h-full bg-red-500 transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
                                  style={{ width: `${usedPercentage}%` }}
                                  title={`Used: RM${used.toLocaleString()}`}
                                >
                                 {usedPercentage > 10 ? `${usedPercentage.toFixed(0)}%` : ''}
                                </div>
                                {/* Optional: Show remaining goal visually */}
                                <div 
                                  className="h-full bg-gray-200 transition-all duration-300"
                                  style={{ width: `${remainingPercentage}%` }}
                                  title={`Remaining Goal: RM${remainingTarget.toLocaleString()}`}
                                />
                              </div>
                    
                              {/* Fund Status Legend - Updated with actual amounts */}
                              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                                  <span>Available: RM{available.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
                                  <span>On Hold: RM{onHold.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                                  <span>Used: RM{used.toLocaleString()}</span>
                                </div>
                                {remainingTarget > 0 && (
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <div className="w-3 h-3 bg-gray-200 rounded-full" />
                                    <span>Goal Remaining: RM{remainingTarget.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
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