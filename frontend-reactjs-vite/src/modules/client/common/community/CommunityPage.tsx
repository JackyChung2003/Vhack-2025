import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaSearch, FaHandHoldingHeart, FaBuilding, FaHashtag, FaTags, FaFire, FaClock } from "react-icons/fa";
import CommunityCard from "../../../../components/cards/CommunityCard";
import CommunitySidebar from "./components/CommunitySidebar";

const CommunityPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'campaign' | 'organization'>('campaign');
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'new'>('all');
  const navigate = useNavigate();

  // Mock data for communities
  const campaignCommunities = [
    { id: 1, name: "Clean Water Initiative", members: 128, posts: 45, lastActive: "2 hours ago", image: "" },
    { id: 2, name: "Education for All", members: 256, posts: 87, lastActive: "5 hours ago", image: "" },
    { id: 3, name: "Wildlife Conservation", members: 192, posts: 63, lastActive: "1 day ago", image: "" },
    { id: 4, name: "Hunger Relief", members: 312, posts: 102, lastActive: "3 hours ago", image: "" },
    { id: 5, name: "Medical Aid", members: 175, posts: 58, lastActive: "12 hours ago", image: "" },
    { id: 6, name: "Disaster Relief", members: 420, posts: 134, lastActive: "30 minutes ago", image: "" },
  ];

  const organizationCommunities = [
    { id: 1, name: "Global Relief", members: 520, posts: 187, lastActive: "1 hour ago", image: "" },
    { id: 2, name: "EduCare", members: 310, posts: 95, lastActive: "4 hours ago", image: "" },
    { id: 3, name: "Nature First", members: 280, posts: 76, lastActive: "2 days ago", image: "" },
    { id: 4, name: "Health Alliance", members: 450, posts: 156, lastActive: "6 hours ago", image: "" },
    { id: 5, name: "Food for All", members: 215, posts: 62, lastActive: "1 day ago", image: "" },
    { id: 6, name: "Clean Earth Initiative", members: 380, posts: 112, lastActive: "8 hours ago", image: "" },
  ];

  const filteredCampaignCommunities = campaignCommunities.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrganizationCommunities = organizationCommunities.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Left Sidebar - Categories & Filters */}
      <div className="hidden lg:block w-64 p-6 bg-[var(--main)] border-r border-[var(--stroke)]">
        <h2 className="text-lg font-bold mb-4 text-[var(--headline)]">Discover</h2>
        <div className="space-y-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeFilter === 'all' 
                ? 'bg-[var(--highlight)] bg-opacity-10 text-[var(--highlight)]' 
                : 'hover:bg-[var(--stroke)] text-[var(--paragraph)]'
            }`}
          >
            <FaHashtag /> All Communities
          </button>
          <button
            onClick={() => setActiveFilter('trending')}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeFilter === 'trending'
                ? 'bg-[var(--highlight)] bg-opacity-10 text-[var(--highlight)]'
                : 'hover:bg-[var(--stroke)] text-[var(--paragraph)]'
            }`}
          >
            <FaFire /> Trending
          </button>
          <button
            onClick={() => setActiveFilter('new')}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeFilter === 'new'
                ? 'bg-[var(--highlight)] bg-opacity-10 text-[var(--highlight)]'
                : 'hover:bg-[var(--stroke)] text-[var(--paragraph)]'
            }`}
          >
            <FaClock /> Newest
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4 text-[var(--headline)]">Categories</h2>
          <div className="space-y-2">
            {['Education', 'Healthcare', 'Environment', 'Social Justice', 'Arts & Culture'].map(category => (
              <button
                key={category}
                className="w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[var(--stroke)] text-[var(--paragraph)]"
              >
                <FaTags /> {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-[var(--main)] border-b border-[var(--stroke)]">
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-[var(--headline)] mb-2">Community Hub</h1>
            <p className="text-[var(--paragraph)]">Connect with donors and track impact together</p>
            
            {/* Search bar */}
            <div className="mt-6 relative">
              <input
                type="text"
                placeholder="Search communities..."
                className="w-full pl-10 pr-4 py-3 rounded-full border border-[var(--stroke)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--paragraph)]" />
            </div>
          </div>
        </div>

        {/* Community Grid */}
        <div className="max-w-4xl mx-auto p-6">
          {activeTab === 'campaign' ? (
            filteredCampaignCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCampaignCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    id={community.id}
                    name={community.name}
                    members={community.members}
                    posts={community.posts}
                    lastActive={community.lastActive}
                    image={community.image}
                    type="campaign"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-[var(--paragraph)]">No campaign communities found matching your search.</p>
              </div>
            )
          ) : (
            filteredOrganizationCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOrganizationCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    id={community.id}
                    name={community.name}
                    members={community.members}
                    posts={community.posts}
                    lastActive={community.lastActive}
                    image={community.image}
                    type="organization"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-[var(--paragraph)]">No organization communities found matching your search.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <CommunitySidebar />
    </div>
  );
};

export default CommunityPage; 