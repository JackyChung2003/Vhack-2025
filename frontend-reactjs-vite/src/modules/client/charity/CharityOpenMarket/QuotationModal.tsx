import React from 'react';
import { FaTimes, FaUser, FaCalendarAlt, FaCheckCircle, FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import { Quotation } from '../../../../services/supabase/openMarketService';
import { toast } from 'react-toastify';

interface QuotationModalProps {
  quotation: Quotation;
  requestDeadline?: string;
  isExpired: boolean;
  isClosed: boolean;
  hasAcceptedQuotation: boolean;
  onClose: () => void;
  onAccept: () => void;
  onChat: () => void;
}

const QuotationModal: React.FC<QuotationModalProps> = ({
  quotation,
  requestDeadline,
  isExpired,
  isClosed,
  hasAcceptedQuotation,
  onClose,
  onAccept,
  onChat
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
            className={`${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'} h-4 w-4`} 
          />
        ))}
        <span className="ml-1 text-sm text-[var(--paragraph)]">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--highlight)] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Quotation Details</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Vendor information */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--headline)] text-lg">{quotation.vendor_name}</h3>
                {renderRating(quotation.vendor_rating)}
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--highlight)]">
              {formatPrice(quotation.price)}
            </div>
          </div>
          
          {/* Quotation status */}
          {quotation.is_accepted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-green-700 font-medium">This quotation has been accepted</span>
            </div>
          )}
          
          {/* Quotation details */}
          <div className="mb-6">
            <h4 className="font-medium text-[var(--headline)] mb-2">Details</h4>
            <div className="bg-gray-50 p-4 rounded-lg min-h-[100px] whitespace-pre-wrap">
              {quotation.details}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-sm text-[var(--paragraph)]">
              <p className="flex items-center mb-2">
                <FaCalendarAlt className="mr-2 text-[var(--highlight)]" /> 
                Submitted: {formatDate(quotation.created_at)}
              </p>
              {requestDeadline && (
                <p className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-[var(--highlight)]" /> 
                  Request Deadline: {formatDate(requestDeadline)}
                  {isExpired && <span className="ml-2 text-red-500">(Expired)</span>}
                </p>
              )}
            </div>
            
            {quotation.attachment_url && (
              <div className="flex justify-end">
                <a 
                  href={quotation.attachment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-[var(--highlight)] hover:underline bg-blue-50 px-4 py-2 rounded-lg"
                >
                  View Attachment <FaExternalLinkAlt className="ml-2" />
                </a>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-end">
            <button
              onClick={onChat}
              className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Chat with Vendor
            </button>
            
            {!isClosed && !hasAcceptedQuotation && !isExpired && (
              <button
                onClick={onAccept}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaCheckCircle className="mr-2" />
                Accept Quotation
              </button>
            )}
            
            {quotation.is_accepted && (
              <button
                onClick={() => toast.info("Transaction details coming soon!")}
                className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-[var(--highlight-dark)] transition-colors"
              >
                View Transaction
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationModal; 