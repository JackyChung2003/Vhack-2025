import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaUsers, 
  FaComments, 
  FaClock, 
  FaBell, 
  FaShare, 
  FaEllipsisH, 
  FaUserPlus, 
  FaUserMinus, 
  FaBullhorn, 
  FaChartBar, 
  FaTrash, 
  FaEdit,
  FaEnvelope
} from "react-icons/fa";
import PostFeed from "../../common/community/components/PostFeed";
import DonationLeaderboard from "../../common/community/components/DonationLeaderboard";
import TransactionTimeline from "../../common/community/components/TransactionTimeline";
import MembersList from "./components/MembersList";
import CommunitySettings from "./components/CommunitySettings";
import { toast } from "react-toastify";

const CharityCommunityAdmin: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'feed' | 'leaderboard' | 'members' | 'settings'>('feed');
  const [isFollowing, setIsFollowing] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcement, setAnnouncement] = useState({ title: "", content: "" });
  
  // Mock community data - In a real app, fetch from your backend
  const [communityData, setCommunityData] = useState({
    name: "Clean Water Initiative",
    type: type || "campaign",
    members: 1200,
    posts: 245,
    activity: "Very active",
    description: "This community is dedicated to supporting the Clean Water Initiative campaign. Join us in our mission to provide clean drinking water to communities in need.",
    goal: 50000,
    raised: 32450,
    contributors: 245,
    pendingRequests: 5
  });

  const handleCreateAnnouncement = () => {
    if (!announcement.title || !announcement.content) {
      toast.error("Please fill in both title and content for your announcement");
      return;
    }
    
    // In a real app, send this to your backend
    toast.success("Announcement created successfully!");
    setShowAnnouncementForm(false);
    setAnnouncement({ title: "", content: "" });
  };

  const handleMemberAction = (action: 'approve' | 'remove' | 'message', memberId: number) => {
    // In a real app, send this action to your backend
    if (action === 'approve') {
      toast.success("Member request approved");
    } else if (action === 'remove') {
      toast.success("Member removed from community");
    } else if (action === 'message') {
      toast.info("Message feature coming soon");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Community Banner */}
      <div className="relative h-64 bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)]">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
        >
          <FaArrowLeft size={20} />
        </button>
        
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          <button className="text-white bg-[var(--highlight)] hover:bg-opacity-90 rounded-lg px-4 py-2 flex items-center gap-2">
            <FaEdit />
            Edit Community
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16">
        {/* Community Info Card - Overlapping Hero */}
        <div className="bg-[var(--main)] rounded-xl shadow-xl border border-[var(--stroke)] p-6 mb-8 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-4xl font-bold -mt-16 shadow-lg border-4 border-[var(--main)]">
                {communityData.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--headline)]">{communityData.name}</h1>
                <p className="text-[var(--paragraph)] mt-2">
                  {communityData.type.charAt(0).toUpperCase() + communityData.type.slice(1)} Community
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm text-[var(--paragraph)]">
                  <span className="flex items-center gap-2">
                    <FaUsers className="text-[var(--tertiary)]" /> {communityData.members} members
                  </span>
                  <span className="flex items-center gap-2">
                    <FaComments className="text-[var(--secondary)]" /> {communityData.posts} posts
                  </span>
                  <span className="flex items-center gap-2">
                    <FaClock className="text-[var(--paragraph)]" /> {communityData.activity}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
              >
                <FaBullhorn /> Make Announcement
              </button>
            </div>
          </div>
          
          {/* Announcement Form */}
          {showAnnouncementForm && (
            <div className="mt-6 p-4 bg-[var(--background)] rounded-lg border border-[var(--stroke)]">
              <h3 className="text-lg font-bold mb-3 text-[var(--headline)]">Create Announcement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">Title</label>
                  <input
                    type="text"
                    value={announcement.title}
                    onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">Content</label>
                  <textarea
                    value={announcement.content}
                    onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] min-h-[100px]"
                    placeholder="Write your announcement here..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAnnouncementForm(false)}
                    className="px-4 py-2 border border-[var(--stroke)] rounded-lg text-[var(--paragraph)] hover:bg-[var(--background)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAnnouncement}
                    className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Post Announcement
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Navigation */}
        <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] mb-6 overflow-hidden">
          <div className="border-b border-[var(--stroke)] px-6 py-4">
            <div className="flex gap-4 overflow-x-auto">
              {['feed', 'leaderboard', 'members', 'settings'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section as typeof activeSection)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection === section
                      ? 'bg-[var(--highlight)] text-white font-bold'
                      : 'text-[var(--paragraph)] hover:text-[var(--headline)] hover:bg-[var(--background)]'
                  }`}
                >
                  {section === 'feed' && 'Posts'}
                  {section === 'leaderboard' && 'Donation Leaderboard'}
                  {section === 'members' && 'Manage Members'}
                  {section === 'settings' && 'Community Settings'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
              <div className="p-6 border-b border-[var(--stroke)]">
                <h2 className="text-xl font-bold text-[var(--headline)]">About</h2>
              </div>
              <div className="p-6">
                <p className="text-[var(--paragraph)] mb-6">
                  {communityData.description}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--paragraph)] font-medium">Campaign Goal</span>
                    <span className="text-[var(--headline)] font-bold">${communityData.goal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--paragraph)] font-medium">Raised So Far</span>
                    <span className="text-[var(--headline)] font-bold">${communityData.raised.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--paragraph)] font-medium">Contributors</span>
                    <span className="text-[var(--headline)] font-bold">{communityData.contributors}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--paragraph)] font-medium">Pending Requests</span>
                    <span className="text-[var(--headline)] font-bold">{communityData.pendingRequests}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <TransactionTimeline communityId={Number(id)} communityType={type || ''} />
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
              <div className="p-6">
                {activeSection === 'feed' && <PostFeed communityId={Number(id)} communityType={type || ''} />}
                {activeSection === 'leaderboard' && <DonationLeaderboard communityId={Number(id)} communityType={type || ''} />}
                {activeSection === 'members' && <MembersList communityId={Number(id)} onMemberAction={handleMemberAction} />}
                {activeSection === 'settings' && <CommunitySettings communityId={Number(id)} communityData={communityData} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharityCommunityAdmin; 