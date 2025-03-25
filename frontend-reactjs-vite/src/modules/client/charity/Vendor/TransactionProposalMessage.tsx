import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { TransactionProposal } from '../../../../services/VendorChatService';

interface TransactionProposalMessageProps {
  proposal: TransactionProposal;
  isFromVendor: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

const TransactionProposalMessage: React.FC<TransactionProposalMessageProps> = ({
  proposal,
  isFromVendor,
  onAccept,
  onReject
}) => {
  return (
    <div className="bg-[var(--card-background)] p-4 rounded-lg border border-[var(--stroke)] shadow-sm">
      <h4 className="font-semibold mb-2 text-[var(--headline)]">Transaction Proposal</h4>
      
      <div className="space-y-2">
        {proposal.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm text-[var(--paragraph)]">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        
        <div className="border-t border-[var(--stroke)] pt-2 mt-2">
          <div className="flex justify-between font-semibold text-[var(--headline)]">
            <span>Total Amount:</span>
            <span>${proposal.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {proposal.status === 'pending' && isFromVendor && (
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all"
            >
              <FaCheck /> Accept
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600 transition-all"
            >
              <FaTimes /> Reject
            </button>
          </div>
        )}
        
        {proposal.status !== 'pending' && (
          <div className={`text-center mt-2 font-medium ${
            proposal.status === 'accepted' ? 'text-green-500' : 'text-red-500'
          }`}>
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionProposalMessage;
