import React from "react";
import { useNavigate } from "react-router-dom";

const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();

  const transactions = [
    { date: "2023-03-01", amount: "RM500", charity: "Clean Water Initiative", status: "Completed" },
    { date: "2023-03-05", amount: "RM300", charity: "Food for All", status: "Pending" },
    { date: "2023-03-10", amount: "RM700", charity: "Education First", status: "Completed" },
  ];

  const handleViewDetails = () => {
    navigate("/vendor/transaction-history-details"); // Redirect to TransactionHistoryDetails page
  };

  return (
    <div className="p-6 rounded-lg shadow-xl border border-[var(--stroke)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--headline)]">Transaction History</h2>
        <button
          onClick={handleViewDetails}
          className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          View Details →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[var(--stroke)]">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">Date</th>
              <th className="border-b p-2 text-left">Amount</th>
              <th className="border-b p-2 text-left">Charity</th>
              <th className="border-b p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={index}
                className="hover:bg-[var(--card-hover)] transition-all"
              >
                <td className="p-2 border-r border-[var(--stroke)]">{transaction.date}</td>
                <td className="p-2 border-r border-[var(--stroke)]">{transaction.amount}</td>
                <td className="p-2 border-r border-[var(--stroke)]">{transaction.charity}</td>
                <td className="p-2">{transaction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;