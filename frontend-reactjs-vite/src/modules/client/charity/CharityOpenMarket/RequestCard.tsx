import React from 'react';
import { FaCalendarAlt, FaComment, FaChevronRight, FaCheckCircle, FaClock } from 'react-icons/fa';

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    quotation_count: number;
    deadline?: string;
    has_accepted_quotation?: boolean;
  };
  onClick: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onClick }) => {
  // Check if the request is expired
  const isExpired = request.deadline ? new Date() > new Date(request.deadline) : false;
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format deadline for display
  const formatDeadline = (dateString?: string) => {
    if (!dateString) return '';
    
    const deadlineDate = new Date(dateString);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Expired';
    } else if (diffDays === 1) {
      return '1 day left';
    } else {
      return `${diffDays} days left`;
    }
  };

  // Determine if the request is open or closed
  const isOpen = !isExpired && request.status === 'open';

  return (
    <div 
      className="bg-[var(--main)] border border-[var(--stroke)] rounded-lg p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-[var(--headline)] flex-1">{request.title}</h3>
        <span 
          className={`ml-3 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            isOpen 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isOpen ? 'Open' : 'Closed'}
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
          <span className="flex items-center mr-4">
            <FaComment className="mr-1" />
            {request.quotation_count} quotation{request.quotation_count !== 1 ? 's' : ''}
          </span>
          {request.deadline && (
            <span className={`flex items-center ${isExpired ? 'text-red-500' : 'text-green-600'}`}>
              <FaClock className="mr-1" />
              {formatDeadline(request.deadline)}
            </span>
          )}
        </div>
        
        <button className="text-[var(--highlight)] hover:text-[var(--highlight-dark)] transition-colors flex items-center text-sm">
          View Details <FaChevronRight size={12} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default RequestCard; 