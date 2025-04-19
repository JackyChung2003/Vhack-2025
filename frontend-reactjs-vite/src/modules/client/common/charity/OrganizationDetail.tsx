import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaHandHoldingHeart, FaBuilding, FaUsers, FaHistory, FaChartLine, 
         FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaComments, FaClock, FaPencilAlt, FaTimes, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import CampaignCard from "../../../../components/cards/CampaignCard";
import { useRole } from "../../../../contexts/RoleContext";
import { mockOrganizations, mockCampaigns, mockDonorContributions, mockDonationTrackers } from "../../../../utils/mockData";
import DonationModal from "../../../../components/modals/DonationModal";
import { toast } from "react-toastify";
import PostFeed from "../../common/community/components/PostFeed";
import DonationTracker from "../../../../components/donation/DonationTracker";
import { useVendorChatStore } from "../../../../services/VendorChatService";
import ChatModal from "../../../client/vendor/VendorHomePage/ChatModal";
import { charityService, CharityProfile as CharityProfileType } from "../../../../services/supabase/charityService";
import CharityInfo from "../../charity/profile/components/CharityInfo";
import AddCampaignModal from "../../../../components/modals/AddCampaignModal";

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
  
  // Determine if we're viewing as charity's own profile
  const isOwnProfile = userRole === 'charity' && !organizationIdString;
  
  // For normal organization viewing (not charity's own profile), use the existing logic
  const organizationId = organizationIdString ? Number(organizationIdString) : 0;
  const organization = isOwnProfile 
    ? { 
        id: Number(charityProfile?.id || 0), 
        name: charityProfile?.name || '', 
        totalRaised: charityProfile?.totalRaised || 0,
        activeCampaigns: charityProfile?.activeCampaigns || 0,
        campaigns: 0,
        verified: charityProfile?.verified || false,
        // other properties needed from mockOrganizations
      } 
    : mockOrganizations.find(org => org.id === organizationId);
  
  // Get campaigns for this organization - must be called even if organization is null
  const organizationCampaigns = !isOwnProfile ? mockCampaigns.filter(
    campaign => campaign.organizationId === organizationId
  ) : [];

  // Calculate additional stats - must be called even if organization is null
  const activeCampaigns = isOwnProfile 
    ? charityProfile?.activeCampaigns || 0
    : organizationCampaigns.filter(campaign => 
        new Date(campaign.deadline) > new Date() && campaign.currentContributions < campaign.goal
      ).length;

  const supporters = isOwnProfile
    ? charityProfile?.supporters || 0
    : organizationCampaigns.reduce(
        (sum, campaign) => sum + Math.floor(campaign.currentContributions / 100), 0
      );

  // Extended organization details - use charity profile data if viewing own profile
  const extendedDetails = isOwnProfile && charityProfile
    ? {
        email: charityProfile.email || '',
        phone: charityProfile.phone || '',
        website: charityProfile.website || '',
        location: charityProfile.location || '',
        founded: charityProfile.founded || '',
        mission: charityProfile.description || '',
        // Keep the mock impact and values for now
        impact: "Helping communities through various programs.",
        values: ["Integrity", "Innovation", "Impact"]
      }
    : {
        email: organizationId === 1 ? "contact@globalrelief.org" : "contact@organization.org",
        phone: organizationId === 1 ? "+1 (234) 567-890" : "+1 (555) 123-4567",
        website: organizationId === 1 ? "globalrelief.org" : "organization.org",
        location: organizationId === 1 ? "New York, USA" : "San Francisco, USA",
        founded: organizationId === 1 ? "2005" : "2010",
        mission: organizationId === 1 
          ? "To provide humanitarian aid and support to communities in crisis around the world through sustainable development programs and emergency relief efforts."
          : "To make a positive impact through various initiatives and campaigns.",
        impact: organizationId === 1 
          ? "Helped over 2 million people across 45 countries with clean water, medical aid, and disaster relief."
          : "Supported thousands of people through various programs.",
        values: organizationId === 1 
          ? ["Compassion", "Integrity", "Accountability", "Sustainability", "Collaboration"]
          : ["Integrity", "Innovation", "Impact"]
      };
  
  // Load charity's own profile if applicable - ALL hooks must be declared unconditionally!
  useEffect(() => {
    if (isOwnProfile) {
      const fetchCharityProfile = async () => {
        try {
          setCharityLoading(true);
          const profileData = await charityService.getCharityProfile();
          setCharityProfile(profileData);
          setCharityError(null);
        } catch (err: any) {
          console.error("Error fetching charity profile:", err);
          setCharityError(err.message || "Failed to load charity profile. Please try again.");
        } finally {
          setCharityLoading(false);
        }
      };

      fetchCharityProfile();
    }
  }, [isOwnProfile]);
  
  // Unconditional donor effect hook
  useEffect(() => {
    if (userRole === 'donor' && !isOwnProfile && organizationId) {
      const hasContributed = mockDonorContributions.supportedCampaigns.some(
        contribution => mockCampaigns.some(
          campaign => campaign.organizationId === organizationId && campaign.id === contribution.id
        )
      );
    }
  }, [organizationId, userRole, isOwnProfile]);

  // Add event listener for chat modal - unconditional hook call
  useEffect(() => {
    if (!organization) return;
    
    const handleOpenChat = (event: CustomEvent) => {
      if (event.detail.organizationId === organization.id) {
        // Find the chat ID for this organization
        const chat = useVendorChatStore.getState().chats.find(
          chat => chat.organizationId === organization.id
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
  }, [organization]);
  
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
    if (organization) {
      openChat(organization.id);
    }
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
  if (!isOwnProfile && !organization) {
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
              ) : (
                organization!.name.charAt(0)
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-[var(--headline)]">{organization!.name}</h1>
                {userRole === 'donor' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDonationModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                  >
                    <FaHandHoldingHeart className="text-xl" />
                    Support {organization!.name}
                  </motion.button>
                )}
                {userRole === 'vendor' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContactClick}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                  >
                    <FaComments className="text-xl" />
                    Contact {organization!.name}
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
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-[var(--highlight)]" />
                  <a href={`mailto:${extendedDetails.email}`} className="hover:text-[var(--highlight)] transition-colors">
                    {extendedDetails.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <FaGlobe className="text-[var(--highlight)]" />
                  <a href={extendedDetails.website.startsWith('http') ? extendedDetails.website : `https://${extendedDetails.website}`} target="_blank" rel="noopener noreferrer" 
                     className="hover:text-[var(--highlight)] transition-colors">
                    {extendedDetails.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-[var(--highlight)]" />
                  <a 
                    href={`tel:${extendedDetails.phone}`}
                    className="hover:text-[var(--highlight)] hover:underline transition-colors"
                  >
                    {extendedDetails.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[var(--highlight)]" />
                  <span>{extendedDetails.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[var(--highlight)]" />
                  <span>Founded: {extendedDetails.founded}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] rounded-lg p-4 text-white"
                >
                  <div className="flex items-center gap-3">
                    <FaHandHoldingHeart className="text-2xl" />
                    <div>
                      <p className="text-2xl font-bold">RM{(isOwnProfile ? charityProfile?.totalRaised : organization!.totalRaised)?.toLocaleString()}</p>
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
                      <p className="text-2xl font-bold">{supporters}</p>
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
                      <p className="text-2xl font-bold">{isOwnProfile ? (charityProfile?.activeCampaigns || 0) : organization!.campaigns}</p>
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

        {/* Donation Tracker */}
        {userRole === 'charity' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <DonationTracker 
              tracker={mockDonationTrackers.find(t => 
                t.recipientId === organization!.id && 
                t.recipientType === 'organization'
              ) || mockDonationTrackers[0]} 
            />
          </motion.div>
        )}

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
          
          {organizationCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizationCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  {...campaign}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--main)] rounded-xl border border-[var(--stroke)]">
              <FaHandHoldingHeart className="mx-auto text-4xl text-[var(--paragraph)] opacity-30 mb-4" />
              <p className="text-lg">No campaigns found for this organization.</p>
            </div>
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
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        communityView === 'feed' 
                        ? 'bg-[var(--highlight)] text-white shadow-lg' 
                        : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
                      }`}
                    >
                      <FaComments className={communityView === 'feed' ? 'text-white' : 'text-[var(--highlight)]'} />
                      Discussion Feed
                    </button>
                    <button
                      onClick={() => setCommunityView('members')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        communityView === 'members' 
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
                      <PostFeed communityId={organization!.id} communityType="organization" />
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
                    Support {organization!.name} by making a donation to unlock access to our community features.
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
      {isDonationModalOpen && (
        <DonationModal
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          organizationId={organization!.id.toString()}
          organizationName={organization!.name}
          campaignId=""
          onDonationComplete={(amount) => {
            toast.success(`Thank you for your donation of RM${amount} to ${organization!.name}!`);
            setIsDonationModalOpen(false);
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