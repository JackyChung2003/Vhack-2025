import React from "react";

interface PurchaseRequestCardProps {
  request: {
    id: number;
    itemName: string;
    price: number;
    vendor: string;
    isCompleted?: boolean; // Flag to indicate if the request is completed
  };
  onClose: () => void; // Callback to close the card
  onApprove?: () => void; // Callback to approve the request (optional)
}

const PurchaseRequestCard: React.FC<PurchaseRequestCardProps> = ({ request, onClose, onApprove }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[var(--card-background)] p-6 rounded-lg shadow-xl border border-[var(--card-border)] max-w-md w-full">
        <h2 className="text-2xl font-bold text-[var(--headline)] mb-4">Purchase Request Details</h2>
        <p className="text-[var(--headline)] font-semibold">{request.itemName}</p>
        <p className="text-sm text-[var(--paragraph)]">Price: RM{request.price.toLocaleString()}</p>
        <p className="text-sm text-[var(--paragraph)]">Vendor: {request.vendor}</p>
        <div className="mt-6 flex justify-end space-x-4">
          {/* Show Approve button only for pending requests */}
          {!request.isCompleted && onApprove && (
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

export default PurchaseRequestCard;