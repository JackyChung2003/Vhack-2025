import React, { useState, useEffect } from "react";
// import axios from 'axios'; // Temporarily commented out for mock data
import { FaSearch, FaListAlt, FaInfoCircle, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaComment, FaChevronRight as FaChevronRightIcon } from "react-icons/fa";
// Assuming RequestCard can be reused or adapted
import RequestCard from "../../charity/CharityOpenMarket/RequestCard"; 
// Import the detail view component
import VendorRequestDetail from './VendorRequestDetail'; // Re-applying this import
import { useAuth } from "../../../../contexts/AuthContext"; // To potentially get vendor info if needed

// Interface matching the backend data for OpenMarketRequest
interface OpenMarketRequest {
  id: string;
  title: string;
  description: string;
  created_by: string; // Charity ID
  status: string;
  created_at: string;
  deadline: string; // Added deadline
  quotation_count: number;
}

// Custom request card component that shows expiration status
const VendorRequestCard: React.FC<{
  request: OpenMarketRequest;
  onClick: () => void;
}> = ({ request, onClick }) => {
  // Check if the request is expired by comparing current date with deadline
  const currentDate = new Date();
  const deadlineDate = new Date(request.deadline);
  const isExpired = currentDate > deadlineDate;
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="bg-[var(--main)] border border-[var(--stroke)] rounded-lg p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-[var(--headline)] flex-1">{request.title}</h3>
        <span 
          className={`ml-3 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            !isExpired 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {!isExpired ? 'Open' : 'Closed'}
        </span>
      </div>
      
      <p className="text-[var(--paragraph)] text-sm mb-4 line-clamp-2">
        {request.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-[var(--paragraph-light)]">
          <span className="flex items-center mr-4">
            <FaCalendarAlt className="mr-1" />
            {formatDate(request.created_at)}
          </span>
          <span className="flex items-center">
            <FaComment className="mr-1" />
            {request.quotation_count} quotation{request.quotation_count !== 1 ? 's' : ''}
          </span>
        </div>
        
        <button className="text-[var(--highlight)] hover:text-[var(--highlight-dark)] transition-colors flex items-center text-sm">
          View Details <FaChevronRightIcon size={12} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

// --- Mock Data Start ---
const mockVendorRequests = [
  {
    id: "1", 
    title: "Toothpaste for Community Dental Health Program",
    description: "Need 500 tubes of toothpaste for our upcoming community dental health initiative.",
    created_by: "charity_123",
    status: "closed",
    created_at: "2025-03-10T08:30:00Z",
    deadline: "2025-05-10T08:30:00Z", // Future deadline (not expired)
    quotation_count: 3
  },
  {
    id: "2", 
    title: "School Supplies for Education Outreach",
    description: "Looking for notebooks, pens, and basic stationery for 100 children.",
    created_by: "charity_456",
    status: "open",
    created_at: "2025-03-12T14:15:00Z",
    deadline: "2023-04-12T14:15:00Z", // Past deadline (expired)
    quotation_count: 5
  },
   {
    id: "4", 
    title: "Winter Clothing Drive - Jackets Needed",
    description: "Seeking 200 new or gently used winter jackets for homeless shelter residents.",
    created_by: "charity_123",
    status: "open",
    created_at: "2025-03-15T09:00:00Z",
    deadline: "2023-04-15T09:00:00Z", // Past deadline (expired)
    quotation_count: 1
  },
    {
    id: "5", 
    title: "Office Furniture for Non-Profit HQ",
    description: "Need 5 desks and chairs for our new office space. Used items in good condition acceptable.",
    created_by: "charity_789",
    status: "open",
    created_at: "2025-03-16T11:20:00Z",
    deadline: "2023-04-16T11:20:00Z", // Past deadline (expired)
    quotation_count: 0
  },
  // Example of a closed request (shouldn't appear with current filter, but good for testing)
  // { 
  //   id: "3", 
  //   title: "First Aid Kits for Medical Camp",
  //   description: "Urgently need 50 first aid kits for our upcoming medical camp.",
  //   created_by: "charity_456",
  //   status: "closed",
  //   created_at: "2025-03-01T10:00:00Z",
  //   quotation_count: 4
  // }
];
// Filter mock data to only show open requests
const openMockRequests = mockVendorRequests.filter(req => req.status === 'open');
// --- Mock Data End ---

const VendorOpenMarket: React.FC = () => {
  // Initialize state with mock data
  const [requests, setRequests] = useState<OpenMarketRequest[]>(openMockRequests);
  const [filteredRequests, setFilteredRequests] = useState<OpenMarketRequest[]>(openMockRequests);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  // Removed isLoading and error states as data is now hardcoded
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Keep useAuth if needed for vendor info later



  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    setFilteredRequests(
      requests.filter(request => 
        request.title.toLowerCase().includes(lowerSearchTerm) ||
        request.description.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [searchTerm, requests]);

  const handleRequestClick = (requestId: string) => {
    setSelectedRequest(requestId);
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
    // When using mock data, no need to re-fetch
  };

  // Removed isLoading and error checks
  /*
  if (isLoading) {
    return <div className="p-6">Loading requests...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }
  */

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      {selectedRequest ? (
        <VendorRequestDetail 
          requestId={selectedRequest} 
          onBack={handleBackToList}
          // Consider passing mock quotations to VendorRequestDetail as well if needed
        />
      ) : (
        <div className="max-w-full mx-auto relative">
          <button
            onClick={() => setIsInfoVisible(!isInfoVisible)}
            className={`absolute top-2 ${isInfoVisible ? 'left-2' : 'left-2'} z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all`}
            title={isInfoVisible ? "Hide Info Panel" : "Show Info Panel"}
          >
            {isInfoVisible ? <FaChevronLeft className="text-[var(--highlight)]" /> : <FaChevronRight className="text-[var(--highlight)]" />}
          </button>
          <div className={`grid ${isInfoVisible ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-8 transition-all duration-300 ease-in-out pt-10`}>
            {isInfoVisible && (
              <div className="bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] rounded-xl p-8 shadow-xl text-white lg:sticky lg:top-6 lg:self-start">
                <h1 className="text-3xl font-bold mb-4">Open Market Opportunities</h1>
                <p className="mb-6 opacity-90">
                  Browse requests from charities and submit your quotations for goods and services.
                  Help charities fulfill their needs while growing your business.
                </p>
                <div className="bg-white bg-opacity-20 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">How It Works for Vendors</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="bg-white text-[var(--highlight)] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                      <span>Browse open requests posted by various charities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white text-[var(--highlight)] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                      <span>Review the request details and existing quotations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white text-[var(--highlight)] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                      <span>Submit your competitive quotation including price and details</span>
                    </li>
                     <li className="flex items-start">
                      <span className="bg-white text-[var(--highlight)] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">4</span>
                      <span>Charities review submissions and may accept your offer</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            <div className={`${isInfoVisible ? '' : 'lg:col-span-1'}`}>
              <div className="bg-[var(--main)] rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-[var(--headline)] mb-4">Browse Charity Requests</h2>
                
                <div className="relative mb-6">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests by title or description..."
                    className="w-full pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {filteredRequests.length > 0 ? (
                    [...filteredRequests]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map(request => (
                        <VendorRequestCard
                          key={request.id}
                          request={request}
                          onClick={() => handleRequestClick(request.id)}
                        />
                    ))
                  ) : (
                    <div className="text-center py-8 bg-[var(--background)] rounded-lg">
                      <p className="text-[var(--paragraph)] mb-4">
                        No open requests found matching your search or available at the moment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOpenMarket;
