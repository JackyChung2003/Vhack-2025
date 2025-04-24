import React, { useState, useEffect } from "react";
import { FaUser, FaHandHoldingHeart, FaUsers, FaComments, FaTrophy, FaCalendarAlt, FaCog, FaSpinner, FaCamera, FaUserCircle, FaMedal, FaStar, FaHeart, FaHandshake, FaUserFriends, FaLock, FaChartLine, FaArrowRight } from "react-icons/fa";
import DonationHistory from "./components/DonationHistory";
import UserPosts from "./components/UserPosts";
import ContributionStats from "./components/ContributionStats";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../services/supabase/supabaseClient";

// Badge data
const badges = [
  {
    id: 1,
    title: "First Donation",
    description: "Made your first donation to a campaign",
    icon: <FaMedal className="text-3xl" />,
    color: "blue",
    earned: true,
    earnedDate: "2023-04-15",
  },
  {
    id: 2,
    title: "Serial Supporter",
    description: "Donated to 5 different campaigns",
    icon: <FaTrophy className="text-3xl" />,
    color: "purple",
    earned: true,
    earnedDate: "2023-06-22",
  },
  {
    id: 3,
    title: "Monthly Hero",
    description: "Made donations for 3 consecutive months",
    icon: <FaStar className="text-3xl" />,
    color: "yellow",
    earned: true,
    earnedDate: "2023-07-30",
  },
  {
    id: 6,
    title: "Early Bird",
    description: "Donated to a campaign within 24 hours of its launch",
    icon: <FaHandshake className="text-3xl" />,
    color: "orange",
    earned: true,
    earnedDate: "2023-08-05",
  },
  {
    id: 4,
    title: "Big Heart",
    description: "Donated a total of RM1,000",
    icon: <FaHeart className="text-3xl" />,
    color: "red",
    earned: false,
    progress: 75, // Percentage progress towards earning this badge
  },
  {
    id: 5,
    title: "Community Builder",
    description: "Referred 3 friends who made donations",
    icon: <FaUserFriends className="text-3xl" />,
    color: "green",
    earned: false,
    progress: 33, // Percentage progress towards earning this badge
  },
  {
    id: 7,
    title: "Long Term Supporter",
    description: "Followed and donated to the same charity for 6 months",
    icon: <FaChartLine className="text-3xl" />,
    color: "teal",
    earned: false,
    progress: 50,
  },
];

interface DonorProfileProps {
  activeTab?: 'donations' | 'badges' | 'posts' | 'settings';
}

const DonorProfile: React.FC<DonorProfileProps> = ({ activeTab: initialTab = 'donations' }) => {
  const [activeTab, setActiveTab] = useState<'donations' | 'badges' | 'posts'>('donations');
  const [expandBadges, setExpandBadges] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    joinDate: new Date().toISOString().split('T')[0],
    totalDonations: 0,
    totalCampaigns: 0,
    badgesEarned: 0,
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
        
        // Fetch total donations amount from database - using campaign_donations table which is the correct table name
        const { data: donationsData, error: donationsError } = await supabase
          .from('campaign_donations')
          .select('amount')
          .eq('user_id', user.id); // Using user_id instead of donor_id
          
        if (donationsError) {
          console.error('Error fetching campaign donations:', donationsError);
        }
        
        // Calculate total donations
        const totalDonations = donationsData ? donationsData.reduce((sum, donation) => sum + (donation.amount || 0), 0) : 0;
        
        // Fetch campaigns user has donated to
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaign_donations')
          .select('campaign_id')
          .eq('user_id', user.id) // Using user_id instead of donor_id
          .not('campaign_id', 'is', null); // Only count donations to campaigns
          
        if (campaignsError) {
          console.error('Error fetching campaign donations:', campaignsError);
        }
        
        // Count unique campaigns
        const uniqueCampaigns = campaignsData 
          ? new Set(campaignsData.map(donation => donation.campaign_id)).size 
          : 0;
        
        setUserData({
          name: settingsData?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Anonymous Donor",
          joinDate: savedJoinDate,
          totalDonations: totalDonations, // Real data from database
          totalCampaigns: uniqueCampaigns, // Real data from database
          badgesEarned: badges.filter(badge => badge.earned).length,  // Keep hardcoded value
          postsCount: 5,        // Keep hardcoded value
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


  // Get the badges to display
  const displayBadges =  badges; 

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
                <Stat icon={<FaMedal />} value={userData.badgesEarned} label="Badges Earned" />
                <Stat icon={<FaComments />} value={userData.postsCount} label="Posts" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] mb-8">
          <div className="flex p-2">
            {['donations', 'badges', 'posts'].map((tab) => (
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
                {tab === 'badges' && <FaMedal className="inline mr-2" />}
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
          {activeTab === 'badges' && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--headline)]">Your Achievement Badges</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`bg-[var(--main)] rounded-xl shadow-md overflow-hidden border border-${badge.color}-200 transition-all hover:shadow-lg text-center p-4 ${!badge.earned && 'opacity-70'}`}
                    >
                      <div className={`mx-auto w-16 h-16 rounded-full mb-3 flex items-center justify-center bg-${badge.color}-100 relative`}>
                        <div className={`text-${badge.color}-600`}>
                          {badge.icon}
                        </div>
                        {!badge.earned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70 rounded-full">
                            <FaLock className="text-gray-500 text-xl" />
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-[var(--headline)] mb-1">{badge.title}</h3>
                      <p className="text-xs text-[var(--paragraph)] mb-2">{badge.description}</p>

                      {badge.earned ? (
                        <div className="text-xs text-green-600 font-medium">
                          Earned {badge.earnedDate ? new Date(badge.earnedDate).toLocaleDateString() : ''}
                        </div>
                      ) : (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                          <div
                            className={`bg-${badge.color}-500 h-1.5 rounded-full`}
                            style={{ width: `${badge.progress}%` }}
                          ></div>
                        </div>
                      )}

                      {!badge.earned && (
                        <div className="text-xs text-[var(--paragraph)]">
                          {badge.progress}% complete
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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