import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaComments, FaClock, FaChevronRight } from "react-icons/fa";
import { mockCommunities } from "../../../../../utils/mockData";

const CommunityManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // Filter communities for Global Relief (organizationId: 1)
  const communities = mockCommunities.filter(community => community.organizationId === 1);

  const navigateToCommunity = (type: string, id: number) => {
    // Update navigation to go to campaign details with community tab
    if (type === 'campaign') {
      navigate(`/charity/${id}?tab=community`);
    } else {
      navigate(`/organization/${id}?tab=community`);
    }
  };

  // Calculate totals for the overview section
  const totalMembers = communities.reduce((sum, community) => sum + community.members, 0);
  const totalPosts = communities.reduce((sum, community) => sum + community.posts, 0);
  const activeCommunitiesCount = communities.length;

  return (
    <div className="space-y-6">
      {/* Community Overview */}
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
        <div className="p-6 border-b border-[var(--stroke)]">
          <h2 className="text-xl font-bold text-[var(--headline)]">Community Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--stroke)]">
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-[var(--tertiary)] mb-2">
              <FaUsers className="text-xl" />
              <span className="text-sm font-medium">Total Members</span>
            </div>
            <span className="text-3xl font-bold text-[var(--headline)]">{totalMembers}</span>
          </div>
          
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-[var(--secondary)] mb-2">
              <FaComments className="text-xl" />
              <span className="text-sm font-medium">Total Posts</span>
            </div>
            <span className="text-3xl font-bold text-[var(--headline)]">{totalPosts}</span>
          </div>
          
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-[var(--highlight)] mb-2">
              <FaUsers className="text-xl" />
              <span className="text-sm font-medium">Active Communities</span>
            </div>
            <span className="text-3xl font-bold text-[var(--headline)]">{activeCommunitiesCount}</span>
          </div>
        </div>
      </div>

      {/* Communities List */}
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
        <div className="p-6 border-b border-[var(--stroke)] bg-[var(--background)]">
          <h2 className="text-xl font-bold text-[var(--headline)]">Your Communities</h2>
          <p className="text-[var(--paragraph)] text-sm mt-1">
            Manage your campaign and organization communities
          </p>
        </div>
        
        <div className="divide-y divide-[var(--stroke)]">
          {communities.map(community => (
            <div 
              key={community.id}
              onClick={() => navigateToCommunity(community.type, community.id)}
              className="p-6 hover:bg-[var(--background)] transition-all duration-300 cursor-pointer group relative"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateToCommunity(community.type, community.id);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-xl font-bold">
                  {community.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--headline)] group-hover:text-[var(--highlight)] transition-colors">
                      {community.name}
                    </h3>
                    <span className="px-2 py-1 bg-[var(--highlight)] bg-opacity-10 rounded-full text-xs font-medium text-white">
                      {community.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--paragraph)]">
                    <span className="flex items-center gap-1">
                      <FaUsers className="text-[var(--tertiary)]" />
                      {community.members} members
                    </span>
                    <span className="flex items-center gap-1">
                      <FaComments className="text-[var(--secondary)]" />
                      {community.posts} posts
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[var(--paragraph)]" />
                      {community.lastActive}
                    </span>
                  </div>
                </div>
                <FaChevronRight className="text-[var(--paragraph)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--highlight)] transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityManagement; 