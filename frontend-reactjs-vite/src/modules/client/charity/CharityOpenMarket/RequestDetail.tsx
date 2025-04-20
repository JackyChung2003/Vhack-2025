import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaExternalLinkAlt, FaThumbtack, FaCheckCircle, FaTimes, FaComment, FaExclamationTriangle } from 'react-icons/fa';
import QuotationCard from './QuotationCard';

// Mock data - Replace with API calls in production
const mockRequest = {
  id: "1",
  title: "Toothpaste for Community Dental Health Program",
  description: "Need 500 tubes of toothpaste for our upcoming community dental health initiative in underserved areas. The toothpaste should be of standard quality and size (minimum 100g per tube). Preference for products with fluoride. Must be delivered by end of next month to our main distribution center.",
  created_by: "123",
  created_by_name: "Global Care Foundation",
  status: "closed",
  created_at: "2025-03-10T08:30:00Z",
  deadline: "2025-04-10T08:30:00Z"
};

const mockQuotations = [
  {
    id: "101",
    request_id: "1",
    vendor_id: "v1",
    vendor_name: "MedSupplies Co.",
    price: 2500,
    details: "We can supply 500 tubes of premium fluoride toothpaste (120g each) with delivery within 2 weeks. Bulk discount applied.",
    attachment_url: "https://example.com/quotation/101.pdf",
    is_accepted: false,
    is_pinned: true,
    created_at: "2025-03-11T10:15:00Z",
    vendor_rating: 4.8
  },
  {
    id: "102",
    request_id: "1",
    vendor_id: "v2",
    vendor_name: "Healthcare Products Ltd.",
    price: 2200,
    details: "500 tubes of standard fluoride toothpaste (100g each). Delivery in 3 weeks. Price includes shipping.",
    attachment_url: "https://example.com/quotation/102.pdf",
    is_accepted: false,
    is_pinned: false,
    created_at: "2025-03-12T14:30:00Z",
    vendor_rating: 4.5
  },
  {
    id: "103",
    request_id: "1",
    vendor_id: "v3",
    vendor_name: "Dental Supplies Inc.",
    price: 2800,
    details: "Premium dental care toothpaste with extra fluoride protection (125g tubes). Fast delivery within 10 days.",
    attachment_url: "https://example.com/quotation/103.pdf",
    is_accepted: false,
    is_pinned: false,
    created_at: "2025-03-13T09:45:00Z",
    vendor_rating: 4.9
  }
];

