import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

interface CreateTransactionModalProps {
  onClose: () => void;
}

const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({ onClose }) => {
  const [vendor, setVendor] = useState("");
  const [fundSource, setFundSource] = useState("General Fund");
  const [items, setItems] = useState<Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>>([{ id: 1, name: "", quantity: 1, price: 0 }]);

  // Mock data for vendors and fund sources
  const vendors = ["ABC Supplies", "XYZ Traders", "Global Goods", "Medical Supplies Inc."];
  const fundSources = ["General Fund", "Clean Water Initiative", "Education for All", "Hunger Relief"];

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems([...items, { id: newId, name: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = () => {
    // Validate form
    if (!vendor || items.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) {
      alert("Please fill in all fields correctly");
      return;
    }

    // Create transaction object
    const transaction = {
      vendor,
      fundSource,
      items,
      totalPrice: calculateTotal(),
      status: 'pending',
      createdBy: 'charity',
      date: new Date().toISOString().split('T')[0]
    };

    console.log("Creating transaction:", transaction);
    // Here you would typically send this to your API
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[var(--background)] p-6 rounded-lg shadow-xl border border-[var(--card-border)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[var(--headline)] mb-4">Create New Transaction</h2>
        
        <div className="space-y-4">
          {/* Vendor Selection */}
          <div>
            <label className="block text-[var(--headline)] font-medium mb-1">Vendor</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full p-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
              required
            >
              <option value="">Select a vendor</option>
              {vendors.map((v, index) => (
                <option key={index} value={v}>{v}</option>
              ))}
            </select>
          </div>
          
          {/* Fund Source Selection */}
          <div>
            <label className="block text-[var(--headline)] font-medium mb-1">Fund Source</label>
            <select
              value={fundSource}
              onChange={(e) => setFundSource(e.target.value)}
              className="w-full p-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
              required
            >
              {fundSources.map((fund, index) => (
                <option key={index} value={fund}>{fund}</option>
              ))}
            </select>
          </div>
          
          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[var(--headline)] font-medium">Items</label>
              <button 
                onClick={addItem}
                className="text-[var(--highlight)] hover:text-opacity-80 flex items-center gap-1"
              >
                <FaPlus size={12} /> Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full p-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                      required
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      min="0.01"
                      step="0.01"
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                      required
                    />
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className={`p-2 rounded-lg ${
                      items.length <= 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Total */}
          <div className="text-right font-semibold text-[var(--headline)]">
            Total: ${calculateTotal().toLocaleString()}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[var(--stroke)] text-[var(--paragraph)] rounded-lg hover:bg-[var(--stroke)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all"
          >
            Create Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTransactionModal; 