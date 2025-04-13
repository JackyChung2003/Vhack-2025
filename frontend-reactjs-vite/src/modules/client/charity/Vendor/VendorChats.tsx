import React, { useState } from "react";
import { FaUserCircle, FaCircle, FaSearch, FaPlus } from "react-icons/fa";
import { useVendorChatStore } from "../../../../services/VendorChatService";
import ChatModal from "./ChatModal";
import NewChatModal from "./NewChatModal";

// Import or define vendors data
const vendors = [
  { id: 1, name: "ABC Supplies" },
  { id: 2, name: "XYZ Traders" },
  { id: 3, name: "Global Goods" },
  { id: 4, name: "Tech4Good" },
  { id: 5, name: "Clean Water Solutions" },
];

interface VendorChatsProps {
  limit?: number;
}

const VendorChats: React.FC<VendorChatsProps> = ({ limit }) => {
  const { chats } = useVendorChatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  
  // Filter and sort chats
  const filteredChats = chats.filter(chat => {
    const vendor = vendors.find(v => v.id === chat.organizationId);
    return vendor?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const sortedChats = [...filteredChats].sort((a, b) => {
    const getTimeValue = (timestamp: string) => {
      if (timestamp.includes("Just now")) return Date.now();
      if (timestamp.includes("hour")) {
        const hours = parseInt(timestamp.split(" ")[0]);
        return Date.now() - hours * 60 * 60 * 1000;
      }
      if (timestamp.includes("day")) {
        const days = parseInt(timestamp.split(" ")[0]);
        return Date.now() - days * 24 * 60 * 60 * 1000;
      }
      return 0;
    };
    
    return getTimeValue(b.timestamp) - getTimeValue(a.timestamp);
  });
  
  const displayedChats = limit ? sortedChats.slice(0, limit) : sortedChats;
  
  return (
    <div className="bg-[var(--main)] p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[var(--headline)]">Vendor Chats</h2>
        <button
          onClick={() => setShowNewChatModal(true)}
          className="px-3 py-1 bg-[var(--highlight)] text-white rounded-lg flex items-center gap-2 hover:bg-opacity-90"
        >
          <FaPlus size={12} /> New Chat
        </button>
      </div>
      
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
        />
      </div>
      
      {displayedChats.length > 0 ? (
        <div className="space-y-4">
          {displayedChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] flex items-center cursor-pointer hover:bg-opacity-90 transition-all"
            >
              <div className="relative mr-3">
                <FaUserCircle className="text-[var(--highlight)] w-10 h-10" />
                {chat.online && (
                  <FaCircle className="absolute bottom-0 right-0 text-green-500 text-xs" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-[var(--headline)]">
                    {vendors.find(v => v.id === chat.organizationId)?.name || "Unknown Vendor"}
                  </h3>
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                </div>
                <p className="text-sm text-[var(--paragraph)] truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <span className="bg-[var(--highlight)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                  {chat.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          {searchTerm ? "No vendors found" : "No chats available"}
        </p>
      )}
      
      {activeChatId !== null && (
        <ChatModal 
          chatId={activeChatId} 
          onClose={() => setActiveChatId(null)} 
        />
      )}
      
      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}
    </div>
  );
};

export default VendorChats;
