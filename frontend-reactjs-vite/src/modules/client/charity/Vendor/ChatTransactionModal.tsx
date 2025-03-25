import React, { useState } from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';

interface ChatTransactionModalProps {
  onClose: () => void;
  onSubmit: (proposal: { items: Array<{ name: string; quantity: number; price: number }>; totalAmount: number }) => void;
}

const ChatTransactionModal: React.FC<ChatTransactionModalProps> = ({ onClose, onSubmit }) => {
  const [items, setItems] = useState<Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>>([{ id: 1, name: "", quantity: 1, price: 0 }]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) {
      alert("Please fill in all fields correctly");
      return;
    }

    onSubmit({
      items: items.map(({ name, quantity, price }) => ({ name, quantity, price })),
      totalAmount: calculateTotal()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--main)] p-6 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create Transaction Proposal</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-2 items-start">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  className="flex-1 p-2 border border-[var(--stroke)] rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-20 p-2 border border-[var(--stroke)] rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  min="0.01"
                  step="0.01"
                  onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                  className="w-24 p-2 border border-[var(--stroke)] rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length <= 1}
                  className={`p-2 rounded-lg ${items.length <= 1 ? 'text-gray-300' : 'text-red-500'}`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 text-[var(--highlight)] hover:text-opacity-80"
          >
            + Add Item
          </button>

          <div className="mt-4 text-right font-semibold">
            Total: ${calculateTotal().toLocaleString()}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
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
              Send Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatTransactionModal; 