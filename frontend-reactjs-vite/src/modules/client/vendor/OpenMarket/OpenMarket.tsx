import React, { useState, useEffect } from "react";
// import axios from 'axios'; // Temporarily commented out for mock data
import { FaSearch, FaListAlt } from "react-icons/fa";
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
  quotation_count: number;
}

// --- Mock Data Start ---
const mockVendorRequests = [
  {
    id: "1", 
    title: "Toothpaste for Community Dental Health Program",
    description: "Need 500 tubes of toothpaste for our upcoming community dental health initiative.",
    created_by: "charity_123",
    status: "open",
    created_at: "2025-03-10T08:30:00Z",
    quotation_count: 3
  },
  {
    id: "2", 
    title: "School Supplies for Education Outreach",
    description: "Looking for notebooks, pens, and basic stationery for 100 children.",
    created_by: "charity_456",
    status: "open",
    created_at: "2025-03-12T14:15:00Z",
    quotation_count: 5
  },
   {
    id: "4", 
    title: "Winter Clothing Drive - Jackets Needed",
    description: "Seeking 200 new or gently used winter jackets for homeless shelter residents.",
    created_by: "charity_123",
    status: "open",
    created_at: "2025-03-15T09:00:00Z",
    quotation_count: 1
  },
    {
    id: "5", 
    title: "Office Furniture for Non-Profit HQ",
    description: "Need 5 desks and chairs for our new office space. Used items in good condition acceptable.",
    created_by: "charity_789",
    status: "open",
    created_at: "2025-03-16T11:20:00Z",
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Welcome Section (Vendor Focused) */}
            <div className="bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] rounded-xl p-8 shadow-xl text-white">
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

            {/* Right Column - Browse Requests */}
            <div>
              <div className="bg-[var(--main)] rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-[var(--headline)] mb-4">Browse Charity Requests</h2>
                
                {/* Search Bar */}
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

                {/* Requests List */}
                <div className="space-y-4">
                  {filteredRequests.length > 0 ? (
                    // Sort by newest first
                    [...filteredRequests]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map(request => (
                        <RequestCard
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
