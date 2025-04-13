import React from "react";
import { useNavigate } from "react-router-dom";

const TransactionHistoryDetails: React.FC = () => {
  const navigate = useNavigate();

  const transactions = [
    { date: "2023-03-01", amount: "RM500", charity: "Clean Water Initiative", status: "Completed" },
    { date: "2023-03-05", amount: "RM300", charity: "Food for All", status: "Pending" },
    { date: "2023-03-10", amount: "RM700", charity: "Education First", status: "Completed" },
    { date: "2023-03-15", amount: "RM200", charity: "Health Matters", status: "Failed" },
    { date: "2023-03-20", amount: "RM1,000", charity: "Clean Water Initiative", status: "Completed" },
    { date: "2023-03-25", amount: "RM400", charity: "Food for All", status: "Pending" },
    { date: "2023-03-30", amount: "RM600", charity: "Education First", status: "Completed" },
    { date: "2023-04-01", amount: "RM800", charity: "Health Matters", status: "Failed" },
    { date: "2023-04-05", amount: "RM1,200", charity: "Clean Water Initiative", status: "Completed" },
    { date: "2023-04-10", amount: "RM900", charity: "Food for All", status: "Pending" },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleBackToVendorProfile = () => {
    navigate("/vendor/profile"); // Redirect back to VendorProfile page
  };

  return (
    <div className="p-6 rounded-lg shadow-xl border border-[var(--stroke)]">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBackToVendorProfile}
          className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-[var(--headline)]">Transaction History Details</h2>
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
                <td className={`p-2 rounded-full text-center ${getStatusClass(transaction.status)}`}>
                  {transaction.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistoryDetails;