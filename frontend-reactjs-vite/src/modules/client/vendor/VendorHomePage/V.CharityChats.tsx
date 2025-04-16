import React, { useState } from "react";
import { FaSearch, FaPlus, FaRegClock, FaClock } from "react-icons/fa";
import { useVendorChatStore } from "../../../../services/VendorChatService";
import { mockOrganizations } from "../../../../utils/mockData";
import NewChatModal from "./NewChatModal";
import ChatModal from "./ChatModal";

interface CharityChatsProps {}

const CharityChats: React.FC<CharityChatsProps> = () => {
  const { chats } = useVendorChatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter chats based on search
  const filteredChats = chats.filter((chat) => {
    const org = mockOrganizations.find(org => org.id === chat.organizationId);
    return org?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort chats by recent first or oldest first based on timestamp
  const sortedChats = [...filteredChats].sort((a, b) => {
    // Convert string timestamps to comparable values
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
      if (timestamp.includes("week")) {
        const weeks = parseInt(timestamp.split(" ")[0]);
        return Date.now() - weeks * 7 * 24 * 60 * 60 * 1000;
      }
      // Default to old timestamp
      return 0;
    };
    
    const valueA = getTimeValue(a.timestamp);
    const valueB = getTimeValue(b.timestamp);
    
    return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--headline)]">
          Organization Communications
        </h2>
        <button
          onClick={() => setShowNewChatModal(true)}
          className="bg-[var(--highlight)] text-white px-3 py-1 rounded-lg flex items-center gap-1.5 text-sm"
        >
          <FaPlus size={12} /> New Chat
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--paragraph-light)]" />
        <input
          type="text"
          placeholder="Search organizations..."
          className="w-full pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Sort order toggle */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="flex items-center gap-1 text-sm text-[var(--paragraph)] hover:text-[var(--highlight)] transition-colors"
        >
          {sortOrder === "desc" ? (
            <>
              <FaClock /> Latest first
            </>
          ) : (
            <>
              <FaRegClock /> Oldest first
            </>
          )}
        </button>
      </div>

      {/* Chats list */}
      <div className="space-y-2">
        {sortedChats.length > 0 ? (
          sortedChats.map((chat) => {
            const org = mockOrganizations.find(org => org.id === chat.organizationId);
            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className="border border-[var(--stroke)] rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-2">
                    <h3 className="font-medium text-[var(--headline)]">
                      {org?.name || "Unknown Organization"}
                    </h3>
                    <p className="text-sm text-[var(--paragraph)] line-clamp-1 mt-1">
                      {chat.lastMessage}
                    </p>
                    <p className="text-xs text-[var(--paragraph-light)] mt-1">
                      {chat.timestamp}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {chat.unread > 0 && (
                      <span className="bg-[var(--highlight)] text-white text-xs rounded-full px-2 py-0.5">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-[var(--paragraph-light)]">
            {searchTerm ? "No organizations found" : "No chats yet"}
            {!searchTerm && (
              <p className="mt-2">
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="text-[var(--highlight)] hover:underline"
                >
                  Start a new conversation
                </button>
              </p>
            )}
          </div>
        )}
      </div>

      {/* View all button */}
      {sortedChats.length > 5 && (
        <div className="flex justify-center mt-4">
          <button className="text-[var(--highlight)] hover:underline">
            View all chats
          </button>
        </div>
      )}

      {/* Modals */}
      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}
      {activeChatId && (
        <ChatModal
          chatId={activeChatId}
          onClose={() => setActiveChatId(null)}
        />
      )}
    </div>
  );
};

export default CharityChats;
