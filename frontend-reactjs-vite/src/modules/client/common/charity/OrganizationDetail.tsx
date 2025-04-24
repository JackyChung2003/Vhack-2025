import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft, FaHandHoldingHeart, FaBuilding, FaUsers, FaHistory, FaChartLine,
  FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaComments, FaClock, FaPencilAlt, FaTimes, FaPlus, FaFacebook, FaTwitter, FaInstagram, FaCoins, FaChevronLeft, FaGift, FaTrophy, FaExternalLinkAlt, FaDownload, FaHandHoldingUsd
} from "react-icons/fa";
import { motion } from "framer-motion";
import CampaignCard from "../../../../components/cards/CampaignCard";
import { useRole } from "../../../../contexts/RoleContext";
import { mockDonorContributions } from "../../../../utils/mockData";
import DonationModal from "../../../../components/modals/DonationModal";
import { toast } from "react-toastify";
import PostFeed from "../../common/community/components/PostFeed";
import { useVendorChatStore } from "../../../../services/VendorChatService";
import ChatModal from "../../../client/vendor/VendorHomePage/ChatModal";
import { charityService, CharityProfile as CharityProfileType } from "../../../../services/supabase/charityService";
import CharityInfo from "../../charity/profile/components/CharityInfo";
import AddCampaignModal from "../../../../components/modals/AddCampaignModal";
import CampaignTimeline from "../../../../components/campaign/CampaignTimeline";
import DonorLeaderboardAndTracker from "../../../../components/donation/DonorLeaderboardAndTracker";
import { DonationTracker } from "../../../../utils/mockData";
import { getTransactionExplorerUrl } from "../../../../services/blockchain/blockchainService";
import supabase from "../../../../services/supabase/supabaseClient";
import SimpleDonationVerifier from "../../../../components/donation/SimpleDonationVerifier";

