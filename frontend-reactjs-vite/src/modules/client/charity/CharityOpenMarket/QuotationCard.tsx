import React from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt, FaCheckCircle, FaTimes, FaExternalLinkAlt, FaCalendarAlt, FaComment, FaTrash } from 'react-icons/fa';
import { Quotation } from '../../../../services/supabase/openMarketService';

interface QuotationCardProps {
  quotation: Quotation;
  requestDeadline?: string;
  onAccept?: () => void;
  onDelete?: () => void;
  onChat?: () => void;
  isVendor?: boolean;
}

const QuotationCard: React.FC<QuotationCardProps> = ({ 
  quotation, 
  requestDeadline,
  onAccept,
  onDelete,
  onChat,
  isVendor = false
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Render stars for rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            className={`${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'} h-3 w-3`} 
          />
        ))}
        <span className="ml-1 text-xs text-[var(--paragraph)]">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const isExpired = requestDeadline ? new Date() > new Date(requestDeadline) : false;

  // Action buttons section
  const renderActionButtons = () => {
    if (quotation.is_accepted) {
      return (
        <div className="flex items-center justify-center py-2 px-4 bg-green-50 border border-green-100 rounded-md">
          <FaCheckCircle className="text-green-500 mr-2" />
          <span className="text-green-600 font-medium">Accepted</span>
        </div>
      );
    }

    // Vendor view - only show delete button
    if (isVendor) {
      return (
        <div className="flex flex-row gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-md flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Delete Quotation
            </button>
          )}
        </div>
      );
    }

    // Charity view - show chat and accept buttons
    return (
      <div className="flex flex-row gap-2">
        {onChat && (
          <button
            onClick={onChat}
            className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md flex items-center justify-center"
          >
            <FaComment className="mr-2" />
            Chat with Vendor
          </button>
        )}
        {onAccept && (
          <button
            onClick={onAccept}
            className="flex-1 py-2 px-4 bg-green-50 text-green-600 hover:bg-green-100 rounded-md flex items-center justify-center"
          >
            <FaCheckCircle className="mr-2" />
            Accept Quotation
          </button>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`
        rounded-lg shadow-md overflow-hidden relative transition-all 
        ${quotation.is_accepted ? 'border-2 border-green-500' : 'border border-[var(--stroke)]'} 
        bg-[var(--main)]
      `}
    >
      {/* Accepted indicator */}
      {quotation.is_accepted && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white px-2 py-1 text-xs font-medium text-center">
          Accepted Quotation
        </div>
      )}
      
      {/* Open indicator */}
      {!quotation.is_accepted && !isExpired && !isVendor && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white px-2 py-1 text-xs font-medium text-center">
          Open for Acceptance
        </div>
      )}
      
      <div className={`p-4 ${(quotation.is_accepted || (!isExpired && !quotation.is_accepted && !isVendor)) ? 'pt-8' : ''}`}>
        {/* Vendor info */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-[var(--headline)]">{quotation.vendor_name}</h3>
            <div className="mt-1">
              {renderRating(quotation.vendor_rating)}
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--highlight)]">
            {formatPrice(quotation.price)}
          </div>
        </div>
        
        {/* Accepted badge for prominent display */}
        {quotation.is_accepted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3 flex items-center justify-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <span className="text-green-700 font-medium">This quotation has been accepted</span>
          </div>
        )}
        
        {/* Quotation details */}
        <div className="bg-white p-3 rounded-lg my-3 text-sm text-[var(--paragraph)]">
          <p>{quotation.details}</p>
        </div>
        
        {/* Date and attachment */}
        <div className="flex justify-between items-center text-xs text-[var(--paragraph-light)] mb-4">
          <span className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            {formatDate(quotation.created_at)}
          </span>
          {quotation.attachment_url && (
            <a 
              href={quotation.attachment_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-[var(--highlight)] hover:underline"
            >
              View Attachment <FaExternalLinkAlt className="ml-1 h-2.5 w-2.5" />
            </a>
          )}
        </div>
        
        {/* Show deadline if provided */}
        {requestDeadline && (
          <div className="text-xs text-[var(--paragraph-light)] mb-4">
            <span className="flex items-center">
              <FaCalendarAlt className="mr-1" />
              Due by: {formatDate(requestDeadline)}
              {!isExpired && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                  Active
                </span>
              )}
            </span>
          </div>
        )}
        
        {/* Action buttons */}
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default QuotationCard; 