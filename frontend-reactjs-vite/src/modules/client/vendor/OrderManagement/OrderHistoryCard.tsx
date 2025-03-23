import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const orders = [
  { id: 1, name: "Milo", quantity: 50, amount: "$150", date: "2025-03-01", charity: "Global Relief Organization" },
  { id: 2, name: "Mineral Water", quantity: 100, amount: "$200", date: "2025-03-05", charity: "Helping Hands Foundation" },
  { id: 3, name: "Rice Bags", quantity: 30, amount: "$300", date: "2025-03-10", charity: "Food for All Initiative" },
];

const OrderHistoryCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the order by id
  const order = orders.find((order) => order.id === parseInt(id || "", 10));

  if (!order) {
    return <p className="text-center text-[var(--paragraph)]">Order not found.</p>;
  }

  const handleBack = () => {
    navigate("/vendor/profile"); // Redirect to Vendor Profile
  };

  return (
    <div className="p-4 bg-[var(--background)] min-h-[calc(100vh-100px)] flex items-center justify-center">
      <div className="relative p-6 bg-[var(--main)] rounded-lg shadow-lg hover:shadow-xl transition-all max-w-md w-full">
        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--highlight)] opacity-20 rounded-bl-full"></div>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 flex items-center text-[var(--headline)] hover:underline"
        >
          <span className="mr-2">←</span> Back
        </button>

        {/* Order Details */}
        <h3 className="text-xl font-bold text-[var(--headline)] mb-4">{order.name}</h3>
        <p className="text-[var(--paragraph)]">
          <strong>Quantity:</strong> {order.quantity}
        </p>
        <p className="text-[var(--paragraph)]">
          <strong>Amount:</strong> {order.amount}
        </p>
        <p className="text-[var(--paragraph)]">
          <strong>Date:</strong> {order.date}
        </p>
        <p className="text-[var(--paragraph)]">
          <strong>Charity:</strong> {order.charity}
        </p>
      </div>
    </div>
  );
};

export default OrderHistoryCard;