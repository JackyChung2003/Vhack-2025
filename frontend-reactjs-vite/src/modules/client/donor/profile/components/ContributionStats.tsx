import React from "react";
import { FaTrophy, FaChartLine, FaHandHoldingHeart } from "react-icons/fa";

const ContributionStats: React.FC = () => {
  // Mock stats data - In real app, fetch from backend
  const stats = {
    totalDonated: 15000,
    campaignsSupported: 12,
    topCampaign: "Clean Water Initiative",
    largestDonation: 2500,
    averageDonation: 1250,
    monthlyGrowth: 15
  };

  return (
    <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
      <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Contribution Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<FaHandHoldingHeart />}
          title="Largest Donation"
          value={`RM${stats.largestDonation}`}
        />
        <StatCard
          icon={<FaTrophy />}
          title="Top Campaign"
          value={stats.topCampaign}
        />
        <StatCard
          icon={<FaChartLine />}
          title="Monthly Growth"
          value={`${stats.monthlyGrowth}%`}
        />
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
}> = ({ icon, title, value }) => (
  <div className="bg-[var(--background)] p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2 text-[var(--highlight)]">
      {icon}
      <span className="font-semibold">{title}</span>
    </div>
    <p className="text-xl font-bold text-[var(--headline)]">{value}</p>
  </div>
);

export default ContributionStats; 