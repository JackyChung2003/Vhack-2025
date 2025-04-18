import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // Temporarily commented out
import { FaArrowLeft, FaCalendarAlt, FaUser, FaComments, FaPlusCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // For chat icon link
// Reuse the QuotationCard from the charity module
import QuotationCard from '../../charity/CharityOpenMarket/QuotationCard';
// Import the modal we will create next
import SubmitQuotationModal from './SubmitQuotationModal'; 
import { useAuth } from '../../../../contexts/AuthContext';

// --- Mock Data Start ---
// Duplicating the list from OpenMarket.tsx for now
// Ideally, move this to a shared file (e.g., src/data/mockOpenMarketData.ts)
const mockVendorRequests = [
  {
    id: "1", 
    title: "Toothpaste for Community Dental Health Program",
    description: "Need 500 tubes of toothpaste for our upcoming community dental health initiative in underserved areas. Standard quality, min 100g, fluoride preferred. Delivery by end of next month.",
    created_by: "charity_123",
    charity_name: "Global Care Foundation (Mock)",
    status: "open",
    created_at: "2025-03-10T08:30:00Z",
    quotation_count: 3
  },
  {
    id: "2", 
    title: "School Supplies for Education Outreach",
    description: "Looking for notebooks, pens, and basic stationery for 100 children.",
    created_by: "charity_456",
    charity_name: "Educate Futures (Mock)",
    status: "open",
    created_at: "2025-03-12T14:15:00Z",
    quotation_count: 5
  },
   {
    id: "4", 
    title: "Winter Clothing Drive - Jackets Needed",
    description: "Seeking 200 new or gently used winter jackets for homeless shelter residents.",
    created_by: "charity_123",
    charity_name: "Global Care Foundation (Mock)",
    status: "open",
    created_at: "2025-03-15T09:00:00Z",
    quotation_count: 1
  },
    {
    id: "5", 
    title: "Office Furniture for Non-Profit HQ",
    description: "Need 5 desks and chairs for our new office space. Used items in good condition acceptable.",
    created_by: "charity_789",
    charity_name: "Community Builders (Mock)",
    status: "open",
    created_at: "2025-03-16T11:20:00Z",
    quotation_count: 0
  }
];

// Mock data for quotations - keeping this generic for now
const mockQuotationsForDetail = [
  {
    id: "q101",
    request_id: "1", // Note: This is still hardcoded to request 1, adjust if needed for specific mock scenarios
    vendor_id: "vendor_abc",
    vendor_name: "MedSupplies Co. (Mock)",
    price: 2500,
    details: "Premium fluoride toothpaste (120g), delivery within 2 weeks.",
    attachment_url: null,
    is_accepted: false,
    is_pinned: true,
    created_at: "2025-03-11T10:15:00Z",
    vendor_rating: 4.8
  },
  {
    id: "q102",
    request_id: "1",
    vendor_id: "vendor_def", 
    vendor_name: "Healthcare Products Ltd. (Mock)",
    price: 2200,
    details: "Standard fluoride toothpaste (100g), delivery in 3 weeks.",
    attachment_url: "https://example.com/mock_attachment.pdf", 
    is_accepted: false,
    is_pinned: false,
    created_at: "2025-03-12T14:30:00Z",
    vendor_rating: 4.5
  }
];

// --- Mock Data End ---

// Interface for the detailed request from the backend
interface RequestDetailData {
  id: string;
  title: string;
  description: string;
  created_by: string; // Charity ID
  charity_name: string; // Added by backend controller
  status: string;
  created_at: string;
  quotation_count: number;
}

// Interface for quotation data from the backend
interface QuotationData {
  id: string;
  request_id: string;
  vendor_id: string;
  vendor_name: string;
  price: number;
  details: string;
  attachment_url: string | null;
  is_accepted: boolean;
  is_pinned: boolean; // Vendors can see pinned status but cannot pin
  created_at: string;
  vendor_rating: number;
}

interface VendorRequestDetailProps {
  requestId: string;
  onBack: () => void;
}

const VendorRequestDetail: React.FC<VendorRequestDetailProps> = ({ requestId, onBack }) => {
  // Find the specific request from the mock list based on the passed ID
  const currentMockRequest = mockVendorRequests.find(req => req.id === requestId) || null;
  // For mock data, show the same quotations regardless of the request for now
  const initialQuotations = mockQuotationsForDetail;
  
  const [request, setRequest] = useState<RequestDetailData | null>(currentMockRequest);
  // Initialize quotations state with the generic mock quotations
  const [quotations, setQuotations] = useState<QuotationData[]>(initialQuotations);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Handle successful quotation submission (adjust mock data update)
  const handleQuotationSubmitted = (newQuotationData: Partial<QuotationData> & { request_id: string }) => {
     // Construct a more complete mock quotation object for display
     const completeNewQuotation: QuotationData = {
         id: `mock_q_${Date.now()}`, // Generate a mock ID
         request_id: newQuotationData.request_id,
         vendor_id: user?.id || 'current_mock_vendor',
         vendor_name: user?.email?.split('@')[0] || 'Current Vendor (Mock)',
         price: newQuotationData.price || 0,
         details: newQuotationData.details || '',
         attachment_url: newQuotationData.attachment_url || null,
         is_accepted: false,
         is_pinned: false,
         created_at: new Date().toISOString(),
         vendor_rating: 0, 
     };

    setQuotations(prev => 
      [completeNewQuotation, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );
    setShowSubmitModal(false);
    if(request) {
        // Update mock request quotation count
        setRequest({...request, quotation_count: request.quotation_count + 1 });
        // Note: This count won't persist if you navigate back and forth with pure mock data
    }
  };
  
  // Navigate to chat page (placeholder)
  const handleChatClick = (charityId: string) => {
      // TODO: Implement actual navigation to chat page
      console.log(`Navigating to chat with charity ID: ${charityId}`);
      // navigate(`/chat/${charityId}`);
  };

  if (!request) {
    // This might happen if the passed requestId doesn't match the mockRequestDetail.id
    return (
        <div className="p-6">
            <button onClick={onBack} className="mb-4 flex items-center text-[var(--highlight)] hover:underline">
                <FaArrowLeft className="mr-2" /> Back to market
            </button>
            Error: Mock Request with ID '{requestId}' not found in local mock data.
        </div>
    );
  }

  // Check if the current vendor has already submitted a quotation
  const vendorHasSubmitted = quotations.some(q => q.vendor_id === user?.id);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-[var(--highlight)] hover:underline"
      >
        <FaArrowLeft className="mr-2" /> Back to market
      </button>

      {/* Request details section */}
      <div className="bg-[var(--main)] rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--headline)] mb-2">{request.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--paragraph)]">
              <span className="flex items-center">
                <FaCalendarAlt className="mr-1" /> Created: {formatDate(request.created_at)}
              </span>
              <span className="flex items-center">
                <FaUser className="mr-1" /> By: {request.charity_name || 'Unknown Charity'}
              </span>
              <span 
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>
          {/* Chat Icon */}
           <button 
              onClick={() => handleChatClick(request.created_by)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full flex items-center self-start md:self-center gap-2 text-sm"
              title={`Chat with ${request.charity_name || 'Charity'}`}
            >
              <FaComments /> Chat with Charity
            </button>
        </div>
        
        <div className="bg-[var(--background)] p-4 rounded-lg mb-4">
          <p className="text-[var(--paragraph)] whitespace-pre-wrap">{request.description}</p>
        </div>
      </div>

      {/* Quotations section */}
      <div className="bg-[var(--main)] rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--headline)]">
            Submitted Quotations ({quotations.length})
          </h2>
          {request.status === 'open' && !vendorHasSubmitted && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-[var(--highlight)] hover:bg-opacity-90 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <FaPlusCircle /> Attach Your Quotation
            </button>
          )}
           {request.status === 'open' && vendorHasSubmitted && (
             <p className="text-green-600 font-medium">You have submitted a quotation for this request.</p>
          )}
           {request.status !== 'open' && (
             <p className="text-gray-500 font-medium">This request is closed and not accepting new quotations.</p>
          )}
        </div>

        {/* Quotation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {quotations.length > 0 ? (
            quotations.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                // Vendors cannot pin or accept quotations
                onPin={() => {}} // Provide dummy function or hide if QuotationCard supports it
                // onAccept prop is optional in QuotationCard, so we just don't pass it
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-[var(--paragraph)] mb-2">No quotations submitted yet.</p>
              {request.status === 'open' && (
                 <p className="text-[var(--paragraph-light)] text-sm">Be the first to submit your quotation!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Quotation Modal */} 
      {showSubmitModal && (
        <SubmitQuotationModal
          requestId={requestId}
          onClose={() => setShowSubmitModal(false)}
          onSubmitSuccess={handleQuotationSubmitted}
        />
      )}
    </div>
  );
};

export default VendorRequestDetail; 