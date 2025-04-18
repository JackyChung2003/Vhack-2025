import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaExternalLinkAlt, FaThumbtack, FaCheckCircle, FaTimes } from 'react-icons/fa';
import QuotationCard from './QuotationCard';

// Mock data - Replace with API calls in production
const mockRequest = {
  id: "1",
  title: "Toothpaste for Community Dental Health Program",
  description: "Need 500 tubes of toothpaste for our upcoming community dental health initiative in underserved areas. The toothpaste should be of standard quality and size (minimum 100g per tube). Preference for products with fluoride. Must be delivered by end of next month to our main distribution center.",
  created_by: "123",
  created_by_name: "Global Care Foundation",
  status: "open",
  created_at: "2025-03-10T08:30:00Z"
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
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onBack }) => {
  const [request, setRequest] = useState(mockRequest);
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
    setQuotations(quotations.map(q => ({
      ...q,
      is_pinned: q.id === quotationId ? !q.is_pinned : q.is_pinned
    })));
  };
  
  // Handle accepting a quotation
  const handleAcceptQuotation = (quotationId: string) => {
    if (window.confirm('Are you sure you want to accept this quotation? This will close the request and notify the vendor.')) {
      // Update quotations to set the accepted one
      setQuotations(quotations.map(q => ({
        ...q,
        is_accepted: q.id === quotationId
      })));
      
      // Update request status to closed
      setRequest({
        ...request,
        status: 'closed'
      });
      
      // In a real app, you would call an API to update the database
    }
  };
  
  // Sort quotations based on selected criteria
  const sortedQuotations = [...quotations].sort((a, b) => {
    // Always show pinned quotations first
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
                  request.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>
          
          {request.status === 'open' && (
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
      </div>
      
      {/* Quotations section */}
      <div className="bg-[var(--main)] rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--headline)]">
            Quotations ({quotations.length})
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
                onPin={() => handlePinQuotation(quotation.id)}
                onAccept={request.status === 'open' ? () => handleAcceptQuotation(quotation.id) : undefined}
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
    </div>
  );
};

export default RequestDetail; 