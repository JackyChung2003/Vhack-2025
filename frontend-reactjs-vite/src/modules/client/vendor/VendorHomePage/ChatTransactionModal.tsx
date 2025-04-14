import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { mockCampaigns } from "../../../../utils/mockData";

interface Item {
  name: string;
  quantity: number;
  price: number;
}

interface ChatTransactionModalProps {
  onClose: () => void;
  onSubmit: (proposal: { 
    items: Array<{ name: string; quantity: number; price: number }>; 
    totalAmount: number;
    fundSource: 'campaign' | 'general';
    campaignId?: number;
  }) => void;
}

const ChatTransactionModal: React.FC<ChatTransactionModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [items, setItems] = useState<Array<{ id: number; name: string; quantity: number; price: number }>>([
    { id: 1, name: "", quantity: 1, price: 0 }
  ]);
  const [fundSource, setFundSource] = useState<'campaign' | 'general'>('general');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | undefined>(undefined);
  const [activeCampaigns, setActiveCampaigns] = useState(mockCampaigns.filter(c => new Date(c.deadline) > new Date()));

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), name: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const newItems = [...items];
    
    if (field === "quantity" || field === "price") {
      // Ensure numeric values are valid
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numValue)) return;
      
      newItems[index][field] = numValue;
    } else {
      newItems[index][field] = value as string;
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + item.quantity * item.price;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    if (fundSource === 'campaign' && !selectedCampaignId) {
      alert("Please select a campaign");
      return;
    }

    onSubmit({
      items: items.map(({ name, quantity, price }) => ({ name, quantity, price })),
      totalAmount,
      fundSource,
      campaignId: fundSource === 'campaign' ? selectedCampaignId : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--highlight)] text-white px-4 py-3 flex justify-between items-center">
          <h3 className="font-medium">Create Transaction Proposal</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div className="text-sm text-[var(--paragraph)]">
              Create a transaction proposal by adding items below.
            </div>

            {/* Fund Source Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--headline)]">
                Fund Source
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="fundSource"
                    value="general"
                    checked={fundSource === 'general'}
                    onChange={() => setFundSource('general')}
                    className="mr-2"
                  />
                  General Fund
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="fundSource"
                    value="campaign"
                    checked={fundSource === 'campaign'}
                    onChange={() => setFundSource('campaign')}
                    className="mr-2"
                  />
                  Campaign
                </label>
              </div>
            </div>

            {/* Campaign Selection - Only show if campaign is selected */}
            {fundSource === 'campaign' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--headline)]">
                  Select Campaign
                </label>
                <select
                  value={selectedCampaignId || ''}
                  onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
                  className="w-full p-2 border border-[var(--stroke)] rounded-lg"
                  required
                >
                  <option value="">Select a campaign</option>
                  {activeCampaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Item list */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center p-3 border border-gray-200 rounded-lg"
                >
                  <div className="col-span-5">
                    <label className="text-xs text-[var(--paragraph-light)] mb-1 block">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                      placeholder="Product name"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-[var(--paragraph-light)] mb-1 block">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-[var(--paragraph-light)] mb-1 block">
                      Price (RM)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, "price", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                    />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 border border-gray-200 rounded-lg text-[var(--paragraph)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors ml-auto"
                      disabled={items.length === 1}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add item button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-2 text-[var(--highlight)] hover:text-[var(--highlight-dark)] transition-colors"
            >
              <FaPlus size={12} /> Add Another Item
            </button>

            {/* Total */}
            <div className="flex justify-between items-center py-2 border-t border-b border-gray-200 my-4">
              <span className="font-medium text-[var(--headline)]">Total</span>
              <span className="font-bold text-[var(--headline)]">
                RM{calculateTotal().toFixed(2)}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-[var(--paragraph)] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-[var(--highlight-dark)] transition-colors"
                disabled={items.some(item => !item.name.trim()) || calculateTotal() <= 0}
              >
                Send Proposal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatTransactionModal; 