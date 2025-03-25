import React from "react";
import { FaTimes, FaCheck, FaBuilding } from "react-icons/fa";
import { mockOrganizations } from "../../../../utils/mockData";

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
    organizationId: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    fundSource: string;
    createdBy: 'charity' | 'vendor';
    date: string;
  };
  onClose: () => void;
  onApprove?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onClose,
  onApprove
}) => {
  const organization = mockOrganizations.find(org => org.id === transaction.organizationId);

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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FaBuilding className="text-[var(--highlight)] text-2xl" />
          <div>
            <h3 className="text-xl font-bold text-[var(--headline)]">
              {organization?.name || 'Unknown Organization'}
            </h3>
            <p className="text-sm text-[var(--paragraph)]">
              Transaction #{transaction.id}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            transaction.status === 'approved' ? 'bg-blue-100 text-blue-800' :
            transaction.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-green-100 text-green-800'
          }`}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </span>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h4 className="font-semibold text-[var(--headline)] mb-3">Items</h4>
          <div className="space-y-2">
            {transaction.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="text-[var(--headline)]">{item.name}</span>
                  <span className="text-sm text-[var(--paragraph)] ml-2">
                    x{item.quantity}
                  </span>
                </div>
                <span className="text-[var(--headline)]">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="mb-6">
          <h4 className="font-semibold text-[var(--headline)] mb-3">Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--paragraph)]">Total Amount</span>
              <span className="font-semibold text-[var(--headline)]">
                ${transaction.totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--paragraph)]">Fund Source</span>
              <span className="text-[var(--headline)]">{transaction.fundSource}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--paragraph)]">Created By</span>
              <span className="text-[var(--headline)]">
                {transaction.createdBy === 'vendor' ? 'You' : organization?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--paragraph)]">Date</span>
              <span className="text-[var(--headline)]">{transaction.date}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {onApprove && (
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[var(--paragraph)] hover:text-[var(--headline)]"
            >
              Cancel
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg flex items-center gap-2 hover:bg-opacity-90"
            >
              <FaCheck /> Approve Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionCard; 