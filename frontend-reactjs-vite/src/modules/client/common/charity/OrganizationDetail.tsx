import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft, FaHandHoldingHeart, FaBuilding, FaUsers, FaHistory, FaChartLine,
  FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaComments, FaClock, FaPencilAlt, FaTimes, FaPlus, FaFacebook, FaTwitter, FaInstagram, FaCoins, FaChevronLeft, FaGift, FaTrophy, FaExternalLinkAlt, FaDownload, FaHandHoldingUsd, FaReceipt, FaArrowRight, FaMedal, FaHeart, FaCheckCircle, FaComment, FaThumbtack
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

// Add these mock data interfaces
interface CommunityMember {
  id: number;
  name: string;
  avatar?: string;
  joinDate: string;
  donationsCount: number;
  badges: string[];
  isVerified: boolean;
}

interface CommunityPost {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
  isPinned?: boolean;
}

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
  const [hasContributedToGeneralFund, setHasContributedToGeneralFund] = useState(false);

  // For timeline data
  const [goalAmount, setGoalAmount] = useState<number>(100000); // Default goal amount for organization
  const [daysLeft, setDaysLeft] = useState<number>(365); // Default yearly goal
  const [todayDonations, setTodayDonations] = useState<number>(0); // Today's donations

  // Add state for blockchain transactions
  const [blockchainTransactions, setBlockchainTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Add community mock data states
  const [communityStats, setCommunityStats] = useState({
    membersCount: 0,
    postsCount: 0,
    activeMembers: 0,
    recentActivities: 0
  });
  
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);

  // Add state for new post input
  const [newPostContent, setNewPostContent] = useState("");
  const [isPostingContent, setIsPostingContent] = useState(false);

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
      // Check for campaign contributions
      const hasCampaignContributions = mockDonorContributions.supportedCampaigns.some(
        contribution => organizationCampaigns.some(
          campaign => campaign.charity_id === organizationIdString && campaign.id === contribution.id
        )
      );
      
      // Check for general fund contributions
      const checkGeneralFundContributions = async () => {
        try {
          // Query for donations made by this donor to this organization's general fund
          const { data: generalDonations, error } = await supabase
            .from('campaign_donations')
            .select('*')
            .eq('charity_id', organizationIdString)
            .is('campaign_id', null);
            
          if (error) {
            console.error("Error checking general fund contributions:", error);
            return;
          }
          
          // If there are any donations to the general fund, mark as contributed
          const hasGeneralFundDonations = (generalDonations && generalDonations.length > 0);
          setHasContributedToGeneralFund(hasGeneralFundDonations);
          
          console.log("General fund contribution check:", {
            hasGeneralFundDonations,
            donationsCount: generalDonations?.length || 0
          });
        } catch (err) {
          console.error("Error checking general fund contributions:", err);
        }
      };
      
      checkGeneralFundContributions();
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
    if (!organization?.id) return;
    
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      
      console.log("Fetching transactions for organization ID:", organization.id);
      
      // Get all donations to this charity (both general and campaign-specific) from campaign_donations table
      const { data: allDonations, error: donationsError } = await supabase
        .from('campaign_donations')
        .select('*')
        .eq('charity_id', organization.id)
        .order('created_at', { ascending: false });
        
      if (donationsError) {
        console.error("Error fetching donations:", donationsError);
        throw donationsError;
      }
      
      console.log("All donations fetched:", allDonations?.length || 0, allDonations);
      
      // Separate general donations (where campaign_id is null) from campaign donations
      const generalDonations = allDonations?.filter(donation => donation.campaign_id === null) || [];
      const campaignDonations = allDonations?.filter(donation => donation.campaign_id !== null) || [];
      
      console.log("General donations count:", generalDonations.length);
      console.log("Campaign donations count:", campaignDonations.length);
      
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
      const generalTransactions = generalDonations.map((donation) => ({
        id: `general-${donation.id}`,
        amount: donation.amount,
        date: donation.created_at,
        donorName: donation.is_anonymous ? "Anonymous Donor" : (userNames[donation.user_id] || 'Unknown Donor'),
        donorId: donation.is_anonymous ? null : donation.user_id,
        transactionHash: donation.transaction_hash || "",
        message: donation.message || "General Fund Donation",
        status: donation.status || 'confirmed',
        donationType: 'general'
      }));
      
      // Format campaign donations
      const campaignTransactions = campaignDonations.map((donation) => {
        const campaign = donation.campaign_id ? campaignInfo[donation.campaign_id] : null;
        
        return {
          id: `campaign-${donation.id}`,
          amount: donation.amount,
          date: donation.created_at,
          donorName: donation.is_anonymous ? "Anonymous Donor" : (userNames[donation.user_id] || 'Unknown Donor'),
          donorId: donation.is_anonymous ? null : donation.user_id,
          transactionHash: donation.transaction_hash || "",
          donationPolicy: donation.donation_policy,
          message: donation.message || `Donation to ${campaign?.title || 'a campaign'}`,
          status: donation.status || 'confirmed',
          donationType: 'campaign',
          campaignName: campaign ? campaign.title : 'Unknown Campaign',
          campaignId: donation.campaign_id
        };
      });
      
      // Combine both types of transactions and log for debugging
      const allTransactions = [...generalTransactions, ...campaignTransactions];
      console.log("Processed transactions:", allTransactions.length, allTransactions);
      
      setBlockchainTransactions(allTransactions);
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

  // Add a new effect to fetch transactions when viewing as charity
  useEffect(() => {
    if (isOwnProfile && charityProfile) {
      // Create a fetchCharityOwnTransactions function specifically for charity viewing own profile
      const fetchCharityOwnTransactions = async () => {
        try {
          setTransactionsLoading(true);
          setTransactionsError(null);
          
          console.log("Fetching transactions for charity's own profile, ID:", charityProfile.id);
          
          // Get all donations to this charity (both general and campaign-specific) from campaign_donations table
          const { data: allDonations, error: donationsError } = await supabase
            .from('campaign_donations')
            .select('*')
            .eq('charity_id', charityProfile.id)
            .order('created_at', { ascending: false });
            
          if (donationsError) {
            console.error("Error fetching charity's own donations:", donationsError);
            throw donationsError;
          }
          
          console.log("All donations fetched for charity profile:", allDonations?.length || 0, allDonations);
          
          // Separate general donations (where campaign_id is null) from campaign donations
          const generalDonations = allDonations?.filter(donation => donation.campaign_id === null) || [];
          const campaignDonations = allDonations?.filter(donation => donation.campaign_id !== null) || [];
          
          console.log("General donations count:", generalDonations.length);
          console.log("Campaign donations count:", campaignDonations.length);
          
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
          const generalTransactions = generalDonations.map((donation) => ({
            id: `general-${donation.id}`,
            amount: donation.amount,
            date: donation.created_at,
            donorName: donation.is_anonymous ? "Anonymous Donor" : (userNames[donation.user_id] || 'Unknown Donor'),
            donorId: donation.is_anonymous ? null : donation.user_id,
            transactionHash: donation.transaction_hash || "",
            message: donation.message || "General Fund Donation",
            status: donation.status || 'confirmed',
            donationType: 'general'
          }));
          
          // Format campaign donations
          const campaignTransactions = campaignDonations.map((donation) => {
            const campaign = donation.campaign_id ? campaignInfo[donation.campaign_id] : null;
            
            return {
              id: `campaign-${donation.id}`,
              amount: donation.amount,
              date: donation.created_at,
              donorName: donation.is_anonymous ? "Anonymous Donor" : (userNames[donation.user_id] || 'Unknown Donor'),
              donorId: donation.is_anonymous ? null : donation.user_id,
              transactionHash: donation.transaction_hash || "",
              donationPolicy: donation.donation_policy,
              message: donation.message || `Donation to ${campaign?.title || 'a campaign'}`,
              status: donation.status || 'confirmed',
              donationType: 'campaign',
              campaignName: campaign ? campaign.title : 'Unknown Campaign',
              campaignId: donation.campaign_id
            };
          });
          
          // Combine both types of transactions and log for debugging
          const allTransactions = [...generalTransactions, ...campaignTransactions];
          console.log("Processed transactions for charity profile:", allTransactions.length, allTransactions);
          
          setBlockchainTransactions(allTransactions);
        } catch (err: any) {
          console.error('Error fetching charity transactions:', err);
          setTransactionsError(err.message || 'Failed to load transaction data');
        } finally {
          setTransactionsLoading(false);
        }
      };
      
      fetchCharityOwnTransactions();
    }
  }, [isOwnProfile, charityProfile]);

  // Add this effect to load mock community data
  useEffect(() => {
    if (userRole === 'donor' && hasContributedToGeneralFund && orgData?.id) {
      setIsLoadingCommunity(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock community stats based on organization size
        const membersCount = Math.floor(Math.random() * 50) + 30; // 30-80 members
        const postsCount = Math.floor(Math.random() * 30) + 15; // 15-45 posts
        
        setCommunityStats({
          membersCount,
          postsCount,
          activeMembers: Math.floor(membersCount * 0.6), // 60% of members are active
          recentActivities: Math.floor(Math.random() * 10) + 5 // 5-15 recent activities
        });
        
        // Generate mock community members
        const mockMembers: CommunityMember[] = [
          {
            id: 1,
            name: "Sarah Abdullah",
            avatar: "https://randomuser.me/api/portraits/women/32.jpg",
            joinDate: "2024-01-15",
            donationsCount: 12,
            badges: ["Top Donor", "Early Supporter"],
            isVerified: true
          },
          {
            id: 2,
            name: "Rajesh Kumar",
            avatar: "https://randomuser.me/api/portraits/men/45.jpg",
            joinDate: "2024-01-22",
            donationsCount: 8,
            badges: ["Regular Donor"],
            isVerified: true
          },
          {
            id: 3,
            name: "Lim Wei Jian",
            avatar: "https://randomuser.me/api/portraits/men/64.jpg",
            joinDate: "2024-02-05",
            donationsCount: 15,
            badges: ["Champion", "Fundraiser"],
            isVerified: true
          },
          {
            id: 4,
            name: "Michelle Wong",
            avatar: "https://randomuser.me/api/portraits/women/28.jpg",
            joinDate: "2024-02-18",
            donationsCount: 5,
            badges: ["New Member"],
            isVerified: false
          },
          {
            id: 5,
            name: "David Smith",
            avatar: "https://randomuser.me/api/portraits/men/22.jpg",
            joinDate: "2024-03-01",
            donationsCount: 3,
            badges: ["New Member"],
            isVerified: false
          },
          {
            id: 6,
            name: "Amanda Chen",
            avatar: "https://randomuser.me/api/portraits/women/65.jpg",
            joinDate: "2024-02-27",
            donationsCount: 7,
            badges: ["Active Member"],
            isVerified: true
          },
          {
            id: 7,
            name: "James Robertson",
            avatar: "https://randomuser.me/api/portraits/men/33.jpg", 
            joinDate: "2024-01-30",
            donationsCount: 10,
            badges: ["Monthly Donor"],
            isVerified: true
          }
        ];
        
        // Create organization announcement post
        const organizationAnnouncement: CommunityPost = {
          id: 999,
          authorId: 0,
          authorName: orgData.name || "Organization",
          authorAvatar: "https://placehold.co/400x400/4A90E2/FFFFFF?text=ORG",
          content: "📢 Important Announcement: We're excited to announce our upcoming fundraising gala on May 15th! Join us for an evening of inspiration and impact. All proceeds will directly support our mission of helping communities in need. Tickets are limited, so reserve your spot early. Contact us for more details or to sponsor the event!",
          date: new Date().toISOString(),
          likes: 78,
          comments: 23,
          isPinned: true
        };
        
        // Generate mock community posts with the announcement at the top
        const mockPosts: CommunityPost[] = [
          organizationAnnouncement,
          {
            id: 1,
            authorId: 3,
            authorName: "Lim Wei Jian",
            authorAvatar: "https://randomuser.me/api/portraits/men/64.jpg",
            content: "I'm so happy to see the progress made on the latest campaign! The work being done to help those in need is truly inspiring.",
            date: "2024-03-15T14:30:00",
            likes: 24,
            comments: 7,
            isPinned: false
          },
          {
            id: 2,
            authorId: 1,
            authorName: "Sarah Abdullah",
            authorAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
            content: "Just made my monthly donation to the general fund. Feels great to know my contribution is making a difference!",
            date: "2024-03-14T09:15:00",
            likes: 18,
            comments: 5
          },
          {
            id: 3,
            authorId: 7,
            authorName: "James Robertson",
            authorAvatar: "https://randomuser.me/api/portraits/men/33.jpg",
            content: "Does anyone know when the next community event will be held? I'd like to volunteer.",
            date: "2024-03-13T16:45:00",
            likes: 7,
            comments: 12
          },
          {
            id: 4,
            authorId: 2,
            authorName: "Rajesh Kumar",
            authorAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
            content: "Just saw the impact report - amazing to see how our donations are helping! Keep up the great work team!",
            date: "2024-03-12T11:20:00",
            likes: 15,
            comments: 3
          },
          {
            id: 5,
            authorId: 4,
            authorName: "Michelle Wong",
            authorAvatar: "https://randomuser.me/api/portraits/women/28.jpg",
            content: "New member here! Excited to be part of this community and support such an important cause.",
            date: "2024-03-10T08:30:00",
            likes: 22,
            comments: 8
          }
        ];
        
        setCommunityMembers(mockMembers);
        setCommunityPosts(mockPosts);
        setIsLoadingCommunity(false);
        
        // Log to console for debugging
        console.log("Community data loaded:", {
          orgId: orgData.id,
          communityType: "organization",
          stats: {
            membersCount,
            postsCount,
            activeMembers: Math.floor(membersCount * 0.6),
            recentActivities: Math.floor(Math.random() * 10) + 5
          },
          members: mockMembers.length,
          posts: mockPosts.length
        });
      }, 800);
    }
  }, [userRole, hasContributedToGeneralFund, orgData?.id]);

  // Replace the community stats section with enhanced version
  const renderCommunityStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] rounded-lg p-4 text-white w-full"
      >
        <div className="flex items-center gap-3">
          <FaUsers className="text-2xl" />
          <div>
            <p className="text-2xl font-bold">{communityStats.membersCount}</p>
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
            <p className="text-2xl font-bold">{communityStats.postsCount}</p>
            <p className="text-sm opacity-90">Posts</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-[var(--tertiary)] to-[var(--secondary)] rounded-lg p-4 text-white w-full"
      >
        <div className="flex items-center gap-3">
          <FaHeart className="text-2xl" />
          <div>
            <p className="text-2xl font-bold">{communityStats.activeMembers}</p>
            <p className="text-sm opacity-90">Active Members</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)] rounded-lg p-4 text-white w-full"
      >
        <div className="flex items-center gap-3">
          <FaClock className="text-2xl" />
          <div>
            <p className="text-2xl font-bold">{communityStats.recentActivities}</p>
            <p className="text-sm opacity-90">Recent Activities</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
  
  // Create enhanced members list
  const renderCommunityMembers = () => (
    <div className="space-y-4">
      {isLoadingCommunity ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)]"></div>
        </div>
      ) : (
        communityMembers.map((member) => (
          <motion.div
            key={member.id}
            whileHover={{ scale: 1.02 }}
            className="bg-[var(--main)] p-4 rounded-lg border border-[var(--stroke)] flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="relative">
              {member.avatar ? (
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white font-bold shadow-lg">
                  {member.name.charAt(0)}
                </div>
              )}
              {member.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <FaCheckCircle className="text-white text-xs" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-[var(--headline)]">{member.name}</p>
                {member.badges.includes('Top Donor') && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FaMedal className="text-amber-600" /> Top Donor
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--paragraph)]">
                <div className="flex items-center gap-1">
                  <FaClock className="text-[var(--highlight)]" />
                  Joined {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1">
                  <FaHandHoldingHeart className="text-[var(--highlight)]" />
                  {member.donationsCount} donations
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {member.badges.filter(badge => badge !== 'Top Donor').map((badge, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  // Add function to handle post creation
  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    setIsPostingContent(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create a new post
      const newPost: CommunityPost = {
        id: Date.now(),
        authorId: 999, // Current user ID
        authorName: "You", // Current user name
        authorAvatar: undefined, // Current user avatar
        content: newPostContent,
        date: new Date().toISOString(),
        likes: 0,
        comments: 0,
        isPinned: false
      };
      
      // Add to posts list
      setCommunityPosts([newPost, ...communityPosts]);
      
      // Reset input
      setNewPostContent("");
      setIsPostingContent(false);
      
      // Show success message
      toast.success("Post published successfully!");
    }, 800);
  };

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
                        organizationName={orgData.name}
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
                        organizationName={orgData.name}
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
              <>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] rounded-lg p-6 text-white mb-6"
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

                {/* Organization Donations - now inside the general fund section */}
                {transactionsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)]"></div>
                  </div>
                ) : transactionsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-500 mb-3">{transactionsError}</p>
                    <button 
                      onClick={() => isOwnProfile && charityProfile ? window.location.reload() : fetchOrganizationTransactions()}
                      className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-[var(--headline)] flex items-center gap-2 mb-4">
                      <FaReceipt className="text-[var(--highlight)]" />
                      General Fund Donations
                    </h3>
                    
                    <p className="text-sm text-[var(--paragraph)] mb-4">
                      Showing recent donation transactions verified on the blockchain for {isOwnProfile ? (charityProfile?.name || "your organization") : (organization?.name || "this organization")}
                    </p>
                    
                    <div className="space-y-3">
                      {blockchainTransactions
                        .filter(tx => tx.donationType === 'general')
                        .slice(0, 3) // Show only first 3 donations
                        .map(tx => (
                          <div
                            key={tx.id}
                            className="p-4 rounded-lg bg-[var(--panel)] hover:shadow-md transition-all"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-bold text-[var(--headline)] text-lg">
                                RM{tx.amount.toLocaleString()}
                              </div>
                              <div className="text-sm text-[var(--subtext)] bg-[var(--main)] px-2 py-1 rounded-full">
                                {new Date(tx.date).toLocaleDateString()}
                              </div>
                            </div>
                            
                            {tx.donorName && (
                              <div className="text-sm text-[var(--paragraph)] mb-2">
                                From: <span className="font-medium text-[var(--headline)]">{tx.donorName}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-xs text-[var(--subtext)] truncate max-w-[70%]">
                                TX: {tx.transactionHash ? 
                                  `${tx.transactionHash.substring(0, 8)}...${tx.transactionHash.substring(tx.transactionHash.length - 8)}` : 
                                  'N/A'}
                              </div>
                              {tx.transactionHash && (
                                <a
                                  href={getTransactionExplorerUrl(tx.transactionHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[var(--highlight)] hover:underline flex items-center"
                                >
                                  Verify <FaExternalLinkAlt className="ml-1 text-xs" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                        
                      {blockchainTransactions.filter(tx => tx.donationType === 'general').length === 0 && (
                        <div className="text-center py-6 text-[var(--paragraph)] bg-[var(--panel)] rounded-lg">
                          <FaReceipt className="mx-auto text-3xl text-[var(--subtext)] mb-2" />
                          <p>No verified transactions available yet.</p>
                        </div>
                      )}
                    </div>
                    
                    {blockchainTransactions.filter(tx => tx.donationType === 'general').length > 3 && (
                      <div className="text-center mt-4">
                        <button 
                          onClick={() => navigate('/general-fund/transactions')}
                          className="text-[var(--highlight)] hover:underline flex items-center justify-center gap-1 mx-auto"
                        >
                          View All Donations <FaArrowRight className="text-xs" />
                        </button>
                      </div>
                    )}
                    
                    <div className="text-xs text-center text-[var(--subtext)] italic mt-4">
                      All donations are securely verified on the blockchain for complete transparency
                    </div>
                  </div>
                )}
              </>
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

        {/* Community Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          {userRole === 'donor' ? (
            hasContributedToGeneralFund ? (
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
                  {renderCommunityStats()}

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
                      isLoadingCommunity ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)]"></div>
                        </div>
                      ) : communityPosts.length > 0 ? (
                        <>
                          {/* Post Creation Form */}
                          <div className="bg-[var(--main)] p-4 rounded-lg border border-[var(--stroke)] mb-6">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white font-bold">
                                Y
                              </div>
                              <div className="flex-1">
                                <textarea
                                  placeholder="Share your thoughts with the community..."
                                  className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--stroke)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] resize-none min-h-[80px] text-[var(--paragraph)]"
                                  value={newPostContent}
                                  onChange={(e) => setNewPostContent(e.target.value)}
                                  disabled={isPostingContent}
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                  <button
                                    className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    onClick={handleCreatePost}
                                    disabled={!newPostContent.trim() || isPostingContent}
                                  >
                                    {isPostingContent ? (
                                      <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Posting...
                                      </>
                                    ) : (
                                      <>
                                        <FaComment />
                                        Post
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Posts List */}
                          <div className="space-y-6">
                            {communityPosts.map(post => (
                              <div 
                                key={post.id} 
                                className={`bg-[var(--main)] p-4 rounded-lg border ${post.isPinned 
                                  ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/10' 
                                  : 'border-[var(--stroke)]'} hover:shadow-md transition-all`}
                              >
                                {/* Post Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    {post.authorAvatar ? (
                                      <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white font-bold">
                                        {post.authorName.charAt(0)}
                                      </div>
                                    )}
                                    <div>
                                      <div className="flex items-center gap-1">
                                        <p className="font-medium text-[var(--headline)]">{post.authorName}</p>
                                        {post.authorId === 0 && (
                                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full ml-1">
                                            Official
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-[var(--subtext)]">
                                        {new Date(post.date).toLocaleString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  {post.isPinned && (
                                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <FaThumbtack className="text-amber-600" /> Announcement
                                    </span>
                                  )}
                                </div>
                                
                                {/* Post Content */}
                                <p className={`text-[var(--paragraph)] mb-4 ${post.isPinned ? 'font-medium' : ''}`}>{post.content}</p>
                                
                                {/* Post Interactions */}
                                <div className="flex items-center justify-between text-sm text-[var(--subtext)] pt-2 border-t border-[var(--stroke)]">
                                  <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1 hover:text-[var(--highlight)] transition-colors">
                                      <FaHeart className="text-[var(--highlight)]" />
                                      {post.likes}
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-[var(--highlight)] transition-colors">
                                      <FaComment className="text-[var(--highlight)]" />
                                      {post.comments}
                                    </button>
                                  </div>
                                  <button className="text-[var(--subtext)] hover:text-[var(--highlight)] transition-colors">
                                    Reply
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <FaComments className="mx-auto text-4xl text-[var(--paragraph)] opacity-30 mb-4" />
                          <p className="text-[var(--paragraph)]">No posts yet in this community.</p>
                          <button
                            className="mt-4 px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-all"
                          >
                            Create the first post
                          </button>
                        </div>
                      )
                    )}
                    {communityView === 'members' && renderCommunityMembers()}
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
              
              // Set that the user has contributed to the general fund
              setHasContributedToGeneralFund(true);

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

      {/* Floating Donate Now button - only show for donors viewing an organization */}
      {userRole === 'donor' && !isOwnProfile && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <button
            onClick={() => setIsDonationModalOpen(true)}
            className="group relative overflow-hidden px-8 py-4 rounded-full bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
          >
            {/* Pulsing background effect */}
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>

            {/* Icon with animation */}
            <span className="relative bg-white bg-opacity-30 p-2 rounded-full">
              <FaHandHoldingHeart className="text-xl group-hover:scale-110 transition-transform duration-300" />
            </span>

            <span className="relative">
              Donate Now
              <span className="block text-xs opacity-90">Support This Organization</span>
            </span>

            {/* Arrow indicator */}
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7"></path>
            </svg>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default OrganizationDetail; 