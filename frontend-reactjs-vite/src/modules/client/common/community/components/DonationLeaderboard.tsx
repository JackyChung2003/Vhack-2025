import React, { useState, useEffect } from "react";
import { FaTrophy, FaMedal, FaAward, FaSearch, FaSortAmountDown, FaSortAmountUp, FaChevronRight } from "react-icons/fa";

interface DonationLeaderboardProps {
  communityId: string | number;
  communityType: string;
  simplified?: boolean;
  onViewFullLeaderboard?: () => void;
  maxItems?: number;
}

interface Donor {
  id: number;
  name: string;
  amount: number;
  donations: number;
  lastDonation: string;
  avatar?: string;
}

const DonationLeaderboard: React.FC<DonationLeaderboardProps> = ({ 
  communityId, 
  communityType, 
  simplified = false,
  onViewFullLeaderboard,
  maxItems = 3
}) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalDonations, setTotalDonations] = useState(0);

  // Mock data - In a real app, fetch from your backend
  useEffect(() => {
    // Simulate API call
    const mockDonors: Donor[] = [
      { id: 1, name: "John Doe", amount: 5000, donations: 3, lastDonation: "2024-03-15" },
      { id: 2, name: "Jane Smith", amount: 3500, donations: 2, lastDonation: "2024-03-10" },
      { id: 3, name: "Robert Johnson", amount: 2800, donations: 1, lastDonation: "2024-03-05" },
      { id: 4, name: "Emily Davis", amount: 1500, donations: 1, lastDonation: "2024-02-28" },
      { id: 5, name: "Michael Wilson", amount: 1200, donations: 1, lastDonation: "2024-02-20" },
      { id: 6, name: "Sarah Brown", amount: 1000, donations: 1, lastDonation: "2024-02-15" },
      { id: 7, name: "David Miller", amount: 800, donations: 1, lastDonation: "2024-02-10" },
      { id: 8, name: "Lisa Anderson", amount: 500, donations: 1, lastDonation: "2024-02-05" },
    ];

    setDonors(mockDonors);
    setTotalDonations(mockDonors.reduce((sum, donor) => sum + donor.amount, 0));
  }, [communityId, communityType]);

  // Sort and filter donors
  const filteredDonors = donors
    .filter((donor) => simplified || donor.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "desc") {
        return b.amount - a.amount;
      } else {
        return a.amount - b.amount;
      }
    });

  // Limit the number of donors to display in simplified mode
  const displayDonors = simplified ? filteredDonors.slice(0, maxItems) : filteredDonors;

  // Get rank badge
  const getRankBadge = (index: number) => {
    if (index === 0) {
      return <FaTrophy className="text-[var(--highlight)]" />;
    } else if (index === 1) {
      return <FaMedal className="text-[var(--secondary)]" />;
    } else if (index === 2) {
      return <FaMedal className="text-[var(--tertiary)]" />;
    } else {
      return <span className="text-[var(--headline)] font-bold">{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {!simplified && (
        <div className="bg-[var(--main)] rounded-lg border border-[var(--stroke)] overflow-hidden p-4">
          <h3 className="text-xl font-bold text-[var(--headline)] mb-2">Top Donors</h3>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-[var(--paragraph)]">
              Total Donations: <span className="font-bold text-[var(--headline)]">RM{totalDonations.toLocaleString()}</span>
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="flex items-center gap-2 text-[var(--headline)] bg-[var(--background)] px-3 py-2 rounded-lg border border-[var(--stroke)] hover:bg-[var(--stroke)] transition-colors"
              >
                {sortOrder === "desc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
                Sort by Amount
              </button>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-[var(--paragraph)]" />
                </div>
                <input
                  type="text"
                  placeholder="Search donors..."
                  className="pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] bg-[var(--main)] text-[var(--headline)]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-[var(--main)] rounded-lg overflow-hidden  border-[var(--stroke)]">
        <table className="min-w-full divide-y divide-[var(--stroke)]">
          {!simplified && (
            <thead className="bg-[var(--background)]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[var(--headline)] uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[var(--headline)] uppercase tracking-wider">
                  Donor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[var(--headline)] uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[var(--headline)] uppercase tracking-wider hidden md:table-cell">
                  Donations
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[var(--headline)] uppercase tracking-wider hidden md:table-cell">
                  Last Donation
                </th>
              </tr>
            </thead>
          )}
          <tbody className="bg-[var(--main)] divide-y divide-[var(--stroke)]">
            {displayDonors.map((donor, index) => (
              <tr key={donor.id} className={index < 3 ? "bg-[var(--highlight)] bg-opacity-5" : ""}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--stroke)]">
                    {getRankBadge(index)}
                  </div>
                </td>
                <td className={`px-4 py-3 whitespace-nowrap ${simplified ? 'text-sm' : ''}`}>
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${simplified ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-[var(--tertiary)] text-white flex items-center justify-center font-bold`}>
                      {donor.avatar ? (
                        <img src={donor.avatar} alt={donor.name} className={`${simplified ? 'h-8 w-8' : 'h-10 w-10'} rounded-full`} />
                      ) : (
                        donor.name.charAt(0)
                      )}
                    </div>
                    <div className="ml-3">
                      <div className={`${simplified ? 'text-xs' : 'text-sm'} font-medium text-[var(--headline)]`}>
                        {donor.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-3 whitespace-nowrap ${simplified ? 'text-xs' : 'text-sm'}`}>
                  <div className="font-bold text-[var(--headline)]">RM{donor.amount.toLocaleString()}</div>
                </td>
                {!simplified && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-[var(--headline)]">{donor.donations} {donor.donations === 1 ? 'donation' : 'donations'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-[var(--headline)]">{new Date(donor.lastDonation).toLocaleDateString()}</div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {simplified && onViewFullLeaderboard && (
          <div className="p-3 border-t border-[var(--stroke)]">
            <button 
              onClick={onViewFullLeaderboard}
              className="w-full py-2 text-sm text-[var(--highlight)] hover:bg-[var(--background)] transition-colors rounded flex items-center justify-center gap-1"
            >
              View Full Leaderboard <FaChevronRight size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationLeaderboard; 