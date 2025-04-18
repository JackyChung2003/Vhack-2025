import React from 'react';
import { FaCalendarAlt, FaComment, FaChevronRight } from 'react-icons/fa';

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    quotation_count: number;
  };
  onClick: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onClick }) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="bg-[var(--main)] border border-[var(--stroke)] rounded-lg p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-[var(--headline)] flex-1">{request.title}</h3>
        <span 
          className={`ml-3 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            request.status === 'open' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>
      
      <p className="text-[var(--paragraph)] text-sm mb-4 line-clamp-2">
        {request.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-[var(--paragraph-light)]">
          <span className="flex items-center mr-4">
            <FaCalendarAlt className="mr-1" />
            {formatDate(request.created_at)}
          </span>
          <span className="flex items-center">
            <FaComment className="mr-1" />
            {request.quotation_count} quotation{request.quotation_count !== 1 ? 's' : ''}
          </span>
        </div>
        
        <button className="text-[var(--highlight)] hover:text-[var(--highlight-dark)] transition-colors flex items-center text-sm">
          View Details <FaChevronRight size={12} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default RequestCard; 