import React, { useState } from "react";
import { FaSearch, FaStar, FaRegStar, FaUserCircle, FaExternalLinkAlt, FaComments, FaExchangeAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ChatModal from "./ChatModal";    

const VendorSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Mock data for vendors
  const vendors = [
    { 
      id: 1, 
      name: "ABC Supplies", 
      category: "Medical Supplies", 
      rating: 4.5, 
      transactions: 28, 
      description: "Specializing in medical and health supplies for humanitarian missions.",
      verified: true
    },
    { 
      id: 2, 
      name: "XYZ Traders", 
      category: "Educational Materials", 
      rating: 4.2, 
      transactions: 15, 
      description: "Providing educational materials and school supplies for charity programs.",
      verified: true
    },
    { 
      id: 3, 
      name: "Global Goods", 
      category: "Food & Nutrition", 
      rating: 4.8, 
      transactions: 42, 
      description: "Supplying nutritional products and food packages for relief efforts.",
      verified: true
    },
    { 
      id: 4, 
      name: "Tech4Good", 
      category: "Technology", 
      rating: 3.9, 
      transactions: 7, 
      description: "Affordable technology solutions for educational and humanitarian projects.",
      verified: false
    },
    { 
      id: 5, 
      name: "Clean Water Solutions", 
      category: "Water & Sanitation", 
      rating: 4.7, 
      transactions: 31, 
      description: "Water filters, purification systems, and sanitation equipment for clean water initiatives.",
      verified: true
    },
  ];

  // Get unique categories for filter
  const categories = ["all", ...new Set(vendors.map(vendor => vendor.category))];

  // Filter vendors based on search term and category
  const filteredVendors = vendors.filter(vendor => 
    (searchTerm === "" || vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     vendor.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === "all" || vendor.category === categoryFilter)
  );

  const handleContactVendor = (vendorId: number) => {
    setActiveChatId(vendorId);
  };

  return (
    <div className="bg-[var(--main)] p-6 rounded-lg shadow-xl">
      {/* Search and Filter Section */}
      <div className="bg-[var(--background)] rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--main)] border border-[var(--stroke)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-full text-sm ${
                  categoryFilter === category
                    ? 'bg-[var(--highlight)] text-white'
                    : 'bg-[var(--main)] text-[var(--paragraph)] hover:bg-gray-200'
                } transition-all`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.length > 0 ? (
          filteredVendors.map(vendor => (
            <div 
              key={vendor.id}
              className="bg-[var(--background)] rounded-lg shadow-md border border-[var(--stroke)] overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <FaUserCircle className="text-[var(--highlight)] w-12 h-12 mr-3" />
                    <div>
                      <h3 className="font-bold text-[var(--headline)]">{vendor.name}</h3>
                      <span className="text-sm text-[var(--paragraph)] bg-[var(--main)] px-2 py-1 rounded-full">
                        {vendor.category}
                      </span>
                    </div>
                  </div>
                  {vendor.verified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                  )}
                </div>
                
                <p className="text-[var(--paragraph)] mb-4">{vendor.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(vendor.rating) ? (
                          <FaStar className="text-yellow-400" />
                        ) : i < vendor.rating ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-yellow-400" />
                        )}
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-[var(--paragraph)]">{vendor.rating}</span>
                  </div>
                  <span className="text-sm text-[var(--paragraph)]">
                    {vendor.transactions} transactions
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleContactVendor(vendor.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-all"
                  >
                    <FaComments />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-[var(--background)] rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-bold text-[var(--headline)] mb-2">No vendors found</h2>
            <p className="text-[var(--paragraph)]">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      
      {/* Chat Modal */}
      {activeChatId !== null && (
        <ChatModal 
          chatId={activeChatId} 
          onClose={() => setActiveChatId(null)} 
        />
      )}
    </div>
  );
};

export default VendorSearch;