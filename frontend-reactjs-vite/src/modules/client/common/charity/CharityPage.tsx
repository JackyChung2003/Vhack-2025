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
  FaMoneyBillWave,
  FaHeart,
  FaGlobe
} from "react-icons/fa";
import OrganizationCard from "../../../../components/cards/OrganizationCard";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "../../../../contexts/RoleContext";
import DonorSupportedCampaigns from "./DonorSupportedCampaigns";
import AutoDonation from "./AutoDonation";
import { charityService, Campaign } from "../../../../services/supabase/charityService";
import { motion } from "framer-motion";

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
      {/* Enhanced Header with animation and more visual appeal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] rounded-2xl mb-8 overflow-hidden shadow-lg"
      >
        <div className="absolute inset-0 bg-opacity-20 bg-[var(--stroke)] backdrop-blur-sm"></div>
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-64 h-64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M42.7,-57.1C55.8,-45.2,67.2,-32.1,71.1,-16.7C75,-1.4,71.5,16.1,63.3,30.2C55.1,44.2,42.2,54.8,27.5,62.7C12.8,70.6,-3.7,75.8,-17.9,70.9C-32.1,66,-44,51.1,-54.8,35.5C-65.6,19.9,-75.3,3.6,-73,-11.7C-70.7,-27,-56.4,-41.3,-41.6,-53.3C-26.8,-65.3,-11.4,-75.1,2.4,-78.2C16.3,-81.2,29.6,-69,42.7,-57.1Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 p-10">
          <div className="flex items-center mb-3">
            <span className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm">
              <FaHeart className="text-white text-xl" />
            </span>
            <h1 className="text-4xl font-bold text-white">Charity Hub</h1>
          </div>
          <p className="text-white text-opacity-90 max-w-2xl text-lg">
            Support causes you care about and make a difference in the world through our verified charity campaigns and organizations.
          </p>
          <div className="flex gap-3 mt-6">
            <button className="bg-white/20 hover:bg-white/30 transition-colors text-white backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
              <FaGlobe className="mr-2" /> Explore Causes
            </button>
            <button className="bg-white text-[var(--highlight)] px-4 py-2 rounded-lg font-medium flex items-center shadow-md hover:bg-opacity-90 transition-colors">
              <FaHandHoldingHeart className="mr-2" /> Start Donating
            </button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search campaigns or organizations..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] bg-white shadow-sm text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {/* Enhanced Tab navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex border-b-2 border-gray-200 mb-8 overflow-x-auto hide-scrollbar"
      >
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          className={`px-8 py-4 font-semibold flex items-center gap-2 transition-colors ${activeTab === 'campaigns'
            ? 'text-[var(--highlight)] border-b-3 border-[var(--highlight)]'
            : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
            }`}
          onClick={() => setActiveTab('campaigns')}
        >
          <FaHandHoldingHeart className={activeTab === 'campaigns' ? 'text-[var(--highlight)]' : 'text-gray-400'} />
          <span>Campaigns</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          className={`px-8 py-4 font-semibold flex items-center gap-2 transition-colors ${activeTab === 'organizations'
            ? 'text-[var(--highlight)] border-b-3 border-[var(--highlight)]'
            : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
            }`}
          onClick={() => setActiveTab('organizations')}
        >
          <FaBuilding className={activeTab === 'organizations' ? 'text-[var(--highlight)]' : 'text-gray-400'} />
          <span>Organizations</span>
        </motion.button>

        {userRole === 'donor' && (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className={`px-8 py-4 font-semibold flex items-center gap-2 transition-colors ${activeTab === 'supported'
              ? 'text-[var(--highlight)] border-b-3 border-[var(--highlight)]'
              : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
              }`}
            onClick={() => setActiveTab('supported')}
          >
            <FaHistory className={activeTab === 'supported' ? 'text-[var(--highlight)]' : 'text-gray-400'} />
            <span>My Supported</span>
          </motion.button>
        )}

        {userRole === 'donor' && (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className={`px-8 py-4 font-semibold flex items-center gap-2 transition-colors ${activeTab === 'autoDonate'
              ? 'text-[var(--highlight)] border-b-3 border-[var(--highlight)]'
              : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
              }`}
            onClick={() => setActiveTab('autoDonate')}
          >
            <FaMoneyBillWave className={activeTab === 'autoDonate' ? 'text-[var(--highlight)]' : 'text-gray-400'} />
            <span>Auto Donation</span>
          </motion.button>
        )}
      </motion.div>

      {/* Content based on active tab */}
      {activeTab === 'campaigns' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center">
              <span className="bg-[var(--highlight)]/10 p-2 rounded-lg mr-3">
                <FaHandHoldingHeart className="text-[var(--highlight)]" />
              </span>
              Active Campaigns
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm ${showFilters
                ? 'bg-[var(--highlight)] text-white'
                : 'bg-white border border-[var(--stroke)] hover:bg-gray-50'
                }`}
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
              {showFilters ? 'Hide Filters' : 'Filters & Sort'}
            </motion.button>
          </div>

          {/* Filters and sorting section with animation */}
          <motion.div
            initial={false}
            animate={{
              height: showFilters ? 'auto' : 0,
              opacity: showFilters ? 1 : 0,
              marginBottom: showFilters ? '1.5rem' : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-[var(--stroke)] rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-5">
                {/* Results count */}
                <div className="flex items-center gap-2">
                  <div className="bg-[var(--highlight)]/10 text-[var(--highlight)] rounded-full px-3 py-1 font-medium">
                    {sortedCampaigns.length} campaigns
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="bg-[var(--secondary)]/10 text-[var(--secondary)] rounded-full px-3 py-1 font-medium">
                      {selectedCategories.length} categories
                    </div>
                  )}
                </div>

                {/* Clear filters button - only show if filters are applied */}
                {(selectedCategories.length > 0 || sortBy !== "default" || searchTerm) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="text-sm text-[var(--highlight)] hover:text-[var(--highlight)]/80 flex items-center gap-1 bg-[var(--highlight)]/5 px-3 py-1.5 rounded-full"
                  >
                    <FaTimes size={12} />
                    Clear All Filters
                  </motion.button>
                )}
              </div>

              {/* Category filter section */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[var(--headline)] mb-3 flex items-center gap-2">
                  <FaTags className="text-[var(--highlight)]" />
                  Filter by Categories
                </label>

                {/* Category chips for multiple selection */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {campaignCategories.slice(1).map((category) => ( // Skip "All Categories"
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategories(prev =>
                          prev.includes(category)
                            ? prev.filter(cat => cat !== category) // Remove if already selected
                            : [...prev, category] // Add if not selected
                        );
                      }}
                      className={`px-4 py-2 text-sm rounded-full transition-all flex items-center gap-1 ${selectedCategories.includes(category)
                        ? 'bg-[var(--highlight)] text-white shadow-md'
                        : 'bg-gray-100 text-[var(--paragraph)] hover:bg-gray-200'
                        }`}
                    >
                      {category}
                      {selectedCategories.includes(category) && (
                        <FaTimes size={10} className="ml-1" />
                      )}
                    </motion.button>
                  ))}

                  {/* Clear categories button - only show if categories are selected */}
                  {selectedCategories.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategories([])}
                      className="px-4 py-2 text-sm rounded-full bg-gray-200 text-[var(--paragraph)] hover:bg-gray-300 transition-colors flex items-center gap-1"
                    >
                      Clear Categories <FaTimes size={10} />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Sort section */}
              <div>
                <label className="text-sm font-medium text-[var(--headline)] mb-3 flex items-center gap-2">
                  <FaSort className="text-[var(--highlight)]" />
                  Sort Results
                </label>

                <div className="relative mt-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 pl-4 pr-10 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-[var(--highlight)] shadow-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <FaChevronDown className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Active filters summary */}
              {(selectedCategories.length > 0 || sortBy !== "default") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 pt-5 border-t border-gray-200"
                >
                  <div className="text-sm text-[var(--paragraph)]">
                    <span className="font-medium">Active filters:</span>

                    {/* Combined flex container for all tags */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {/* Category tags */}
                      {selectedCategories.map(category => (
                        <span
                          key={category}
                          className="px-3 py-1.5 bg-[var(--highlight)] bg-opacity-10 rounded-full text-xs font-semibold text-[var(--headline)] flex items-center"
                        >
                          Category: {category}
                          <button
                            onClick={() => setSelectedCategories(prev => prev.filter(cat => cat !== category))}
                            className="ml-2 hover:text-[var(--highlight)]"
                          >
                            <FaTimes size={10} />
                          </button>
                        </span>
                      ))}

                      {/* Sort tag */}
                      {sortBy !== "default" && (
                        <span className="px-3 py-1.5 bg-[var(--secondary)] bg-opacity-10 rounded-full text-xs font-semibold text-[var(--headline)] flex items-center">
                          Sort: {currentSortLabel}
                          <button
                            onClick={() => setSortBy("default")}
                            className="ml-2 hover:text-[var(--secondary)]"
                          >
                            <FaTimes size={10} />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute top-0 left-0 right-0 bottom-0 animate-spin rounded-full h-16 w-16 border-4 border-t-[var(--highlight)] border-b-[var(--highlight)] border-r-transparent border-l-transparent"></div>
                  <div className="absolute top-2 left-2 right-2 bottom-2 animate-ping rounded-full h-12 w-12 border-4 border-[var(--highlight)] opacity-30"></div>
                </div>
                <p className="text-[var(--paragraph)] mt-4 font-medium">Loading campaigns...</p>
              </div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl border border-[var(--stroke)] shadow-sm"
            >
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaTimes className="text-3xl text-red-500" />
              </div>
              <p className="text-xl font-medium text-[var(--headline)] mb-2">Error loading campaigns</p>
              <p className="text-[var(--paragraph)] max-w-md mx-auto">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchCampaigns}
                className="mt-6 px-6 py-2.5 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-md"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : sortedCampaigns.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedCampaigns.map((campaign) => {
                // Calculate a default deadline of 30 days from now if not provided
                const defaultDeadline = new Date();
                defaultDeadline.setDate(defaultDeadline.getDate() + 30);

                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CampaignCard
                      id={campaign.id}
                      name={campaign.title}
                      description={campaign.description}
                      goal={campaign.target_amount}
                      currentContributions={campaign.current_amount}
                      deadline={campaign.deadline || defaultDeadline.toISOString()}
                      category={campaign.category}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-xl border border-[var(--stroke)] shadow-sm"
            >
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-4xl text-[var(--paragraph)] opacity-30" />
              </div>
              <p className="text-xl font-medium text-[var(--headline)] mb-2">No campaigns found</p>
              <p className="text-[var(--paragraph)] max-w-md mx-auto mb-6">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-6 py-2.5 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-md"
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      ) : activeTab === 'organizations' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center">
              <span className="bg-[var(--secondary)]/10 p-2 rounded-lg mr-3">
                <FaBuilding className="text-[var(--secondary)]" />
              </span>
              Charity Organizations
            </h2>
          </div>

          {organizationsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute top-0 left-0 right-0 bottom-0 animate-spin rounded-full h-16 w-16 border-4 border-t-[var(--secondary)] border-b-[var(--secondary)] border-r-transparent border-l-transparent"></div>
                  <div className="absolute top-2 left-2 right-2 bottom-2 animate-ping rounded-full h-12 w-12 border-4 border-[var(--secondary)] opacity-30"></div>
                </div>
                <p className="text-[var(--paragraph)] mt-4 font-medium">Loading organizations...</p>
              </div>
            </div>
          ) : organizationsError ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl border border-[var(--stroke)] shadow-sm"
            >
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaTimes className="text-3xl text-red-500" />
              </div>
              <p className="text-xl font-medium text-[var(--headline)] mb-2">Error loading organizations</p>
              <p className="text-[var(--paragraph)] max-w-md mx-auto">{organizationsError}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchOrganizations}
                className="mt-6 px-6 py-2.5 bg-[var(--secondary)] text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-md"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : filteredOrganizations.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredOrganizations.map((org) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <OrganizationCard
                    id={org.id}
                    name={org.name}
                    description={org.description}
                    logo={org.logo}
                    campaigns={org.campaigns}
                    totalRaised={org.totalRaised}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-xl border border-[var(--stroke)] shadow-sm"
            >
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-4xl text-[var(--paragraph)] opacity-30" />
              </div>
              <p className="text-xl font-medium text-[var(--headline)] mb-2">No organizations found</p>
              <p className="text-[var(--paragraph)] max-w-md mx-auto mb-6">
                Try adjusting your search terms to find what you're looking for.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchTerm('')}
                className="px-6 py-2.5 bg-[var(--secondary)] text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-md"
              >
                Clear Search
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      ) : activeTab === 'autoDonate' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <div className="flex items-center">
              <span className="bg-[var(--highlight)]/10 p-2 rounded-lg mr-3">
                <FaMoneyBillWave className="text-[var(--highlight)]" />
              </span>
              <h2 className="text-2xl font-bold text-[var(--headline)]">Auto Donation Settings</h2>
            </div>
            <p className="mt-2 text-[var(--paragraph)] ml-12">Set up recurring donations to support causes that matter to you.</p>
          </div>
          <AutoDonation />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <div className="flex items-center">
              <span className="bg-[var(--secondary)]/10 p-2 rounded-lg mr-3">
                <FaHistory className="text-[var(--secondary)]" />
              </span>
              <h2 className="text-2xl font-bold text-[var(--headline)]">My Supported Campaigns</h2>
            </div>
            <p className="mt-2 text-[var(--paragraph)] ml-12">View your donation history and track the impact of your contributions.</p>
          </div>
          <DonorSupportedCampaigns />
        </motion.div>
      )}
    </div>
  );
};

export default CharityPage; 