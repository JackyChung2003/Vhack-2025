import React, { useState } from "react";
import { FaUsers, FaComments, FaClock, FaBullhorn, FaTrash } from "react-icons/fa";

const CommunityManagement: React.FC = () => {
  // Mock community data - In real app, fetch from your backend
  const [communities, setCommunities] = useState([
    {
      id: 1,
      name: "Clean Water Supporters",
      members: 128,
      posts: 45,
      lastActive: "2h ago",
      type: "campaign"
    },
    {
      id: 2,
      name: "Global Relief Community",
      members: 520,
      posts: 187,
      lastActive: "1h ago",
      type: "organization"
    }
  ]);

  const handleDeleteCommunity = (id: number) => {
    if (window.confirm("Are you sure you want to delete this community?")) {
      setCommunities(communities.filter(community => community.id !== id));
      // In a real app, make an API call to delete the community
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
        <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Community Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--background)] p-4 rounded-lg">
            <div className="flex items-center gap-2 text-[var(--highlight)] mb-1">
              <FaUsers />
              <span className="font-medium">Total Members</span>
            </div>
            <p className="text-2xl font-bold text-[var(--headline)]">
              {communities.reduce((sum, community) => sum + community.members, 0)}
            </p>
          </div>
          
          <div className="bg-[var(--background)] p-4 rounded-lg">
            <div className="flex items-center gap-2 text-[var(--highlight)] mb-1">
              <FaComments />
              <span className="font-medium">Total Posts</span>
            </div>
            <p className="text-2xl font-bold text-[var(--headline)]">
              {communities.reduce((sum, community) => sum + community.posts, 0)}
            </p>
          </div>
          
          <div className="bg-[var(--background)] p-4 rounded-lg">
            <div className="flex items-center gap-2 text-[var(--highlight)] mb-1">
              <FaBullhorn />
              <span className="font-medium">Active Communities</span>
            </div>
            <p className="text-2xl font-bold text-[var(--headline)]">{communities.length}</p>
          </div>
        </div>
      </div>

      {/* Communities List */}
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
        <div className="p-6 border-b border-[var(--stroke)]">
          <h2 className="text-xl font-bold text-[var(--headline)]">Your Communities</h2>
          <p className="text-[var(--paragraph)] text-sm mt-1">
            Manage your campaign and organization communities
          </p>
        </div>
        
        <div className="divide-y divide-[var(--stroke)]">
          {communities.map(community => (
            <div key={community.id} className="p-6 flex items-center justify-between hover:bg-[var(--background)] transition-colors">
              <div className="flex-1">
                <h3 className="font-medium text-[var(--headline)]">{community.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-[var(--paragraph)]">
                  <span className="flex items-center gap-1">
                    <FaUsers />
                    {community.members} members
                  </span>
                  <span className="flex items-center gap-1">
                    <FaComments />
                    {community.posts} posts
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock />
                    {community.lastActive}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {communities.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[var(--paragraph)]">No communities found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityManagement; 