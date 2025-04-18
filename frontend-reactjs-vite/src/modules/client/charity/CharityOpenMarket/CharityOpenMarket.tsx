import React, { useState, useEffect } from "react";
import { FaPlus, FaListAlt, FaSearch, FaThumbtack } from "react-icons/fa";
import CreateRequestModal from "./CreateRequestModal";
import RequestCard from "./RequestCard";
import RequestDetail from "./RequestDetail";

// Define the request interface
interface OpenMarketRequest {
  id: string;
  title: string;
  description: string;
  created_by: string;
  status: string;
  created_at: string;
  quotation_count: number;
}

// Mock data - Replace with actual API calls
const mockRequests = [
  { 
    id: "1", 
    title: "Toothpaste for Community Dental Health Program",
    description: "Need 500 tubes of toothpaste for our upcoming community dental health initiative in underserved areas.",
    created_by: "123",
    status: "open",
    created_at: "2025-03-10T08:30:00Z",
    quotation_count: 3
  },
  { 
    id: "2", 
    title: "School Supplies for Education Outreach",
    description: "Looking for notebooks, pens, and basic stationery for 100 children in our education program.",
    created_by: "123",
    status: "open",
    created_at: "2025-03-08T14:15:00Z",
    quotation_count: 5
  },
  { 
    id: "3", 
    title: "First Aid Kits for Medical Camp",
    description: "Urgently need 50 first aid kits for our upcoming medical camp in rural areas.",
    created_by: "123",
    status: "closed",
    created_at: "2025-03-01T10:00:00Z",
    quotation_count: 4
  }
];

const CharityOpenMarket: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [requests, setRequests] = useState(mockRequests);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");

  // Filter requests based on search term and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort requests by created_at (newest first)
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleCreateRequest = (newRequest: { title: string; description: string }) => {
    // In a real app, you would call an API to create the request
    const requestWithId = {
      ...newRequest,
      id: (requests.length + 1).toString(),
      created_by: "123", // In a real app, this would b e the user's ID
      status: "open",
      created_at: new Date().toISOString(),
      quotation_count: 0
    };
    
    setRequests([requestWithId, ...requests]);
    setShowCreateModal(false); 
  };

  const handleRequestClick = (requestId: string) => {
    setSelectedRequest(requestId);
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      {selectedRequest ? (
        <RequestDetail 
          requestId={selectedRequest} 
          onBack={handleBackToList}
        />
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Welcome Section */}
            <div className="bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] rounded-xl p-8 shadow-xl text-white">
              <h1 className="text-3xl font-bold mb-4">Welcome to Your Bid Market</h1>
              <p className="mb-6 opacity-90">
                Create requests for supplies and services you need, and let vendors submit their best quotations.
                Compare offers, view vendor ratings, and make informed decisions for your charity's needs.
              </p>
              <div className="bg-white bg-opacity-20 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">How It Works</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-white text-[var(--highlight)] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                    <span>Create a request detailing what supplies or services your charity needs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-white text-[var(--highlight)] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                    <span>Vendors submit quotations with their pricing and details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-white text-[var(--highlight)] rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                    <span>Review and compare offers, pin your favorites, and approve the best quotation</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 bg-white text-[var(--highlight)] px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <FaPlus /> Create New Request
              </button>
            </div>

            {/* Right Column - Manage Bids */}
            <div>
              <div className="bg-[var(--main)] rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-[var(--headline)] mb-4">Manage Your Bid Requests</h2>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      className="w-full pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="border border-[var(--stroke)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "open" | "closed")}
                  >
                    <option value="all">All Requests</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                  {sortedRequests.length > 0 ? (
                    sortedRequests.map(request => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onClick={() => handleRequestClick(request.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 bg-[var(--background)] rounded-lg">
                      <p className="text-[var(--paragraph)] mb-4">
                        No requests found. Create your first request to get started!
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[var(--highlight)] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
                      >
                        Create Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRequest}
        />
      )}
    </div>
  );
};

export default CharityOpenMarket;
