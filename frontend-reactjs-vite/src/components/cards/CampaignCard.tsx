import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaMoneyBillWave, FaTag } from "react-icons/fa";

interface CampaignCardProps {
  id: number;
  name: string;
  description: string;
  goal: number;
  currentContributions: number;
  deadline: string;
  category?: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ id, name, description, goal, currentContributions, deadline, category }) => {
  const navigate = useNavigate();
  const progress = (currentContributions / goal) * 100;
  const timeLeft = Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const handleClick = () => {
    navigate(`/charity/${id}`);
  };

  return (
    <div 
      className="bg-[var(--main)] p-6 rounded-lg shadow-xl border border-[var(--stroke)] transition-all transform hover:translate-y-[-8px] hover:shadow-2xl cursor-pointer overflow-hidden"
      onClick={handleClick}
      style={{ position: 'relative' }}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--highlight)] opacity-20 rounded-bl-full"></div>
      
      <h2 className="text-xl font-bold text-[var(--headline)] mb-3 pr-16">{name}</h2>
      <p className="mb-5 text-[var(--paragraph)] line-clamp-2">{description}</p>
      
      {category && (
        <div className="mb-3 flex items-center gap-1 text-sm">
          <FaTag className="text-[var(--highlight)]" />
          <span className="px-2 py-1 bg-[var(--highlight)] bg-opacity-10 rounded-full text-xs font-semibold text-[var(--headline)]">
            {category}
          </span>
        </div>
      )}
      
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, var(--highlight) 0%, var(--secondary) 100%)`
            }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold flex items-center gap-1">
            <FaMoneyBillWave className="text-[var(--highlight)]" />
            RM{currentContributions}
          </span>
          <span className="text-[var(--paragraph)]">RM{goal} goal</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 text-sm text-[var(--paragraph)]">
          <FaCalendarAlt className="text-[var(--tertiary)]" />
          <span>{timeLeft} days left</span>
        </div>
        <div className="px-3 py-1 bg-[var(--highlight)] bg-opacity-20 rounded-full text-xs font-semibold text-[var(--headline)]">
          {progress >= 100 ? 'Funded' : `${Math.round(progress)}% funded`}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard; 