import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaMoneyBillWave, FaArrowLeft, FaHandHoldingHeart, FaUsers, FaChartLine, FaHistory, FaBuilding, FaEdit, FaTrash, FaComments, FaClock, FaThumbsUp, FaPlus, FaMapMarkerAlt, FaShare, FaTrophy, FaExchangeAlt, FaTimes, FaHashtag, FaTags, FaFire, FaUserCircle, FaCheck, FaFileInvoice, FaFlag, FaLock, FaDownload, FaCalendarTimes, FaExternalLinkAlt, FaReceipt } from "react-icons/fa";
import { useRole } from "../../../../contexts/RoleContext";
import { charityService, Campaign as CampaignType } from "../../../../services/supabase/charityService";
import DonationModal from "../../../../components/modals/DonationModal";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import PostFeed from "../../common/community/components/PostFeed";
import DonationLeaderboard from "../../common/community/components/DonationLeaderboard";
import MyContributionPopup from '../../../../components/modals/MyContributionPopup';
import CampaignTimeline from "../../../../components/campaign/CampaignTimeline";

import DonorLeaderboardAndTracker from '../../../../components/donation/DonorLeaderboardAndTracker';
import supabase from "../../../../services/supabase/supabaseClient";  

import SimpleDonationVerifier from "../../../../components/donation/SimpleDonationVerifier";

// Floating Modal Component for Full Leaderboard
const LeaderboardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignName: string;
}> = ({ isOpen, onClose, campaignId, campaignName }) => {
  if (!isOpen) return null;

  // Handle keyboard events (Escape key)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener when the modal is open
    document.addEventListener('keydown', handleKeyDown);

    // Focus trap (optional)
    const originalFocus = document.activeElement;

    // Clean up event listener when modal is closed
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to original element (if it can receive focus)
      if (originalFocus && 'focus' in originalFocus && typeof (originalFocus as any).focus === 'function') {
        (originalFocus as HTMLElement).focus();
      }
    };
  }, [onClose]);

  // Close when clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
    >
      <motion.div
        className="bg-[var(--main)] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="p-6 border-b border-[var(--stroke)] flex justify-between items-center sticky top-0 bg-[var(--main)] z-10">
          <div>
            <h2 id="leaderboard-title" className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2">
              <FaTrophy className="text-[var(--highlight)]" />
              Top Donors
            </h2>
            <p className="text-[var(--paragraph)] mt-1">
              {campaignName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[var(--background)] transition-colors text-[var(--paragraph)] hover:text-[var(--headline)]"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          <DonationLeaderboard
            communityId={campaignId}
            communityType="campaign"
            simplified={false}
          />
        </div>
      </motion.div>
    </div>
  );
};

