import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHandHoldingHeart, FaMoneyBillWave, FaCalendarAlt, FaChartLine, FaChevronRight, FaPlus } from "react-icons/fa";
import { charityService, Campaign } from "../../../../../services/supabase/charityService";
import { toast } from "react-toastify";

interface CharityCampaignsProps {
  onAddCampaign?: () => void;
}

const CharityCampaigns: React.FC<CharityCampaignsProps> = ({ onAddCampaign }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Fetch actual campaigns from database
  useEffect(() => {
    fetchCampaigns();

    // Listen for refresh events from parent component
    const handleRefresh = () => {
      fetchCampaigns();
    };
    
    window.addEventListener('refreshCampaigns', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshCampaigns', handleRefresh);
    };
  }, []);

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

  const handleView = (id: string) => {
    navigate(`/charity/${id}`);
  };

  const handleAddCampaign = () => {
    if (onAddCampaign) {
      onAddCampaign();
    }
  };

  // Calculate statistics for the overview section
  const totalCampaigns = campaigns.length;
  const totalRaised = campaigns.reduce((sum, campaign) => sum + (campaign.current_amount || 0), 0);
  const activeCampaigns = campaigns.filter(campaign => 
    campaign.status === 'active'
  ).length;

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)] mb-4"></div>
          <p className="text-[var(--paragraph)]">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex justify-center">
        <div className="flex flex-col items-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Overview */}
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
        <div className="p-6 border-b border-[var(--stroke)]">
          <h2 className="text-xl font-bold text-[var(--headline)]">Campaign Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--stroke)]">
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-[var(--tertiary)] mb-2">
              <FaHandHoldingHeart className="text-xl" />
              <span className="text-sm font-medium">Total Campaigns</span>
            </div>
            <span className="text-3xl font-bold text-[var(--headline)]">{totalCampaigns}</span>
          </div>
          
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-[var(--secondary)] mb-2">
              <FaMoneyBillWave className="text-xl" />
              <span className="text-sm font-medium">Total Raised</span>
            </div>
            <span className="text-3xl font-bold text-[var(--headline)]">RM{totalRaised.toLocaleString()}</span>
          </div>
          
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-[var(--highlight)] mb-2">
              <FaCalendarAlt className="text-xl" />
              <span className="text-sm font-medium">Active Campaigns</span>
            </div>
            <span className="text-3xl font-bold text-[var(--headline)]">{activeCampaigns}</span>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
        <div className="p-6 border-b border-[var(--stroke)] bg-[var(--background)] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[var(--headline)]">Your Campaigns</h2>
            <p className="text-[var(--paragraph)] text-sm mt-1">
              View and manage your fundraising campaigns
            </p>
          </div>
          {/* Only show this button if there's no parent button */}
          {!onAddCampaign && (
            <button 
              onClick={handleAddCampaign}
              className="px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90 flex items-center gap-2"
            >
              <FaPlus /> New Campaign
            </button>
          )}
        </div>
        
        {campaigns.length > 0 ? (
          <div className="divide-y divide-[var(--stroke)]">
            {campaigns.map((campaign) => {
              const progress = Math.min(100, ((campaign.current_amount || 0) / (campaign.target_amount || 1)) * 100);
              const isActive = campaign.status === 'active';
              const isCompleted = campaign.status === 'completed';
              const isExpired = campaign.status === 'expired';
              
              let statusColor = "text-green-600 bg-green-100";
              if (isCompleted) statusColor = "text-blue-600 bg-blue-100";
              if (isExpired) statusColor = "text-yellow-600 bg-yellow-100";
              
              return (
                <div 
                  key={campaign.id}
                  onClick={() => handleView(campaign.id)}
                  className="p-6 hover:bg-[var(--background)] transition-all duration-300 cursor-pointer group relative"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleView(campaign.id);
                    }
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-[var(--headline)] group-hover:text-[var(--highlight)] transition-colors">
                          {campaign.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {isActive ? 'Active' : isCompleted ? 'Completed' : 'Expired'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-[var(--paragraph)] line-clamp-2 mb-3">
                        {campaign.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-[var(--paragraph)]">
                        <span className="flex items-center gap-1">
                          <FaMoneyBillWave className="text-[var(--tertiary)]" />
                          Goal: RM{campaign.target_amount?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaChartLine className="text-[var(--secondary)]" />
                          Raised: RM{campaign.current_amount?.toLocaleString() || 0}
                        </span>
                        {campaign.deadline && (
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="text-[var(--paragraph)]" />
                            Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-3 w-full bg-[var(--background)] rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-blue-500' : isActive ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-[var(--paragraph)] flex justify-between">
                        <span>{progress.toFixed(0)}% Complete</span>
                        <span>RM{campaign.current_amount?.toLocaleString() || 0} of RM{campaign.target_amount?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    <FaChevronRight className="text-[var(--paragraph)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--highlight)] transition-all" />
                  </div>
                  <div className="absolute inset-y-0 right-0 w-1 bg-[var(--highlight)] scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-[var(--background)] p-4 rounded-full mb-4">
              <FaHandHoldingHeart className="text-[var(--highlight)] text-4xl opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-[var(--headline)] mb-2">No Campaigns Yet</h3>
            <p className="text-[var(--paragraph)] mb-6 max-w-md">
              You haven't created any fundraising campaigns yet. Start your first campaign to begin raising funds for your cause.
            </p>
            <button 
              onClick={handleAddCampaign}
              className="px-6 py-3 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90 flex items-center gap-2"
            >
              <FaPlus /> Create Your First Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

CharityCampaigns.defaultProps = {
  onAddCampaign: undefined
};

export default CharityCampaigns;