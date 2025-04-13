import React, { useState, useEffect } from "react";
import { FaBuilding, FaHandHoldingHeart, FaUsers, FaBullhorn, FaPencilAlt, FaPlus, FaSave, FaTimes, FaChevronDown, FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import CharityInfo from "./components/CharityInfo";
import CharityCampaigns from "./components/CharityCampaigns";
import CommunityManagement from "./components/CommunityManagement";
import { charityService, CharityProfile as CharityProfileType } from "../../../../services/supabase/charityService";
import { toast } from "react-toastify";
import { mockOrganizations, mockCampaigns, mockCommunities } from "../../../../utils/mockData";

import LoginButton from "../../../../components/Button/LoginButton";

const CharityProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get Global Relief organization data (id: 1)
  const [charityData, setCharityData] = useState({
    ...(mockOrganizations.find(org => org.id === 1) || {
      id: 1,
      name: "Global Relief",
      description: "A worldwide organization dedicated to providing humanitarian aid in crisis situations.",
      logo: "",
      campaigns: 0,
      totalRaised: 0
    }),
    email: "contact@globalrelief.org",
    phone: "+1 (234) 567-890",
    website: "globalrelief.org",
    location: "New York, USA",
    founded: "2005",
    wallet_address: "0x123456789abcdef",
    role: "charity",
    verified: true,
    created_at: new Date().toISOString()
  });

  // Calculate additional stats from mock data
  const activeCampaigns = mockCampaigns.filter(
    campaign => campaign.organizationId === 1 && 
    new Date(campaign.deadline) > new Date() && 
    campaign.currentContributions < campaign.goal
  ).length;

  const supporters = mockCampaigns
    .filter(campaign => campaign.organizationId === 1)
    .reduce((sum, campaign) => sum + Math.floor(campaign.currentContributions / 100), 0);

  const communities = mockCommunities.filter(community => community.organizationId === 1).length;

  // Function to scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Handle saving charity profile changes
  const handleSaveCharityData = async (updatedData: Partial<CharityProfileType>) => {
    try {
      setLoading(true);
      const savedData = await charityService.updateCharityProfile(updatedData);
      setCharityData(prevData => ({
        ...prevData,
        ...savedData,
        id: typeof savedData.id === 'string' ? parseInt(savedData.id) : savedData.id
      }));
      setIsEditing(false);
      toast.success("Charity information updated successfully!");
    } catch (err: any) {
      console.error("Error updating charity data:", err);
      toast.error(err.message || "Failed to update charity information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !charityData.name) {
    return <div className="min-h-screen flex items-center justify-center">Loading charity profile...</div>;
  }

  if (error && !charityData.name) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-r from-[var(--secondary)] to-[var(--tertiary)] h-64 md:h-80">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center pt-12 relative z-10">
            <h1 className="text-white text-3xl font-bold drop-shadow-md">Charity Dashboard</h1>
          </div>
          <p className="text-white text-opacity-90 relative z-10 drop-shadow-sm mt-2">Manage your organization and campaigns</p>
          
          {/* Quick Navigation */}
          <div className="flex gap-3 mt-8 relative z-10 overflow-x-auto pb-2 md:justify-center">
            {[
              { id: 'campaigns', label: 'Campaigns', icon: <FaHandHoldingHeart /> },
              { id: 'community', label: 'Community', icon: <FaUsers /> },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white text-[var(--highlight)] shadow-md'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        {/* Profile Card - Overlapping Hero */}
        <div className="bg-[var(--main)] rounded-xl shadow-xl border border-[var(--stroke)] p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-[var(--secondary)] to-[var(--tertiary)] flex items-center justify-center text-white text-4xl font-bold">
              {charityData.logo ? (
                <img src={charityData.logo} alt={charityData.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                charityData.name?.charAt(0) || '?'
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--headline)]">{charityData.name}</h2>
                <div className="flex items-center justify-between gap-4">
                  {/* <LoginButton /> */}
                  <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg bg-[var(--highlight)] text-white hover:bg-opacity-90 flex items-center gap-2 transition-colors"
                  >
                  <FaPencilAlt /> Edit Profile
                  </button>
                </div>
              </div>
              <p className="text-[var(--paragraph)] mt-2 max-w-2xl">{charityData.description}</p>
              
              {/* Organization Details */}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--paragraph)]">
                {charityData.founded && (
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[var(--secondary)]" />
                    <span>Founded: {charityData.founded}</span>
                  </div>
                )}
                {charityData.location && (
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[var(--tertiary)]" />
                    <span>{charityData.location}</span>
                  </div>
                )}
                {charityData.website && (
                  <div className="flex items-center gap-2">
                    <FaGlobe className="text-[var(--highlight)]" />
                    <a 
                      href={charityData.website.startsWith('http') ? charityData.website : `https://${charityData.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[var(--highlight)] hover:underline transition-colors"
                    >
                      {charityData.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {charityData.email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-[var(--highlight)]" />
                    <a 
                      href={`mailto:${charityData.email}`}
                      className="hover:text-[var(--highlight)] hover:underline transition-colors"
                    >
                      {charityData.email}
                    </a>
                  </div>
                )}
                {charityData.phone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-[var(--highlight)]" />
                    <a 
                      href={`tel:${charityData.phone}`}
                      className="hover:text-[var(--highlight)] hover:underline transition-colors"
                    >
                      {charityData.phone}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Stat icon={<FaHandHoldingHeart />} value={`RM${charityData.totalRaised?.toLocaleString() || '0'}`} label="Total Raised" />
                <Stat icon={<FaHandHoldingHeart />} value={activeCampaigns} label="Active Campaigns" />
                <Stat icon={<FaUsers />} value={supporters} label="Supporters" />
                <Stat icon={<FaUsers />} value={communities} label="Communities" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Section */}
        <section id="campaigns" className="mb-12 scroll-mt-24 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaHandHoldingHeart className="text-[var(--highlight)] text-xl mr-3" />
              <h2 className="text-2xl font-bold text-[var(--headline)]">Campaigns</h2>
            </div>
          </div>
          <div className="bg-[var(--main)] rounded-xl overflow-hidden">
            <CharityCampaigns />
          </div>
        </section>

        {/* Community Management Section */}
        <section id="community" className="mb-12 scroll-mt-24 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaUsers className="text-[var(--highlight)] text-xl mr-3" />
              <h2 className="text-2xl font-bold text-[var(--headline)]">Community Management</h2>
            </div>
          </div>
          <div className="bg-[var(--main)] rounded-xl overflow-hidden">
            <CommunityManagement />
          </div>
        </section>

        {/* Back to top button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-[var(--highlight)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all"
            aria-label="Back to top"
          >
            <FaChevronDown className="transform rotate-180" />
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--main)] rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--stroke)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--headline)]">Edit Organization Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <CharityInfo 
              charity={{...charityData, id: charityData.id.toString()}} 
              isEditing={true} 
              onSave={handleSaveCharityData} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Stat component for displaying statistics
const Stat: React.FC<{ icon: React.ReactNode; value: string | number; label: string }> = ({ 
  icon, value, label 
}) => (
  <div className="bg-[var(--main)] rounded-lg p-4 border border-[var(--stroke)] hover:shadow-md transition-all">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center text-[var(--highlight)]">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--headline)]">{value}</p>
        <p className="text-sm text-[var(--paragraph)]">{label}</p>
      </div>
    </div>
  </div>
);

export default CharityProfile; 