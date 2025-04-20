import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaMoneyBillWave, FaArrowLeft, FaHandHoldingHeart, FaUsers, FaChartLine, FaHistory, FaBuilding, FaEdit, FaTrash, FaComments, FaClock, FaThumbsUp, FaPlus, FaMapMarkerAlt, FaShare, FaTrophy, FaExchangeAlt, FaTimes, FaHashtag, FaTags, FaFire, FaUserCircle } from "react-icons/fa";
import { useRole } from "../../../../contexts/RoleContext";
import { charityService, Campaign as CampaignType } from "../../../../services/supabase/charityService";
import DonationModal from "../../../../components/modals/DonationModal";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
// Import the community components
import PostFeed from "../../common/community/components/PostFeed";
import DonationLeaderboard from "../../common/community/components/DonationLeaderboard";
import TransactionTimeline from "../../common/community/components/TransactionTimeline";
import DonationTracker from "../../../../components/donation/DonationTracker";
import MyContributionPopup from '../../../../components/modals/MyContributionPopup';

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
  
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [isContributionPopupOpen, setIsContributionPopupOpen] = useState(false);
  
  // Add new state for community features
  const [activeSection, setActiveSection] = useState<'feed'>('feed');

  // Keep this declaration that initializes based on URL
  const [activeMainTab, setActiveMainTab] = useState<'transactions' | 'community'>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'community' ? 'community' : 'transactions';
  });

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
      } catch (err: any) {
        console.error("Error fetching campaign:", err);
        setError(err.message || "Failed to load campaign. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

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
  
  // Create mock donor contribution data for all donors
  const donorContribution: DonorContribution = {
    totalAmount: 250,
    contributions: [
      { id: '1', date: '2023-11-15T10:30:00', amount: 150 },
      { id: '2', date: '2023-12-20T15:45:00', amount: 100 }
    ],
    percentageOfTotal: '8.5'
  };
  
  // Calculate progress percentage
  const progress = (campaign.current_amount / campaign.target_amount) * 100;
  
  // Calculate days left (if deadline exists)
  const timeLeft = campaign.deadline 
    ? Math.max(0, Math.floor((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Check if campaign is active
  const isCampaignActive = campaign.status === 'active';

  const handleDonationComplete = async (amount: number, donationPolicy?: string, isAnonymous?: boolean, isRecurring?: boolean) => {
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

  // Update the tab change handler to update the URL
  const handleTabChange = (tab: 'transactions' | 'community') => {
    setActiveMainTab(tab);
    navigate(`/charity/${id}?tab=${tab}`, { replace: true });
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

        {/* Main campaign header - full width */}
        <div className="bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] p-8 text-white rounded-t-xl shadow-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
          <p className="text-white text-opacity-90 mb-4">{campaign.description}</p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-white bg-opacity-30 rounded-full h-4 mb-2">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-sm text-white">
              <span>RM{campaign.current_amount} raised</span>
              <span>RM{campaign.target_amount} goal</span>
            </div>
          </div>

          {/* Campaign stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">RM{campaign.current_amount}</div>
              <div className="text-sm">Raised</div>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{campaign.deadline ? timeLeft : 'No'}</div>
              <div className="text-sm">Days Left</div>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">-</div>
              <div className="text-sm">Donors</div>
            </div>
          </div>

          {/* User's donation - show for all donors */}
          {userRole === 'donor' && (
            <div className="mt-4 bg-white bg-opacity-20 p-4 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                {/* User avatar/icon */}
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center mr-3">
                  <FaUserCircle className="text-white text-xl" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-white flex items-center">
                    Your Total: RM{donorContribution.totalAmount}
                  </div>
                  <div className="text-sm text-white text-opacity-90">
                    {donorContribution.percentageOfTotal}% of Campaign
                  </div>
                </div>
              </div>

              {/* My Contributions button */}
              <button
                onClick={() => setIsContributionPopupOpen(true)}
                className="px-4 py-2 rounded-lg bg-white text-[var(--highlight)] hover:bg-opacity-90 transition-colors duration-300 flex items-center gap-2 font-bold shadow-sm"
              >
                <FaHistory className="text-[var(--highlight)]" />
                My Contributions
              </button>
            </div>
          )}
        </div>

        {/* Two-column layout for main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main campaign information */}
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
                      <h2 className="text-xl font-bold text-[var(--headline)] mb-2">Campaign Transactions</h2>
                      <p className="text-[var(--paragraph)] text-sm mb-4">
                        Track how funds are being used in this campaign
                      </p>
                      <TransactionTimeline communityId={campaign.id} communityType="campaign" />
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

                      {/* Community Sub-Navigation */}
                      <div className="flex mb-6 border-b border-[var(--stroke)]">
                        <button
                          onClick={() => setActiveSection('feed')}
                          className={`px-4 py-2 text-sm font-medium ${activeSection === 'feed'
                            ? 'border-b-2 border-[var(--highlight)] text-[var(--highlight)]'
                            : 'text-[var(--paragraph)]'
                            }`}
                        >
                          <FaComments className="inline mr-2" />
                          Discussion Feed
                        </button>
                      </div>

                      {/* Community Content Based on Selected View */}
                      {activeSection === 'feed' && <PostFeed communityId={campaign.id} communityType="campaign" />}
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
                  {isCampaignActive && (
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
            {/* Campaign details */}
            <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
              <div className="p-4 border-b border-[var(--stroke)] bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] bg-opacity-10">
                <h3 className="text-lg font-bold text-[var(--headline)]">Campaign Timeline</h3>
              </div>
              <div className="p-6">
                <div className="relative">
                  {/* Timeline line - Fix: Make it extend through all content including the last item */}
                  <div className="absolute h-full w-0.5 bg-[var(--stroke)] left-6 top-0 bottom-0"></div>

                  {/* Start date */}
                  <div className="flex mb-8 relative">
                    <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--secondary)] bg-opacity-10 border-4 border-[var(--main)] shadow">
                      <FaCalendarAlt className="text-[var(--secondary)]" />
                    </div>
                    <div className="flex-grow ml-4">
                      <div className="font-bold text-[var(--headline)] flex items-center gap-2">
                        Campaign Started
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[var(--secondary)] bg-opacity-10 text-black">
                          {campaign.status}
                        </span>
                      </div>
                      <div className="text-[var(--paragraph)] mt-1">
                        {new Date(campaign.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-[var(--paragraph)] mt-1 italic">
                        {Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    </div>
                  </div>

                  {/* Current progress */}
                  <div className="flex mb-8 relative">
                    <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--highlight)] bg-opacity-10 border-4 border-[var(--main)] shadow">
                      <FaMoneyBillWave className="text-[var(--highlight)]" />
                    </div>
                    <div className="flex-grow ml-4">
                      <div className="font-bold text-[var(--headline)]">Current Progress</div>
                      <div className="text-[var(--paragraph)] mt-1">RM{campaign.current_amount} raised of RM{campaign.target_amount} goal</div>
                      <div className="w-full bg-[var(--stroke)] rounded-full h-2 mt-2">
                        <div
                          className="h-full rounded-full bg-[var(--highlight)]"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-[var(--paragraph)] mt-1">
                        {progress.toFixed(1)}% Complete
                      </div>
                    </div>
                  </div>

                  {/* End date - only show if deadline exists */}
                  {campaign.deadline && (
                    <div className="flex relative mb-8">
                      <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--tertiary)] bg-opacity-10 border-4 border-[var(--main)] shadow">
                        <FaClock className="text-[var(--tertiary)]" />
                      </div>
                      <div className="flex-grow ml-4">
                        <div className="font-bold text-[var(--headline)]">Campaign Deadline</div>
                        <div className="text-[var(--paragraph)] mt-1">{campaign.deadline}</div>
                        <div className="text-xs mt-2 flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${timeLeft > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {timeLeft > 0 ? `${timeLeft} days left` : 'Campaign ended'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location - show if charity has location */}
                  {charity && charity.location && (
                    <div className="flex relative">
                      <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--highlight)] bg-opacity-10 border-4 border-[var(--main)] shadow">
                        <FaMapMarkerAlt className="text-[var(--highlight)]" />
                      </div>
                      <div className="flex-grow ml-4">
                        <div className="font-bold text-[var(--headline)]">Campaign Location</div>
                        <div className="text-[var(--paragraph)] mt-1">{charity.location || "Worldwide"}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Donor Leaderboard - show for all donors */}
            {(userRole === 'charity' || userRole === 'donor') ? (
              <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
                <div className="p-4">
                  <h2 className="text-xl font-bold text-[var(--headline)] flex items-center gap-2">
                    <FaTrophy className="text-[var(--highlight)]" />
                    Top Donors
                  </h2>
                  <p className="text-[var(--paragraph)] text-sm mt-1">
                    Recognizing our most generous supporters
                  </p>
                </div>

                <div className="p-0">
                  <DonationLeaderboard
                    communityId={campaign.id}
                    communityType="campaign"
                    simplified={true}
                    onViewFullLeaderboard={handleViewFullLeaderboard}
                    maxItems={5}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaTrophy className="text-[var(--highlight)]" />
                  <h3 className="text-lg font-bold text-[var(--headline)]">Top Donors</h3>
                </div>
                <div className="border-t border-[var(--stroke)] pt-4 mt-2 text-center">
                  <p className="text-[var(--paragraph)] mb-4">
                    Donate to this campaign to view the leaderboard and track where your donation ranks!
                  </p>
                  {isCampaignActive && (
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

            {/* Donation Tracker - temporarily disabled until real data is available */}
            {false && (userRole === 'charity' || (userRole === 'donor' && donorContribution)) && (
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
      {userRole === 'donor' && isCampaignActive && (
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

      {/* MyContributionPopup modal */}
      <MyContributionPopup
        isOpen={isContributionPopupOpen}
        onClose={() => setIsContributionPopupOpen(false)}
        contributions={donorContribution.contributions}
        totalContributed={donorContribution.totalAmount}
        donationsCount={donorContribution.contributions.length}
        percentageOfTotal={parseFloat(donorContribution.percentageOfTotal)}
      />
    </div>
  );
};

export default CampaignDetail; 