import React, { useState, useEffect } from "react";
import CampaignCard from "../../../../components/cards/CampaignCard";
import { 
  FaHandHoldingHeart, 
  FaBuilding, 
  FaSearch, 
  FaHistory, 
  FaFilter, 
  FaSort, 
  FaTags, 
  FaChevronDown, 
  FaChevronUp, 
  FaTimes, 
  FaListUl, 
  FaMoneyBillWave
} from "react-icons/fa";
import OrganizationCard from "../../../../components/cards/OrganizationCard";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "../../../../contexts/RoleContext";
import DonorSupportedCampaigns from "./DonorSupportedCampaigns";
import AutoDonation from "./AutoDonation";
import { charityService, Campaign } from "../../../../services/supabase/charityService";

// Define available campaign categories
const campaignCategories = [
  "All Categories",
  "Health & Medical",
  "Education",
  "Environment",
  "Disaster Relief",
  "Poverty & Hunger",
  "Animal Welfare",
  "Human Rights",
  "Community Development"
];

// Define sorting options
const sortOptions = [
  { value: "default", label: "Default" },
  { value: "timeLeft", label: "Time Left (Least to Most)" },
  { value: "timeLeftDesc", label: "Time Left (Most to Least)" },
  { value: "amountLeft", label: "Amount Left to Goal (Least to Most)" },
  { value: "amountLeftDesc", label: "Amount Left to Goal (Most to Least)" },
  { value: "goalAsc", label: "Goal Amount (Low to High)" },
  { value: "goalDesc", label: "Goal Amount (High to Low)" },
  { value: "progressAsc", label: "Progress (Least to Most)" },
  { value: "progressDesc", label: "Progress (Most to Least)" }
];

const CharityPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'organizations' | 'supported' | 'autoDonate'>(() => {
    // Check if there's a tab parameter in the URL
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'autoDonate' && userRole === 'donor') {
      return 'autoDonate';
    }
    
    return 'campaigns';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const { userRole } = useRole();
  const navigate = useNavigate();
  
  // Add state for real campaigns and organizations
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationsError, setOrganizationsError] = useState<string | null>(null);

  // Fetch campaigns when component mounts or tab changes
  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaigns();
    } else if (activeTab === 'organizations') {
      fetchOrganizations();
    }
  }, [activeTab]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const campaignsData = await charityService.getAllCampaigns();
      setCampaigns(campaignsData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching campaigns:", err);
      setError(err.message || "Failed to load campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      setOrganizationsLoading(true);
      const orgsData = await charityService.getAllCharityOrganizations();
      setOrganizations(orgsData);
      setOrganizationsError(null);
    } catch (err: any) {
      console.error("Error fetching organizations:", err);
      setOrganizationsError(err.message || "Failed to load organizations. Please try again.");
    } finally {
      setOrganizationsLoading(false);
    }
  };

  // Filter campaigns by search term and category
  const filteredCampaigns = campaigns
    .filter(campaign => 
      (campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       campaign.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategories.length === 0 || (campaign.category && selectedCategories.includes(campaign.category)))
    );

  // Sort campaigns based on selected sort option
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const today = new Date();
    const aTimeLeft = a.deadline ? Math.max(0, Math.floor((new Date(a.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const bTimeLeft = b.deadline ? Math.max(0, Math.floor((new Date(b.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const aAmountLeft = a.target_amount - a.current_amount;
    const bAmountLeft = b.target_amount - b.current_amount;
    const aProgress = (a.current_amount / a.target_amount) * 100;
    const bProgress = (b.current_amount / b.target_amount) * 100;

    switch (sortBy) {
      case "timeLeft":
        return aTimeLeft - bTimeLeft;
      case "timeLeftDesc":
        return bTimeLeft - aTimeLeft;
      case "amountLeft":
        return aAmountLeft - bAmountLeft;
      case "amountLeftDesc":
        return bAmountLeft - aAmountLeft;
      case "goalAsc":
        return a.target_amount - b.target_amount;
      case "goalDesc":
        return b.target_amount - a.target_amount;
      case "progressAsc":
        return aProgress - bProgress;
      case "progressDesc":
        return bProgress - aProgress;
      default:
        return 0;
    }
  });

  const filteredOrganizations = organizations.filter(org => {
    // Add null checks for name and description
    const nameMatch = org.name ? org.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const descriptionMatch = org.description ? org.description.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return nameMatch || descriptionMatch;
  });

  // Reset all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSortBy("default");
    setSearchTerm("");
  };

  // Get current sort option label
  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || "Default";

  return (
    <div className="p-6 bg-[var(--background)] text-[var(--paragraph)] max-w-7xl mx-auto">
      {/* Header with decorative element */}
      <div className="relative bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] rounded-lg mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-opacity-30 bg-[var(--stroke)]"></div>
        <div className="relative z-10 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Charity Hub</h1>
          <p className="text-white text-opacity-90 max-w-2xl">Support causes you care about and make a difference in the world through our verified charity campaigns and organizations.</p>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search campaigns or organizations..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'campaigns'
              ? 'text-[var(--highlight)] border-b-2 border-[var(--highlight)]'
              : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
          }`}
          onClick={() => setActiveTab('campaigns')}
        >
          <FaHandHoldingHeart />
          Campaigns
        </button>
        <button
          className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'organizations'
              ? 'text-[var(--highlight)] border-b-2 border-[var(--highlight)]'
              : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
          }`}
          onClick={() => setActiveTab('organizations')}
        >
          <FaBuilding />
          Organizations
        </button>
        
        {userRole === 'donor' && (
          <button
            className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'supported'
                ? 'text-[var(--highlight)] border-b-2 border-[var(--highlight)]'
                : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
            }`}
            onClick={() => setActiveTab('supported')}
          >
            <FaHistory />
            My Supported
          </button>
        )}

        {userRole === 'donor' && (
          <button
            className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'autoDonate'
                ? 'text-[var(--highlight)] border-b-2 border-[var(--highlight)]'
                : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
            }`}
            onClick={() => setActiveTab('autoDonate')}
          >
            <FaMoneyBillWave />
            Auto Donation
          </button>
        )}
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'campaigns' ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[var(--headline)]">Active Campaigns</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-[var(--highlight)] text-white' 
                  : 'bg-[var(--background)] border border-[var(--stroke)] hover:bg-gray-100'
              }`}
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
              {showFilters ? 'Hide Filters' : 'Filters & Sort'}
            </button>
          </div>

          {/* Filters and sorting section with animation */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showFilters ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-gradient-to-r from-[var(--main)] to-white border border-[var(--stroke)] rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">                
                {/* Results count */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--paragraph)]">
                    Showing <span className="font-semibold text-[var(--headline)]">{sortedCampaigns.length}</span> campaigns
                    {selectedCategories.length > 0 && (
                      <> in <span className="font-semibold text-[var(--headline)]">{selectedCategories.length}</span> categories</>
                    )}
                  </span>
                  
                  {/* Clear filters button - only show if filters are applied */}
                  {(selectedCategories.length > 0 || sortBy !== "default" || searchTerm) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-[var(--highlight)] hover:underline flex items-center gap-1"
                    >
                      <FaTimes size={12} />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              
              {/* Category filter section */}
              <div className="mb-5">
                <label className="text-sm font-medium text-[var(--headline)] mb-3 flex items-center gap-2">
                  <FaTags className="text-[var(--highlight)]" />
                  Filter by Categories
                </label>
                
                {/* Category chips for multiple selection */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {campaignCategories.slice(1).map((category) => ( // Skip "All Categories"
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategories(prev => 
                          prev.includes(category)
                            ? prev.filter(cat => cat !== category) // Remove if already selected
                            : [...prev, category] // Add if not selected
                        );
                      }}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 ${
                        selectedCategories.includes(category)
                          ? 'bg-[var(--highlight)] text-white'
                          : 'bg-gray-100 text-[var(--paragraph)] hover:bg-gray-200'
                      }`}
                    >
                      {category}
                      {selectedCategories.includes(category) && (
                        <FaTimes size={10} className="ml-1" />
                      )}
                    </button>
                  ))}
                  
                  {/* Clear categories button - only show if categories are selected */}
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="px-3 py-1.5 text-sm rounded-full bg-gray-200 text-[var(--paragraph)] hover:bg-gray-300 transition-colors flex items-center gap-1"
                    >
                      Clear Categories <FaTimes size={10} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Sort section */}
              <div>
                <label className="text-sm font-medium text-[var(--headline)] mb-3 flex items-center gap-2">
                  <FaSort className="text-[var(--highlight)]" />
                  Sort Results
                </label>
                
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2.5 pl-4 pr-10 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-[var(--highlight)]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FaChevronDown className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* Active filters summary */}
              {(selectedCategories.length > 0 || sortBy !== "default") && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-[var(--paragraph)]">
                    <span className="font-medium">Active filters:</span>
                    
                    {/* Combined flex container for all tags */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {/* Category tags */}
                      {selectedCategories.map(category => (
                        <span 
                          key={category}
                          className="px-2 py-1 bg-[var(--highlight)] bg-opacity-10 rounded-full text-xs font-semibold text-[var(--headline)] flex items-center"
                        >
                          Category: {category}
                          <button 
                            onClick={() => setSelectedCategories(prev => prev.filter(cat => cat !== category))}
                            className="ml-1 hover:text-[var(--highlight)]"
                          >
                            <FaTimes size={10} />
                          </button>
                        </span>
                      ))}
                      
                      {/* Sort tag */}
                      {sortBy !== "default" && (
                        <span className="px-2 py-1 bg-[var(--secondary)] bg-opacity-10 rounded-full text-xs font-semibold text-[var(--headline)] flex items-center">
                          Sort: {currentSortLabel}
                          <button 
                            onClick={() => setSortBy("default")}
                            className="ml-1 hover:text-[var(--secondary)]"
                          >
                            <FaTimes size={10} />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--highlight)] mb-4"></div>
                <p className="text-[var(--paragraph)]">Loading campaigns...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-white rounded-lg border border-[var(--stroke)] shadow-sm">
              <FaTimes className="mx-auto text-4xl text-red-500 mb-4" />
              <p className="text-lg font-medium text-[var(--headline)]">Error loading campaigns</p>
              <p className="text-[var(--paragraph)]">{error}</p>
              <button
                onClick={fetchCampaigns}
                className="mt-4 px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : sortedCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCampaigns.map((campaign) => {
                // Calculate a default deadline of 30 days from now if not provided
                const defaultDeadline = new Date();
                defaultDeadline.setDate(defaultDeadline.getDate() + 30);
                
                return (
                  <CampaignCard
                    key={campaign.id}
                    id={campaign.id}
                    name={campaign.title}
                    description={campaign.description}
                    goal={campaign.target_amount}
                    currentContributions={campaign.current_amount}
                    deadline={campaign.deadline || defaultDeadline.toISOString()}
                    category={campaign.category}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg border border-[var(--stroke)] shadow-sm">
              <FaSearch className="mx-auto text-4xl text-[var(--paragraph)] opacity-30 mb-4" />
              <p className="text-lg font-medium text-[var(--headline)]">No campaigns found</p>
              <p className="text-[var(--paragraph)]">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </>
      ) : activeTab === 'organizations' ? (
        <>
          <h2 className="text-2xl font-bold mb-4 text-[var(--headline)]">Charity Organizations</h2>
          {organizationsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--highlight)] mb-4"></div>
                <p className="text-[var(--paragraph)]">Loading organizations...</p>
              </div>
            </div>
          ) : organizationsError ? (
            <div className="text-center py-10 bg-white rounded-lg border border-[var(--stroke)] shadow-sm">
              <FaTimes className="mx-auto text-4xl text-red-500 mb-4" />
              <p className="text-lg font-medium text-[var(--headline)]">Error loading organizations</p>
              <p className="text-[var(--paragraph)]">{organizationsError}</p>
              <button
                onClick={fetchOrganizations}
                className="mt-4 px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrganizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizations.map((org) => (
                <OrganizationCard
                  key={org.id}
                  id={org.id}
                  name={org.name}
                  description={org.description}
                  logo={org.logo}
                  campaigns={org.campaigns}
                  totalRaised={org.totalRaised}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg">No organizations found matching your search.</p>
            </div>
          )}
        </>
      ) : activeTab === 'autoDonate' ? (
        <>
          <AutoDonation />
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-[var(--headline)]">My Supported Campaigns</h2>
          <DonorSupportedCampaigns />
        </>
      )}
    </div>
  );
};

export default CharityPage; 