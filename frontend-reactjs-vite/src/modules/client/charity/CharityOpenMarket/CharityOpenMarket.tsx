import React, { useState, useEffect } from "react";
import { FaPlus, FaListAlt, FaSearch, FaThumbtack, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CreateRequestModal from "./CreateRequestModal";
import RequestCard from "./RequestCard";
import RequestDetail from "./RequestDetail";
import { openMarketService, OpenMarketRequest } from "../../../../services/supabase/openMarketService";
import { toast } from "react-toastify";

// Define the request interface
// Note: Interface is now imported from openMarketService

// Get the current date for comparison
const currentDate = new Date();

// Set future date (not expired) - 30 days in the future
const futureDate = new Date();
futureDate.setDate(currentDate.getDate() + 30);

// Set ongoing date - 15 days in the future
const ongoingDate = new Date();
ongoingDate.setDate(currentDate.getDate() + 15);

// Set past date (expired) - 30 days in the past
const pastDate = new Date();
pastDate.setDate(currentDate.getDate() - 30);

const CharityOpenMarket: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [requests, setRequests] = useState<OpenMarketRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch requests from the database when component mounts
  useEffect(() => {
    fetchRequests();
  }, []);

  // Function to fetch requests from the database
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await openMarketService.getCharityRequests();
      setRequests(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      setError(err.message || "Failed to load requests. Please try again.");
      toast.error("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if a request is actually open (not expired and status is open)
  const isRequestOpen = (request: OpenMarketRequest) => {
    const isExpired = request.deadline ? new Date() > new Date(request.deadline) : false;
    return !isExpired && request.status === 'open';
  };

  // Filter requests based on search term and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Determine if status matches
    let statusMatches = true;
    if (statusFilter === "open") {
      statusMatches = isRequestOpen(request);
    } else if (statusFilter === "closed") {
      statusMatches = !isRequestOpen(request);
    }
    
    return matchesSearch && statusMatches;
  });

  // Sort requests by created_at (newest first)
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleCreateRequest = async (newRequest: { 
    title: string; 
    description: string; 
    deadline?: string;
    fund_type: 'general' | 'campaign';
    campaign_id?: string;
  }) => {
    try {
      // Call the service to create the request in the database
      const createdRequest = await openMarketService.createRequest(newRequest);
      
      // Add the new request to the state
      setRequests(prevRequests => [createdRequest, ...prevRequests]);
      
      // Close the modal and show success message
      setShowCreateModal(false);
      toast.success("Request created successfully!");
    } catch (err: any) {
      console.error("Error creating request:", err);
      toast.error(err.message || "Failed to create request. Please try again.");
    }
  };

  const handleRequestClick = (requestId: string) => {
    setSelectedRequest(requestId);
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
    // Refresh requests when going back to list
    fetchRequests();
  };
  
  const handleRequestUpdated = async (requestId: string, hasAcceptedQuotation: boolean) => {
    try {
      // Update request status in the database
      await openMarketService.updateRequestStatus(requestId, "closed", hasAcceptedQuotation);
      
      // Update in local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId 
            ? { ...req, status: "closed", has_accepted_quotation: hasAcceptedQuotation } 
            : req
        )
      );
      
      toast.success("Request updated successfully!");
    } catch (err: any) {
      console.error("Error updating request:", err);
      toast.error(err.message || "Failed to update request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      {selectedRequest ? (
        <RequestDetail 
          requestId={selectedRequest} 
          onBack={handleBackToList}
          onRequestUpdated={handleRequestUpdated}
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
            )}
            <div className={`${isInfoVisible ? '' : 'lg:col-span-1'}`}>
              <div className="bg-[var(--main)] rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[var(--headline)]">Manage Your Bid Requests</h2>
                  {!isInfoVisible && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-[var(--highlight)] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center gap-2"
                    >
                      <FaPlus /> Create New Request
                    </button>
                  )}
                </div>
                
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
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--highlight)] mb-4"></div>
                        <p className="text-[var(--paragraph)]">Loading requests...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 bg-[var(--background)] rounded-lg">
                      <p className="text-red-500 mb-4">{error}</p>
                      <button
                        onClick={fetchRequests}
                        className="bg-[var(--highlight)] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : sortedRequests.length > 0 ? (
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
