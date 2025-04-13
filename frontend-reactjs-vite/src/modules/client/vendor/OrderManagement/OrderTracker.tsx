import React from "react";
import { useNavigate } from "react-router-dom";

const OrderTracker: React.FC = () => {
  const navigate = useNavigate();

  const orders = [
    { id: 1, name: "Milo", status: "Pending", charity: "Global Relief Organization" },
    { id: 2, name: "Mineral Water", status: "Processing", charity: "Helping Hands Foundation" },
    { id: 3, name: "Rice Bags", status: "Shipped", charity: "Food for All Initiative" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Processing":
        return "bg-blue-500";
      case "Shipped":
        return "bg-purple-500";
      case "Delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleViewDetails = () => {
    navigate("/vendor/order-tracker-details"); // Redirect to the detailed order tracker page
  };

  return (
    <div>
      {/* Single Title with Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[var(--headline)]">Order Tracker</h2>
        <button
          onClick={handleViewDetails}
          className="flex items-center justify-center w-10 h-10 bg-white text-[var(--highlight)] rounded-full shadow-md hover:opacity-90 transition-all"
        >
          →
        </button>
      </div>
      <table className="w-full border-collapse border border-[var(--stroke)]">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">Order Name</th>
            <th className="border-b p-2 text-left">Status</th>
            <th className="border-b p-2 text-left">Charity</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-[var(--card-hover)] transition-all">
              <td className="p-2">{order.name}</td>
              <td className="p-2">
                <span className={`px-2 py-1 text-white rounded ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="p-2">{order.charity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTracker;