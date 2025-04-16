import React, { useState, useEffect } from "react";
import { FaUser, FaHandHoldingHeart, FaUsers, FaComments, FaTrophy, FaCalendarAlt, FaCog, FaSpinner, FaCamera, FaUserCircle } from "react-icons/fa";
import DonationHistory from "./components/DonationHistory";
import JoinedCommunities from "./components/JoinedCommunities";
import UserPosts from "./components/UserPosts";
import ContributionStats from "./components/ContributionStats";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../services/supabase/supabaseClient";


interface DonorProfileProps {
  activeTab?: 'donations' | 'communities' | 'posts' | 'settings';
}

const DonorProfile: React.FC<DonorProfileProps> = ({ activeTab: initialTab = 'donations' }) => {
  const [activeTab, setActiveTab] = useState<'donations' | 'communities' | 'posts'>('donations');
  const [userData, setUserData] = useState({
    name: "",
    joinDate: new Date().toISOString().split('T')[0],
    totalDonations: 0,
    totalCampaigns: 0,
    communitiesJoined: 0,
    postsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Load user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get display name from database (user_settings table)
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('display_name, anonymous_donation')
          .eq('user_id', user.id)
          .single();
          
        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('Error fetching user settings:', settingsError);
          setError('Failed to load user settings');
        }
        
        // Get join date or default to current date if not found
        const savedJoinDate = localStorage.getItem('userJoinDate') || new Date().toISOString().split('T')[0];
        if (!localStorage.getItem('userJoinDate')) {
          localStorage.setItem('userJoinDate', savedJoinDate);
        }
        
        // Get donation data - in a real app, this would come from the database
        // For demo, we'll use mock data
        
        setUserData({
          name: settingsData?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Anonymous Donor",
          joinDate: savedJoinDate,
          totalDonations: 15000, // Mock data
          totalCampaigns: 12,    // Mock data
          communitiesJoined: 5,  // Mock data
          postsCount: 28,        // Mock data
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center p-8 bg-[var(--main)] rounded-lg shadow-lg">
          <FaSpinner className="animate-spin text-4xl text-[var(--highlight)] mx-auto mb-4" />
          <p className="text-[var(--headline)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center p-8 bg-[var(--main)] rounded-lg shadow-lg border-l-4 border-red-500">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] h-48">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-white text-3xl font-bold pt-12 relative z-10 drop-shadow-md">Donor Profile</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16">
        {/* Profile Card */}
        <div className="bg-[var(--main)] rounded-xl shadow-xl border border-[var(--stroke)] p-6 mb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {user?.user_metadata?.avatar_url ? (
              <div className="relative">
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg border-4 border-[var(--main)]" />
              </div>
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg border-4 border-[var(--main)] relative">
                <FaUserCircle size={50} />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer" onClick={() => document.getElementById('profilePictureInput')?.click()}>
                  <FaCamera size={20} className="text-white" />
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--headline)]">{userData.name}</h1>
                  <div className="flex items-center gap-2 text-[var(--paragraph)] mt-1">
                    <span className="flex items-center gap-1 text-sm">
                      <FaCalendarAlt />
                      Joined {new Date(userData.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 mt-4 md:mt-0">
                  <button
                    onClick={handleSettingsClick}
                    className="px-4 py-2 bg-[var(--background)] border border-[var(--stroke)] rounded-lg text-sm hover:bg-[var(--highlight)] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FaCog />
                    Settings
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Stat icon={<FaHandHoldingHeart />} value={`RM${userData.totalDonations.toLocaleString()}`} label="Total Donated" />
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