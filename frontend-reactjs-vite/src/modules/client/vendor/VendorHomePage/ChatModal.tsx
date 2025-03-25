import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes, FaFile, FaDollarSign } from "react-icons/fa";
import { useVendorChatStore } from "../../../../services/VendorChatService";
import { mockOrganizations } from "../../../../utils/mockData";
import TransactionProposalMessage from "./TransactionProposalMessage";
import ChatTransactionModal from "./ChatTransactionModal";

interface ChatModalProps {
  chatId: number;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ chatId, onClose }) => {
  const { chats, messages, sendMessage, sendTransactionProposal, acceptProposal, rejectProposal } = useVendorChatStore();
  const [newMessage, setNewMessage] = useState("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find the current chat
  const currentChat = chats.find(chat => chat.id === chatId);
  
  // Get the organization for this chat
  const organization = currentChat ? mockOrganizations.find(org => org.id === currentChat.organizationId) : null;
  
  // Get messages for this chat
  const chatMessages = messages[chatId] || [];
  
  // Scroll to bottom of messages on load and when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  
  if (!currentChat || !organization) {
    return null;
  }
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(chatId, newMessage);
      setNewMessage("");
    }
  };
  
  const handleSendTransactionProposal = (proposal: { 
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
  }) => {
    sendTransactionProposal(chatId, proposal);
    setShowTransactionModal(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--highlight)] text-white px-4 py-3 flex justify-between items-center">
          <h3 className="font-medium">{organization.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white hover:bg-opacity-20 rounded">
            <FaTimes />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--paragraph-light)]">
              <p>No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          ) : (
            chatMessages.map((message) => {
              // Handle transaction proposal messages
              if (message.transactionProposal) {
                return (
                  <TransactionProposalMessage 
                    key={message.id}
                    message={{
                      id: message.id,
                      content: message.text,
                      isFromVendor: message.fromVendor,
                      timestamp: Date.now(), // Using current time as a fallback
                      type: "transaction_proposal",
                      status: message.transactionProposal.status,
                      proposal: message.transactionProposal
                    }}
                    onAccept={() => acceptProposal(chatId, message.id)}
                    onReject={() => rejectProposal(chatId, message.id)}
                  />
                );
              }
            
              // Regular text messages
              return (
                <div 
                  key={message.id} 
                  className={`flex ${message.fromVendor ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      message.fromVendor 
                        ? 'bg-[var(--highlight)] text-white rounded-br-none' 
                        : 'bg-gray-100 text-[var(--paragraph)] rounded-bl-none'
                    }`}
                  >
                    <p>{message.text}</p>
                    <div className="text-xs opacity-70 text-right mt-1">
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Action buttons */}
        <div className="px-4 py-2 border-t border-gray-200 flex gap-2">
          <button 
            className="p-2 rounded-full text-[var(--paragraph)] hover:bg-gray-100" 
            title="Attach File"
          >
            <FaFile />
          </button>
          <button 
            className="p-2 rounded-full text-[var(--paragraph)] hover:bg-gray-100" 
            title="Create Transaction Proposal"
            onClick={() => setShowTransactionModal(true)}
          >
            <FaDollarSign />
          </button>
        </div>
        
        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
          <textarea
            className="flex-grow resize-none border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent"
            placeholder="Type a message..."
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[var(--highlight)] text-white rounded-full w-10 h-10 flex items-center justify-center"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
      
      {/* Transaction Proposal Modal */}
      {showTransactionModal && (
        <ChatTransactionModal
          onClose={() => setShowTransactionModal(false)}
          onSubmit={handleSendTransactionProposal}
        />
      )}
    </div>
  );
};

export default ChatModal; 