import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaCalendarAlt, FaBuilding, FaPaperclip, FaFileAlt, FaQuoteLeft, FaComment, FaTrash, FaGraduationCap, FaUser } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import SubmitQuotationModal from "./SubmitQuotationModal";
import { openMarketService, OpenMarketRequest, Quotation } from "../../../../services/supabase/openMarketService";
import { useAuth } from "../../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { charityService, Campaign } from "../../../../services/supabase/charityService";

// Extended interface for Request with UI-specific properties
interface RequestWithUIData extends OpenMarketRequest {
  charity_name?: string;
  campaign?: Campaign;
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
        
        // If this is a campaign-funded request, fetch the campaign details
        if (requestData.fund_type === 'campaign' && requestData.campaign_id) {
          try {
            const campaignData = await charityService.getCampaignById(requestData.campaign_id);
            requestWithUI.campaign = campaignData;
          } catch (campaignErr) {
            console.error("Error fetching campaign details:", campaignErr);
            // Don't fail the whole request if campaign fetch fails
          }
        }
        
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

  const handleChatWithVendor = (quotationId: string) => {
    // In a real app, this would open a chat interface with the vendor
    console.log("Chat with vendor for quotation:", quotationId);
    toast.info("Chat feature would open here");
  };

  const handleAcceptQuotation = (quotationId: string) => {
    // In a real app, this would call an API to accept the quotation
    console.log("Accept quotation:", quotationId);
    toast.success("Quotation would be accepted here");
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (!confirm("Are you sure you want to delete this quotation?")) {
      return;
    }
    
    try {
      // Call service to delete the quotation
      await openMarketService.deleteQuotation(quotationId);
      
      // Update the UI - remove the deleted quotation
      setQuotations(quotations.filter(q => q.id !== quotationId));
      
      // If it was the user's quotation, update status
      if (quotations.find(q => q.id === quotationId)?.vendor_id === user?.id) {
        setHasSubmittedQuotation(false);
      }
      
      toast.success("Quotation deleted successfully");
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Failed to delete quotation. Please try again.");
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

  // Check if the current user has submitted a quotation
  const userQuotation = quotations.find(q => q.vendor_id === user?.id);
  
  // Get other vendors' quotations
  const otherQuotations = quotations.filter(q => q.vendor_id !== user?.id);
  
  // Determine if this is an education campaign
  const isEducationCampaign = request.campaign?.category === 'education';

  return (
    <div className="bg-[var(--main)] rounded-xl shadow-lg p-6">
      {/* Back button */}
      <button onClick={onBack} className="mb-4 flex items-center text-[var(--highlight)] hover:text-[var(--highlight-dark)] transition-colors">
        <FaChevronLeft className="mr-1" /> Back to listings
      </button>

      {/* Redesigned header - clean white background with clear sections */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-[var(--headline)]">{request.title}</h1>
          <div className="mt-2 flex items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              !isExpired(request) 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {!isExpired(request) ? 'Open' : 'Closed'}
            </span>
            <span className="ml-4 text-sm text-gray-500">
              Posted: {formatDate(request.created_at)}
            </span>
            
            {isEducationCampaign && (
              <span className="ml-3 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
                <FaGraduationCap className="mr-1" /> Education Campaign
              </span>
            )}
          </div>
        </div>
        
        {/* Campaign info for campaign-funded requests */}
        {request.fund_type === 'campaign' && request.campaign && (
          <div className="mb-4 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <h3 className="font-semibold text-blue-800">Campaign Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700 font-medium">{request.campaign.title}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Target: ${request.campaign.target_amount.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">
                  Raised: ${request.campaign.current_amount.toLocaleString()} 
                  ({Math.round((request.campaign.current_amount / request.campaign.target_amount) * 100)}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600">
                  Deadline: {formatDate(request.campaign.deadline)}
                </p>
                {request.campaign.category && (
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    Category: {request.campaign.category.charAt(0).toUpperCase() + request.campaign.category.slice(1)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Organization info prominently displayed */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t border-b border-gray-100 py-4 my-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <FaBuilding className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">{request.charity_name || "Unknown Organization"}</h3>
              <p className="text-sm text-gray-500">Requesting Organization</p>
            </div>
          </div>
          <div className="mt-3 md:mt-0 bg-yellow-50 px-4 py-2 rounded-lg flex items-center">
            <FaCalendarAlt className="mr-2 text-yellow-600" /> 
            <div>
              <span className="text-sm font-medium text-yellow-800">
                Deadline: 
              </span>
              <span className="ml-1 text-sm font-bold">
                {formatDate(request.deadline || '')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Bid details */}
        <div>
          <h2 className="text-xl font-semibold text-[var(--headline)] mb-3">Bid Details</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-[var(--paragraph)] whitespace-pre-wrap">{request.description}</p>
          </div>
        </div>
      </div>

      {/* Submit Quotation button - Prominent position */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[var(--headline)]">
            Quotations ({quotations.length})
          </h2>
          
          {!isExpired(request) && !hasSubmittedQuotation && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-base font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center"
            >
              <MdSend className="mr-2" /> Submit your Quotation
            </button>
          )}
          
          {/* Only show message if vendor has already submitted */}
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
      </div>
        
      {/* All quotations in a single section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User's quotation (if any) */}
          {userQuotation && (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
              {/* Status header */}
              <div className="bg-blue-600 text-white py-2 px-4 text-center font-medium">
                Open for Acceptance
              </div>
              
              {/* Your quotation badge */}
              <div className="absolute top-2 right-2 bg-blue-700 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <FaUser className="mr-1" size={10} /> Your Quote
              </div>
              
              {/* Quotation content */}
              <div className="p-4 bg-white">
                {/* Header with vendor/charity and price */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      You (Vendor)
                    </h3>
                  </div>
                  <div className="text-xl font-bold text-amber-500">
                    ${userQuotation.price.toFixed(2)}
                  </div>
                </div>
                
                {/* Description */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3 min-h-[80px]">
                  <p className="text-gray-700">{userQuotation.details}</p>
                  
                  {isEducationCampaign && (
                    <div className="mt-2 flex items-center">
                      <FaGraduationCap className="text-blue-600 mr-1" />
                      <span className="text-xs text-blue-700">Education Campaign Quotation</span>
                    </div>
                  )}
                  
                  {userQuotation.attachment_url && (
                    <div className="mt-2">
                      <a 
                        href={userQuotation.attachment_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[var(--highlight)] hover:underline flex items-center text-sm"
                      >
                        <FaPaperclip className="mr-1" /> View Attachment
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Dates */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {formatDate(userQuotation.created_at)}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDeleteQuotation(userQuotation.id)}
                    className="col-span-2 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <FaTrash className="mr-1" /> Delete Quotation
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Other vendors' quotations */}
          {otherQuotations.map((quotation) => (
            <div key={quotation.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Status header */}
              <div className="bg-blue-600 text-white py-2 px-4 text-center font-medium">
                Open for Acceptance
              </div>
              
              {/* Quotation content */}
              <div className="p-4 bg-white">
                {/* Header with vendor/charity and price */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {quotation.vendor_name || "Anonymous Vendor"}
                    </h3>
                  </div>
                  <div className="text-xl font-bold text-amber-500">
                    ${quotation.price.toFixed(2)}
                  </div>
                </div>
                
                {/* Description */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3 min-h-[80px]">
                  <p className="text-gray-700">{quotation.details}</p>
                  
                  {isEducationCampaign && (
                    <div className="mt-2 flex items-center">
                      <FaGraduationCap className="text-blue-600 mr-1" />
                      <span className="text-xs text-blue-700">Education Campaign Quotation</span>
                    </div>
                  )}
                  
                  {quotation.attachment_url && (
                    <div className="mt-2">
                      <a 
                        href={quotation.attachment_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[var(--highlight)] hover:underline flex items-center text-sm"
                      >
                        <FaPaperclip className="mr-1" /> View Attachment
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Dates */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {formatDate(quotation.created_at)}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                {/* Action buttons for other vendors' quotations */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDeleteQuotation(quotation.id)}
                    className="col-span-2 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <FaTrash className="mr-1" /> Delete Quotation
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty state if no quotations */}
          {quotations.length === 0 && (
            <div className="col-span-full bg-gray-50 p-6 rounded-lg text-center">
              <FaQuoteLeft className="mx-auto mb-2 text-gray-300 text-3xl" />
              <p className="text-gray-500">No quotations have been submitted yet.</p>
              {!isExpired(request) && !hasSubmittedQuotation && (
                <p className="mt-2 text-gray-700">Be the first to submit a quotation!</p>
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