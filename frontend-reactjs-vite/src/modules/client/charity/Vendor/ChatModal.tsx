import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes, FaFile, FaDownload } from "react-icons/fa";
import { useVendorChatStore } from "../../../../services/VendorChatService";

interface ChatModalProps {
  chatId: number;
  onClose: () => void;
}

const vendors = [
  { id: 1, name: "ABC Supplies" },
  { id: 2, name: "XYZ Traders" },
  { id: 3, name: "Global Goods" },
  { id: 4, name: "Tech4Good" },
  { id: 5, name: "Clean Water Solutions" },
];

const ChatModal: React.FC<ChatModalProps> = ({ chatId, onClose }) => {
  const { chats, messages, sendMessage, sendFileMessage } = useVendorChatStore();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Find the current chat
  const currentChat = chats.find(chat => chat.id === chatId);
  
  // Get messages for this chat
  const chatMessages = messages[chatId] || [];
  
  // Scroll to bottom of messages on load and when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  
  if (!currentChat) {
    return null;
  }
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(chatId, newMessage, false);
      setNewMessage("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendFileMessage(chatId, file, false);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg">Chat</h3>
            <span className="text-sm text-green-500">●</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.fromVendor ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.fromVendor 
                    ? 'bg-gray-100 text-[var(--paragraph)] rounded-bl-none' 
                    : 'bg-[var(--highlight)] text-white rounded-br-none'
                }`}
              >
                {message.type === 'file' ? (
                  <div className="flex items-center gap-2">
                    <FaFile className="text-xl" />
                    <span className="flex-1 truncate">{message.fileName}</span>
                    <button
                      onClick={() => message.fileUrl && handleDownload(message.fileUrl, message.fileName || 'download')}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                    >
                      <FaDownload />
                    </button>
                  </div>
                ) : (
                  <p>{message.text}</p>
                )}
                <div className="text-xs opacity-70 text-right mt-1">
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <button 
            type="button"
            onClick={handleFileClick}
            className="p-2 rounded-full text-[var(--paragraph)] hover:bg-gray-100" 
            title="Attach File"
          >
            <FaFile />
          </button>
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
    </div>
  );
};

export default ChatModal; 