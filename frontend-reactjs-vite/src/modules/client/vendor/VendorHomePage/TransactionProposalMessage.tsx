import React from "react";
import { FaCheck, FaTimes, FaBox } from "react-icons/fa";

interface TransactionProposalMessageProps {
  message: {
    id?: number;
    content: string;
    isFromVendor: boolean;
    timestamp: number;
    type: string;
    status?: string;
    proposal?: {
      items: Array<{
        name: string;
        quantity: number;
        price: number;
      }>;
      totalAmount: number;
    };
  };
  onAccept: () => void;
  onReject: () => void;
}

const TransactionProposalMessage: React.FC<TransactionProposalMessageProps> = ({
  message,
  onAccept,
  onReject,
}) => {
  const { proposal, isFromVendor, status } = message;

  if (!proposal) return null;

  const isPending = status === "pending";
  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";

  return (
    <div
      className={`flex ${isFromVendor ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 border ${
          isAccepted
            ? "border-green-300 bg-green-50"
            : isRejected
            ? "border-red-300 bg-red-50"
            : "border-blue-300 bg-blue-50"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <FaBox className="text-[var(--highlight)]" />
          <span className="font-medium text-[var(--headline)]">
            Transaction Proposal
          </span>
          {isAccepted && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
              Accepted
            </span>
          )}
          {isRejected && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
              Rejected
            </span>
          )}
        </div>

        <div className="space-y-2 mb-3">
          {proposal.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-1 border-b border-gray-100"
            >
              <div>
                <p className="text-[var(--headline)]">{item.name}</p>
                <p className="text-xs text-[var(--paragraph-light)]">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-medium text-[var(--headline)]">
                ${(item.quantity * item.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center font-medium text-[var(--headline)] pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${proposal.totalAmount.toFixed(2)}</span>
        </div>

        <div className="text-xs text-[var(--paragraph-light)] mt-2 text-right">
          {new Date(message.timestamp).toLocaleString()}
        </div>

        {/* Action buttons - show only for charity and if pending */}
        {!isFromVendor && isPending && (
          <div className="flex justify-end mt-3 gap-2">
            <button
              onClick={onReject}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors"
            >
              <FaTimes size={12} /> Reject
            </button>
            <button
              onClick={onAccept}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-green-50 text-green-600 text-sm hover:bg-green-100 transition-colors"
            >
              <FaCheck size={12} /> Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionProposalMessage;
