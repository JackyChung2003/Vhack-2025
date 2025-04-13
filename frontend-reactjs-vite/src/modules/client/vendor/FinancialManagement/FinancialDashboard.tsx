import React from "react";

const FinancialDashboard: React.FC = () => {
  const totalEarnings = {
    allTime: "RM120,000",
    monthly: "RM10,000",
    weekly: "RM2,500",
  };

  return (
    <div className="p-6 rounded-lg shadow-xl border border-[var(--stroke)]">
      <h2 className="text-2xl font-bold text-[var(--headline)] mb-6">Financial Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-lg shadow-md border border-[var(--card-border)] hover:bg-[var(--background)] transition-all">
          <h3 className="text-lg font-semibold text-[var(--headline)]">All-Time Earnings</h3>
          <p className="text-2xl font-bold text-[var(--highlight)]">{totalEarnings.allTime}</p>
        </div>
        <div className="p-4 rounded-lg shadow-md border border-[var(--card-border)] hover:bg-[var(--background)] transition-all">
          <h3 className="text-lg font-semibold text-[var(--headline)]">Monthly Earnings</h3>
          <p className="text-2xl font-bold text-[var(--highlight)]">{totalEarnings.monthly}</p>
        </div>
        <div className="p-4 rounded-lg shadow-md border border-[var(--card-border)] hover:bg-[var(--background)] transition-all">
          <h3 className="text-lg font-semibold text-[var(--headline)]">Weekly Earnings</h3>
          <p className="text-2xl font-bold text-[var(--highlight)]">{totalEarnings.weekly}</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;