import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaCalendarAlt, FaBuilding, FaPaperclip, FaFileAlt, FaQuoteLeft } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import SubmitQuotationModal from "./SubmitQuotationModal";
import { openMarketService, OpenMarketRequest, Quotation } from "../../../../services/supabase/openMarketService";
import { useAuth } from "../../../../contexts/AuthContext";
import { toast } from "react-toastify";

// Extended interface for Request with UI-specific properties
interface RequestWithUIData extends OpenMarketRequest {
  charity_name?: string;
}

interface VendorRequestDetailProps {
  requestId: string;
  onBack: () => void;
}

const VendorRequestDetail: React.FC<VendorRequestDetailProps> = ({ requestId, onBack }) => {
  const [request, setRequest] = useState<RequestWithUIData | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSubmittedQuotation, setHasSubmittedQuotation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Check if the request is expired
  const isExpired = (request: RequestWithUIData) => {
    if (!request?.deadline) return false;
    const currentDate = new Date();
    const deadlineDate = new Date(request.deadline);
    return currentDate > deadlineDate;
  };

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch request details
        const requestData = await openMarketService.getRequestById(requestId);
        
        // Enhance with charity name (would be fetched in real implementation)
        const requestWithUI: RequestWithUIData = {
          ...requestData,
          charity_name: "Charity Organization" // This would be fetched from a users table in real implementation
        };
        
        setRequest(requestWithUI);
        
        // Fetch quotations for this request
        const quotationsData = await openMarketService.getQuotationsByRequestId(requestId);
        setQuotations(quotationsData);
        
        // Check if current vendor has already submitted a quotation
        if (user?.id) {
          const hasQuotation = quotationsData.some(q => q.vendor_id === user.id);
          setHasSubmittedQuotation(hasQuotation);
        }
        
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching request details:", err);
        setError(err.message || "Failed to load request details");
        setIsLoading(false);
        toast.error("Failed to load request details. Please try again later.");
      }
    };
    
    fetchRequestDetails();
  }, [requestId, user?.id]);

  const handleQuotationSubmit = async (quotationData: any) => {
    try {
      // Call the service to submit the quotation
      await openMarketService.createQuotation({
        ...quotationData,
        request_id: requestId,
        vendor_id: user?.id,
      });
      
      // Refresh quotations
      const updatedQuotations = await openMarketService.getQuotationsByRequestId(requestId);
      setQuotations(updatedQuotations);
      setHasSubmittedQuotation(true);
      setIsModalOpen(false);
      
      toast.success("Your quotation has been submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting quotation:", error);
      toast.error(error.message || "Failed to submit quotation. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--highlight)]"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="mb-4 flex items-center text-[var(--highlight)]">
          <FaChevronLeft className="mr-1" /> Back to listings
        </button>
        <div className="bg-red-50 p-4 rounded text-red-600">
          {error || "Request not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--main)] rounded-xl shadow-lg p-6">
      {/* Back button */}
      <button onClick={onBack} className="mb-4 flex items-center text-[var(--highlight)] hover:text-[var(--highlight-dark)] transition-colors">
        <FaChevronLeft className="mr-1" /> Back to listings
      </button>

      {/* Request header */}
      <div className="border-b border-[var(--stroke)] pb-6 mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-[var(--headline)]">{request.title}</h1>
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              !isExpired(request) 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {!isExpired(request) ? 'Open' : 'Closed'}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-[var(--paragraph-light)]">
          <span className="flex items-center">
            <FaCalendarAlt className="mr-1" /> Posted: {formatDate(request.created_at)}
          </span>
          <span className="flex items-center">
            <FaCalendarAlt className="mr-1" /> Deadline: {formatDate(request.deadline || '')}
          </span>
          {request.charity_name && (
            <span className="flex items-center">
              <FaBuilding className="mr-1" /> {request.charity_name}
            </span>
          )}
        </div>
      </div>

      {/* Request details */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--headline)] mb-3">Request Details</h2>
        <p className="text-[var(--paragraph)] whitespace-pre-wrap">{request.description}</p>
        
        {/* Note: Request doesn't have attachments in the DB schema, so we don't render this section */}
      </div>

      {/* Quotations section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--headline)]">
            Quotations ({quotations.length})
          </h2>
          
          {/* Only show the button if the request is not expired and the vendor hasn't submitted yet */}
          {!isExpired(request) && !hasSubmittedQuotation && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--highlight)] hover:bg-[var(--highlight-dark)] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <MdSend className="mr-2" /> Submit Quotation
            </button>
          )}
          
          {/* Show message if vendor has already submitted */}
          {hasSubmittedQuotation && (
            <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              You've submitted a quotation
            </span>
          )}
          
          {/* Show message if the request is expired */}
          {isExpired(request) && !hasSubmittedQuotation && (
            <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              This request has expired
            </span>
          )}
        </div>
        
        {/* List of quotations */}
        <div className="space-y-4">
          {quotations.length > 0 ? (
            quotations.map((quotation) => (
              <div 
                key={quotation.id} 
                className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]"
              >
                <div className="flex justify-between mb-2">
                  <div className="font-medium text-[var(--headline)]">
                    {quotation.vendor_name || "Anonymous Vendor"}
                  </div>
                  <div className="text-lg font-semibold text-[var(--highlight)]">
                    ${quotation.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                </div>
                
                <p className="text-[var(--paragraph)] text-sm mb-3">
                  {quotation.details}
                </p>
                
                <div className="flex justify-between items-center text-xs text-[var(--paragraph-light)]">
                  <span>Submitted: {formatDate(quotation.created_at)}</span>
                  
                  {/* Only show attachment icon if there's an attachment URL */}
                  {quotation.attachment_url && (
                    <div className="flex items-center">
                      <FaPaperclip className="mr-1" /> 
                      <a 
                        href={quotation.attachment_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[var(--highlight)] hover:underline"
                      >
                        View attachment
                      </a>
                    </div>
                  )}
                </div>
                
                {/* If this quotation belongs to the current vendor, highlight it */}
                {user?.id === quotation.vendor_id && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                    Your quotation
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[var(--background)] p-6 rounded-lg text-center">
              <FaQuoteLeft className="mx-auto mb-2 text-gray-300 text-3xl" />
              <p className="text-[var(--paragraph-light)]">No quotations have been submitted yet.</p>
              {!isExpired(request) && !hasSubmittedQuotation && (
                <p className="mt-2 text-[var(--paragraph)]">Be the first to submit a quotation!</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Submit quotation modal */}
      {isModalOpen && (
        <SubmitQuotationModal
          request={request}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleQuotationSubmit}
        />
      )}
    </div>
  );
};

export default VendorRequestDetail; 