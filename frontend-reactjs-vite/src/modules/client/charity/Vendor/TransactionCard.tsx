import React from "react";

interface TransactionCardProps {
  transaction: {
    id: number;
    items: Array<{
      id: number;
      name: string;
      quantity: number;
      price: number;
    }>;
    totalPrice: number;
    vendor: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    fundSource: string;
    createdBy: 'charity' | 'vendor';
    date: string;
  };
  onClose: () => void;
  onApprove?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onClose, onApprove }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[var(--background)] p-6 rounded-lg shadow-xl border border-[var(--card-border)] max-w-md w-full">
        <h2 className="text-2xl font-bold text-[var(--headline)] mb-4">Transaction Details</h2>
        
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <p className="text-[var(--headline)] font-semibold">{transaction.vendor}</p>
            <span className={`text-sm px-2 py-1 rounded-full ${
              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              transaction.status === 'approved' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-[var(--paragraph)]">Created by: {transaction.createdBy === 'charity' ? 'You' : transaction.vendor}</p>
          <p className="text-sm text-[var(--paragraph)]">Date: {transaction.date}</p>
          <p className="text-sm text-[var(--paragraph)]">Fund Source: {transaction.fundSource}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold text-[var(--headline)] mb-2">Items</h3>
          <div className="bg-[var(--background)] rounded-lg p-3">
            <table className="w-full text-sm text-[var(--paragraph)]">
              <thead>
                <tr className="border-b border-[var(--stroke)]">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map(item => (
                  <tr key={item.id} className="border-b border-[var(--stroke)] last:border-0">
                    <td className="py-2">{item.name}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">${item.price}</td>
                    <td className="text-right py-2">${(item.quantity * item.price).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={3} className="text-right py-2 text-[var(--headline)]">Total:</td>
                  <td className="text-right py-2 text-[var(--headline)]">${transaction.totalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          {/* Show Approve button only for pending vendor-created transactions */}
          {transaction.status === 'pending' && transaction.createdBy === 'vendor' && onApprove && (
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all"
            >
              Approve
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard; 