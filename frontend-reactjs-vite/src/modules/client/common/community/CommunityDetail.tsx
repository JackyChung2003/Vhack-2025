import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUsers, FaComments, FaClock, FaBell, FaShare, FaEllipsisH } from "react-icons/fa";
import PostFeed from "./components/PostFeed";
import DonationLeaderboard from "./components/DonationLeaderboard";
import TransactionTimeline from "./components/TransactionTimeline";

const CommunityDetail: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'feed' | 'leaderboard'>('feed');
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Community Banner */}
      <div className="relative h-64 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)]">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
        >
          <FaArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16">
        {/* Community Info Card - Overlapping Hero */}
        <div className="bg-[var(--main)] rounded-xl shadow-xl border border-[var(--stroke)] p-6 mb-8 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-4xl font-bold -mt-16 shadow-lg border-4 border-[var(--main)]">
                {/* Community Avatar */}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--headline)]">Clean Water Initiative</h1>
                <p className="text-[var(--paragraph)] mt-2">Campaign Community</p>
                <div className="flex items-center gap-6 mt-4 text-sm text-[var(--paragraph)]">
                  <span className="flex items-center gap-2">
                    <FaUsers className="text-[var(--tertiary)]" /> 1.2k members
                  </span>
                  <span className="flex items-center gap-2">
                    <FaComments className="text-[var(--secondary)]" /> 245 posts
                  </span>
                  <span className="flex items-center gap-2">
                    <FaClock className="text-[var(--paragraph)]" /> Very active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  isFollowing
                    ? 'bg-[var(--background)] text-[var(--headline)] border border-[var(--stroke)]'
                    : 'bg-[var(--highlight)] text-white'
                }`}
              >
                <FaBell className="inline mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="p-2 rounded-lg text-[var(--paragraph)] hover:text-[var(--headline)] hover:bg-[var(--background)] transition-colors">
                <FaShare />
              </button>
              <button className="p-2 rounded-lg text-[var(--paragraph)] hover:text-[var(--headline)] hover:bg-[var(--background)] transition-colors">
                <FaEllipsisH />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-1">
            <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
              <div className="p-6 border-b border-[var(--stroke)]">
                <h2 className="text-xl font-bold text-[var(--headline)]">About</h2>
              </div>
              <div className="p-6">
                <p className="text-[var(--paragraph)] mb-6">
                  This community is dedicated to supporting the Clean Water Initiative campaign. 
                  Join us in our mission to provide clean drinking water to communities in need.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--paragraph)] font-medium">Campaign Goal</span>
                    <span className="text-[var(--headline)] font-bold">$50,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--paragraph)] font-medium">Raised So Far</span>
                    <span className="text-[var(--headline)] font-bold">$32,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--paragraph)] font-medium">Contributors</span>
                    <span className="text-[var(--headline)] font-bold">245</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <TransactionTimeline communityId={Number(id)} communityType={type || ''} />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
              <div className="border-b border-[var(--stroke)] px-6 py-4">
                <div className="flex gap-4">
                  {['feed', 'leaderboard'].map((section) => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section as typeof activeSection)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeSection === section
                          ? 'bg-[var(--highlight)] text-white font-bold'
                          : 'text-[var(--paragraph)] hover:text-[var(--headline)] hover:bg-[var(--background)]'
                      }`}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {activeSection === 'feed' && <PostFeed communityId={Number(id)} communityType={type || ''} />}
                {activeSection === 'leaderboard' && <DonationLeaderboard communityId={Number(id)} communityType={type || ''} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail; 