import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import PurchaseRequestCard from "./PurchaseRequestCard";

const PurchaseRequest: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<null | {
    id: number;
    itemName: string;
    price: number;
    vendor: string;
    isCompleted?: boolean;
  }>(null);

  const pendingRequests = [
    { id: 1, itemName: "Water Filters", price: 500, vendor: "ABC Supplies" },
    { id: 2, itemName: "School Supplies", price: 1200, vendor: "XYZ Traders" },
  ];

  const completedRequests = [
    { id: 3, itemName: "Medical Kits", price: 800, vendor: "Global Goods", isCompleted: true },
    { id: 4, itemName: "Food Packages", price: 1500, vendor: "ABC Supplies", isCompleted: true },
  ];

  const handleRequestClick = (request: { id: number; itemName: string; price: number; vendor: string; isCompleted?: boolean }) => {
    setSelectedRequest(request); // Set the selected request to display in the card
  };

  const handleCloseCard = () => {
    setSelectedRequest(null); // Close the card
  };

  const handleApprove = () => {
    console.log(`Approved request ID: ${selectedRequest?.id}`);
    setSelectedRequest(null); // Close the card after approval
  };

  return (
    <div className="bg-[var(--main)] p-6 rounded-lg shadow-xl border border-[var(--stroke)]">
      <h2 className="text-2xl font-bold text-[var(--headline)] mb-4">Purchase Requests</h2>

      {/* Pending Requests */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[var(--headline)] mb-3">Pending Requests</h3>
        <ul className="space-y-4">
          {pendingRequests.map((request) => (
            <li
              key={request.id}
              onClick={() => handleRequestClick(request)} // Handle click to show details
              className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] flex items-center cursor-pointer hover:bg-gray-100 transition-all"
            >
              <div className="flex-1">
                <p className="text-[var(--headline)] font-semibold">{request.itemName}</p>
                <p className="text-sm text-[var(--paragraph)]">Price: RM{request.price.toLocaleString()}</p>
                <p className="text-sm text-[var(--paragraph)]">Vendor: {request.vendor}</p>
              </div>
              {/* Empty circle for pending requests */}
              <div className="text-gray-400">
                <FaCheckCircle className="w-5 h-5 opacity-30" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Completed Requests */}
      <div>
        <h3 className="text-lg font-bold text-[var(--headline)] mb-3">Completed Requests</h3>
        <ul className="space-y-4">
          {completedRequests.map((request) => (
            <li
              key={request.id}
              onClick={() => handleRequestClick(request)} // Handle click to show details
              className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] flex items-center cursor-pointer hover:bg-gray-100 transition-all"
            >
              <div className="flex-1">
                <p className="text-[var(--headline)] font-semibold line-through">{request.itemName}</p>
                <p className="text-sm text-[var(--paragraph)] line-through">Price: RM{request.price.toLocaleString()}</p>
                <p className="text-sm text-[var(--paragraph)] line-through">Vendor: {request.vendor}</p>
              </div>
              {/* Check icon for completed requests */}
              <div className="text-green-500">
                <FaCheckCircle className="w-5 h-5" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Purchase Request Card */}
      {selectedRequest && (
        <PurchaseRequestCard
          request={selectedRequest}
          onClose={handleCloseCard}
          onApprove={!selectedRequest.isCompleted ? handleApprove : undefined} // Pass approve handler only for pending requests
        />
      )}
    </div>
  );
};

export default PurchaseRequest;