import React, { useState } from 'react';
import { FaTrophy, FaUser, FaHistory, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { DonationTracker as DonationTrackerType } from '../../utils/mockData';

interface SimpleLeaderboardProps {
    tracker: DonationTrackerType;
    className?: string;
    userDonorId?: number;
}

const SimpleLeaderboard: React.FC<SimpleLeaderboardProps> = ({
    tracker,
    className = '',
    userDonorId
}) => {
    const [showAllDonations, setShowAllDonations] = useState(false);

    // Get top donors and donations
    const topDonors = tracker.donations.topDonors;
    const visibleDonations = showAllDonations
        ? tracker.donations.timeline.daily
        : tracker.donations.timeline.daily.slice(0, 5);

    const hasMoreDonations = tracker.donations.timeline.daily.length > 5 && !showAllDonations;

    // Check if a donor is the current user
    const isCurrentUser = (donorId: number) => userDonorId === donorId;

    return (
        <div className={`bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-5 ${className}`}>
            <h2 className="text-xl font-bold text-[var(--headline)] flex items-center gap-2 mb-4">
                <FaTrophy className="text-[var(--highlight)]" />
                Donor Leaderboard
            </h2>

            {/* Top Donors List */}
            <div className="bg-[var(--background)] rounded-lg border border-[var(--stroke)] mb-6">
                <div className="p-3 border-b border-[var(--stroke)]">
                    <h3 className="font-medium text-[var(--headline)]">Top Donors</h3>
                </div>
                <div className="p-2">
                    {topDonors.map((donor, index) => {
                        const isUserDonor = isCurrentUser(donor.donorId);
                        return (
                            <div
                                key={donor.donorId}
                                className={`flex items-center justify-between p-2 rounded-lg ${isUserDonor ? 'bg-[var(--highlight)] bg-opacity-5' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--tertiary)] text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className={`font-medium ${isUserDonor ? 'text-[var(--highlight)]' : 'text-[var(--headline)]'}`}>
                                            {donor.name} {isUserDonor && <span className="text-xs">(You)</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold text-[var(--highlight)]">
                                    RM{donor.amount.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Donations */}
            <div>
                <h3 className="text-sm font-medium text-[var(--headline)] flex items-center gap-2 mb-3">
                    <FaHistory className="text-[var(--highlight)]" />
                    Recent Donations
                </h3>

                <div className="space-y-2">
                    {visibleDonations.map((donation) => {
                        const donor = topDonors.find(d =>
                            new Date(d.lastDonation).toISOString().split('T')[0] === donation.date
                        );
                        const isUserDonation = donor && isCurrentUser(donor.donorId);

                        return (
                            <div
                                key={donation.date}
                                className={`p-3 rounded-lg border ${isUserDonation
                                    ? 'border-[var(--highlight)] bg-[var(--highlight)] bg-opacity-5'
                                    : 'border-[var(--stroke)]'
                                    }`}
                            >
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUserDonation
                                            ? 'bg-[var(--highlight)] text-white'
                                            : 'bg-[var(--background)] text-[var(--highlight)]'
                                            }`}>
                                            {isUserDonation ? <FaUser size={12} /> : <FaCalendarAlt size={12} />}
                                        </div>
                                        <div>
                                            <div className={`text-sm font-medium ${isUserDonation ? 'text-[var(--highlight)]' : 'text-[var(--headline)]'
                                                }`}>
                                                RM{donation.amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-[var(--paragraph)]">
                                                {new Date(donation.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {donor?.name || 'Anonymous'} {isUserDonation && <span className="text-xs">(You)</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {hasMoreDonations && (
                        <button
                            onClick={() => setShowAllDonations(true)}
                            className="w-full py-2 text-sm text-[var(--highlight)] font-medium hover:underline"
                        >
                            Show More Donations
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimpleLeaderboard; 