import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";
import VendorChats from "./VendorChats";
import PurchasingTransactions from "./PurchasingTransactions";
import ChatModal from "./ChatModal";

const VendorManagement: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  
  const handleChatClick = (id: number) => {
    setActiveChatId(id);
  };
  
  const handleCloseChat = () => {
    setActiveChatId(null);
  };

  return (
    <div className="pt-0.1 bg-[var(--background)] text-[var(--paragraph)] max-w-7xl mx-auto space-y-6">
      {/* Vendor Chats Section with View All link */}
      <div className="relative">
        <VendorChats limit={3} />
        <Link 
          to="/Vhack-2025/charity/vendor-page?tab=chats" 
          className="absolute top-6 right-6 text-[var(--highlight)] hover:underline flex items-center gap-1 text-sm"
        >
          View All <FaExternalLinkAlt size={12} />
        </Link>
      </div>

      {/* Recent Transactions Section with View All link */}
      <div className="relative">
        <div className="bg-[var(--main)] p-6 rounded-lg shadow-xl border border-[var(--stroke)]">
          <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Recent Transactions</h2>
          
          {/* Display only 2 most recent transactions */}
          <div className="space-y-4">
            <div className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] flex items-center">
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-[var(--headline)] font-semibold">ABC Supplies - 2 item(s)</p>
                  <span className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                </div>
                <p className="text-sm text-[var(--paragraph)]">
                  Total: $1,000 | Fund: Clean Water Initiative
                </p>
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] flex items-center">
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-[var(--headline)] font-semibold">XYZ Traders - 1 item(s)</p>
                  <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">Approved</span>
                </div>
                <p className="text-sm text-[var(--paragraph)]">
                  Total: $1,200 | Fund: Education for All
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Link 
          to="/Vhack-2025/charity/vendor-page?tab=transactions" 
          className="absolute top-6 right-6 text-[var(--highlight)] hover:underline flex items-center gap-1 text-sm"
        >
          View All <FaExternalLinkAlt size={12} />
        </Link>
      </div>
      
      {/* Chat Modal */}
      {activeChatId !== null && (
        <ChatModal 
          chatId={activeChatId} 
          onClose={handleCloseChat} 
        />
      )}
    </div>
  );
};

export default VendorManagement;