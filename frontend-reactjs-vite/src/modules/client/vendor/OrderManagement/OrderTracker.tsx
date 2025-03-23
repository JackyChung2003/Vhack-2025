import React from "react";

const OrderTracker: React.FC = () => {
  const orders = [
    { id: 1, name: "Milo", status: "Pending" },
    { id: 2, name: "Mineral Water", status: "Processing" },
    { id: 3, name: "Rice Bags", status: "Shipped" },
    { id: 4, name: "Cooking Oil", status: "Delivered" },
    { id: 5, name: "Sugar", status: "Pending" },
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

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="border-b p-2 text-left">Order Name</th>
          <th className="border-b p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr
            key={order.id}
            className="hover:bg-[var(--card-hover)] transition-all"
          >
            <td className="p-2">{order.name}</td>
            <td className="p-2">
              <span className={`px-2 py-1 text-white rounded ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTracker;