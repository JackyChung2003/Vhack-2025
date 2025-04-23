import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaMoneyBillWave,
    FaCreditCard,
    FaCalendarAlt,
    FaArrowRight,
    FaHandHoldingHeart,
    FaBuilding,
    FaCoins,
    FaClock,
    FaChartLine
} from 'react-icons/fa';
import { mockDonorAutoDonations } from '../../../../utils/mockData';

/**
 * DonorDashboardDonationSummary component
 * A simplified version of the AutoDonation component for the dashboard
 * Shows key donation statistics and a limited list of active recurring donations
 */
const DonorDashboardDonationSummary: React.FC = () => {
    const navigate = useNavigate();

    // Filter out category-based donations
    const autoDonations = mockDonorAutoDonations.filter(donation =>
        donation.donationType === 'direct'
    );

    // Calculate summary information
    const totalActiveDonations = autoDonations.length;
    const totalMonthlyAmount = autoDonations.reduce((sum, donation) => {
        return sum + donation.amount;
    }, 0);

    // Total donated so far (mock calculation)
    const totalDonatedSoFar = autoDonations.reduce((sum, donation) => {
        // Count 3 months of donations for demo purposes
        const monthsActive = 3;
        return sum + (donation.amount * monthsActive);
    }, 0);

    // Find the closest upcoming donation date
    const getNextDonationDate = () => {
        if (autoDonations.length === 0) return null;

        const upcomingDates = autoDonations
            .filter(d => d.nextDonationDate)
            .map(d => new Date(d.nextDonationDate))
            .sort((a, b) => a.getTime() - b.getTime())
            .filter(date => date > new Date());

        return upcomingDates.length > 0 ? upcomingDates[0] : null;
    };

    const nextDonationDate = getNextDonationDate();

    // View all recurring donations
    const handleViewAllDonations = () => {
        navigate('/Vhack-2025/charity');
    };

    // View specific donation recipient
    const handleViewRecipient = (recipient: {
        id: number;
        type: 'campaign' | 'organization';
    }) => {
        if (recipient.type === 'campaign') {
            navigate(`/charity/${recipient.id}`);
        } else {
            navigate(`/charity/organization/${recipient.id}`);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-[var(--stroke)] h-full">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-[var(--headline)] flex items-center gap-2">
                    <FaMoneyBillWave className="text-[#F9A826]" />
                    Monthly Donations
                </h3>
            </div>

            {/* Stats Cards - simplified layout */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--stroke)]">
                    <div className="flex items-center gap-2 mb-1">
                        <FaCoins className="text-[#F9A826]" size={14} />
                        <span className="text-xs text-[var(--paragraph)]">Monthly</span>
                    </div>
                    <div className="font-bold text-[var(--headline)]">
                        RM{totalMonthlyAmount.toFixed(2)}
                    </div>
                </div>

                <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--stroke)]">
                    <div className="flex items-center gap-2 mb-1">
                        <FaChartLine className="text-[#F9A826]" size={14} />
                        <span className="text-xs text-[var(--paragraph)]">Total Impact</span>
                    </div>
                    <div className="font-bold text-[var(--headline)]">
                        RM{totalDonatedSoFar.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Next donation reminder */}
            {nextDonationDate && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <FaClock size={14} />
                    </div>
                    <div>
                        <div className="text-xs text-blue-600 font-medium">Next Donation</div>
                        <div className="text-sm text-blue-800 font-semibold flex items-center gap-1">
                            <FaCalendarAlt size={12} />
                            {nextDonationDate.toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}

            {/* Active donations - limited to 2 for dashboard */}
            {autoDonations.length > 0 ? (
                <div>
                    <h4 className="text-sm font-medium text-[var(--paragraph)] mb-2">Active Donations</h4>
                    <div className="space-y-2">
                        {autoDonations.slice(0, 2).map((donation) => (
                            <div
                                key={donation.id}
                                className="bg-[var(--background)] p-3 rounded-lg border border-[var(--stroke)] hover:border-[#F9A826] transition-colors cursor-pointer"
                                onClick={() => donation.directRecipient && handleViewRecipient(donation.directRecipient)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {donation.directRecipient?.type === 'campaign' ? (
                                            <div className="w-7 h-7 rounded-full bg-[#F9A826] bg-opacity-10 flex items-center justify-center">
                                                <FaHandHoldingHeart className="text-[#F9A826]" size={12} />
                                            </div>
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-[var(--secondary)] bg-opacity-10 flex items-center justify-center">
                                                <FaBuilding className="text-[var(--secondary)]" size={12} />
                                            </div>
                                        )}
                                        <div className="text-sm font-medium text-[var(--headline)] line-clamp-1">
                                            {donation.directRecipient?.name}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-[#F9A826]">RM{donation.amount}</span>
                                        <span className="text-xs text-[var(--paragraph)]">/mo</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="text-[var(--paragraph)]">
                                        Next: {new Date(donation.nextDonationDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1 text-green-500">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        Active
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Show count of additional donations if there are more than 2 */}
                        {autoDonations.length > 2 && (
                            <div
                                className="bg-[var(--background)] p-3 rounded-lg border border-dashed border-[var(--stroke)] flex justify-center items-center text-sm text-[var(--paragraph)] hover:bg-[var(--background-hover)] cursor-pointer transition-colors"
                                onClick={handleViewAllDonations}
                            >
                                +{autoDonations.length - 2} more donations
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto bg-[var(--background)] rounded-full flex items-center justify-center mb-2">
                        <FaCreditCard className="text-[var(--paragraph)] opacity-50" />
                    </div>
                    <p className="text-sm font-medium text-[var(--headline)] mb-1">No active donations</p>
                    <p className="text-xs text-[var(--paragraph)] mb-4">Set up recurring donations to support causes you care about.</p>
                    <button
                        onClick={() => navigate('/Vhack-2025/charity')}
                        className="text-sm bg-[#F9A826] text-white px-3 py-1.5 rounded-lg hover:bg-[#e69718] transition-colors"
                    >
                        Find Causes
                    </button>
                </div>
            )}
        </div>
    );
};

export default DonorDashboardDonationSummary; 