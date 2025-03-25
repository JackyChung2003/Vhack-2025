import React, { useState } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { mockOrganizations } from "../../../../utils/mockData";

interface CreateTransactionModalProps {
  onClose: () => void;
}

const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({ onClose }) => {
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [items, setItems] = useState<Array<{ id: number; name: string; quantity: number; price: number }>>([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, price: 0 });
  const [fundSource, setFundSource] = useState("");

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity > 0 && newItem.price > 0) {
      setItems([...items, { ...newItem, id: Date.now() }]);
      setNewItem({ name: "", quantity: 1, price: 0 });
    }
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    if (!selectedOrgId || items.length === 0 || !fundSource) {
      return;
    }

    const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const transaction = {
      id: Date.now(),
      items,
      totalPrice,
      organizationId: selectedOrgId,
      status: 'pending' as const,
      fundSource,
      createdBy: 'vendor' as const,
      date: new Date().toISOString().split('T')[0]
    };

    console.log('New transaction:', transaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--main)] rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold text-[var(--headline)] mb-6">Create New Transaction</h2>

        {/* Organization Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--headline)] mb-2">
            Select Organization
          </label>
          <select
            value={selectedOrgId || ""}
            onChange={(e) => setSelectedOrgId(Number(e.target.value))}
            className="w-full p-2 bg-[var(--background)] border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
          >
            <option value="">Select an organization...</option>
            {mockOrganizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fund Source */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--headline)] mb-2">
            Fund Source
          </label>
          <input
            type="text"
            value={fundSource}
            onChange={(e) => setFundSource(e.target.value)}
            placeholder="Enter fund source..."
            className="w-full p-2 bg-[var(--background)] border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
          />
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--headline)] mb-4">Items</h3>
          
          {/* Add New Item */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Item name"
              className="flex-1 p-2 bg-[var(--background)] border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            />
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              placeholder="Quantity"
              min="1"
              className="w-24 p-2 bg-[var(--background)] border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            />
            <input
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
              placeholder="Price"
              min="0"
              step="0.01"
              className="w-32 p-2 bg-[var(--background)] border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            />
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg flex items-center gap-2 hover:bg-opacity-90"
            >
              <FaPlus /> Add
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-2 bg-[var(--background)] rounded-lg">
                <div className="flex-1">{item.name}</div>
                <div className="w-24 text-right">{item.quantity}</div>
                <div className="w-32 text-right">${item.price.toLocaleString()}</div>
                <div className="w-40 text-right font-semibold">
                  ${(item.quantity * item.price).toLocaleString()}
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-lg font-semibold text-[var(--headline)]">
            <span>Total Amount:</span>
            <span>
              ${items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--paragraph)] hover:text-[var(--headline)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedOrgId || items.length === 0 || !fundSource}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTransactionModal; 