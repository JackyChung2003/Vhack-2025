import React from "react";
import { useNavigate } from "react-router-dom";

const OrderHistoryDetails: React.FC = () => {
  const navigate = useNavigate();

  const orders = [
    { id: 1, name: "Milo", quantity: 50, amount: "$150", date: "2025-03-01", charity: "Global Relief Organization" },
    { id: 2, name: "Mineral Water", quantity: 100, amount: "$200", date: "2025-03-05", charity: "Helping Hands Foundation" },
    { id: 3, name: "Rice Bags", quantity: 30, amount: "$300", date: "2025-03-10", charity: "Food for All Initiative" },
    { id: 4, name: "Cooking Oil", quantity: 20, amount: "$400", date: "2025-03-15", charity: "Charity Aid Network" },
    { id: 5, name: "Sugar", quantity: 40, amount: "$250", date: "2025-03-20", charity: "Hope Foundation" },
    { id: 6, name: "Flour", quantity: 60, amount: "$350", date: "2025-03-25", charity: "Global Relief Organization" },
    { id: 7, name: "Milk Powder", quantity: 25, amount: "$500", date: "2025-03-30", charity: "Helping Hands Foundation" },
    { id: 8, name: "Salt", quantity: 70, amount: "$100", date: "2025-04-01", charity: "Food for All Initiative" },
    { id: 9, name: "Tea Bags", quantity: 15, amount: "$120", date: "2025-04-05", charity: "Charity Aid Network" },
    { id: 10, name: "Coffee", quantity: 10, amount: "$80", date: "2025-04-10", charity: "Hope Foundation" },
  ];

  const handleBack = () => {
    navigate("/vendor/profile"); // Redirects to the vendor profile page
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
        <h2 className="text-2xl font-bold text-[var(--headline)]">Order History Details</h2>
      </div>
      <table className="w-full border-collapse border border-[var(--stroke)]">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">Order Name</th>
            <th className="border-b p-2 text-left">Quantity</th>
            <th className="border-b p-2 text-left">Amount</th>
            <th className="border-b p-2 text-left">Date</th>
            <th className="border-b p-2 text-left">Charity</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-[var(--card-hover)] transition-all">
              <td className="p-2">{order.name}</td>
              <td className="p-2">{order.quantity}</td>
              <td className="p-2">{order.amount}</td>
              <td className="p-2">{order.date}</td>
              <td className="p-2">{order.charity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistoryDetails;