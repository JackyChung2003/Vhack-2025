import React, { useState } from 'react';
import { FaTimes, FaPaperclip, FaTag, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 text-white px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">Submit Quotation</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Request title */}
          <div className="mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <h3 className="font-medium text-sm text-[var(--headline)] mb-1">Request</h3>
            <p className="text-sm text-[var(--paragraph)]">{request.title}</p>
          </div>
          
          {/* Price input */}
          <div className="mb-3">
            <label className="block text-sm text-[var(--headline)] font-medium mb-1">
              Your Price <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <div className="bg-gray-100 flex items-center px-3 rounded-l-lg border border-r-0 border-[var(--stroke)]">
                <FaMoneyBillWave className="text-green-500 text-sm" />
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 border border-[var(--stroke)] rounded-r-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>
          
          {/* Details textarea */}
          <div className="mb-3">
            <label className="block text-sm text-[var(--headline)] font-medium mb-1">
              Details <span className="text-red-500">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full border border-[var(--stroke)] rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 min-h-[100px]"
              placeholder="Describe your quotation in detail..."
              required
            ></textarea>
          </div>
          
          {/* File upload - condensed version */}
          <div className="mb-3">
            <label className="block text-sm text-[var(--headline)] font-medium mb-1">
              Attachments (Optional)
            </label>
            
            <div className="border border-dashed border-[var(--stroke)] rounded-lg p-2 text-center">
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <label 
                htmlFor="fileUpload"
                className="cursor-pointer flex items-center justify-center text-sm py-1"
              >
                <FaPaperclip className="text-green-500 mr-2" />
                <span className="text-[var(--paragraph)]">
                  Upload files
                </span>
              </label>
            </div>
            
            {/* File list */}
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-1 px-2 rounded text-xs"
                  >
                    <span className="truncate max-w-[250px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 ml-1"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Info callout - more compact */}
          <div className="bg-blue-50 text-blue-800 rounded-lg p-2 mb-3 flex items-start text-xs">
            <FaInfoCircle className="flex-shrink-0 mt-1 mr-2" />
            <p>
              Your quotation will be visible to the charity organization. Be competitive with your pricing and clear with your details.
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm border border-[var(--stroke)] rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-1">Submitting...</span>
                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
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