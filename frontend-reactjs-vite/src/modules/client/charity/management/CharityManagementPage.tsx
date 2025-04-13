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
  FaArrowRight
} from "react-icons/fa";
import { toast } from "react-toastify";
import { mockCampaigns, mockOrganizations, Campaign, mockDonationTrackers } from "../../../../utils/mockData";
import AddCampaignModal from "../profile/components/AddCampaignModal";
import { motion, AnimatePresence } from "framer-motion";

// Mock current charity organization ID (Global Relief)
const CURRENT_CHARITY_ORG_ID = 1;

const CharityManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'goal' | 'progress'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showFundDetails, setShowFundDetails] = useState(true);
  
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

  // Mock fund usage data
  const fundUsageData = [
    { category: "Program Services", percentage: 75, color: "bg-blue-500" },
    { category: "Administrative", percentage: 15, color: "bg-green-500" },
    { category: "Fundraising", percentage: 10, color: "bg-yellow-500" }
  ];

  // Mock recent fund activities
  const recentFundActivities = [
    { id: 1, type: "Donation", amount: 5000, date: "2025-03-20", description: "Major donor contribution" },
    { id: 2, type: "Withdrawal", amount: 2500, date: "2025-03-18", description: "Clean Water Initiative expenses" },
    { id: 3, type: "Transfer", amount: 1500, date: "2025-03-15", description: "Funds allocated to Disaster Relief" }
  ];
  
  // Apply filters and search
  const filteredCampaigns = organizationCampaigns
    .filter(campaign => {
      // Search filter
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'active') return matchesSearch && new Date(campaign.deadline) > new Date() && campaign.currentContributions < campaign.goal;
      if (filterStatus === 'completed') return matchesSearch && campaign.currentContributions >= campaign.goal;
      if (filterStatus === 'expired') return matchesSearch && new Date(campaign.deadline) <= new Date() && campaign.currentContributions < campaign.goal;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'deadline') {
        return sortOrder === 'asc' 
          ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          : new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      if (sortBy === 'goal') {
        return sortOrder === 'asc' ? a.goal - b.goal : b.goal - a.goal;
      }
      if (sortBy === 'progress') {
        const progressA = (a.currentContributions / a.goal) * 100;
        const progressB = (b.currentContributions / b.goal) * 100;
        return sortOrder === 'asc' ? progressA - progressB : progressB - progressA;
      }
      return 0;
    });

  // Handle adding a new campaign
  const handleAddCampaign = async (campaignData: FormData) => {
    try {
      setLoading(true);
      // Instead of calling the service, just log the data
      console.log("Campaign Created:", Object.fromEntries(campaignData.entries()));
      
      // Mock a successful creation
      setShowAddCampaignModal(false);
      toast.success("Campaign created successfully! (Mock data)");
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      toast.error(err.message || "Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate campaign status
  const getCampaignStatus = (campaign: Campaign) => {
    if (campaign.currentContributions >= campaign.goal) return 'completed';
    if (new Date(campaign.deadline) > new Date()) return 'active';
    return 'expired';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate days left
  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeLeft = deadlineDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeLeft / (1000 * 3600 * 24));
    return daysLeft > 0 ? `${daysLeft} days left` : 'Expired';
  };

  return (
    <div className="p-6 bg-[var(--background)] text-[var(--paragraph)]">
      {/* Header with organization info */}
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

      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white p-6 rounded-xl border border-[var(--stroke)] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--paragraph)] mb-1">Total Campaigns</p>
              <h3 className="text-2xl font-bold text-[var(--headline)]">{organizationCampaigns.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <FaHandHoldingHeart size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-[var(--stroke)] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--paragraph)] mb-1">Campaign Funds</p>
              <h3 className="text-2xl font-bold text-[var(--headline)]">
                RM{campaignFundsRaised.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <FaMoneyBillWave size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-[var(--stroke)] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--paragraph)] mb-1">General Fund</p>
              <h3 className="text-2xl font-bold text-[var(--headline)]">
                RM{generalFundBalance.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <FaWallet size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-[var(--stroke)] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--paragraph)] mb-1">Total Funds</p>
              <h3 className="text-2xl font-bold text-[var(--headline)]">
                RM{totalFunds.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
              <FaChartPie size={24} />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Fund Details Section (Expandable) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div 
          className="bg-white p-4 rounded-xl border border-[var(--stroke)] shadow-sm cursor-pointer"
          onClick={() => setShowFundDetails(!showFundDetails)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaWallet className="text-[var(--highlight)] mr-2" />
              <h2 className="text-lg font-bold text-[var(--headline)]">Fund Details</h2>
            </div>
            <div>
              {showFundDetails ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {showFundDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-6 border-x border-b border-[var(--stroke)] rounded-b-xl shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Fund Details */}
                  <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-[var(--headline)]">General Fund</h3>
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Unrestricted
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--headline)] mb-1">
                      RM{generalFundBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--paragraph)]">
                      Available for any charitable purpose
                    </p>
                    <div className="mt-4 flex justify-end">
                      <button className="px-3 py-1 bg-[var(--highlight)] text-white rounded-lg text-sm hover:bg-opacity-90 transition-all">
                        Manage Fund
                      </button>
                    </div>
                  </div>
                  
                  {/* Campaign Funds Details */}
                  <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-[var(--headline)]">Campaign Funds</h3>
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Restricted
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--headline)] mb-1">
                      RM{campaignFundsRaised.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--paragraph)] mb-3">
                      Designated for specific campaigns
                    </p>
                    
                    {/* Donation Policy Breakdown */}
                    <div className="mt-2 border-t border-[var(--stroke)] pt-3">
                      <h4 className="text-xs font-medium text-[var(--paragraph)] mb-2">Donation Policy Breakdown</h4>
                      
                      {/* Calculate estimated policy breakdowns based on typical distributions */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Campaign-specific donations */}
                        <div className="bg-white p-2 rounded-lg border border-[var(--stroke)]">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-xs font-medium">Campaign-Specific</span>
                          </div>
                          <p className="text-sm font-bold text-[var(--headline)]">
                            RM{Math.round(campaignFundsRaised * 0.6).toLocaleString()}
                          </p>
                          <p className="text-xs text-[var(--paragraph)]">Refundable if goal not met</p>
                        </div>
                        
                        {/* Always-donate */}
                        <div className="bg-white p-2 rounded-lg border border-[var(--stroke)]">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-medium">Always Donate</span>
                          </div>
                          <p className="text-sm font-bold text-[var(--headline)]">
                            RM{Math.round(campaignFundsRaised * 0.4).toLocaleString()}
                          </p>
                          <p className="text-xs text-[var(--paragraph)]">Moves to general fund if needed</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button className="px-3 py-1 bg-[var(--highlight)] text-white rounded-lg text-sm hover:bg-opacity-90 transition-all">
                        View Breakdown
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Fund Allocation Chart */}
                <div className="mt-6 p-4 bg-[var(--background)] rounded-lg border border-[var(--stroke)]">
                  <h3 className="font-medium text-[var(--headline)] mb-4">Fund Allocation</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Fund Distribution */}
                    <div>
                      <h4 className="text-sm font-medium text-[var(--paragraph)] mb-2">Main Fund Distribution</h4>
                      <div className="h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-purple-500 flex items-center justify-center text-xs text-white"
                          style={{ width: `${generalFundPercentage}%` }}
                        >
                          {generalFundPercentage}%
                        </div>
                        <div 
                          className="h-full bg-green-500 flex items-center justify-center text-xs text-white"
                          style={{ width: `${campaignFundPercentage}%`, marginTop: '-2rem' }}
                        >
                          {campaignFundPercentage}%
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-[var(--paragraph)]">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                          General Fund
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                          Campaign Funds
                        </div>
                      </div>
                    </div>
                    
                    {/* Fund Usage */}
                    <div>
                      <h4 className="text-sm font-medium text-[var(--paragraph)] mb-2">Fund Usage</h4>
                      <div className="space-y-2">
                        {fundUsageData.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-xs mb-1">
                              <span>{item.category}</span>
                              <span>{item.percentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.color}`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Campaign Fund Breakdown */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-[var(--paragraph)] mb-3">Campaign Fund Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaignPercentages.map(campaign => (
                        <div key={campaign.id} className="bg-white p-3 rounded-lg border border-[var(--stroke)]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium truncate" style={{ maxWidth: '70%' }}>
                              {campaign.name}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {campaign.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${campaign.percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-[var(--paragraph)] mt-1">
                            RM{campaign.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent Fund Activities */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-[var(--paragraph)] mb-3">Recent Fund Activities</h4>
                    <div className="overflow-hidden rounded-lg border border-[var(--stroke)]">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentFundActivities.map(activity => (
                            <tr key={activity.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  {activity.type === "Donation" && <FaMoneyBillWave className="text-green-500 mr-2" />}
                                  {activity.type === "Withdrawal" && <FaArrowRight className="text-red-500 mr-2" />}
                                  {activity.type === "Transfer" && <FaExchangeAlt className="text-blue-500 mr-2" />}
                                  <span className="text-sm text-gray-900">{activity.type}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                RM{activity.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {activity.date}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {activity.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Monthly Donation Trends */}
                  {donationTracker && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-[var(--headline)] mb-3">Monthly Donation Trends</h4>
                      <div className="bg-white p-4 rounded-lg border border-[var(--stroke)]">
                        <div className="flex items-end h-40 space-x-2">
                          {donationTracker.donations.timeline.monthly.map((month, index) => {
                            // Calculate the maximum amount for proper scaling
                            const maxAmount = Math.max(...donationTracker.donations.timeline.monthly.map(m => m.amount));
                            // Calculate height percentage (minimum 5% for visibility)
                            const heightPercentage = maxAmount > 0 
                              ? Math.max(5, (month.amount / maxAmount) * 100) 
                              : 5;
                              
                            return (
                              <div key={index} className="flex flex-col items-center flex-1">
                                <div className="text-xs text-center mb-1 text-[var(--paragraph)]">
                                  RM{month.amount.toLocaleString()}
                                </div>
                                <div 
                                  className="w-full bg-blue-500 rounded-t-sm" 
                                  style={{ 
                                    height: `${heightPercentage*1.2}px`,
                                    width: '250px'
                                  }}
                                ></div>
                                <span className="text-xs mt-1 text-[var(--paragraph)]">{month.month}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 text-sm text-center text-[var(--headline)] font-medium">
                          Total donations: RM{donationTracker.donations.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Campaign Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl border border-[var(--stroke)] overflow-hidden mb-8"
      >
        <div className="p-6 border-b border-[var(--stroke)] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[var(--headline)]">Your Campaigns</h2>
            <p className="text-[var(--paragraph)] text-sm mt-1">
              Manage your fundraising campaigns
            </p>
          </div>
          <button
            onClick={() => setShowAddCampaignModal(true)}
            className="px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90 flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            <FaPlus /> Add Campaign
          </button>
        </div>
        
        {/* Search and filters */}
        <div className="p-4 border-b border-[var(--stroke)] bg-[var(--background)] bg-opacity-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-[var(--paragraph)] text-opacity-50" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-[var(--stroke)] rounded-lg bg-white focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm("")}
                >
                  <FaTimes className="text-[var(--paragraph)] text-opacity-50 hover:text-opacity-100" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-[var(--stroke)] rounded-lg bg-white hover:bg-[var(--background)] transition-colors flex items-center gap-2"
              >
                <FaFilter />
                Filters
                {showFilters ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-[var(--stroke)] rounded-lg bg-white hover:bg-[var(--background)] transition-colors flex items-center gap-2"
              >
                <FaSort />
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>
          
          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">Status</label>
                    <select
                      className="w-full p-2 border border-[var(--stroke)] rounded-lg"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                      <option value="all">All Campaigns</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">Sort By</label>
                    <select
                      className="w-full p-2 border border-[var(--stroke)] rounded-lg"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="deadline">Deadline</option>
                      <option value="goal">Goal Amount</option>
                      <option value="progress">Progress</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Campaign cards */}
        <div className="p-6">
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => {
                const status = getCampaignStatus(campaign);
                const statusColor = getStatusColor(status);
                const progress = Math.min(100, (campaign.currentContributions / campaign.goal) * 100);
                
                return (
                  <motion.div 
                    key={campaign.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    className="bg-white rounded-lg border border-[var(--stroke)] overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/charity/${campaign.id}`)}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-[var(--headline)] text-lg">{campaign.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-[var(--paragraph)] mb-4 line-clamp-2">{campaign.description}</p>
                      
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-1 text-sm text-[var(--paragraph)]">
                          <FaCalendarAlt />
                          <span>{getDaysLeft(campaign.deadline)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-[var(--paragraph)]">
                          <FaMoneyBillWave />
                          <span>RM{campaign.currentContributions.toLocaleString()} of RM{campaign.goal.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <motion.div 
                          className="bg-[var(--highlight)] h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                      <div className="text-xs text-right text-[var(--paragraph)]">
                        {Math.round(progress)}% funded
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
          
          {filteredCampaigns.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <p className="text-lg text-[var(--paragraph)]">No campaigns found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus('all');
                }}
                className="mt-2 text-[var(--highlight)] hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Add Campaign Modal */}
      {showAddCampaignModal && (
        <AddCampaignModal onClose={() => setShowAddCampaignModal(false)} onSave={handleAddCampaign} />
      )}
    </div>
  );
};

export default CharityManagementPage; 