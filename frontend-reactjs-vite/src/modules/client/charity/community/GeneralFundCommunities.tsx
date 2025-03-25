import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaComments, FaClock, FaPlus, FaSearch, FaFilter, FaSort } from "react-icons/fa";
import { toast } from "react-toastify";

interface GeneralFundCommunity {
  id: number;
  name: string;
  members: number;
  posts: number;
  lastActive: string;
  description: string;
  donationTotal: number;
  donorsCount: number;
}

const GeneralFundCommunities: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });
  const [sortBy, setSortBy] = useState<"members" | "activity" | "donations">("activity");
  
  // Mock data - In a real app, fetch from your backend
  const [communities, setCommunities] = useState<GeneralFundCommunity[]>([
    {
      id: 1,
      name: "General Relief Fund",
      members: 450,
      posts: 120,
      lastActive: "1h ago",
      description: "Community for donors who contribute to our general relief fund.",
      donationTotal: 45000,
      donorsCount: 320
    },
    {
      id: 2,
      name: "Emergency Response",
      members: 380,
      posts: 95,
      lastActive: "3h ago",
      description: "Supporting our emergency response initiatives around the world.",
      donationTotal: 38500,
      donorsCount: 275
    },
    {
      id: 3,
      name: "Operational Support",
      members: 210,
      posts: 65,
      lastActive: "1d ago",
      description: "Community for donors who help fund our day-to-day operations.",
      donationTotal: 27500,
      donorsCount: 180
    }
  ]);

  const handleCreateCommunity = () => {
    if (!newCommunity.name || !newCommunity.description) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // In a real app, send to your backend
    const newCommunityObj: GeneralFundCommunity = {
      id: communities.length + 1,
      name: newCommunity.name,
      description: newCommunity.description,
      members: 0,
      posts: 0,
      lastActive: "Just now",
      donationTotal: 0,
      donorsCount: 0
    };
    
    setCommunities([...communities, newCommunityObj]);
    setNewCommunity({ name: "", description: "" });
    setShowCreateForm(false);
    toast.success("Community created successfully!");
  };

  const handleNavigateToCommunity = (id: number) => {
    navigate(`/charity/community/general/${id}`);
  };

  // Sort communities based on selected criteria
  const sortedCommunities = [...communities].sort((a, b) => {
    if (sortBy === "members") {
      return b.members - a.members;
    } else if (sortBy === "donations") {
      return b.donationTotal - a.donationTotal;
    } else {
      // Sort by activity (most recent first)
      return a.lastActive.localeCompare(b.lastActive);
    }
  });

  // Filter communities based on search term
  const filteredCommunities = sortedCommunities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[var(--background)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--headline)]">General Fund Communities</h1>
            <p className="text-[var(--paragraph)] mt-1">
              Manage communities for donors who contribute to your general funds
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Create Community
          </button>
        </div>

        {/* Create Community Form */}
        {showCreateForm && (
          <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Create New Community</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                  className="w-full px-3 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                  placeholder="Enter community name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">
                  Description
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                  className="w-full px-3 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] min-h-[100px]"
                  placeholder="Describe this community"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-[var(--stroke)] rounded-lg text-[var(--paragraph)] hover:bg-[var(--background)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCommunity}
                  className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Create Community
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search communities..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--stroke)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--paragraph)]" />
          </div>
          
          <select
            className="px-3 py-2 rounded-lg border border-[var(--stroke)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] bg-[var(--main)]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "members" | "activity" | "donations")}
          >
            <option value="activity">Sort by Activity</option>
            <option value="members">Sort by Members</option>
            <option value="donations">Sort by Donation Amount</option>
          </select>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map(community => (
            <div
              key={community.id}
              onClick={() => handleNavigateToCommunity(community.id)}
              className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden hover:border-[var(--highlight)] transition-all duration-300 cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-2xl font-bold">
                    {community.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--headline)] group-hover:text-[var(--highlight)] transition-colors">
                      {community.name}
                    </h3>
                    <p className="text-sm text-[var(--paragraph)]">
                      General Fund Community
                    </p>
                  </div>
                </div>
                
                <p className="mt-4 text-[var(--paragraph)] line-clamp-2">
                  {community.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-[var(--background)] p-3 rounded-lg">
                    <p className="text-xs text-[var(--paragraph)]">Total Donations</p>
                    <p className="text-lg font-bold text-[var(--headline)]">${community.donationTotal.toLocaleString()}</p>
                  </div>
                  <div className="bg-[var(--background)] p-3 rounded-lg">
                    <p className="text-xs text-[var(--paragraph)]">Donors</p>
                    <p className="text-lg font-bold text-[var(--headline)]">{community.donorsCount}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm text-[var(--paragraph)]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FaUsers className="text-[var(--tertiary)]" />
                      {community.members}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaComments className="text-[var(--secondary)]" />
                      {community.posts}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-[var(--paragraph)]" />
                    {community.lastActive}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-10 text-center">
            <p className="text-[var(--paragraph)]">No communities found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralFundCommunities; 