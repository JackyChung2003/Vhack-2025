import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaHandHoldingHeart, FaBuilding, FaUsers, FaHistory, FaChartLine, 
         FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaComments, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";
import CampaignCard from "../../../../components/cards/CampaignCard";
import { useRole } from "../../../../contexts/RoleContext";
import { mockOrganizations, mockCampaigns, mockDonorContributions, mockDonationTrackers } from "../../../../utils/mockData";
import DonationModal from "../../../../components/modals/DonationModal";
import { toast } from "react-toastify";
import PostFeed from "../../common/community/components/PostFeed";
import DonationTracker from "../../../../components/donation/DonationTracker";
import { useVendorChatStore } from "../../../../services/VendorChatService";
import ChatModal from "../../../../modules/client/vendor/VendorHomePage/ChatModal";

const OrganizationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useRole();
  const organizationId = parseInt(id || "0");
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [hasDonated, setHasDonated] = useState(false);
  const { openChat } = useVendorChatStore();
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  
  const [communityView, setCommunityView] = useState<'feed' | 'members'>('feed');

  // Add event listener for chat modal
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      if (event.detail.organizationId === organizationId) {
        // Find the chat ID for this organization
        const chat = useVendorChatStore.getState().chats.find(
          chat => chat.organizationId === organizationId
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
  }, [organizationId]);

  const handleCloseChat = () => {
    setActiveChatId(null);
  };

  // Find the organization from our centralized mock data
  const organization = mockOrganizations.find(org => org.id === organizationId);
  
  // If organization not found, show error or redirect
  if (!organization) {
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

  // Get campaigns for this organization
  const organizationCampaigns = mockCampaigns.filter(
    campaign => campaign.organizationId === organizationId
  );

  // Calculate additional stats
  const activeCampaigns = organizationCampaigns.filter(campaign => 
    new Date(campaign.deadline) > new Date() && campaign.currentContributions < campaign.goal
  ).length;

  const supporters = organizationCampaigns.reduce(
    (sum, campaign) => sum + Math.floor(campaign.currentContributions / 100), 0
  );

  // Extended organization details (would come from API in real app)
  const extendedDetails = {
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

  useEffect(() => {
    if (userRole === 'donor') {
      const hasContributed = mockDonorContributions.supportedCampaigns.some(
        contribution => mockCampaigns.some(
          campaign => campaign.organizationId === organizationId && campaign.id === contribution.id
        )
      );
      setHasDonated(hasContributed);
    }
  }, [organizationId, userRole]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Organization Banner */}
      <div className="relative h-64 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)]">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
        >
          <FaArrowLeft size={20} />
        </button>
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
              {organization.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-[var(--headline)]">{organization.name}</h1>
                {userRole === 'vendor' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openChat(organizationId)}
                    className="px-6 py-3 bg-[var(--highlight)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                  >
                    <FaComments className="text-xl" />
                    Send Offer
                  </motion.button>
                )}
                {userRole === 'donor' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDonationModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                  >
                    <FaHandHoldingHeart className="text-xl" />
                    Support {organization.name}
                  </motion.button>
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
                  <a href={`https://${extendedDetails.website}`} target="_blank" rel="noopener noreferrer" 
                     className="hover:text-[var(--highlight)] transition-colors">
                    {extendedDetails.website}
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
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] rounded-lg p-4 text-white"
                >
                  <div className="flex items-center gap-3">
                    <FaHandHoldingHeart className="text-2xl" />
                    <div>
                      <p className="text-2xl font-bold">${organization.totalRaised.toLocaleString()}</p>
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
                      <p className="text-2xl font-bold">{organization.campaigns}</p>
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
              Active Campaigns
            </h2>
          </div>
          
          {organizationCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizationCampaigns.map((campaign) => (
                userRole === 'vendor' ? (
                  <div 
                    key={campaign.id}
                    className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[var(--headline)]">{campaign.name}</h3>
                      <span className="px-3 py-1 bg-[var(--highlight-light)] text-[var(--highlight)] rounded-full text-sm">
                        Active
                      </span>
                    </div>
                    <p className="text-[var(--paragraph)] text-sm mb-4 line-clamp-2">{campaign.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--paragraph-light)]">Goal: ${campaign.goal.toLocaleString()}</span>
                      <span className="text-[var(--paragraph-light)]">Raised: ${campaign.currentContributions.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <CampaignCard
                    key={campaign.id}
                    {...campaign}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--main)] rounded-xl border border-[var(--stroke)]">
              <FaHandHoldingHeart className="mx-auto text-4xl text-[var(--paragraph)] opacity-30 mb-4" />
              <p className="text-lg">No campaigns found for this organization.</p>
            </div>
          )}
        </motion.section>

        {/* Contact Information Section - Only show for vendors */}
        {userRole === 'vendor' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2">
                      <FaEnvelope className="text-[var(--highlight)]" />
                      Contact Information
                    </h2>
                    <p className="text-[var(--paragraph)] mt-1">
                      Get in touch with {organization.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-[var(--highlight)] text-xl" />
                      <div>
                        <p className="text-sm text-[var(--paragraph-light)]">Email</p>
                        <a href={`mailto:${extendedDetails.email}`} className="text-[var(--headline)] hover:text-[var(--highlight)] transition-colors">
                          {extendedDetails.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaPhone className="text-[var(--highlight)] text-xl" />
                      <div>
                        <p className="text-sm text-[var(--paragraph-light)]">Phone</p>
                        <a href={`tel:${extendedDetails.phone}`} className="text-[var(--headline)] hover:text-[var(--highlight)] transition-colors">
                          {extendedDetails.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className="text-[var(--highlight)] text-xl" />
                      <div>
                        <p className="text-sm text-[var(--paragraph-light)]">Location</p>
                        <p className="text-[var(--headline)]">{extendedDetails.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FaGlobe className="text-[var(--highlight)] text-xl" />
                      <div>
                        <p className="text-sm text-[var(--paragraph-light)]">Website</p>
                        <a href={`https://${extendedDetails.website}`} target="_blank" rel="noopener noreferrer" 
                           className="text-[var(--headline)] hover:text-[var(--highlight)] transition-colors">
                          {extendedDetails.website}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaBuilding className="text-[var(--highlight)] text-xl" />
                      <div>
                        <p className="text-sm text-[var(--paragraph-light)]">Organization Type</p>
                        <p className="text-[var(--headline)]">Non-Profit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Impact Section - Only show for non-vendors */}
        {userRole !== 'vendor' && (
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
        )}
      </div>
      
      {/* Donation Modal */}
      {isDonationModalOpen && (
        <DonationModal
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          organizationId={organizationId}
          organizationName={organization.name}
          onDonationComplete={(amount) => {
            toast.success(`Thank you for your donation of $${amount} to ${organization.name}!`);
            setIsDonationModalOpen(false);
          }}
        />
      )}

      {/* Chat Modal */}
      {activeChatId !== null && (
        <ChatModal 
          chatId={activeChatId} 
          onClose={handleCloseChat} 
        />
      )}
    </div>
  );
};

export default OrganizationDetail; 