// Define a type for donor contribution
interface DonorContribution {
  totalAmount: number;
  contributions: Array<{
    date: string;
    amount: number;
    id: string;  // Add id field to match MyContributionPopup requirements
  }>;
  percentageOfTotal: string;
}

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useRole();

  // State for campaign data
  const [campaign, setCampaign] = useState<CampaignType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add state for donation stats
  const [donationStats, setDonationStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [isContributionPopupOpen, setIsContributionPopupOpen] = useState(false);

  // Add state for selected donor ID
  const [selectedDonorId, setSelectedDonorId] = useState<number | null>(null);

  // Update type definition to include the new tab
  const [activeMainTab, setActiveMainTab] = useState<'transactions' | 'community'>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'community' ? 'community' : 'transactions';
  });

  // Add to CampaignDetail.tsx
  const [userDonations, setUserDonations] = useState<any>(null);

  // Add state for blockchain transactions
  const [blockchainTransactions, setBlockchainTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) {
        setError("Campaign ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const campaignData = await charityService.getCampaignById(id);
        console.log("Campaign data fetched:", campaignData);
        console.log("Campaign charity_id:", campaignData.charity_id);
        console.log("Campaign charity object:", campaignData.charity);
        setCampaign(campaignData);
        setError(null);

        // Fetch donation stats after campaign data is loaded
        fetchDonationStats(id);
      } catch (err: any) {
        console.error("Error fetching campaign:", err);
        setError(err.message || "Failed to load campaign. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  // Function to fetch donation stats
  const fetchDonationStats = async (campaignId: string) => {
    try {
      setStatsLoading(true);
      const stats = await charityService.getCampaignDonationStats(campaignId);
      setDonationStats(stats);
      setStatsError(null);
    } catch (err: any) {
      console.error("Error fetching donation stats:", err);
      setStatsError(err.message || "Failed to load donation statistics.");
    } finally {
      setStatsLoading(false);
    }
  };

  // Refresh donation stats after a successful donation
  const refreshDonationStats = () => {
    if (id) {
      fetchDonationStats(id);
    }
  };

  // Add to CampaignDetail.tsx
  const fetchUserDonations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('campaign_donations')
        .select('id, amount, created_at, transaction_hash, donation_policy, blockchain_donation_id, status')
        .eq('campaign_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (data && data.length > 0) {
        const contributions = data.map(donation => ({
          id: donation.id,
          date: donation.created_at,
          amount: donation.amount,
          txHash: donation.transaction_hash,
          donationPolicy: donation.donation_policy,
          blockchainId: donation.blockchain_donation_id,
          status: donation.status
        }));
        
        setUserDonations({
          totalAmount: data.reduce((sum, d) => sum + d.amount, 0),
          contributions,
          percentageOfTotal: donationStats ? 
            ((data.reduce((sum, d) => sum + d.amount, 0) / donationStats.donations.total) * 100).toFixed(1) : 
            '0'
        });
      }
    } catch (error) {
      console.error('Error fetching user donations:', error);
    }
  };

  // Use effect to fetch user donations after donation stats are fetched
  useEffect(() => {
    if (donationStats) {
      fetchUserDonations();
    }
  }, [donationStats]);

  // Add useEffect to fetch blockchain transactions when campaign is loaded
  useEffect(() => {
    if (campaign) {
      fetchBlockchainTransactions();
    }
  }, [campaign]);

  // Update the fetchBlockchainTransactions function with the correct column name
  const fetchBlockchainTransactions = async () => {
    if (!campaign) return;
    
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      
      // Use is_anonymous instead of anonymous
      const { data, error } = await supabase
        .from('campaign_donations')
        .select('id, amount, created_at, user_id, is_anonymous, transaction_hash, donation_policy, message, status')
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Fix the filter to use is_anonymous
      const userIds = data
        .filter(donation => !donation.is_anonymous && donation.user_id)
        .map(donation => donation.user_id);
        
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
      
      // Fix the donorName to use is_anonymous
      const transactions = data.map(donation => ({
        id: donation.id,
        amount: donation.amount,
        date: donation.created_at,
        donorName: donation.is_anonymous ? null : (userNames[donation.user_id] || 'Unknown Donor'),
        donorId: donation.is_anonymous ? null : donation.user_id,
        transactionHash: donation.transaction_hash,
        donationPolicy: donation.donation_policy,
        message: donation.message,
        status: donation.status || 'confirmed'
      }));
      
      setBlockchainTransactions(transactions);
    } catch (err: any) {
      console.error('Error fetching blockchain transactions:', err);
      setTransactionsError(err.message || 'Failed to load transaction data');
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--highlight)] mb-4"></div>
          <p className="text-[var(--paragraph)]">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // If campaign not found or error, show error or redirect
  if (error || !campaign) {
    return (
      <div className="p-6 bg-[var(--background)] text-[var(--paragraph)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Campaign not found"}</h1>
          <button
            onClick={() => navigate('/charity')}
            className="button flex items-center gap-2 px-6 py-2 mx-auto"
          >
            <FaArrowLeft />
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  // Use charity data from campaign
  const charity = campaign.charity || null;

  // Calculate progress percentage
  const progress = (campaign.current_amount / campaign.target_amount) * 100;

  // Calculate days left (if deadline exists)
  const timeLeft = campaign.deadline
    ? Math.max(0, Math.floor((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Check if campaign is active
  const isCampaignActive = campaign.status === 'active';

  // Check if campaign is expired based on deadline
  const isCampaignExpired = campaign.deadline ? new Date(campaign.deadline) < new Date() : false;

  const handleDonationComplete = async (amount: number, donationPolicy?: string, isAnonymous?: boolean, isRecurring?: boolean, txHash?: string) => {
    try {
      console.log("Full campaign object:", campaign);

      // Ensure we have the proper charity ID
      // First check if charity object is available and has an ID
      let charityId;
      if (campaign.charity && campaign.charity.id) {
        charityId = campaign.charity.id;
        console.log("Using charity ID from charity object:", charityId);
      } else {
        // Fallback to charity_id from campaign
        charityId = campaign.charity_id;
        console.log("Using charity_id from campaign:", charityId);
      }

      if (!charityId) {
        throw new Error("Unable to determine charity ID for donation");
      }

      console.log("Making campaign donation with parameters:", {
        campaignId: campaign.id,
        charityId: charityId,
        amount: amount,
        donationPolicy: donationPolicy,
        isAnonymous: isAnonymous || false,
        isRecurring: isRecurring || false
      });

      // Call the charityService to make the donation
      const donation = await charityService.makeDonation({
        campaignId: campaign.id,
        charityId: charityId,
        amount: amount,
        donationPolicy: donationPolicy,
        isAnonymous: isAnonymous || false,
        isRecurring: isRecurring || false
      });

      // Show success message based on donation policy and recurring status
      let message = `Thank you for your ${isRecurring ? 'monthly' : 'one-time'} donation of RM${amount}!`;

      if (donationPolicy) {
        if (donationPolicy === 'campaign-specific') {
          message += ` You can get a refund if the campaign doesn't reach its goal.`;
        } else if (donationPolicy === 'always-donate') {
          message += ` Your donation will support the organization even if the campaign doesn't reach its goal.`;
        }
      }

      toast.success(message);

      // Refresh the campaign data to reflect the new donation amount
      const updatedCampaign = await charityService.getCampaignById(campaign.id);
      setCampaign(updatedCampaign);

      // Also refresh donation stats
      refreshDonationStats();
      // Also refresh user donations
      fetchUserDonations();
    } catch (error: any) {
      console.error('Error making donation:', error);
      toast.error(error.message || 'Failed to process donation. Please try again.');
    }
  };

  // Handle view full leaderboard
  const handleViewFullLeaderboard = () => {
    // Use the modal instead of navigation
    setShowFullLeaderboard(true);
  };

  // Handle organization click to navigate to org page
  const handleOrganizationClick = () => {
    if (charity) {
      navigate(`/organization/${charity.id}`);
    }
  };

  // Handle tab change to update URL
  const handleTabChange = (tab: 'transactions' | 'community') => {
    setActiveMainTab(tab);
    navigate(`/charity/${id}?tab=${tab}`, { replace: true });
  };

  // Get the current user's donor ID (in a real app, this would come from an auth context)
  const getCurrentUserDonorId = () => {
    // This is a placeholder - in a real application, you'd get this from auth
    if (userRole === 'donor') {
      const userId = localStorage.getItem('userId');
      return userId ? parseInt(userId) : undefined;
    }
    return undefined;
  };

  return (
    <div className="p-6 bg-[var(--background)] text-[var(--paragraph)]">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--paragraph)] hover:text-[var(--headline)] mb-6"
        >
          <FaArrowLeft />
          Back to Campaigns
        </button>

        {/* Expired campaign banner - only show for expired campaigns */}
        {isCampaignExpired && (
          <div className="mb-6 overflow-hidden rounded-lg shadow-md border border-red-200">
            <div className="bg-gradient-to-r from-red-500 to-orange-400 px-5 py-2 text-white text-sm font-medium">
              Campaign Status
            </div>
            <div className="bg-white p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FaCalendarTimes className="text-red-500 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-red-700 font-semibold text-lg flex items-center gap-2">
                  This campaign has ended
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Expired
                  </span>
                </h3>
                <p className="text-gray-600">
                  This campaign reached its deadline on {new Date(campaign.deadline).toLocaleDateString()} and is no longer accepting donations.
                  You can still view details and impact information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main campaign header - full width */}
        <div className={`bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] p-8 text-white rounded-t-xl shadow-lg mb-6 
          ${isCampaignExpired ? 'relative' : ''}`}>

          {/* Status indicator for expired campaigns instead of watermark */}
          {isCampaignExpired && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30 shadow-sm">
              <span className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-white font-medium text-sm">Campaign Ended</span>
            </div>
          )}

          <div className="relative">
            <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
            <p className="text-white text-opacity-90 mb-4">{campaign.description}</p>

            {/* Progress bar */}
            <div className="mb-6">
              {/* Enhanced progress bar with donation policy visualization */}
              <div className="flex justify-between items-center mb-3">
                {/* Legend */}
                <div className="flex gap-4 text-sm text-white">
                  {/* Campaign-specific */}
                  <div className="flex items-center gap-2 bg-white bg-opacity-10 px-2 py-1 rounded-lg">
                    <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-green-600 to-green-400 shadow-sm"></div>
                    <div className="font-medium flex items-center gap-1">
                      <FaLock className="text-green-300" size={10} />
                      <span>Campaign-Specific</span>
                    </div>
                  </div>

                  {/* Always-donate */}
                  <div className="flex items-center gap-2 bg-white bg-opacity-10 px-2 py-1 rounded-lg">
                    <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm"></div>
                    <div className="font-medium flex items-center gap-1">
                      <FaHandHoldingHeart className="text-blue-300" size={10} />
                      <span>Always-Donate</span>
                    </div>
                  </div>
                </div>

                {/* Goal indicator */}
                <div className="bg-white/50 px-4 py-1.5 rounded-full text-sm text-black flex items-center gap-2 shadow-md border border-white/30 font-semibold">
                  <span className="text-black/70 font-medium">Goal:</span>
                  <span className="font-bold text-base">RM{campaign.target_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Enhanced progress bar with shadow and glass effect */}
              <div className="w-full bg-white bg-opacity-20 backdrop-blur-sm rounded-xl h-12 overflow-hidden flex p-1 shadow-inner relative">
                {donationStats && campaign.target_amount > 0 && (
                  <>
                    {/* Campaign-specific portion with gradient */}
                    {donationStats.donations.campaignSpecificTotal > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(donationStats.donations.campaignSpecificTotal / campaign.target_amount) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-l-lg bg-gradient-to-r from-green-600 to-green-400 shadow-lg flex items-center justify-center"
                        style={{
                          width: `${(donationStats.donations.campaignSpecificTotal / campaign.target_amount) * 100}%`,
                          maxWidth: "100%"
                        }}
                      >
                        {((donationStats.donations.campaignSpecificTotal / campaign.target_amount) * 100) > 10 && (
                          <span className="text-sm font-bold text-white drop-shadow-md px-2">
                            RM{Math.round(donationStats.donations.campaignSpecificTotal).toLocaleString()}
                          </span>
                        )}
                      </motion.div>
                    )}

                    {/* Always-donate portion with gradient */}
                    {donationStats.donations.alwaysDonateTotal > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(donationStats.donations.alwaysDonateTotal / campaign.target_amount) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        className={`h-full ${donationStats.donations.campaignSpecificTotal > 0 ? "" : "rounded-l-lg"} rounded-r-lg bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg flex items-center justify-center`}
                        style={{
                          width: `${(donationStats.donations.alwaysDonateTotal / campaign.target_amount) * 100}%`,
                          maxWidth: `${100 - ((donationStats.donations.campaignSpecificTotal / campaign.target_amount) * 100)}%`
                        }}
                      >
                        {((donationStats.donations.alwaysDonateTotal / campaign.target_amount) * 100) > 10 && (
                          <span className="text-sm font-bold text-white drop-shadow-md px-2">
                            RM{Math.round(donationStats.donations.alwaysDonateTotal).toLocaleString()}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </>
                )}
                {/* Fallback or loading state for progress bar if needed */}
                {!donationStats && (
                  <div className="h-full w-full bg-gray-300 rounded-lg animate-pulse"></div>
                )}

                {/* Subtle grid overlay for texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMCBMIDEwIDEwIE0gMTAgMCBMIDAgMTAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiAvPjwvc3ZnPg==')]"></div>
              </div>
            </div>

            {/* Campaign stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/60 p-3 rounded-lg text-center backdrop-blur-sm shadow-inner border border-white/20">
                <div className="text-2xl font-bold text-black">RM{campaign.current_amount.toLocaleString()}</div>
                <div className="text-sm mt-1 text-black/70 font-medium">Raised</div>
              </div>
              <div className="bg-white/60 p-3 rounded-lg text-center backdrop-blur-sm shadow-inner border border-white/20">
                <div className="text-2xl font-bold text-black">{campaign.deadline ? timeLeft : 'No'}</div>
                <div className="text-sm mt-1 text-black/70 font-medium">Days Left</div>
              </div>
              <div className="bg-white/60 p-3 rounded-lg text-center backdrop-blur-sm shadow-inner border border-white/20">
                <div className="text-2xl font-bold text-black">42</div>
                <div className="text-sm mt-1 text-black/70 font-medium">Donors</div>
              </div>
            </div>

            {/* User's donation - show for all donors */}
            {userRole === 'donor' && userDonations && (
              <div
                className="mt-4 group bg-white/70 p-3.5 px-5 rounded-lg cursor-pointer hover:bg-white/80 transition-all duration-300 shadow-sm border border-white/30"
                onClick={() => setIsContributionPopupOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 border border-amber-200">
                      <span className="text-xl" role="img" aria-label="raised hands">🙌</span>
                      </div>
                    <div className="text-black">
                      <div className="font-bold text-base">Thanks for your support!</div>
                      <div className="text-sm text-black/70 mt-0.5">
                        {donationStats && donationStats.donations.topDonors.some((d: any) => d.donorId === getCurrentUserDonorId()) ? 
                        `Top Donor · RM${userDonations.totalAmount} · Last on ${new Date(userDonations.contributions[0].date).toLocaleDateString()}` :
                        `RM${userDonations.totalAmount} · Last on ${new Date(userDonations.contributions[0].date).toLocaleDateString()}`
                      }
                        </div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-black/50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Two-column layout for main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main campaign information - now spans 2 columns always */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization info - now clickable */}
            {charity && (
              <div
                className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-[var(--highlight)] group"
                onClick={handleOrganizationClick}
                role="button"
                aria-label={`View ${charity?.name || "Organization"} details`}
              >
                <div className="p-4 border-b border-[var(--stroke)] bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] bg-opacity-10 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[var(--headline)]">Organized by</h3>
                  <span className="text-sm text-[var(--highlight)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                    View Organization
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
                <div className="p-6 group-hover:bg-[var(--background)] transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[var(--highlight)] bg-opacity-20 rounded-full flex items-center justify-center shadow-md group-hover:bg-opacity-30 transition-all duration-300">
                      <FaBuilding className="text-[var(--highlight)] text-2xl" />
                    </div>
                    <div>
                      <p className="font-bold text-xl text-[var(--headline)] group-hover:text-[var(--highlight)] transition-colors duration-300">{charity?.name || "Organization"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {charity.verified && (
                          <span className="bg-[var(--highlight)] bg-opacity-10 text-white text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            Verified Organization
                          </span>
                        )}
                        {charity.founded && (
                          <span className="text-[var(--paragraph)] text-sm">Since {charity.founded}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-[var(--stroke)] pt-4 text-sm text-[var(--paragraph)]">
                    <p className="line-clamp-2">
                      {charity?.description || "This organization is dedicated to making a positive impact through various campaigns and initiatives."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabbed section for Transactions and Community - show for all donors now */}
            {(userRole === 'charity' || userRole === 'donor') ? (
              <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
                <div className="border-b border-[var(--stroke)]">
                  <div className="flex">
                    <button
                      onClick={() => handleTabChange('transactions')}
                      className={`px-6 py-4 flex items-center gap-2 text-sm font-medium ${activeMainTab === 'transactions'
                        ? 'bg-[var(--highlight)] text-white'
                        : 'hover:bg-[var(--background)]'
                        }`}
                    >
                      <FaExchangeAlt />
                      Transactions
                    </button>
                    <button
                      onClick={() => handleTabChange('community')}
                      className={`px-6 py-4 flex items-center gap-2 text-sm font-medium ${activeMainTab === 'community'
                        ? 'bg-[var(--highlight)] text-white'
                        : 'hover:bg-[var(--background)]'
                        }`}
                    >
                      <FaUsers />
                      Community
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {activeMainTab === 'transactions' && (
                    <>                     
                      {/* Keep the existing CampaignTimeline component */}
                      <CampaignTimeline
                        campaignName={campaign.title}
                        currentAmount={campaign.current_amount}
                        goalAmount={campaign.target_amount}
                        deadline={campaign.deadline}
                        daysLeft={timeLeft}
                        startDate={campaign.created_at}
                      />
                    </>
                  )}

                  {activeMainTab === 'community' && (
                    <>
                      <h2 className="text-xl font-bold text-[var(--headline)] mb-2">Campaign Community</h2>
                      <p className="text-[var(--paragraph)] text-sm mb-4">
                        Connect with other supporters and stay updated
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[var(--paragraph)] mb-6">
                        <span className="flex items-center gap-1">
                          <FaUsers className="text-[var(--tertiary)]" />
                          {42} members
                        </span>
                        <span className="flex items-center gap-1">
                          <FaComments className="text-[var(--secondary)]" />
                          {24} posts
                        </span>
                      </div>

                      {/* Post feed component */}
                      <PostFeed communityId={campaign.id} communityType="campaign" />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden p-6 text-center">
                <div className="my-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center">
                      <FaHandHoldingHeart className="text-[var(--highlight)] text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--headline)] mb-3">Support this campaign</h3>
                  <p className="text-[var(--paragraph)] mb-6 max-w-md mx-auto">
                    Donate to this campaign to unlock access to campaign transactions,
                    community discussions, and the donor leaderboard.
                  </p>
                  {isCampaignActive && !isCampaignExpired && (
                    <button
                      className="px-6 py-3 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90 flex items-center gap-2 transition-colors mx-auto"
                      onClick={() => setIsDonationModalOpen(true)}
                    >
                      <FaHandHoldingHeart />
                      Donate Now
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Supplementary information */}
          <div className="space-y-6">
            {/* Campaign details - removed */}

            {/* Donor Leaderboard - show for all donors */}
            {(userRole === 'charity' || userRole === 'donor') ? (
              <div className="mb-8">
                {statsLoading ? (
                  <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--highlight)]"></div>
                    </div>
                  </div>
                ) : statsError ? (
                  <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
                    <div className="text-red-500 py-2">{statsError}</div>
                    <button
                      onClick={refreshDonationStats}
                      className="mt-2 px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90"
                    >
                      Try Again
                    </button>
                  </div>
                ) : donationStats ? (
                  <DonorLeaderboardAndTracker
                    tracker={{
                      id: parseInt(campaign.id),
                      recipientId: parseInt(campaign.id),
                      recipientType: 'campaign',
                      donations: {
                        total: donationStats.donations.total,
                        count: donationStats.donations.count,
                        campaignSpecificTotal: donationStats.donations.campaignSpecificTotal,
                        alwaysDonateTotal: donationStats.donations.alwaysDonateTotal,
                        timeline: donationStats.donations.timeline,
                        topDonors: donationStats.donations.topDonors
                      }
                    }}
                    userDonorId={getCurrentUserDonorId()} // Get actual donor ID
                  />
                ) : (
                  <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FaTrophy className="text-[var(--highlight)]" />
                      <h3 className="text-lg font-bold text-[var(--headline)]">Donors & Donations</h3>
                    </div>
                    <p className="text-[var(--paragraph)] text-center py-4">
                      No donation data available yet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <FaTrophy className="text-[var(--highlight)]" />
                  <h3 className="text-lg font-bold text-[var(--headline)]">Donors & Donations</h3>
                </div>
                <div className="border-t border-[var(--stroke)] pt-4 mt-2 text-center">
                  <p className="text-[var(--paragraph)] mb-4">
                    Donate to this campaign to view the leaderboard and track where your donation ranks!
                  </p>
                  {isCampaignActive && !isCampaignExpired && (
                    <button
                      className="px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90 text-sm transition-colors"
                      onClick={() => setIsDonationModalOpen(true)}
                    >
                      Become a Donor
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Donation Verifier - shows recent transactions with blockchain verification */}
            {(userRole === 'charity' || userRole === 'donor') && (
              <>
                {blockchainTransactions.length > 0 ? (
                  <SimpleDonationVerifier
                    title="Blockchain Verification"
                    campaignName={campaign.title}
                    transactions={blockchainTransactions.map(tx => ({
                      id: tx.id,
                      amount: tx.amount,
                      date: tx.date,
                      transactionHash: tx.transactionHash || '',
                      donorName: tx.donorName
                    }))}
                    showDonorNames={true}
                  />
                ) : (
                  <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <FaReceipt className="text-[var(--highlight)]" />
                      <h3 className="text-lg font-bold text-[var(--headline)]">Blockchain Verification</h3>
                    </div>
                    <p className="text-[var(--paragraph)] text-center py-4">
                      No verified transactions available yet.
                    </p>
                    <div className="mt-2 border-t border-[var(--stroke)] pt-4 text-center">
                      <p className="text-sm text-[var(--paragraph)] italic">
                        All donations are securely verified on the blockchain for complete transparency
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Donation Tracker - temporarily disabled until real data is available */}
            {false && (userRole === 'charity' || (userRole === 'donor' && userDonations)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h3 className="text-xl font-bold text-[var(--headline)] mb-4 flex items-center gap-2">
                  <FaChartLine className="text-[var(--highlight)]" />
                  Donation Breakdown
                </h3>

                <div className="max-w-full overflow-hidden">
                  <p className="text-[var(--paragraph)]">
                    Donation tracking data will be available soon.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Donate Now button - only show for active campaigns */}
      {userRole === 'donor' && !isCampaignExpired && isCampaignActive && (
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
              <span className="block text-xs opacity-90">Support This Campaign</span>
            </span>

            {/* Arrow indicator */}
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7"></path>
            </svg>
          </button>
        </motion.div>
      )}

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaignId={campaign.id}
        campaignName={campaign.title}
        organizationId={campaign.charity_id}
        organizationName={charity?.name}
        onDonationComplete={handleDonationComplete}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showFullLeaderboard}
        onClose={() => setShowFullLeaderboard(false)}
        campaignId={campaign.id}
        campaignName={campaign.title}
      />

      {/* Donor Profile Popup */}
      {selectedDonorId && campaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm"
          onClick={() => setSelectedDonorId(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--main)] rounded-xl overflow-hidden shadow-xl max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}>

            {/* Popout Header */}
            <div className="p-4 border-b border-[var(--stroke)] flex justify-between items-center bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] text-white">
              <h3 className="text-xl font-bold">Donor Profile</h3>
              <button
                onClick={() => setSelectedDonorId(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Popout Content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Donor Profile Section */}
                <div className="md:w-1/3 bg-[var(--background)] rounded-lg border border-[var(--stroke)] p-5">
                  <div className="flex flex-col items-center mb-6">
                    {/* Top 3 badge */}
                    <div className="mb-2 text-3xl">🥉</div>

                    {/* Avatar */}
                    <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-[var(--highlight)] p-1">
                      <div className="w-full h-full flex items-center justify-center rounded-full bg-[#CD6116] text-white text-3xl font-bold">
                        Y
                      </div>
                    </div>

                    {/* Donor name and rank */}
                    <h4 className="text-xl font-bold text-[var(--highlight)]">
                      You
                    </h4>

                    <div className="text-[var(--paragraph)] mt-1">
                      Rank: 3
                    </div>
                  </div>

                  {/* Donor stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-[var(--main)] rounded-lg border border-[var(--stroke)]">
                      <div className="text-sm text-[var(--paragraph)]">Total Donated</div>
                      <div className="font-bold text-[#00674D]">RM{userDonations?.totalAmount}</div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[var(--main)] rounded-lg border border-[var(--stroke)]">
                      <div className="text-sm text-[var(--paragraph)]">Transactions</div>
                      <div className="font-bold text-[#00674D]">{userDonations?.contributions.length}</div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[var(--main)] rounded-lg border border-[var(--stroke)]">
                      <div className="text-sm text-[var(--paragraph)]">Last Donation</div>
                      <div className="font-bold text-[#00674D]">{new Date(userDonations?.contributions[0].date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* View full profile button */}
                  <button
                    className="w-full mt-6 px-4 py-3 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaUserCircle size={16} />
                    View Full Profile
                  </button>
                </div>

                {/* Donation History Section */}
                <div className="md:w-2/3 bg-[var(--background)] rounded-lg border border-[var(--stroke)] p-5 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-[#00674D] flex items-center gap-2 mb-4">
                    <FaHistory className="text-[var(--highlight)]" />
                    Donation History
                  </h3>

                  {/* Donation timeline */}
                  <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: "350px" }}>
                    <div className="space-y-2">
                      {userDonations?.contributions.length > 0 ? (
                        userDonations.contributions.map((contribution: any, index: number) => (
                          <div
                            key={contribution.id}
                            className="bg-[var(--main)] p-4 rounded-lg border border-[var(--stroke)] flex justify-between items-center"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center">
                                <FaCalendarAlt className="text-[var(--highlight)]" />
                              </div>
                              <div>
                                <div className="font-medium text-lg text-[#00674D]">
                                  RM{contribution.amount}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-xs text-[var(--paragraph)]">
                                    {new Date(contribution.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button className="px-3 py-1.5 bg-[#FFA500] bg-opacity-10 text-[#FF8C00] rounded-md hover:bg-opacity-20 transition-colors flex items-center gap-1.5 text-xs font-medium ml-2">
                              <FaDownload className="text-sm" />
                              <span>Receipt</span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-[var(--paragraph)]">
                          No donation history available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MyContributionPopup - Keep but set isOpen to false */}
      <MyContributionPopup
        isOpen={isContributionPopupOpen}
        onClose={() => setIsContributionPopupOpen(false)}
        contributions={userDonations?.contributions || []}
        totalContributed={userDonations?.totalAmount || 0}
        donationsCount={userDonations?.contributions?.length || 0}
        percentageOfTotal={userDonations?.percentageOfTotal ? parseFloat(userDonations.percentageOfTotal) : 0}
        displayAsCenterModal={true}
      />
    </div>
  );
};

export default CampaignDetail; 