const OrganizationDetail: React.FC = () => {
  const { id: organizationIdString } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useRole();
  const [activeTab, setActiveTab] = useState("about");
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const { openChat } = useVendorChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [communityView, setCommunityView] = useState<'feed' | 'members'>('feed');

  // For charity viewing own profile
  const [charityProfile, setCharityProfile] = useState<CharityProfileType | null>(null);
  const [charityLoading, setCharityLoading] = useState(false);
  const [charityError, setCharityError] = useState<string | null>(null);

  // For charity's own campaigns
  const [charityCampaigns, setCharityCampaigns] = useState<any[]>([]);
  const [charityCampaignsLoading, setCharityCampaignsLoading] = useState(false);
  const [charityCampaignsError, setCharityCampaignsError] = useState<string | null>(null);

  // For general fund data
  const [generalFund, setGeneralFund] = useState<{ totalAmount: number, donationsCount: number }>({ totalAmount: 0, donationsCount: 0 });
  const [generalFundLoading, setGeneralFundLoading] = useState(false);
  const [generalFundError, setGeneralFundError] = useState<string | null>(null);

  // For external organization view
  const [organization, setOrganization] = useState<any>(null);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [organizationError, setOrganizationError] = useState<string | null>(null);
  const [organizationCampaigns, setOrganizationCampaigns] = useState<any[]>([]);

  // For timeline data
  const [goalAmount, setGoalAmount] = useState<number>(100000); // Default goal amount for organization
  const [daysLeft, setDaysLeft] = useState<number>(365); // Default yearly goal
  const [todayDonations, setTodayDonations] = useState<number>(0); // Today's donations

  // Add state for blockchain transactions
  const [blockchainTransactions, setBlockchainTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Determine if we're viewing as charity's own profile
  const isOwnProfile = userRole === 'charity' && !organizationIdString;

  // Initialize donationTracker with default values
  const [donationTracker, setDonationTracker] = useState<DonationTracker>({
    id: 1,
    recipientId: isOwnProfile ? 1 : Number(organizationIdString) || 1,
    recipientType: 'organization',
    donations: {
      total: 0,
      count: 25,
      topDonors: [
        {
          donorId: 1,
          name: "Lim Wei Jian",
          amount: 5000,
          lastDonation: "2024-02-15",
        },
        {
          donorId: 2,
          name: "Sarah Abdullah",
          amount: 3500,
          lastDonation: "2024-02-20",
        },
        {
          donorId: 3,
          name: "Jay Prakash",
          amount: 2800,
          lastDonation: "2024-03-01",
        },
        {
          donorId: 4,
          name: "James Robertson",
          amount: 1500,
          lastDonation: "2024-03-05",
        },
        {
          donorId: 5,
          name: "Michelle Wong",
          amount: 1000,
          lastDonation: "2024-03-10",
        }
      ],
      timeline: {
        daily: [
          {
            date: "2024-02-15",
            amount: 2500,
            donationPolicy: 'always-donate',
          },
          {
            date: "2024-02-20",
            amount: 3500,
            donationPolicy: 'campaign-specific',
          },
          {
            date: "2024-03-01",
            amount: 2800,
            isRecurring: true,
            donationPolicy: 'always-donate',
          },
          {
            date: "2024-03-05",
            amount: 1500,
            donationPolicy: 'campaign-specific',
          },
          {
            date: "2024-03-10",
            amount: 1000,
            donationPolicy: 'always-donate',
          }
        ],
        weekly: [
          {
            week: "2024-W07",
            amount: 6000
          },
          {
            week: "2024-W08",
            amount: 4500
          },
          {
            week: "2024-W09",
            amount: 5200
          },
          {
            week: "2024-W10",
            amount: 3800
          }
        ],
        monthly: [
          {
            month: "2024-01",
            amount: 15000
          },
          {
            month: "2024-02",
            amount: 18500
          },
          {
            month: "2024-03",
            amount: 12300
          }
        ]
      }
    }
  });

  // Load charity's own profile if applicable
  useEffect(() => {
    if (isOwnProfile) {
      const fetchCharityProfile = async () => {
        try {
          setCharityLoading(true);
          const profileData = await charityService.getCharityProfile();
          setCharityProfile(profileData);
          setCharityError(null);

          // Also fetch the charity's campaigns
          setCharityCampaignsLoading(true);
          const campaignsData = await charityService.getCharityCampaigns();
          setCharityCampaigns(campaignsData);
          setCharityCampaignsError(null);

          // Fetch general fund data
          setGeneralFundLoading(true);
          const fundData = await charityService.getCharityGeneralFund(profileData.id);
          setGeneralFund(fundData);
          setGeneralFundError(null);
        } catch (err: any) {
          console.error("Error fetching charity profile:", err);
          setCharityError(err.message || "Failed to load charity profile. Please try again.");
        } finally {
          setCharityLoading(false);
          setCharityCampaignsLoading(false);
          setGeneralFundLoading(false);
        }
      };

      fetchCharityProfile();
    } else if (organizationIdString) {
      // Fetch organization by ID if we're viewing an external profile
      const fetchOrganization = async () => {
        try {
          setOrganizationLoading(true);
          const orgData = await charityService.getCharityOrganizationById(organizationIdString);
          setOrganization(orgData);
          setOrganizationCampaigns(orgData.campaignsList || []);
          setOrganizationError(null);

          // Fetch general fund data for the organization
          setGeneralFundLoading(true);
          const fundData = await charityService.getCharityGeneralFund(organizationIdString);
          setGeneralFund(fundData);
          setGeneralFundError(null);
        } catch (err: any) {
          console.error("Error fetching organization:", err);
          setOrganizationError(err.message || "Failed to load organization. Please try again.");
        } finally {
          setOrganizationLoading(false);
          setGeneralFundLoading(false);
        }
      };

      fetchOrganization();
    }
  }, [isOwnProfile, organizationIdString]);

  // Unconditional donor effect hook
  useEffect(() => {
    if (userRole === 'donor' && !isOwnProfile && organizationIdString) {
      const hasContributed = mockDonorContributions.supportedCampaigns.some(
        contribution => organizationCampaigns.some(
          campaign => campaign.charity_id === organizationIdString && campaign.id === contribution.id
        )
      );
    }
  }, [organizationIdString, userRole, isOwnProfile, organizationCampaigns]);

  // Calculate additional stats based on either own profile or external organization
  const orgData = isOwnProfile
    ? {
      id: charityProfile?.id || '',
      name: charityProfile?.name || '',
      totalRaised: charityProfile?.totalRaised || 0,
      activeCampaigns: charityProfile?.activeCampaigns || 0,
      campaigns: 0,
      verified: charityProfile?.verified || false,
    }
    : organization || {};

  // Calculate additional stats for active campaigns if viewing external organization
  const activeCampaigns = isOwnProfile
    ? charityProfile?.activeCampaigns || 0
    : organization?.activeCampaigns || 0;

  const supporters = isOwnProfile
    ? charityProfile?.supporters || 0
    : organization?.supporters || 0;

  // Extended organization details
  const extendedDetails = isOwnProfile && charityProfile
    ? {
      email: charityProfile.email || '',
      phone: charityProfile.phone || '',
      website: charityProfile.website || '',
      location: charityProfile.location || '',
      founded: charityProfile.founded || '',
      mission: charityProfile.description || '',
      // Default values for impact and values if not provided
      impact: "Helping communities through various programs.",
      values: ["Integrity", "Innovation", "Impact"]
    }
    : {
      email: organization?.email || '',
      phone: organization?.phone || '',
      website: organization?.website || '',
      location: organization?.location || '',
      founded: organization?.founded || '',
      mission: organization?.description || '',
      impact: "Helping communities through various programs.",
      values: ["Integrity", "Innovation", "Impact"]
    };

  // Add event listener for chat modal - unconditional hook call
  useEffect(() => {
    if (!orgData) return;

    const handleOpenChat = (event: CustomEvent) => {
      if (event.detail.organizationId === orgData.id) {
        // Find the chat ID for this organization
        const chat = useVendorChatStore.getState().chats.find(
          chat => chat.organizationId === orgData.id
        );
        if (chat) {
          setActiveChatId(chat.id);
        }
      }
    };

    window.addEventListener('openVendorChat', handleOpenChat as EventListener);
    return () => {
      window.removeEventListener('openVendorChat', handleOpenChat as EventListener);
    };
  }, [orgData]);

  // Handle saving charity profile changes
  const handleSaveCharityData = async (updatedData: Partial<CharityProfileType>) => {
    try {
      setCharityLoading(true);
      const savedData = await charityService.updateCharityProfile(updatedData);
      setCharityProfile(prevData => ({
        ...prevData!,
        ...savedData,
      }));
      setIsEditing(false);
      toast.success("Charity information updated successfully!");
    } catch (err: any) {
      console.error("Error updating charity data:", err);
      toast.error(err.message || "Failed to update charity information. Please try again.");
    } finally {
      setCharityLoading(false);
    }
  };

  // Handle campaign modal
  const handleOpenCampaignModal = () => {
    setShowAddCampaignModal(true);
  };

  const handleCloseCampaignModal = () => {
    setShowAddCampaignModal(false);
  };

  const handleSaveCampaign = async (campaignData: FormData) => {
    try {
      await charityService.createCampaign(campaignData);
      toast.success("Campaign created successfully!");
      setShowAddCampaignModal(false);
      // Force refresh of campaigns
      window.dispatchEvent(new CustomEvent('refreshCampaigns'));
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      toast.error(err.message || "Failed to create campaign. Please try again.");
      throw err;
    }
  };

  const handleContactClick = () => {
    if (orgData && orgData.id) {
      openChat(Number(orgData.id));
    }
  };

  // Force refresh of campaigns when new campaign is added
  useEffect(() => {
    const handleRefreshCampaigns = async () => {
      if (isOwnProfile) {
        try {
          setCharityCampaignsLoading(true);
          const campaignsData = await charityService.getCharityCampaigns();
          setCharityCampaigns(campaignsData);
          setCharityCampaignsError(null);
        } catch (err: any) {
          console.error("Error refreshing charity campaigns:", err);
          setCharityCampaignsError(err.message || "Failed to refresh campaigns. Please try again.");
        } finally {
          setCharityCampaignsLoading(false);
        }
      }
    };

    window.addEventListener('refreshCampaigns', handleRefreshCampaigns);
    return () => {
      window.removeEventListener('refreshCampaigns', handleRefreshCampaigns);
    };
  }, [isOwnProfile]);

  // Calculate combined total raised (campaign + general fund)
  const combinedTotalRaised = (isOwnProfile ?
    (charityProfile?.totalRaised || 0) :
    (organization?.totalRaised || 0)) + generalFund.totalAmount;

  // Update today's donations - mock data for demonstration
  useEffect(() => {
    // For a real implementation, this would fetch from an API
    // Here we're just generating a random value between 0 and 5000
    setTodayDonations(Math.floor(Math.random() * 5000));

    // Calculate days left until end of year for demonstration purposes
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31); // December 31st
    const diffTime = endOfYear.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays);

    // Set a default goal amount based on organization size
    const estimatedGoal = supporters > 100 ? 200000 : supporters > 50 ? 100000 : 50000;
    setGoalAmount(estimatedGoal);
  }, [supporters]);

  // Update donation tracker when combinedTotalRaised changes
  useEffect(() => {
    setDonationTracker((prevTracker: DonationTracker) => ({
      ...prevTracker,
      donations: {
        ...prevTracker.donations,
        total: combinedTotalRaised
      }
    }));
  }, [combinedTotalRaised]);

  // Organization timeline entries - mock data
  const generateOrganizationTimelineEntries = () => {
    const foundedDate = extendedDetails.founded || "2018";

    return [
      {
        id: 'org-founded',
        date: `Jan 1, ${foundedDate}`,
        title: 'Organization Founded',
        description: `${orgData.name} was established to address ${extendedDetails.mission?.substring(0, 40) || "community needs"}...`,
        icon: <FaBuilding />,
        color: 'bg-blue-500',
        type: 'milestone' as const,
        statusTag: {
          text: 'Founded',
          color: 'bg-blue-100 text-blue-800'
        }
      },
      {
        id: 'first-campaign',
        date: `Mar 15, ${foundedDate}`,
        title: 'First Campaign Launched',
        description: 'Our first campaign to support the local community',
        icon: <FaHandHoldingHeart />,
        color: 'bg-green-500',
        type: 'milestone' as const,
        statusTag: {
          text: 'Milestone',
          color: 'bg-green-100 text-green-800'
        }
      },
      {
        id: 'community-growth',
        date: `Jul 10, ${parseInt(foundedDate) + 1}`,
        title: 'Community Growth',
        description: 'Reached 100 supporters milestone',
        icon: <FaUsers />,
        color: 'bg-purple-500',
        type: 'milestone' as const,
        statusTag: {
          text: 'Growth',
          color: 'bg-purple-100 text-purple-800'
        }
      },
      {
        id: 'today-progress',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        title: 'Organization Progress',
        description: `Currently supporting ${activeCampaigns} active campaigns with ${supporters || 0} supporters`,
        icon: <FaChartLine />,
        color: 'bg-blue-600',
        type: 'status' as const,
        statusTag: {
          text: 'Today',
          color: 'bg-blue-100 text-blue-800'
        }
      }
    ];
  };

  // Update the fetchOrganizationTransactions function with the correct column name
  const fetchOrganizationTransactions = async () => {
    if (!organization || !organization.id) return;
    
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      
      // Get all donations to this charity (both general and campaign-specific) from campaign_donations table
      const { data: allDonations, error: donationsError } = await supabase
        .from('campaign_donations')
        .select('id, amount, created_at, user_id, is_anonymous, transaction_hash, donation_policy, message, status, campaign_id')
        .eq('charity_id', organization.id)
        .order('created_at', { ascending: false });
        
      if (donationsError) throw donationsError;
      
      // Separate general donations (where campaign_id is null) from campaign donations
      const generalDonations = allDonations.filter(donation => donation.campaign_id === null);
      const campaignDonations = allDonations.filter(donation => donation.campaign_id !== null);
      
      // Update filters to use is_anonymous
      const userIds = [
        ...generalDonations.filter(d => !d.is_anonymous && d.user_id).map(d => d.user_id),
        ...campaignDonations.filter(d => !d.is_anonymous && d.user_id).map(d => d.user_id)
      ];
      
      // Collect all campaign IDs 
      const campaignIds = [...new Set(campaignDonations.filter(d => d.campaign_id).map(d => d.campaign_id))];
      
      // Fetch user names
      let userNames: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', userIds);
          
        if (!userError && userData) {
          userNames = userData.reduce((acc: Record<string, string>, user) => {
            acc[user.id] = user.name;
            return acc;
          }, {});
        }
      }
      
      // Fetch campaign names
      let campaignInfo: Record<string, {title: string, id: string}> = {};
      if (campaignIds.length > 0) {
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, title')
          .in('id', campaignIds);
          
        if (!campaignsError && campaignsData) {
          campaignInfo = campaignsData.reduce((acc: Record<string, {title: string, id: string}>, campaign) => {
            acc[campaign.id] = { title: campaign.title, id: campaign.id };
            return acc;
          }, {});
        }
      }
      
      // Format general donations
      const generalTransactions = (generalDonations || []).map((donation: any) => ({
        id: `general-${donation.id}`,
        amount: donation.amount,
        date: donation.created_at,
        donorName: donation.is_anonymous ? null : (userNames[donation.user_id] || 'Unknown Donor'),
        donorId: donation.is_anonymous ? null : donation.user_id,
        transactionHash: donation.transaction_hash,
        message: donation.message,
        status: donation.status || 'confirmed',
        donationType: 'general'
      }));
      
      // Format campaign donations
      const campaignTransactions = (campaignDonations || []).map((donation: any) => {
        const campaign = donation.campaign_id ? campaignInfo[donation.campaign_id] : null;
        
        return {
          id: `campaign-${donation.id}`,
          amount: donation.amount,
          date: donation.created_at,
          donorName: donation.is_anonymous ? null : (userNames[donation.user_id] || 'Unknown Donor'),
          donorId: donation.is_anonymous ? null : donation.user_id,
          transactionHash: donation.transaction_hash,
          donationPolicy: donation.donation_policy,
          message: donation.message,
          status: donation.status || 'confirmed',
          donationType: 'campaign',
          campaignName: campaign ? campaign.title : 'Unknown Campaign',
          campaignId: donation.campaign_id
        };
      });
      
      // Combine both types of transactions
      setBlockchainTransactions([...generalTransactions, ...campaignTransactions]);
    } catch (err: any) {
      console.error('Error fetching organization transactions:', err);
      setTransactionsError(err.message || 'Failed to load transaction data');
    } finally {
      setTransactionsLoading(false);
    }
  };
  
  // Call fetchOrganizationTransactions when organization data is loaded
  useEffect(() => {
    if (organization) {
      fetchOrganizationTransactions();
    }
  }, [organization]);

  // Conditional rendering after all hooks are called
  // If we're viewing as charity profile and still loading
  if (isOwnProfile && charityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[var(--main)] p-8 rounded-xl shadow-xl border border-[var(--stroke)]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--highlight)] mb-4"></div>
            <p className="text-[var(--paragraph)]">Loading charity profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for external organization
  if (!isOwnProfile && organizationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[var(--main)] p-8 rounded-xl shadow-xl border border-[var(--stroke)]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--highlight)] mb-4"></div>
            <p className="text-[var(--paragraph)]">Loading organization profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state for external organization
  if (!isOwnProfile && organizationError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[var(--main)] p-8 rounded-xl shadow-xl border border-[var(--stroke)]">
          <div className="flex flex-col items-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-500">{organizationError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we're viewing as charity profile and have an error
  if (isOwnProfile && charityError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[var(--main)] p-8 rounded-xl shadow-xl border border-[var(--stroke)]">
          <div className="flex flex-col items-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-500">{charityError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we're viewing as charity profile but no profile found
  if (isOwnProfile && !charityLoading && !charityError && (!charityProfile || !charityProfile.name)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[var(--main)] p-8 rounded-xl shadow-xl border border-[var(--stroke)]">
          <div className="flex flex-col items-center">
            <p className="text-[var(--paragraph)] mb-4">No charity profile found.</p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90"
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If organization not found for regular view, show error or redirect
  if (!isOwnProfile && !organization && !organizationLoading) {
    return (
      <div className="p-6 bg-[var(--background)] text-[var(--paragraph)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Organization not found</h1>
          <button
            onClick={() => navigate('/charity')}
            className="button flex items-center gap-2 px-6 py-2 mx-auto"
          >
            <FaArrowLeft />
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Organization Banner */}
      <div className="relative h-64 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)]">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        {!isOwnProfile && (
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 z-10 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <FaArrowLeft size={20} />
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-12">
        {/* Organization Info Card - Overlapping Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--main)] rounded-xl shadow-xl border border-[var(--stroke)] p-6 mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {isOwnProfile && charityProfile?.logo ? (
                <img src={charityProfile.logo} alt={charityProfile.name} className="w-full h-full object-cover rounded-xl" />
              ) : organization?.logo ? (
                <img src={organization.logo} alt={organization.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                (orgData.name && orgData.name.charAt(0)) || "C"
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-[var(--headline)]">{orgData.name}</h1>
                {userRole === 'donor' && !isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDonationModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                  >
                    <FaHandHoldingHeart className="text-xl" />
                    Support {orgData.name}
                  </motion.button>
                )}
                {userRole === 'vendor' && !isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContactClick}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                  >
                    <FaComments className="text-xl" />
                    Contact {orgData.name}
                  </motion.button>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90 flex items-center gap-2 transition-colors"
                  >
                    <FaPencilAlt /> Edit Profile
                  </button>
                )}
              </div>
              <p className="text-[var(--paragraph)] mt-2">{extendedDetails.mission}</p>

              <div className="flex flex-wrap gap-4 mt-4">
                {extendedDetails.email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-[var(--highlight)]" />
                    <a href={`mailto:${extendedDetails.email}`} className="hover:text-[var(--highlight)] transition-colors">
                      {extendedDetails.email}
                    </a>
                  </div>
                )}
                {extendedDetails.website && (
                  <div className="flex items-center gap-2">
                    <FaGlobe className="text-[var(--highlight)]" />
                    <a href={extendedDetails.website.startsWith('http') ? extendedDetails.website : `https://${extendedDetails.website}`} target="_blank" rel="noopener noreferrer"
                      className="hover:text-[var(--highlight)] transition-colors">
                      {extendedDetails.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {extendedDetails.phone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-[var(--highlight)]" />
                    <a
                      href={`tel:${extendedDetails.phone}`}
                      className="hover:text-[var(--highlight)] hover:underline transition-colors"
                    >
                      {extendedDetails.phone}
                    </a>
                  </div>
                )}
                {extendedDetails.location && (
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[var(--highlight)]" />
                    <span>{extendedDetails.location}</span>
                  </div>
                )}
                {extendedDetails.founded && (
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[var(--highlight)]" />
                    <span>Founded: {extendedDetails.founded}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] rounded-lg p-4 text-white"
                >
                  <div className="flex items-center gap-3">
                    <FaHandHoldingHeart className="text-2xl" />
                    <div>
                      <p className="text-2xl font-bold">RM{combinedTotalRaised.toLocaleString()}</p>
                      <p className="text-sm opacity-90">Total Raised</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[var(--secondary)] to-[var(--tertiary)] rounded-lg p-4 text-white"
                >
                  <div className="flex items-center gap-3">
                    <FaBuilding className="text-2xl" />
                    <div>
                      <p className="text-2xl font-bold">{activeCampaigns}</p>
                      <p className="text-sm opacity-90">Active Campaigns</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[var(--tertiary)] to-[var(--highlight)] rounded-lg p-4 text-white"
                >
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-2xl" />
                    <div>
                      <p className="text-2xl font-bold">{supporters || 0}</p>
                      <p className="text-sm opacity-90">Supporters</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] rounded-lg p-4 text-white"
                >
                  <div className="flex items-center gap-3">
                    <FaHandHoldingHeart className="text-2xl" />
                    <div>
                      <p className="text-2xl font-bold">{isOwnProfile ? (charityProfile?.activeCampaigns || 0) : (organization?.campaigns || 0)}</p>
                      <p className="text-sm opacity-90">Total Campaigns</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Impact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
            <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2 mb-4">
              <FaChartLine className="text-[var(--highlight)]" />
              Our Impact
            </h2>
            <p className="text-[var(--paragraph)] mb-6">{extendedDetails.impact}</p>

            <h3 className="text-xl font-bold text-[var(--headline)] mb-4">Our Values</h3>
            <div className="flex flex-wrap gap-3">
              {extendedDetails.values.map((value, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[var(--highlight)] text-white rounded-full text-sm font-medium"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* General Fund Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
            <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2 mb-4">
              <FaHandHoldingHeart className="text-[var(--highlight)]" />
              General Fund
            </h2>

            {generalFundLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)]"></div>
              </div>
            ) : generalFundError ? (
              <div className="text-red-500 py-2">{generalFundError}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] rounded-lg p-6 text-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-full">
                      <FaHandHoldingHeart className="text-3xl" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">RM{generalFund.totalAmount.toLocaleString()}</p>
                      <p className="text-sm opacity-90">Total Direct Donations</p>
                    </div>
                  </div>
                  <p className="mt-4 text-white text-opacity-90">
                    Funds donated directly to support our general operations and mission.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[var(--secondary)] to-[var(--tertiary)] rounded-lg p-6 text-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-full">
                      <FaUsers className="text-3xl" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{generalFund.donationsCount}</p>
                      <p className="text-sm opacity-90">Direct Supporters</p>
                    </div>
                  </div>
                  <p className="mt-4 text-white text-opacity-90">
                    People who believe in our organization's mission and have donated directly.
                  </p>
                </motion.div>
              </div>
            )}

            {userRole === 'donor' && !isOwnProfile && (
              <div className="mt-6 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDonationModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto"
                >
                  <FaHandHoldingHeart className="text-xl" />
                  Support Our General Fund
                </motion.button>
              </div>
            )}
          </div>
        </motion.section>

        {/* Organization Timeline and Leaderboard Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline - Left Column */}
            <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
              <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2 mb-4">
                <FaHistory className="text-[var(--highlight)]" />
                Organization Timeline
              </h2>

              <CampaignTimeline
                entries={generateOrganizationTimelineEntries()}
                className="bg-transparent p-0"
                startDate={extendedDetails.founded ? `Jan 1, ${extendedDetails.founded}` : undefined}
                currentAmount={combinedTotalRaised}
                goalAmount={goalAmount}
                daysLeft={daysLeft}
                todayDonations={todayDonations}
              />
            </div>

            {/* Donor Leaderboard - Right Column */}
            <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
              <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2 mb-4">
                <FaTrophy className="text-[var(--highlight)]" />
                Top Supporters
              </h2>

              <DonorLeaderboardAndTracker
                tracker={donationTracker}
                className="border-0 bg-transparent p-0 shadow-none"
                userDonorId={userRole === 'donor' ? 2 : undefined} // Example: highlight user with ID 2 if current user is a donor
              />
            </div>
          </div>
        </motion.section>

        {/* Campaigns Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2">
              <FaHandHoldingHeart className="text-[var(--highlight)]" />
              {isOwnProfile ? "Your Campaigns" : "Active Campaigns"}
            </h2>
            {isOwnProfile && (
              <button
                onClick={handleOpenCampaignModal}
                className="px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90 flex items-center gap-2 transition-colors"
              >
                <FaPlus /> New Campaign
              </button>
            )}
          </div>

          {isOwnProfile ? (
            /* Updated code for charity viewing own campaigns */
            charityCampaignsLoading ? (
              <div className="p-8 flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)] mb-4"></div>
                  <p className="text-[var(--paragraph)]">Loading campaigns...</p>
                </div>
              </div>
            ) : charityCampaignsError ? (
              <div className="text-center py-10 bg-[var(--main)] rounded-xl border border-[var(--stroke)]">
                <FaHandHoldingHeart className="mx-auto text-4xl text-[var(--paragraph)] opacity-30 mb-4" />
                <p className="text-lg text-red-500">{charityCampaignsError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90"
                >
                  Try Again
                </button>
              </div>
            ) : charityCampaigns && charityCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {charityCampaigns.map((campaign) => {
                  // Calculate a default deadline of 30 days from now if not provided
                  const defaultDeadline = new Date();
                  defaultDeadline.setDate(defaultDeadline.getDate() + 30);

                  return (
                    <div key={campaign.id} className="h-full">
                      <CampaignCard
                        id={campaign.id}
                        name={campaign.title}
                        description={campaign.description}
                        goal={campaign.target_amount}
                        currentContributions={campaign.current_amount}
                        deadline={campaign.deadline || defaultDeadline.toISOString()}
                        category={campaign.category}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-[var(--main)] rounded-xl border border-[var(--stroke)]">
                <FaHandHoldingHeart className="mx-auto text-4xl text-[var(--paragraph)] opacity-30 mb-4" />
                <p className="text-lg">You don't have any campaigns yet.</p>
                <button
                  onClick={handleOpenCampaignModal}
                  className="mt-4 px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90 flex items-center gap-2 mx-auto"
                >
                  <FaPlus /> Create Your First Campaign
                </button>
              </div>
            )
          ) : (
            /* Updated code to show real organization campaigns */
            organizationCampaigns && organizationCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizationCampaigns.map((campaign) => {
                  // Calculate a default deadline of 30 days from now if not provided
                  const defaultDeadline = new Date();
                  defaultDeadline.setDate(defaultDeadline.getDate() + 30);

                  return (
                    <div key={campaign.id} className="h-full">
                      <CampaignCard
                        id={campaign.id}
                        name={campaign.title}
                        description={campaign.description}
                        goal={campaign.target_amount}
                        currentContributions={campaign.current_amount}
                        deadline={campaign.deadline || defaultDeadline.toISOString()}
                        category={campaign.category}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-[var(--main)] rounded-xl border border-[var(--stroke)]">
                <FaHandHoldingHeart className="mx-auto text-4xl text-[var(--paragraph)] opacity-30 mb-4" />
                <p className="text-lg">No campaigns found for this organization.</p>
              </div>
            )
          )}
        </motion.section>

        {/* Community Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          {userRole === 'donor' ? (
            isDonationModalOpen ? (
              <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2">
                        <FaUsers className="text-[var(--highlight)]" />
                        Organization Community
                      </h2>
                      <p className="text-[var(--paragraph)] mt-1">
                        Connect with other supporters and stay updated
                      </p>
                    </div>
                  </div>

                  {/* Community Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] rounded-lg p-4 text-white w-full"
                    >
                      <div className="flex items-center gap-3">
                        <FaUsers className="text-2xl" />
                        <div>
                          <p className="text-2xl font-bold">42</p>
                          <p className="text-sm opacity-90">Members</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-[var(--secondary)] to-[var(--tertiary)] rounded-lg p-4 text-white w-full"
                    >
                      <div className="flex items-center gap-3">
                        <FaComments className="text-2xl" />
                        <div>
                          <p className="text-2xl font-bold">24</p>
                          <p className="text-sm opacity-90">Posts</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Community Navigation */}
                  <div className="flex mb-6 bg-[var(--background)] rounded-lg p-1">
                    <button
                      onClick={() => setCommunityView('feed')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${communityView === 'feed'
                        ? 'bg-[var(--highlight)] text-white shadow-lg'
                        : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
                        }`}
                    >
                      <FaComments className={communityView === 'feed' ? 'text-white' : 'text-[var(--highlight)]'} />
                      Discussion Feed
                    </button>
                    <button
                      onClick={() => setCommunityView('members')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${communityView === 'members'
                        ? 'bg-[var(--highlight)] text-white shadow-lg'
                        : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
                        }`}
                    >
                      <FaUsers className={communityView === 'members' ? 'text-white' : 'text-[var(--highlight)]'} />
                      Members
                    </button>
                  </div>

                  {/* Community Content */}
                  <div className="bg-[var(--background)] rounded-lg p-4">
                    {communityView === 'feed' && (
                      <PostFeed communityId={orgData.id} communityType="organization" />
                    )}
                    {communityView === 'members' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="bg-[var(--main)] p-4 rounded-lg border border-[var(--stroke)] flex items-center gap-4 cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white font-bold shadow-lg">
                              U{i}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--headline)]">User {i}</p>
                              <div className="flex items-center gap-2 text-xs text-[var(--paragraph)]">
                                <FaClock className="text-[var(--highlight)]" />
                                Joined 2 weeks ago
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
                <div className="p-8 text-center">
                  <FaHandHoldingHeart className="mx-auto text-4xl text-[var(--highlight)] mb-4" />
                  <h2 className="text-2xl font-bold text-[var(--headline)] mb-2">Join Our Community</h2>
                  <p className="text-[var(--paragraph)] mb-6">
                    Support {orgData.name} by making a donation to unlock access to our community features.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDonationModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto"
                  >
                    <FaHandHoldingHeart className="text-xl" />
                    Make Your First Donation
                  </motion.button>
                </div>
              </div>
            )
          ) : null}
        </motion.section>

        {/* Add the BlockchainTransparencyTracker in an appropriate tab or section */}
        <div className="max-w-7xl mx-auto mt-6">
          <SimpleDonationVerifier
            title="Organization Donations"
            campaignName={organization?.name || "this organization"}
            transactions={blockchainTransactions.map(tx => ({
              id: tx.id,
              amount: tx.amount,
              date: tx.date,
              transactionHash: tx.transactionHash,
              donorName: tx.donorName
            }))}
            showDonorNames={true}
          />
        </div>
      </div>

      {/* Donation Modal */}
      {isDonationModalOpen && orgData && (
        <DonationModal
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          organizationId={orgData.id.toString()}
          organizationName={orgData.name}
          campaignId=""
          onDonationComplete={async (amount, _, isAnonymous, isRecurring) => {
            try {
              console.log("Full organization data:", orgData);

              // Ensure we have a valid charity ID
              if (!orgData.id) {
                throw new Error("Invalid charity ID for donation");
              }

              // Debug information
              console.log("Making general charity donation with parameters:", {
                charityId: orgData.id,
                amount,
                isAnonymous,
                isRecurring
              });

              // Call charityService to make a general donation to the organization
              await charityService.makeDonation({
                charityId: orgData.id,
                amount: amount,
                isAnonymous: isAnonymous || false,
                isRecurring: isRecurring || false
              });

              const donationType = isRecurring ? 'monthly' : 'one-time';
              toast.success(`Thank you for your ${donationType} donation of RM${amount} to ${orgData.name}!`);
              setIsDonationModalOpen(false);

              // Optionally refresh organization data to show updated stats
              if (!isOwnProfile && organizationIdString) {
                const refreshedOrgData = await charityService.getCharityOrganizationById(organizationIdString);
                setOrganization(refreshedOrgData);
                setOrganizationCampaigns(refreshedOrgData.campaignsList || []);
              }
            } catch (error: any) {
              console.error('Error making donation:', error);
              toast.error(error.message || 'Failed to process donation. Please try again.');
            }
          }}
        />
      )}

      {/* Chat Modal */}
      {activeChatId !== null && (
        <ChatModal
          chatId={activeChatId}
          onClose={() => setActiveChatId(null)}
        />
      )}

      {/* Edit Profile Modal for charity users viewing their own profile */}
      {isEditing && isOwnProfile && charityProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--main)] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--stroke)] flex justify-between items-center sticky top-0 bg-[var(--main)] z-10">
              <h2 className="text-xl font-bold text-[var(--headline)]">Edit Organization Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <CharityInfo
                charity={charityProfile}
                isEditing={true}
                onSave={handleSaveCharityData}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Campaign Modal */}
      {showAddCampaignModal && (
        <AddCampaignModal
          onClose={handleCloseCampaignModal}
          onSave={handleSaveCampaign}
        />
      )}
    </div>
  );
};

export default OrganizationDetail; 