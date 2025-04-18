import React from 'react';
import { FaStar, FaCheckCircle, FaThumbtack, FaExternalLinkAlt, FaCalendarAlt } from 'react-icons/fa';

interface QuotationProps {
  quotation: {
    id: string;
    request_id: string;
    vendor_id: string;
    vendor_name: string;
    price: number;
    details: string;
    attachment_url: string | null;
    is_accepted: boolean;
    is_pinned: boolean;
    created_at: string;
    vendor_rating: number;
  };
  onPin: () => void;
  onAccept?: () => void;
}

const QuotationCard: React.FC<QuotationProps> = ({ quotation, onPin, onAccept }) => {
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
      currency: 'MYR'
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

  return (
    <div 
      className={`
        rounded-lg shadow-md overflow-hidden relative transition-all 
        ${quotation.is_accepted ? 'border-2 border-green-500' : 'border border-[var(--stroke)]'} 
        ${quotation.is_pinned ? 'bg-blue-50' : 'bg-[var(--main)]'}
      `}
    >
      {/* Pin indicator */}
      {quotation.is_pinned && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs font-medium">
          Pinned
        </div>
      )}
      
      {/* Accepted indicator */}
      {quotation.is_accepted && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white px-2 py-1 text-xs font-medium text-center">
          Accepted Quotation
        </div>
      )}
      
      <div className="p-4">
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
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onPin}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm 
              ${quotation.is_pinned 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-[var(--background)] text-[var(--paragraph)] hover:bg-gray-200'} 
              transition-colors`}
          >
            <FaThumbtack className={`${quotation.is_pinned ? 'rotate-45' : ''} transition-transform`} />
            {quotation.is_pinned ? 'Unpin' : 'Pin'}
          </button>
          {onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
              disabled={quotation.is_accepted}
            >
              <FaCheckCircle />
              Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationCard; 