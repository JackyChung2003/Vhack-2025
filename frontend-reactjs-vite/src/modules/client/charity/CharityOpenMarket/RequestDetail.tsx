import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaExternalLinkAlt, FaThumbtack, FaCheckCircle, FaTimes, FaComment, FaExclamationTriangle, FaClock, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import QuotationCard from './QuotationCard';
import QuotationModal from './QuotationModal';
import { openMarketService, OpenMarketRequest, Quotation } from "../../../../services/supabase/openMarketService";
import { toast } from "react-toastify";

interface RequestDetailProps {
  requestId: string;
  onBack: () => void;
  onRequestUpdated: (requestId: string, hasAcceptedQuotation: boolean) => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onBack, onRequestUpdated }) => {
  const [request, setRequest] = useState<OpenMarketRequest | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotationsLoading, setQuotationsLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Fetch request when component mounts or requestId changes
  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        setLoading(true);
        // Fetch request details
        const data = await openMarketService.getRequestById(requestId);
        setRequest(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching request:", err);
        setError(err.message || "Failed to load request. Please try again.");
        toast.error("Failed to load request details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchQuotations = async () => {
      try {
        setQuotationsLoading(true);
        // Fetch quotations for this request
        const data = await openMarketService.getQuotations(requestId);
        setQuotations(data);
      } catch (err: any) {
        console.error("Error fetching quotations:", err);
        // We don't set the error state here because we still want to show the request
        // details even if there's an error with quotations
        toast.error("Failed to load quotations. Please try refreshing.");
      } finally {
        setQuotationsLoading(false);
      }
    };

    fetchRequestData();
    fetchQuotations();
  }, [requestId]);

  const isRequestExpired = (deadline?: string) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  const handleAcceptQuotation = async (quotationId: string) => {
    if (!request) return;
    
    try {
      // Call the service to accept the quotation
      await openMarketService.acceptQuotation(quotationId);
      
      // Update locally
      setQuotations(prevQuotations => 
        prevQuotations.map(q => 
          q.id === quotationId 
            ? { ...q, is_accepted: true } 
            : { ...q, is_accepted: false }
        )
      );
      setRequest(prev => prev ? { ...prev, status: "closed", has_accepted_quotation: true } : null);
      
      // Notify the parent component that the request has been updated
      onRequestUpdated(request.id, true);
      
      toast.success("Quotation accepted successfully!");
    } catch (err: any) {
      console.error("Error accepting quotation:", err);
      toast.error(err.message || "Failed to accept quotation. Please try again.");
    }
  };

  const handleCloseRequest = async () => {
    if (!request) return;
    
    try {
      await onRequestUpdated(request.id, false);
      setRequest(prev => prev ? { ...prev, status: "closed", has_accepted_quotation: false } : null);
      toast.success("Request closed successfully!");
    } catch (err: any) {
      console.error("Error closing request:", err);
      toast.error(err.message || "Failed to close request. Please try again.");
    }
  };

  const handleQuotationClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
  };

  const handleCloseModal = () => {
    setSelectedQuotation(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)] mb-4"></div>
          <p className="text-[var(--paragraph)]">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-8 bg-[var(--background)] rounded-lg">
        <p className="text-red-500 mb-4">{error || "Request not found"}</p>
        <button
          onClick={onBack}
          className="bg-[var(--highlight)] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center gap-2 mx-auto"
        >
          <FaArrowLeft /> Back to Requests
        </button>
      </div>
    );
  }

  const isExpired = isRequestExpired(request.deadline);
  const isClosed = request.status === "closed";
  const hasAcceptedQuotation = request.has_accepted_quotation || quotations.some(q => q.is_accepted);
  const canAcceptQuotation = !isClosed && !isExpired && quotations.length > 0 && !hasAcceptedQuotation;

  return (
    <div className="bg-[var(--main)] rounded-xl shadow-lg p-6">
      {/* Back button and status */}
      <div className="flex justify-between items-center mb-6">
      <button
        onClick={onBack}
          className="flex items-center gap-2 text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors"
      >
          <FaArrowLeft /> Back to Requests
      </button>
        <div className="flex items-center gap-2">
          {isClosed ? (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium flex items-center gap-1">
              <FaTimesCircle className="text-gray-600" /> Closed
              </span>
          ) : isExpired ? (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
              <FaExclamationCircle className="text-red-600" /> Expired
              </span>
          ) : (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
              <FaCheckCircle className="text-green-600" /> Open
                </span>
              )}
            </div>
          </div>
          
      {/* Request title and details */}
      <h1 className="text-2xl font-bold text-[var(--headline)] mb-4">{request.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--headline)] mb-2">Details</h2>
          <div className="bg-[var(--background)] rounded-lg p-4">
            <p className="text-[var(--paragraph)] whitespace-pre-wrap">{request.description}</p>
            {request.fund_type === 'campaign' && request.campaign_id && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg">
                <span className="font-medium">Campaign Fund:</span> This request will use funds for a specific campaign (ID: {request.campaign_id})
              </div>
            )}
            {request.fund_type === 'general' && (
              <div className="mt-4 p-3 bg-purple-50 text-purple-800 rounded-lg">
                <span className="font-medium">General Fund:</span> This request will use funds for your general charity fund
              </div>
          )}
        </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-[var(--headline)] mb-2">Request Information</h2>
          <div className="bg-[var(--background)] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--paragraph)]">
              <FaCalendarAlt className="text-[var(--highlight)]" />
              <span>Created on {new Date(request.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            {request.deadline && (
              <div className="flex items-center gap-2 text-[var(--paragraph)]">
                <FaClock className="text-[var(--highlight)]" />
                <span>
                  Deadline: {new Date(request.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {isExpired && <span className="text-red-500 ml-2 font-medium">Expired</span>}
            </span>
          </div>
            )}
            <div className="flex items-center gap-2 text-[var(--paragraph)]">
              <FaUser className="text-[var(--highlight)]" />
              <span>Quotations received: {request.quotation_count || quotations.length}</span>
            </div>
            </div>
        </div>
      </div>
      
      {/* Quotations section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[var(--headline)] mb-4">
          Quotations {quotationsLoading ? '(Loading...)' : `(${quotations.length})`}
          </h2>
          
        {quotationsLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--highlight)] mb-3"></div>
              <p className="text-[var(--paragraph)]">Loading quotations...</p>
            </div>
          </div>
        ) : quotations.length === 0 ? (
          <div className="bg-[var(--background)] rounded-lg p-6 text-center">
            <p className="text-[var(--paragraph)] mb-2">No quotations received yet.</p>
            <p className="text-[var(--paragraph)] text-sm">Vendors will be able to submit their quotations for this request.</p>
        </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {quotations.map(quotation => (
              <div key={quotation.id} onClick={() => handleQuotationClick(quotation)} className="cursor-pointer">
                <QuotationCard
                  quotation={quotation}
                  requestDeadline={request.deadline}
                  onAccept={canAcceptQuotation ? () => handleAcceptQuotation(quotation.id) : undefined}
                  onChat={() => toast.info("Chat feature is coming soon!")}
                  isVendor={false}
                />
              </div>
            ))}
            </div>
          )}
      </div>
      
      {/* Action buttons */}
      {!isClosed && !hasAcceptedQuotation && (
        <div className="mt-8 flex justify-end gap-4">
          {!isExpired && (
              <button 
              onClick={handleCloseRequest}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Close Request Without Accepting
                </button>
              )}
        </div>
      )}

      {/* Quotation Modal */}
      {selectedQuotation && (
        <QuotationModal
          quotation={selectedQuotation}
          requestDeadline={request?.deadline}
          isExpired={isExpired}
          isClosed={isClosed}
          hasAcceptedQuotation={hasAcceptedQuotation}
          onClose={handleCloseModal}
          onAccept={() => {
            handleAcceptQuotation(selectedQuotation.id);
            handleCloseModal();
          }}
          onChat={() => toast.info("Chat feature is coming soon!")}
        />
      )}
    </div>
  );
};

export default RequestDetail; 