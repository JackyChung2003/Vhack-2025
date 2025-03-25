import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useVendorChatStore } from '../../../../services/VendorChatService';

interface NewChatModalProps {
  onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose }) => {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  
  // Mock vendor data - in a real app, this would come from an API
  const availableVendors = [
    "ABC Medical Supplies",
    "Global Water Solutions",
    "Education Materials Inc.",
    "Food Distribution Network",
    "Shelter Construction Co."
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) {
      alert('Please select a vendor');
      return;
    }
    
    // Here you would typically create a new chat in your store
    // For now, just log the action
    console.log('Creating new chat with:', selectedVendor, 'Initial message:', initialMessage);
    
    // Close the modal
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--main)] p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Start New Conversation</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[var(--headline)] font-medium mb-2">
              Select Vendor
            </label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full p-2 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
              required
            >
              <option value="">-- Select a vendor --</option>
              {availableVendors.map((vendor, index) => (
                <option key={index} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-[var(--headline)] font-medium mb-2">
              Initial Message (Optional)
            </label>
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Type your first message..."
              className="w-full p-2 border border-[var(--stroke)] rounded-lg bg-[var(--background)] min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--stroke)] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg"
            >
              Start Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChatModal; 