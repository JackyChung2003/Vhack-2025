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
  hasAcceptedQuotation?: boolean;
}

const QuotationCard: React.FC<QuotationCardProps> = ({ 
  quotation, 
  requestDeadline,
  onAccept,
  onDelete,
  onChat,
  isVendor = false,
  hasAcceptedQuotation = false
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
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-[var(--stroke)]">
      {/* Status header - always show but might be empty for consistent sizing */}
      {quotation.is_accepted ? (
        <div className="py-3 px-4 text-center text-white bg-blue-500">
          Accepted
        </div>
      ) : (hasAcceptedQuotation || isExpired) ? (
        <div className="py-3 px-4 text-center text-white bg-gray-500">
          Closed
        </div>
      ) : (
        <div className="py-3 px-4 text-center text-transparent">
          {/* Empty header to maintain consistent card height */}
          Placeholder
        </div>
      )}
      
      {/* Quotation content */}
      <div className="p-4 bg-white h-full flex flex-col">
        {/* Header with vendor/charity and price */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-[var(--headline)]">
              {isVendor ? (quotation as any).charity_name || "Anonymous Charity" : quotation.vendor_name || "Anonymous Vendor"}
            </h3>
            {renderRating(quotation.vendor_rating || 0.0)}
          </div>
          <div className="text-xl font-bold text-[var(--highlight)]">
            {formatPrice(quotation.price)}
          </div>
        </div>
        
        {/* Description - set minimum height */}
        <div className="bg-gray-50 p-3 rounded-lg mb-3 min-h-[80px]">
          <p className="text-[var(--paragraph)]">{quotation.details}</p>
        </div>
        
        {/* Dates */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-[var(--paragraph)]">
            <FaCalendarAlt className="mr-2 text-gray-400" />
            {formatDate(quotation.created_at)}
          </div>
          
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="flex items-center">
              <span className="text-[var(--paragraph)]">Due by: {requestDeadline ? formatDate(requestDeadline) : 'N/A'}</span>
            </div>
            {!isExpired && !hasAcceptedQuotation && !quotation.is_accepted && (
              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Active
              </span>
            )}
            {quotation.is_accepted && (
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Accepted
              </span>
            )}
          </div>
        </div>
        
        {/* Action area - ensure consistent height */}
        <div className="mt-auto">
          {/* Action buttons */}
          {!quotation.is_accepted && !isExpired && !hasAcceptedQuotation ? (
            <div className="flex justify-between mt-4 space-x-2">
              {/* For charity view */}
              {!isVendor && (
                <>
                  {onChat && (
                    <button
                      onClick={onChat}
                      className="flex-1 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaComment className="mr-2" /> Chat with Vendor
                    </button>
                  )}
                  {onAccept && (
                    <button
                      onClick={onAccept}
                      className="flex-1 flex items-center justify-center text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors"
                    >
                      Accept Quotation
                    </button>
                  )}
                </>
              )}
              
              {/* For vendor view */}
              {isVendor && onDelete && (
                <button
                  onClick={onDelete}
                  className="flex-1 py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Delete Quotation
                </button>
              )}
            </div>
          ) : (
            quotation.is_accepted ? (
              <div className="flex items-center justify-center py-2 px-4 mt-4 bg-blue-50 text-blue-600 rounded-lg">
                <FaCheckCircle className="mr-2" />
                <span className="font-medium">This quotation has been accepted</span>
              </div>
            ) : (
              <div className="py-2 px-4 mt-4 opacity-0">
                {/* Empty div to maintain consistent height */}
              </div>
            )
          )}
          
          {/* Attachment link */}
          {quotation.attachment_url && (
            <div className="mt-3 text-center">
              <a 
                href={quotation.attachment_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--highlight)] hover:underline text-sm flex items-center justify-center"
              >
                View Attachment <FaExternalLinkAlt className="ml-1 h-2.5 w-2.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationCard; 