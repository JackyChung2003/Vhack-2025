import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaHandHoldingHeart, FaComments } from "react-icons/fa";
import { useVendorChatStore } from "../../services/VendorChatService";
import ChatModal from "../../modules/client/vendor/VendorHomePage/ChatModal";
import { useRole } from "../../contexts/RoleContext";

interface OrganizationCardProps {
  id: number;
  name: string;
  description: string;
  logo: string;
  campaigns: number;
  totalRaised: number;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({ 
  id, 
  name, 
  description, 
  logo, 
  campaigns, 
  totalRaised 
}) => {
  const navigate = useNavigate();
  const { openChat } = useVendorChatStore();
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const { userRole } = useRole();

  // Add event listener for chat modal
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      if (event.detail.organizationId === id) {
        // Find the chat ID for this organization
        const chat = useVendorChatStore.getState().chats.find(
          chat => chat.organizationId === id
        );
        if (chat) {
          setActiveChatId(chat.id);
        }
      }
    };

    window.addEventListener('openVendorChat', handleOpenChat as EventListener);
    return () => {
      window.removeEventListener('openVendorChat', handleOpenChat as EventListener);
    };
  }, [id]);

  const handleCloseChat = () => {
    setActiveChatId(null);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the contact button
    if ((e.target as HTMLElement).closest('.contact-button')) {
      return;
    }
    navigate(`/organization/${id}`);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // First open the chat
    openChat(id);
    // Then find the chat ID and set it as active
    const chat = useVendorChatStore.getState().chats.find(
      chat => chat.organizationId === id
    );
    if (chat) {
      setActiveChatId(chat.id);
    }
  };

  return (
    <>
      <div
        className="bg-[var(--main)] p-6 rounded-lg shadow-xl border border-[var(--stroke)] transition-all transform hover:translate-y-[-8px] hover:shadow-2xl cursor-pointer overflow-hidden"
        onClick={handleCardClick}
        style={{ position: 'relative' }}
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--secondary)] opacity-20 rounded-bl-full"></div>
        
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--highlight)] mr-4 flex items-center justify-center text-[var(--button-text)] text-2xl font-bold overflow-hidden">
            {logo ? <img src={logo} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-[var(--headline)]">{name}</h2>
        </div>
        
        <p className="mb-5 text-[var(--paragraph)] line-clamp-3">{description}</p>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
          <div className="text-sm flex items-center gap-1">
            <FaHandHoldingHeart className="text-[var(--tertiary)]" />
            <span className="font-semibold">{campaigns}</span> active campaigns
          </div>
          <div className="text-sm flex items-center gap-1">
            <span className="font-semibold">RM{totalRaised.toLocaleString()}</span> raised
          </div>
        </div>

        {/* Only show contact button for vendors */}
        {userRole === 'vendor' && (
          <button
            onClick={handleContactClick}
            className="contact-button mt-4 w-full bg-[var(--highlight)] text-white py-2 rounded-lg hover:bg-[var(--highlight-dark)] transition-colors flex items-center justify-center gap-2"
          >
            <FaComments />
            Contact Organization
          </button>
        )}
      </div>

      {/* Chat Modal */}
      {activeChatId !== null && (
        <ChatModal 
          chatId={activeChatId} 
          onClose={handleCloseChat} 
        />
      )}
    </>
  );
};

export default OrganizationCard; 