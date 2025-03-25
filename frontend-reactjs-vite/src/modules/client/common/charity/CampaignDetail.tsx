import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaMoneyBillWave, FaArrowLeft, FaHandHoldingHeart, FaUsers, FaChartLine, FaHistory, FaBuilding, FaEdit, FaTrash, FaComments, FaClock, FaThumbsUp, FaPlus, FaMapMarkerAlt, FaShare, FaTrophy, FaExchangeAlt, FaTimes, FaHashtag, FaTags, FaFire } from "react-icons/fa";
import { useRole } from "../../../../contexts/RoleContext";
import { mockCampaigns, mockDonorContributions, mockOrganizations, mockDonationTrackers } from "../../../../utils/mockData";
import DonationModal from "../../../../components/modals/DonationModal";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
// Import the community components
import PostFeed from "../../common/community/components/PostFeed";
import DonationLeaderboard from "../../common/community/components/DonationLeaderboard";
import TransactionTimeline from "../../common/community/components/TransactionTimeline";
import DonationTracker from "../../../../components/donation/DonationTracker";

// Floating Modal Component for Full Leaderboard
const LeaderboardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
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

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useRole();
  const campaignId = parseInt(id || "0");
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  // Add state for showing full leaderboard modal
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  // Add new state for community features
  const [activeSection, setActiveSection] = useState<'feed'>('feed');

  // Keep this declaration that initializes based on URL
  const [activeMainTab, setActiveMainTab] = useState<'transactions' | 'community'>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'community' ? 'community' : 'transactions';
  });

  // Find the campaign from our centralized mock data
  const campaign = mockCampaigns.find(c => c.id === campaignId);
  
  // If campaign not found, show error or redirect
  if (!campaign) {
    return (
      <div className="p-6 bg-[var(--background)] text-[var(--paragraph)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign not found</h1>
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

  // Find the organization for this campaign
  const organization = mockOrganizations.find(org => org.id === campaign.organizationId);

  // Check if the donor has contributed to this campaign
  const supportedCampaign = mockDonorContributions.supportedCampaigns.find(
    (c) => c.id === campaignId
  );
  
  // Get donor contribution details if they exist
  const donorContribution = supportedCampaign ? {
    totalAmount: supportedCampaign.donorContribution,
    contributions: mockDonorContributions.contributionDetails[campaignId] || [],
    percentageOfTotal: ((supportedCampaign.donorContribution / campaign.currentContributions) * 100).toFixed(1)
  } : null;

  const progress = (campaign.currentContributions / campaign.goal) * 100;
  const timeLeft = Math.max(0, Math.floor((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  
  // Add this line to define isCampaignActive
  const isCampaignActive = timeLeft > 0 && campaign.currentContributions < campaign.goal;

  const handleDonationComplete = (amount: number, donationPolicy?: string) => {
    // In a real app, you would update the campaign data after a successful donation
    console.log(`Donation of $${amount} completed for campaign: ${campaign.name}`);
    console.log(`Donation policy: ${donationPolicy || 'N/A'}`);
    
    // Add donation to campaign-specific or always-donate total based on policy
    // This would be handled by the backend in a real app
    if (donationPolicy) {
      // For demonstration, let's show a toast message about the donation policy
      if (donationPolicy === 'campaign-specific') {
        toast.success(`Thank you for your campaign-specific donation of $${amount}! You can get a refund if the campaign doesn't reach its goal.`);
      } else if (donationPolicy === 'always-donate') {
        toast.success(`Thank you for your always-donate donation of $${amount}! Your donation will support the organization even if the campaign doesn't reach its goal.`);
      }
    } else {
      toast.success(`Thank you for your donation of $${amount}!`);
    }
  };

  // Handle view full leaderboard
  const handleViewFullLeaderboard = () => {
    // Use the modal instead of navigation
    setShowFullLeaderboard(true);
  };

  // Handle organization click to navigate to org page
  const handleOrganizationClick = () => {
    if (organization) {
      navigate(`/organization/${organization.id}`);
    }
  };

  // Update the tab change handler to update the URL
  const handleTabChange = (tab: 'transactions' | 'community') => {
    setActiveMainTab(tab);
    navigate(`/charity/${campaignId}?tab=${tab}`, { replace: true });
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
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
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
              <span>${campaign.currentContributions} raised</span>
              <span>${campaign.goal} goal</span>
            </div>
          </div>
          
          {/* Campaign stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">${campaign.currentContributions}</div>
              <div className="text-sm">Raised</div>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{timeLeft}</div>
              <div className="text-sm">Days Left</div>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm">Donors</div>
            </div>
          </div>
          
          {/* Donate button for donor role */}
          {userRole === 'donor' && (
            <div className="mt-6">
              <button 
                className="px-6 py-3 rounded-lg bg-white text-[var(--highlight)] hover:bg-opacity-90 flex items-center gap-2 transition-colors font-bold"
                onClick={() => setIsDonationModalOpen(true)}
                disabled={!isCampaignActive}
              >
                <FaHandHoldingHeart />
                {isCampaignActive ? 'Donate Now' : 'Campaign Ended'}
              </button>
            </div>
          )}
        </div>
        
        {/* Two-column layout for main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main campaign information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization info - now clickable */}
            <div 
              className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-[var(--highlight)] group"
              onClick={handleOrganizationClick}
              role="button"
              aria-label={`View ${organization?.name || "Organization"} details`}
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
                    <p className="font-bold text-xl text-[var(--headline)] group-hover:text-[var(--highlight)] transition-colors duration-300">{organization?.name || "Organization"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-[var(--highlight)] bg-opacity-10 text-white text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        Verified Organization
                      </span>
                      <span className="text-[var(--paragraph)] text-sm">Since 2020</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-[var(--stroke)] pt-4 text-sm text-[var(--paragraph)]">
                  <p className="line-clamp-2">
                    {organization?.description || "This organization is dedicated to making a positive impact through various campaigns and initiatives."}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Tabbed section for Transactions and Community - only show for charity users or donors who have contributed */}
            {(userRole === 'charity' || (userRole === 'donor' && donorContribution)) ? (
              <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
                <div className="border-b border-[var(--stroke)]">
                  <div className="flex">
                    <button
                      onClick={() => handleTabChange('transactions')}
                      className={`px-6 py-4 flex items-center gap-2 text-sm font-medium ${
                        activeMainTab === 'transactions' 
                        ? 'bg-[var(--highlight)] text-white' 
                        : 'hover:bg-[var(--background)]'
                      }`}
                    >
                      <FaExchangeAlt />
                      Transactions
                    </button>
                    <button
                      onClick={() => handleTabChange('community')}
                      className={`px-6 py-4 flex items-center gap-2 text-sm font-medium ${
                        activeMainTab === 'community' 
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
                      <TransactionTimeline communityId={campaignId} communityType="campaign" />
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
                          className={`px-4 py-2 text-sm font-medium ${
                            activeSection === 'feed' 
                            ? 'border-b-2 border-[var(--highlight)] text-[var(--highlight)]' 
                            : 'text-[var(--paragraph)]'
                          }`}
                        >
                          <FaComments className="inline mr-2" />
                          Discussion Feed
                        </button>
                      </div>
                      
                      {/* Community Content Based on Selected View */}
                      {activeSection === 'feed' && <PostFeed communityId={Number(id)} communityType="campaign" />}
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
                          Active
                        </span>
                      </div>
                      <div className="text-[var(--paragraph)] mt-1">January 15, 2023</div>
                      <div className="text-xs text-[var(--paragraph)] mt-1 italic">
                        {timeLeft + 30} days ago
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
                      <div className="text-[var(--paragraph)] mt-1">${campaign.currentContributions} raised of ${campaign.goal} goal</div>
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
                  
                  {/* End date */}
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
                  
                  {/* Location - Fix: Remove the border-t and adjust spacing */}
                  <div className="flex relative">
                    <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--highlight)] bg-opacity-10 border-4 border-[var(--main)] shadow">
                      <FaMapMarkerAlt className="text-[var(--highlight)]" />
                    </div>
                    <div className="flex-grow ml-4">
                      <div className="font-bold text-[var(--headline)]">Campaign Location</div>
                      <div className="text-[var(--paragraph)] mt-1">Worldwide</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Donor Leaderboard - only show for charity users or donors who have contributed */}
            {(userRole === 'charity' || (userRole === 'donor' && donorContribution)) ? (
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
                    communityId={campaignId} 
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
            
            {/* Donor-specific contribution section - only show if donor has contributed */}
            {userRole === 'donor' && donorContribution && (
              <div className="bg-[var(--main)] p-6 rounded-lg border border-[var(--stroke)] shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center">
                    <FaHistory className="text-[var(--highlight)]" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--headline)]">Your Contributions</h3>
                </div>
                
                {/* Stats in a visually appealing grid */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className="relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight)] bg-opacity-5 p-4">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--highlight)] opacity-5 rounded-bl-full"></div>
                    <span className="text-3xl font-bold text-white">${donorContribution.totalAmount}</span>
                    <p className="text-sm text-white font-medium mt-1">Total Contributed</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary)] bg-opacity-5 p-4">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--secondary)] opacity-5 rounded-bl-full"></div>
                      <span className="text-2xl font-bold text-white">{donorContribution.contributions.length}</span>
                      <p className="text-sm text-white font-medium mt-1">Donations Made</p>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-gradient-to-r from-[var(--tertiary)] to-[var(--tertiary)] bg-opacity-5 p-4">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--tertiary)] opacity-5 rounded-bl-full"></div>
                      <span className="text-2xl font-bold text-white">{donorContribution.percentageOfTotal}%</span>
                      <p className="text-sm text-white font-medium mt-1">Of Total Raised</p>
                    </div>
                  </div>
                </div>
                
                {/* Contribution History with improved styling */}
                <div className="border-t border-[var(--stroke)] pt-5 mt-2">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-[var(--headline)]">
                    <FaCalendarAlt className="text-[var(--highlight)] text-sm" />
                    Contribution History
                  </h4>
                  
                  <div className="space-y-3">
                    {donorContribution.contributions.map((contribution, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-3 border border-[var(--stroke)] rounded-lg hover:border-[var(--highlight)] hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center text-[var(--highlight)]">
                            <FaCalendarAlt />
                          </div>
                          <div>
                            <span className="text-[var(--headline)] font-medium">{new Date(contribution.date).toLocaleDateString()}</span>
                            <p className="text-xs text-[var(--paragraph)]">
                              {new Date(contribution.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        <div className="font-bold text-[var(--highlight)]">${contribution.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Donation Tracker */}
            {(userRole === 'charity' || (userRole === 'donor' && donorContribution)) && (
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
                
                {/* Find campaign tracker or create a placeholder if not found */}
                <div className="max-w-full overflow-hidden">
                  <DonationTracker 
                    tracker={
                      mockDonationTrackers.find(t => 
                        t.recipientId === campaignId && 
                        t.recipientType === 'campaign'
                      ) || {
                        id: 9999,
                        recipientId: campaignId,
                        recipientType: 'campaign',
                        donations: {
                          total: campaign.currentContributions,
                          count: 45,
                          campaignSpecificTotal: Math.round(campaign.currentContributions * 0.6), // 60% is campaign-specific
                          alwaysDonateTotal: Math.round(campaign.currentContributions * 0.4), // 40% is always-donate
                          timeline: {
                            daily: [
                              { date: new Date().toISOString().split('T')[0], amount: 500, donationPolicy: 'campaign-specific' },
                              { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], amount: 300, donationPolicy: 'always-donate' }
                            ],
                            weekly: [{ week: '2025-W12', amount: 1500 }],
                            monthly: [{ month: '2025-03', amount: 4500 }]
                          },
                          topDonors: []
                        }
                      }
                    } 
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaignId={campaignId}
        campaignName={campaign.name}
        organizationId={campaign.organizationId}
        organizationName={organization?.name}
        onDonationComplete={handleDonationComplete}
      />
      
      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showFullLeaderboard}
        onClose={() => setShowFullLeaderboard(false)}
        campaignId={campaignId}
        campaignName={campaign.name}
      />
    </div>
  );
};

export default CampaignDetail; 