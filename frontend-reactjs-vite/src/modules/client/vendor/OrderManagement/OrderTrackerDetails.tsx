import React from "react";
import { useNavigate } from "react-router-dom";

const OrderTrackerDetails: React.FC = () => {
  const navigate = useNavigate();

  const orders = [
    { id: 1, name: "Milo", status: "Pending", charity: "Global Relief Organization" },
    { id: 2, name: "Mineral Water", status: "Processing", charity: "Helping Hands Foundation" },
    { id: 3, name: "Rice Bags", status: "Shipped", charity: "Food for All Initiative" },
    { id: 4, name: "Cooking Oil", status: "Delivered", charity: "Charity Aid Network" },
    { id: 5, name: "Sugar", status: "Pending", charity: "Hope Foundation" },
    { id: 6, name: "Flour", status: "Processing", charity: "Global Relief Organization" },
    { id: 7, name: "Milk Powder", status: "Shipped", charity: "Helping Hands Foundation" },
    { id: 8, name: "Salt", status: "Delivered", charity: "Food for All Initiative" },
    { id: 9, name: "Tea Bags", status: "Pending", charity: "Charity Aid Network" },
    { id: 10, name: "Coffee", status: "Processing", charity: "Hope Foundation" },
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

  const handleBack = () => {
    navigate("/vendor/profile"); // Redirects back to Order Tracker
  };

  return (
    <div className="p-6 bg-[var(--background)]">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 bg-white text-[var(--highlight)] rounded-full shadow-md hover:opacity-90 transition-all mr-4"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold text-[var(--headline)]">Order Tracker Details</h2>
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
              <td className="p-2 border-r border-[var(--stroke)]">{order.name}</td>
              <td className="p-2 border-r border-[var(--stroke)]">
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

export default OrderTrackerDetails;