import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaComments, FaClock, FaArrowRight } from "react-icons/fa";

interface CommunityCardProps {
  id: number;
  name: string;
  members: number;
  posts: number;
  lastActive: string;
  image: string;
  type: 'campaign' | 'organization';
}

const CommunityCard: React.FC<CommunityCardProps> = ({ 
  id, 
  name, 
  members, 
  posts, 
  lastActive, 
  image,
  type 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (type === 'campaign') {
      navigate(`/charity/${id}?tab=community`);
    } else {
      navigate(`/organization/${id}?tab=community`);
    }
  };

  return (
    <div
      className="group bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden hover:border-[var(--highlight)] transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-2xl font-bold">
            {image ? <img src={image} alt={name} className="w-full h-full object-cover rounded-xl" /> : name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--headline)] group-hover:text-[var(--highlight)] transition-colors">
              {name}
            </h3>
            <p className="text-sm text-[var(--paragraph)]">
              {type.charAt(0).toUpperCase() + type.slice(1)} Community
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-[var(--paragraph)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FaUsers className="text-[var(--tertiary)]" />
              {members}
            </span>
            <span className="flex items-center gap-1">
              <FaComments className="text-[var(--secondary)]" />
              {posts}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <FaClock className="text-[var(--paragraph)]" />
            {lastActive}
          </span>
        </div>
      </div>
      
      <div className="px-6 py-4 border-t border-[var(--stroke)] bg-[var(--background)] group-hover:bg-[var(--highlight)] group-hover:bg-opacity-5 transition-colors">
        <span className="flex items-center justify-between text-sm font-medium text-[var(--headline)]">
          View Community
          <FaArrowRight className="opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all" />
        </span>
      </div>
    </div>
  );
};

export default CommunityCard; 