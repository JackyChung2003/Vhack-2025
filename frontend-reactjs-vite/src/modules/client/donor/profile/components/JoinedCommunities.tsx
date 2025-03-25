import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaComments, FaClock } from "react-icons/fa";

const JoinedCommunities: React.FC = () => {
  const navigate = useNavigate();

  // Mock joined communities data - In real app, fetch from backend
  const communities = [
    { id: 1, type: 'campaign', name: "Clean Water Initiative", members: 128, posts: 45, lastActive: "2h", image: "" },
    { id: 2, type: 'organization', name: "Global Relief", members: 520, posts: 187, lastActive: "1h", image: "" },
    { id: 3, type: 'campaign', name: "Education for All", members: 256, posts: 87, lastActive: "5h", image: "" },
    { id: 4, type: 'organization', name: "EduCare", members: 310, posts: 95, lastActive: "4h", image: "" },
  ];

  return (
    <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
      <div className="p-6 border-b border-[var(--stroke)]">
        <h2 className="text-xl font-bold text-[var(--headline)]">Joined Communities</h2>
      </div>
      <div className="divide-y divide-[var(--stroke)]">
        {communities.map((community) => (
          <div
            key={`${community.type}-${community.id}`}
            onClick={() => {
              if (community.type === 'campaign') {
                navigate(`/charity/${community.id}?tab=community`);
              } else {
                navigate(`/organization/${community.id}?tab=community`);
              }
            }}
            className="p-6 hover:bg-[var(--background)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-2xl font-bold">
                {community.image ? (
                  <img src={community.image} alt={community.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  community.name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--headline)]">{community.name}</h3>
                <p className="text-sm text-[var(--paragraph)]">
                  {community.type.charAt(0).toUpperCase() + community.type.slice(1)} Community
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm text-[var(--paragraph)]">
                  <span className="flex items-center gap-1">
                    <FaUsers className="text-[var(--tertiary)]" />
                    {community.members}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaComments className="text-[var(--secondary)]" />
                    {community.posts}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-[var(--paragraph)]" />
                    {community.lastActive}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinedCommunities; 