import React, { useState } from "react";
import { FaUser, FaHandHoldingHeart, FaUsers, FaComments, FaTrophy, FaCalendarAlt } from "react-icons/fa";
import DonationHistory from "./components/DonationHistory";
import JoinedCommunities from "./components/JoinedCommunities";
import UserPosts from "./components/UserPosts";
import ContributionStats from "./components/ContributionStats";
import LoginButton from "../../../../components/Button/LoginButton";

const DonorProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donations' | 'communities' | 'posts'>('donations');

  // Mock user data - In real app, fetch from your backend
  const userData = {
    name: "John Doe",
    walletAddress: "0x1234...5678",
    joinDate: "2024-01-15",
    totalDonations: 15000,
    totalCampaigns: 12,
    communitiesJoined: 5,
    postsCount: 28,
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] h-48">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-white text-3xl font-bold pt-12 relative z-10 drop-shadow-md">Donor Dashboard</h1>
          <p className="text-white text-opacity-90 relative z-10 drop-shadow-sm">Track your impact and engagement</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16">
        {/* Profile Card - Overlapping Hero */}
        <div className="bg-[var(--main)] rounded-xl shadow-xl border border-[var(--stroke)] p-6 mb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg border-4 border-[var(--main)]">
              {userData.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--headline)]">{userData.name}</h1>
                  <div className="flex items-center gap-2 text-[var(--paragraph)] mt-1">
                    <span className="bg-[var(--highlight)] bg-opacity-20 text-white font-bold px-3 py-1 rounded-full text-sm drop-shadow-sm">
                      Donor
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <FaCalendarAlt />
                      Joined {new Date(userData.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <LoginButton />
                  {/* <div className="mt-4 md:mt-0">
                  <div className="bg-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium text-[var(--headline)] flex items-center gap-2 border border-[var(--stroke)]">
                    <span className="font-bold">Wallet:</span>
                    <span className="font-mono">{userData.walletAddress}</span>
                  </div>
                </div> */}
                </div>
                
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Stat icon={<FaHandHoldingHeart />} value={`$${userData.totalDonations.toLocaleString()}`} label="Total Donated" />
                <Stat icon={<FaTrophy />} value={userData.totalCampaigns} label="Campaigns Supported" />
                <Stat icon={<FaUsers />} value={userData.communitiesJoined} label="Communities" />
                <Stat icon={<FaComments />} value={userData.postsCount} label="Posts" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] mb-8">
          <div className="flex p-2">
            {['donations', 'communities', 'posts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[var(--highlight)] text-white font-bold shadow-sm'
                    : 'text-[var(--paragraph)] hover:text-[var(--headline)] hover:bg-[var(--background)]'
                }`}
              >
                {tab === 'donations' && <FaHandHoldingHeart className="inline mr-2" />}
                {tab === 'communities' && <FaUsers className="inline mr-2" />}
                {tab === 'posts' && <FaComments className="inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 mb-12">
          {activeTab === 'donations' && (
            <>
              <div className="animate-fadeIn">
                <ContributionStats />
              </div>
              <div className="animate-fadeIn delay-100">
                <DonationHistory />
              </div>
            </>
          )}
          {activeTab === 'communities' && (
            <div className="animate-fadeIn">
              <JoinedCommunities />
            </div>
          )}
          {activeTab === 'posts' && (
            <div className="animate-fadeIn">
              <UserPosts />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat component with improved contrast
const Stat: React.FC<{ icon: React.ReactNode; value: number | string; label: string }> = ({ icon, value, label }) => (
  <div className="bg-[var(--background)] p-4 rounded-lg hover:shadow-md transition-shadow border border-[var(--stroke)]">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[var(--highlight)]">{icon}</span>
      <span className="font-semibold text-[var(--headline)]">{label}</span>
    </div>
    <p className="text-xl font-bold text-[var(--headline)]">{value}</p>
  </div>
);

export default DonorProfile; 