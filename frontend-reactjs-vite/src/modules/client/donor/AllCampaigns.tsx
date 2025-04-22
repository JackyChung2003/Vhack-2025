import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaArrowLeft, FaTimes, FaChevronDown, FaChevronUp, FaSort } from 'react-icons/fa';
import { charityService, Campaign } from '../../../services/supabase/charityService';

// Define sorting options
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "goal_high", label: "Goal: High to Low" },
  { value: "goal_low", label: "Goal: Low to High" },
  { value: "progress_high", label: "Progress: High to Low" },
  { value: "progress_low", label: "Progress: Low to High" },
  { value: "days_left", label: "Days Left: Least to Most" },
];

const AllCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await charityService.getAllCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const navigateToCampaign = (id: string) => {
    navigate(`/charity/${id}`);
  };

  const goBack = () => {
    navigate(-1);
  };

  // Calculate days left from deadline
  const getDaysLeft = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSortBy("newest");
  };

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (campaign.charity?.name && campaign.charity.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort campaigns based on selected criteria
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "goal_high":
        return (b.target_amount || 0) - (a.target_amount || 0);
      case "goal_low":
        return (a.target_amount || 0) - (b.target_amount || 0);
      case "progress_high": {
        const progressA = ((a.current_amount || 0) / (a.target_amount || 1)) * 100;
        const progressB = ((b.current_amount || 0) / (b.target_amount || 1)) * 100;
        return progressB - progressA;
      }
      case "progress_low": {
        const progressA = ((a.current_amount || 0) / (a.target_amount || 1)) * 100;
        const progressB = ((b.current_amount || 0) / (b.target_amount || 1)) * 100;
        return progressA - progressB;
      }
      case "days_left": {
        const daysLeftA = getDaysLeft(a.deadline);
        const daysLeftB = getDaysLeft(b.deadline);
        return daysLeftA - daysLeftB;
      }
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header with navigation */}
      <div className="flex items-center mb-6">
        <button 
          onClick={goBack}
          className="mr-4 p-2 rounded-full bg-[var(--background)] hover:bg-[var(--stroke)] transition-colors"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-[var(--headline)]" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--headline)]">All Campaigns</h1>
      </div>

      {/* Search and filter bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative flex items-center gap-2 min-w-[200px]">
            <div className="relative flex-1 w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] appearance-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <FaChevronDown className="text-gray-400" size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-[var(--paragraph)]">
          Showing {sortedCampaigns.length} of {campaigns.length} campaigns
        </div>
      </div>

      {/* Campaigns grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--highlight)]"></div>
        </div>
      ) : sortedCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCampaigns.map((campaign) => (
            <div 
              key={campaign.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden border border-[var(--stroke)] transition-all hover:shadow-lg cursor-pointer"
              onClick={() => navigateToCampaign(campaign.id)}
            >
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={campaign.image_url || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80'} 
                  alt={campaign.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute left-0 bottom-0 p-3 text-white">
                  <h3 className="text-lg font-bold">{campaign.title}</h3>
                  <p className="text-white/80 text-xs">By {campaign.charity?.name || 'Organization'}</p>
                </div>
                {campaign.category && (
                  <div className="absolute right-3 top-3">
                    <span className="px-2 py-1 bg-black/30 text-white text-xs rounded-full backdrop-blur-sm">
                      {campaign.category}
                    </span>
                  </div>
                )}
                {new Date(campaign.created_at).getTime() > (Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                  <div className="absolute left-3 top-3">
                    <span className="px-2 py-1 bg-[var(--highlight)] text-white text-xs rounded-full">
                      New
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <p className="text-[var(--paragraph)] text-sm mb-3 line-clamp-2">
                  {campaign.description}
                </p>
                
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--paragraph)]">Progress</span>
                    <span className="font-medium">{Math.round(((campaign.current_amount || 0) / (campaign.target_amount || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[var(--highlight)] h-2 rounded-full" 
                      style={{ width: `${((campaign.current_amount || 0) / (campaign.target_amount || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-xs mt-4">
                  <div>
                    <span className="text-[var(--paragraph)]">Raised</span>
                    <p className="font-semibold text-[var(--headline)]">RM{(campaign.current_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[var(--paragraph)]">Goal</span>
                    <p className="font-semibold text-[var(--headline)]">RM{(campaign.target_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[var(--paragraph)]">Days Left</span>
                    <p className="font-semibold text-[var(--headline)]">{getDaysLeft(campaign.deadline)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-[var(--paragraph)] mb-4">No campaigns found matching your search criteria.</p>
          <button 
            onClick={clearFilters}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AllCampaigns; 