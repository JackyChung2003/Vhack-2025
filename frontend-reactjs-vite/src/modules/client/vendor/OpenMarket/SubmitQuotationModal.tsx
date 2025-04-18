import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';

// Reuse the QuotationData interface, maybe move to a shared types file later
interface QuotationData {
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
}

interface SubmitQuotationModalProps {
  requestId: string;
  onClose: () => void;
  onSubmitSuccess: (newQuotation: QuotationData) => void;
}

const SubmitQuotationModal: React.FC<SubmitQuotationModalProps> = ({ requestId, onClose, onSubmitSuccess }) => {
  const [price, setPrice] = useState('');
  const [details, setDetails] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState(''); // Optional
  const [priceError, setPriceError] = useState('');
  const [detailsError, setDetailsError] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); // Get vendor ID from logged-in user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    let isValid = true;
    setPriceError('');
    setDetailsError('');
    setSubmitError(null);

    // Ensure user is logged in before proceeding
    if (!user?.id) {
        setSubmitError('Authentication error: You must be logged in to submit a quotation.');
        // No need to set isValid = false here, just return early
        return; 
    }
    // Now TypeScript knows user and user.id exist beyond this point

    const numericPrice = parseFloat(price);
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      setPriceError('Please enter a valid positive price.');
      isValid = false;
    }
    
    if (!details.trim()) {
      setDetailsError('Details are required.');
      isValid = false;
    }
    
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with your actual backend API URL
      const response = await axios.post<QuotationData>('http://localhost:5000/api/market/quotations', 
        {
          request_id: requestId,
          vendor_id: user.id, // Safe to access user.id now
          price: numericPrice,
          details: details.trim(),
          attachment_url: attachmentUrl.trim() || null, // Send null if empty
        },
        {
           headers: {
             // Include auth token if your backend requires it
             // 'Authorization': `Bearer ${your_token}` 
           }
        }
      );

      // On success, call the callback function passed from the parent
      onSubmitSuccess(response.data);
      
    } catch (err: any) {
      console.error("Error submitting quotation:", err);
      setSubmitError(err.response?.data?.error || "Failed to submit quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--main)] rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-[var(--stroke)]">
          <h2 className="text-xl font-bold text-[var(--headline)]">Submit Your Quotation</h2>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Price Input */}
          <div>
            <label htmlFor="quotation-price" className="block text-[var(--headline)] font-medium mb-1.5">
              Price (MYR)
            </label>
            <input
              id="quotation-price"
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 1500.00"
              required
              disabled={isSubmitting}
              className={`w-full p-3 rounded-lg border ${priceError ? 'border-red-500' : 'border-[var(--stroke)]'} focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] disabled:bg-gray-100`}
            />
            {priceError && <p className="mt-1 text-red-500 text-sm">{priceError}</p>}
          </div>
          
          {/* Details Textarea */}
          <div>
            <label htmlFor="quotation-details" className="block text-[var(--headline)] font-medium mb-1.5">
              Details
            </label>
            <textarea
              id="quotation-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide details about your offer, delivery timeline, specifications, etc."
              rows={4}
              required
              disabled={isSubmitting}
              className={`w-full p-3 rounded-lg border ${detailsError ? 'border-red-500' : 'border-[var(--stroke)]'} focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] disabled:bg-gray-100`}
            />
            {detailsError && <p className="mt-1 text-red-500 text-sm">{detailsError}</p>}
          </div>

          {/* Attachment URL Input (Optional) */}
           <div>
            <label htmlFor="quotation-attachment" className="block text-[var(--headline)] font-medium mb-1.5">
              Attachment URL (Optional)
            </label>
            <input
              id="quotation-attachment"
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://example.com/your_quotation.pdf"
              disabled={isSubmitting}
              className={`w-full p-3 rounded-lg border border-[var(--stroke)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] disabled:bg-gray-100`}
            />
            <p className="text-xs text-[var(--paragraph-light)] mt-1">Link to a PDF or document (e.g., Google Drive, Dropbox).</p>
          </div>
          
          {/* Info Message */}
          <div className="bg-blue-50 text-blue-800 rounded-lg p-3 flex items-start text-sm">
            <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-2" />
            <p>
            Ensure your price and details are accurate. Once submitted, your quotation may be visible to other vendors and cannot be edited.
            </p>
          </div>

          {/* Submit Error Message */}
          {submitError && (
             <div className="bg-red-100 text-red-700 rounded-lg p-3 text-sm">
                {submitError}
             </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg font-medium border border-[var(--stroke)] hover:bg-[var(--background)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg font-medium bg-[var(--highlight)] text-white hover:bg-opacity-90 transition-colors flex items-center justify-center disabled:opacity-70 min-w-[120px]"
            >
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : 'Submit Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuotationModal; 