interface RequestDetailProps {
  requestId: string;
  onBack: () => void;
  onRequestUpdated?: (requestId: string, hasAcceptedQuotation: boolean) => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onBack, onRequestUpdated }) => {
  // Get the request data from the mockRequests via requestId parameter
  const [request, setRequest] = useState(() => {
    // Simulate API call by getting the request from the mock data in CharityOpenMarket
    const mockRequestsList = [
      {
        id: "1",
        title: "Toothpaste for Community Dental Health Program",
        description: "Need 500 tubes of toothpaste for our upcoming community dental health initiative in underserved areas. The toothpaste should be of standard quality and size (minimum 100g per tube). Preference for products with fluoride. Must be delivered by end of next month to our main distribution center.",
        created_by: "123",
        created_by_name: "Global Care Foundation",
        status: "closed",
        created_at: "2025-03-10T08:30:00Z",
        deadline: "2025-04-10T08:30:00Z"
      },
      {
        id: "2", 
        title: "School Supplies for Education Outreach",
        description: "Looking for notebooks, pens, and basic stationery for 100 children in our education program.",
        created_by: "123",
        created_by_name: "Educate Futures",
        status: "open",
        created_at: "2025-03-08T14:15:00Z",
        deadline: "2025-04-05T17:00:00Z"
      },
      {
        id: "3", 
        title: "First Aid Kits for Medical Camp",
        description: "Urgently need 50 first aid kits for our upcoming medical camp in rural areas.",
        created_by: "123",
        created_by_name: "Health Horizons",
        status: "closed",
        created_at: "2025-03-01T10:00:00Z",
        deadline: "2025-04-01T10:00:00Z"
      },
      {
        id: "5", 
        title: "Office Furniture for Non-Profit HQ",
        description: "Need 5 desks and chairs for our new office space. Used items in good condition acceptable.",
        created_by: "123",
        created_by_name: "Community Builders",
        status: "open",
        created_at: "2025-03-16T11:20:00Z",
        deadline: "2025-04-16T11:20:00Z"
      }
    ];
    return mockRequestsList.find(r => r.id === requestId) || mockRequest;
  });
  const [quotations, setQuotations] = useState(mockQuotations);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'newest'>('newest');
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle pinning a quotation
  const handlePinQuotation = (quotationId: string) => {
    // Update quotations to set the pinned one
    setQuotations(quotations.map(q => ({
      ...q,
      is_pinned: q.id === quotationId
    })));
    
    // In a real app, you would call an API to update the database
  };
  
  // Handle deleting a quotation
  const handleDeleteQuotation = (quotationId: number) => {
    // Filter out the deleted quotation
    setQuotations(quotations.filter(q => parseInt(q.id) !== quotationId));
    
    // In a real app, you would call an API to delete the quotation
  };
  
  // New state for accept confirmation modal
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [quotationToAccept, setQuotationToAccept] = useState<string | null>(null);
  
  // Handle accepting a quotation
  const handleAcceptQuotation = (quotationId: string) => {
    // Instead of using window.confirm, show our custom modal
    setQuotationToAccept(quotationId);
    setShowAcceptModal(true);
  };
  
  // Confirm acceptance of quotation
  const confirmAcceptance = () => {
    if (quotationToAccept) {
      // Update quotations to set the accepted one
      setQuotations(quotations.map(q => ({
        ...q,
        is_accepted: q.id === quotationToAccept
      })));
      
      // Update request status to closed
      setRequest({
        ...request,
        status: 'closed'
      });
      
      // Close the modal
      setShowAcceptModal(false);
      setQuotationToAccept(null);
      
      // Notify the parent component about the updated request with accepted quotation
      if (onRequestUpdated) {
        onRequestUpdated(request.id, true);
      }
      
      // In a real app, you would call an API to update the database
    }
  };
  
  // Check if any quotation has been accepted
  const hasAcceptedQuotation = quotations.some(q => q.is_accepted);

  // Sort quotations based on selected criteria
  const sortedQuotations = [...quotations].sort((a, b) => {
    // Always show accepted quotation at the top
    if (a.is_accepted) return -1;
    if (b.is_accepted) return 1;
    
    // Always show pinned quotations next
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    // Then sort by the selected criteria
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating':
        return b.vendor_rating - a.vendor_rating;
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  
  // Calculate time frame progress
  const calculateTimeProgress = () => {
    if (!request) return { progressPercentage: 0, daysRemaining: 0, totalDays: 0, isExpired: true };
    
    const startDate = new Date(request.created_at);
    const endDate = new Date(request.deadline);
    const currentDate = new Date();
    
    // Check if expired
    const isExpired = currentDate > endDate;
    
    // Total duration in milliseconds
    const totalDuration = endDate.getTime() - startDate.getTime();
    // Elapsed time in milliseconds
    const elapsedTime = currentDate.getTime() - startDate.getTime();
    
    // Calculate percentage (capped at 100%)
    const progressPercentage = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100));
    
    // Calculate days remaining
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      progressPercentage: isExpired ? 100 : progressPercentage,
      daysRemaining,
      totalDays: Math.ceil(totalDuration / (1000 * 60 * 60 * 24)),
      isExpired
    };
  };
  
  const timeProgress = calculateTimeProgress();
  const isOpen = !timeProgress.isExpired && request.status === 'open';
  
  // New state for chat modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentVendor, setCurrentVendor] = useState({id: '', name: '', quotationId: ''});
  
  // Handle chatting with a vendor
  const handleChatWithVendor = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (quotation) {
      setCurrentVendor({
        id: quotation.vendor_id,
        name: quotation.vendor_name,
        quotationId: quotation.id
      });
      setShowChatModal(true);
      
      // In a real app, you would initialize a chat session with the vendor
      console.log(`Opening chat with vendor: ${quotation.vendor_name}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-[var(--highlight)] hover:underline"
      >
        <FaArrowLeft className="mr-2" /> Back to requests
      </button>
      
      {/* Request details section */}
      <div className="bg-[var(--main)] rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--headline)] mb-2">{request.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm text-[var(--paragraph)]">
              <span className="flex items-center">
                <FaCalendarAlt className="mr-1" /> Created: {formatDate(request.created_at)}
              </span>
              <span className="flex items-center">
                <FaUser className="mr-1" /> By: {request.created_by_name}
              </span>
              <span 
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  !timeProgress.isExpired 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {!timeProgress.isExpired ? 'Open' : 'Closed'}
              </span>
              {hasAcceptedQuotation && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FaCheckCircle className="inline mr-1" />
                  Quotation Accepted
                </span>
              )}
            </div>
          </div>
          
          {request.status === 'open' && !hasAcceptedQuotation && (
            <button 
              onClick={() => setRequest({ ...request, status: 'closed' })}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center self-start"
            >
              <FaTimes className="mr-2" /> Close Request
            </button>
          )}
        </div>
        
        <div className="bg-[var(--background)] p-4 rounded-lg mb-4">
          <p className="text-[var(--paragraph)]">{request.description}</p>
        </div>
        
        {/* Time frame section */}
        <div className="mt-4 bg-[var(--background)] p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-[var(--headline)]">Request Timeline</h3>
            <span className={`text-sm font-medium ${
              timeProgress.isExpired 
                ? 'text-red-500' 
                : timeProgress.daysRemaining < 3 
                  ? 'text-orange-500' 
                  : 'text-green-600'
            }`}>
              {timeProgress.isExpired 
                ? 'Expired' 
                : `${timeProgress.daysRemaining} day${timeProgress.daysRemaining !== 1 ? 's' : ''} remaining`}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            {timeProgress.isExpired ? (
              <div className="h-2.5 rounded-full bg-red-500 w-full"></div>
            ) : (
              <div 
                className={`h-2.5 rounded-full ${
                  isOpen
                    ? 'bg-green-500' 
                    : timeProgress.progressPercentage > 75 
                      ? 'bg-orange-500' 
                      : 'bg-blue-600'
                }`} 
                style={{ width: `${timeProgress.progressPercentage}%` }}
              ></div>
            )}
          </div>
          
          <div className="flex justify-between text-xs text-[var(--paragraph-light)]">
            <span>Created: {formatDate(request.created_at)}</span>
            <span>Deadline: {formatDate(request.deadline)}</span>
          </div>
          
          {!timeProgress.isExpired ? (
            <div className="mt-2 text-sm text-[var(--paragraph)]">
              <p>Request will be open for {timeProgress.totalDays} days total.</p>
            </div>
          ) : (
            <div className="mt-2 text-sm text-red-500">
              <p>This request has expired and is no longer accepting quotations.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Quotations section */}
      <div className="bg-[var(--main)] rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--headline)]">
            Quotations ({quotations.length})
            {hasAcceptedQuotation && (
              <span className="ml-2 text-sm font-normal text-green-600">
                (A quotation has been accepted)
              </span>
            )}
          </h2>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--paragraph)]">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-[var(--stroke)] rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Vendor Rating</option>
            </select>
          </div>
        </div>
        
        {/* Quotation cards - Padlet style */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedQuotations.length > 0 ? (
            sortedQuotations.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                requestDeadline={request.deadline}
                onChat={() => handleChatWithVendor(quotation.id)}
                onAccept={request.status === 'open' && !timeProgress.isExpired && !hasAcceptedQuotation ? 
                  () => handleAcceptQuotation(quotation.id) : 
                  undefined}
                isVendor={false}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-[var(--paragraph)] mb-2">No quotations yet.</p>
              <p className="text-[var(--paragraph-light)] text-sm">
                Vendors will be able to submit their quotes soon.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center">
                <FaComment className="text-blue-500 mr-2" />
                Chat with {currentVendor.name}
              </h3>
              <button 
                onClick={() => setShowChatModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4 flex-grow overflow-y-auto">
              <div className="space-y-4">
                {/* This would be replaced with actual chat messages */}
                <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm text-gray-500 mb-1">System</p>
                  <p>You are now connected with {currentVendor.name}.</p>
                </div>
                
                <div className="bg-blue-100 p-3 rounded-lg max-w-[80%] ml-auto">
                  <p className="text-sm text-blue-500 mb-1">You</p>
                  <p>Hello! I have some questions about your quotation.</p>
                </div>
                
                <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm text-gray-500 mb-1">{currentVendor.name}</p>
                  <p>Hi there! I'd be happy to answer any questions you have.</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-grow border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-600">
                  Send
                </button>
              </div>
              
              {request.status === 'open' && !timeProgress.isExpired && !hasAcceptedQuotation && (
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    handleAcceptQuotation(currentVendor.quotationId);
                  }}
                  className="w-full py-2 px-4 bg-green-500 text-white hover:bg-green-600 rounded-md flex items-center justify-center"
                >
                  <FaCheckCircle className="mr-2" />
                  Accept this Quotation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Accept Quotation Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <FaExclamationTriangle className="text-yellow-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-[var(--headline)]">Confirm Acceptance</h3>
              </div>
              
              <p className="text-[var(--paragraph)] mb-6">
                Are you sure you want to accept this quotation? This will close the request and notify the vendor.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2 border border-[var(--stroke)] rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAcceptance}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaCheckCircle className="mr-2" />
                  Accept Quotation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail; 