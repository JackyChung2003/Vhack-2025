import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaComments, FaClock, FaChevronRight, FaChevronLeft } from "react-icons/fa";

interface Community {
  id: number;
  type: 'campaign' | 'organization';
  name: string;
  members: number;
  posts: number;
  lastActive: string;
  image: string;
}

const CommunitySidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mock joined communities data
  const joinedCommunities: Community[] = [
    { id: 1, type: 'campaign', name: "Clean Water Initiative", members: 128, posts: 45, lastActive: "2h", image: "" },
    { id: 2, type: 'organization', name: "Global Relief", members: 520, posts: 187, lastActive: "1h", image: "" },
    { id: 3, type: 'campaign', name: "Education for All", members: 256, posts: 87, lastActive: "5h", image: "" },
    { id: 4, type: 'organization', name: "EduCare", members: 310, posts: 95, lastActive: "4h", image: "" },
  ];

  return (
    <div className={`hidden md:flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-80'} bg-[var(--main)] border-l border-[var(--stroke)] h-screen sticky top-0`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-4 top-6 w-8 h-8 bg-[var(--main)] border border-[var(--stroke)] rounded-full flex items-center justify-center text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors shadow-md"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
      </button>

      <div className={`flex-1 p-4 ${isCollapsed ? 'overflow-hidden sidebar-collapsed' : 'overflow-y-auto'}`}>
        <h2 className={`text-xl font-bold text-[var(--headline)] mb-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          Your Communities
        </h2>
        
        <div className="space-y-2">
          {joinedCommunities.map((community) => (
            <div
              key={`${community.type}-${community.id}`}
              className={`flex items-center p-3 rounded-lg hover:bg-[var(--background)] cursor-pointer transition-colors`}
              onClick={() => {
                if (community.type === 'campaign') {
                  navigate(`/charity/${community.id}?tab=community`);
                } else {
                  navigate(`/organization/${community.id}?tab=community`);
                }
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[var(--tertiary)] text-white flex items-center justify-center font-bold shrink-0">
                {community.image ? (
                  <img src={community.image} alt={community.name} className="w-full h-full rounded-full" />
                ) : (
                  community.name.charAt(0)
                )}
              </div>
              
              <div className={`flex-1 min-w-0 ml-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                <h3 className="text-sm font-semibold text-[var(--headline)] truncate">
                  {community.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[var(--paragraph)]">
                  <span className="flex items-center gap-1">
                    <FaUsers className="text-[var(--tertiary)]" />
                    {community.members}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-[var(--secondary)]" />
                    {community.lastActive}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={`mt-6 p-4 pt-6 border-t border-[var(--stroke)] transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
        <button
          onClick={() => navigate("/community")}
          className="w-full py-2 px-4 rounded-lg bg-[var(--highlight)] text-[var(--button-text)] font-semibold hover:opacity-90 transition-opacity"
        >
          Browse More
        </button>
      </div>
    </div>
  );
};

export default CommunitySidebar; 