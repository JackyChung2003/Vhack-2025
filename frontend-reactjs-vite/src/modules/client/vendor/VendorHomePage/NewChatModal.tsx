import React, { useState } from "react";
import { FaSearch, FaTimes, FaUserCircle } from "react-icons/fa";
import { useVendorChatStore } from "../../../../services/VendorChatService";
import { mockOrganizations } from "../../../../utils/mockData";

interface NewChatModalProps {
  onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const { sendMessage, chats } = useVendorChatStore();

  // Filter organizations based on search term
  const filteredOrganizations = searchTerm
    ? mockOrganizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : mockOrganizations;

  // Check if organization is already in chats
  const isOrgInChats = (orgId: number) => {
    return chats.some(chat => 
      'organizationId' in chat && chat.organizationId === orgId
    );
  };

  const handleStartChat = () => {
    if (selectedOrgId) {
      // Determine the next available chat ID
      const nextChatId = Math.max(...chats.map(chat => chat.id), 0) + 1;
      
      // In a real app, this would create a chat via the service
      // Here we'll just close the modal since we're using mock data
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--highlight)] text-white px-4 py-3 flex justify-between items-center">
          <h3 className="font-medium">Start New Conversation</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm text-[var(--paragraph-light)] mb-1">
              Select an organization
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--paragraph-light)]" />
              <input
                type="text"
                placeholder="Search organizations..."
                className="w-full pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Organization list */}
          <div className="max-h-60 overflow-y-auto mb-4 border border-[var(--stroke)] rounded-lg">
            {filteredOrganizations.length > 0 ? (
              filteredOrganizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => setSelectedOrgId(org.id)}
                  className={`p-3 border-b border-[var(--stroke)] last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedOrgId === org.id
                      ? "bg-[var(--highlight-light)]"
                      : ""
                  } ${isOrgInChats(org.id) ? "opacity-50" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <FaUserCircle className="text-[var(--paragraph)] w-8 h-8 mr-3" />
                      <div>
                        <h4 className="font-medium text-[var(--headline)]">
                          {org.name}
                        </h4>
                        <p className="text-xs text-[var(--paragraph-light)]">
                          {org.description}
                        </p>
                        {isOrgInChats(org.id) && (
                          <p className="text-xs text-blue-500 mt-1">
                            Already in your chats
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedOrgId === org.id && (
                      <div className="w-4 h-4 rounded-full bg-[var(--highlight)] flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[var(--paragraph-light)]">
                No organizations found matching your search.
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-[var(--paragraph)] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartChat}
              disabled={selectedOrgId === null || isOrgInChats(selectedOrgId || 0)}
              className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-[var(--highlight-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal; 