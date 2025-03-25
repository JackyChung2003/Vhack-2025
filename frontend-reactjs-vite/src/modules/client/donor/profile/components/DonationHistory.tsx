import React from "react";
import { FaMoneyBillWave, FaCalendarAlt, FaExternalLinkAlt } from "react-icons/fa";

const DonationHistory: React.FC = () => {
  // Mock donation data
  const donations = [
    {
      id: 1,
      campaign: "Clean Water Initiative",
      amount: 1000,
      date: "2024-03-15",
      status: "completed",
      transactionHash: "0x123...",
    },
    // Add more mock donations...
  ];

  return (
    <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
      <div className="p-6 border-b border-[var(--stroke)]">
        <h2 className="text-xl font-bold text-[var(--headline)]">Donation History</h2>
      </div>
      <div className="divide-y divide-[var(--stroke)]">
        {donations.map((donation) => (
          <div key={donation.id} className="p-6 hover:bg-[var(--background)] transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-[var(--headline)]">{donation.campaign}</h3>
              <span className="text-[var(--highlight)] font-bold">${donation.amount}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--paragraph)]">
              <span className="flex items-center gap-1">
                <FaCalendarAlt />
                {new Date(donation.date).toLocaleDateString()}
              </span>
              <a
                href={`https://etherscan.io/tx/${donation.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-[var(--highlight)]"
              >
                <FaExternalLinkAlt />
                View Transaction
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationHistory; 