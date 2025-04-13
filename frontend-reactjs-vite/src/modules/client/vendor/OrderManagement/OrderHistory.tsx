import React from "react";
import { useNavigate } from "react-router-dom";

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();

  const orders = [
    { id: 1, name: "Milo", date: "2025-03-01", total: "$150" },
    { id: 2, name: "Mineral Water", date: "2025-03-05", total: "$200" },
    { id: 3, name: "Rice Bags", date: "2025-03-10", total: "$300" },
  ];

  const handleViewOrder = (id: number) => {
    navigate(`/vendor/order-history/${id}`); // Redirect to the specific order details
  };

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li
          key={order.id}
          className="flex justify-between items-center bg-[var(--card-background)] p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all relative"
        >
          {/* Decorative Element for Each Card */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--highlight)] opacity-10 rounded-bl-full"></div>

          <div>
            <p className="font-semibold text-[var(--headline)]">{order.name}</p>
            <p className="text-sm text-[var(--paragraph)]">{order.date}</p>
            <p className="text-sm text-[var(--paragraph)]">{order.total}</p>
          </div>
          <button
            onClick={() => handleViewOrder(order.id)}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all"
          >
            View
          </button>
        </li>
      ))}
    </ul>
  );
};

export default OrderHistory;