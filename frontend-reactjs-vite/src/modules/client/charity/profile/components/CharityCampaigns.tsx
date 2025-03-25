import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHandHoldingHeart, FaDollarSign, FaCalendarAlt, FaChartLine, FaChevronRight } from "react-icons/fa";
import { mockCampaigns } from "../../../../../utils/mockData";

const CharityCampaigns: React.FC = () => {
  const navigate = useNavigate();
  
  // Filter campaigns for Global Relief (organizationId: 1)
  const campaigns = mockCampaigns.filter(campaign => campaign.organizationId === 1);

  const handleView = (id: number) => {
    navigate(`/charity/${id}`);
  };

  // Calculate statistics for the overview section
  const totalCampaigns = campaigns.length;
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.currentContributions, 0);
  const activeCampaigns = campaigns.filter(campaign => 
    new Date(campaign.deadline) > new Date() && campaign.currentContributions < campaign.goal
  ).length;

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
              <FaDollarSign className="text-xl" />
              <span className="text-sm font-medium">Total Raised</span>
            </div>
            <span className="text-3xl font-bold text-[var(--headline)]">${totalRaised.toLocaleString()}</span>
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
        <div className="p-6 border-b border-[var(--stroke)] bg-[var(--background)]">
          <h2 className="text-xl font-bold text-[var(--headline)]">Your Campaigns</h2>
          <p className="text-[var(--paragraph)] text-sm mt-1">
            View and manage your fundraising campaigns
          </p>
        </div>
        
        <div className="divide-y divide-[var(--stroke)]">
          {campaigns.map((campaign) => {
            const progress = Math.min(100, (campaign.currentContributions / campaign.goal) * 100);
            const isActive = new Date(campaign.deadline) > new Date() && campaign.currentContributions < campaign.goal;
            const isCompleted = campaign.currentContributions >= campaign.goal;
            const isExpired = new Date(campaign.deadline) < new Date() && campaign.currentContributions < campaign.goal;
            
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
                        {campaign.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {isActive ? 'Active' : isCompleted ? 'Completed' : 'Expired'}
                      </span>
                      <span className="px-2 py-1 bg-[var(--highlight)] bg-opacity-10 rounded-full text-xs font-medium text-white">
                        {campaign.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-[var(--paragraph)] line-clamp-2 mb-3">
                      {campaign.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-[var(--paragraph)]">
                      <span className="flex items-center gap-1">
                        <FaDollarSign className="text-[var(--tertiary)]" />
                        Goal: ${campaign.goal.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaChartLine className="text-[var(--secondary)]" />
                        Raised: ${campaign.currentContributions.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-[var(--paragraph)]" />
                        Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                      </span>
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
                      <span>${campaign.currentContributions.toLocaleString()} of ${campaign.goal.toLocaleString()}</span>
                    </div>
                  </div>
                  <FaChevronRight className="text-[var(--paragraph)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--highlight)] transition-all" />
                </div>
                <div className="absolute inset-y-0 right-0 w-1 bg-[var(--highlight)] scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharityCampaigns; 