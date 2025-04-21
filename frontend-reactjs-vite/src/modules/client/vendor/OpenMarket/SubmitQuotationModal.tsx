import React, { useState } from 'react';
import { FaTimes, FaPaperclip, FaTag } from 'react-icons/fa';
import { OpenMarketRequest } from '../../../../services/supabase/openMarketService';
import { toast } from 'react-toastify';

interface SubmitQuotationModalProps {
  request: OpenMarketRequest;
  onClose: () => void;
  onSubmit: (quotationData: any) => void;
}

const SubmitQuotationModal: React.FC<SubmitQuotationModalProps> = ({
  request,
  onClose,
  onSubmit
}) => {
  const [price, setPrice] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!price.trim()) {
      toast.error("Please enter a price for your quotation");
      return;
    }
    
    if (!details.trim()) {
      toast.error("Please provide details for your quotation");
      return;
    }
    
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast.error("Please enter a valid price greater than zero");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const quotationData = {
        price: numericPrice,
        details,
        files, // Files would need to be uploaded to storage in a real implementation
      };
      
      // Call the parent component's onSubmit handler
      await onSubmit(quotationData);
    } catch (error) {
      console.error("Error submitting quotation:", error);
      toast.error("Failed to submit quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--highlight)] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Submit Quotation</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Request title */}
          <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <h3 className="font-medium text-[var(--headline)] mb-1">Request</h3>
            <p className="text-sm text-[var(--paragraph)]">{request.title}</p>
          </div>
          
          {/* Price input */}
          <div className="mb-4">
            <label className="block text-[var(--headline)] font-medium mb-2">
              Your Price <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <div className="bg-gray-100 flex items-center px-3 rounded-l-lg border border-r-0 border-[var(--stroke)]">
                <FaTag className="text-[var(--paragraph-light)]" />
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 border border-[var(--stroke)] rounded-r-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>
          
          {/* Details textarea */}
          <div className="mb-4">
            <label className="block text-[var(--headline)] font-medium mb-2">
              Details <span className="text-red-500">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full border border-[var(--stroke)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] min-h-[150px]"
              placeholder="Describe your quotation in detail, including product specifications, delivery timeline, payment terms, etc."
              required
            ></textarea>
          </div>
          
          {/* File upload */}
          <div className="mb-6">
            <label className="block text-[var(--headline)] font-medium mb-2">
              Attachments (Optional)
            </label>
            
            <div className="border-2 border-dashed border-[var(--stroke)] rounded-lg p-4 text-center">
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <label 
                htmlFor="fileUpload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <FaPaperclip className="text-[var(--paragraph-light)] text-2xl mb-2" />
                <span className="text-[var(--paragraph)]">
                  Click to upload files
                </span>
                <span className="text-xs text-[var(--paragraph-light)] mt-1">
                  (PDF, Word, Excel, Images)
                </span>
              </label>
            </div>
            
            {/* File list */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <span className="truncate max-w-[300px] text-sm">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--stroke)] rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-[var(--highlight-dark)] transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Submitting...</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </>
              ) : (
                'Submit Quotation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuotationModal; 