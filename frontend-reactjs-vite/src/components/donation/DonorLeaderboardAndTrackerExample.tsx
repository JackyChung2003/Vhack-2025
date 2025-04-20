import React from 'react';
import DonorLeaderboardAndTracker from './DonorLeaderboardAndTracker';
import { DonationTracker as DonationTrackerType } from '../../utils/mockData';

/**
 * Example component showing how to use the DonorLeaderboardAndTracker
 * This can be used in organization pages, campaign pages, or donor dashboards
 */
const DonorLeaderboardAndTrackerExample: React.FC = () => {
    // Normally you would fetch this tracker data from your API
    const exampleTracker: DonationTrackerType = {
        id: 1,
        recipientId: 123,
        recipientType: 'campaign',
        donations: {
            total: 10000,
            count: 45,
            campaignSpecificTotal: 6000, // 60% is campaign-specific
            alwaysDonateTotal: 4000, // 40% is always-donate
            timeline: {
                daily: [
                    {
                        date: '2025-03-20',
                        amount: 500,
                        donationPolicy: 'campaign-specific',
                        transactionHash: '0xab52c8df456e789012a3456f7890b1234c5d6e7f',
                        message: "Supporting this important cause!"
                    },
                    {
                        date: '2025-03-19',
                        amount: 300,
                        donationPolicy: 'always-donate',
                        transactionHash: '0xcd89e123a456b7890cde12345f6789ab01c2345d',
                        isRecurring: true
                    },
                    {
                        date: '2025-03-18',
                        amount: 200,
                        donationPolicy: 'campaign-specific',
                        transactionHash: '0xef12345a6789b0cde1234f5678a9b0c1d2e3f456'
                    },
                ],
                weekly: [
                    { week: '2025-W12', amount: 1500 },
                    { week: '2025-W11', amount: 1200 },
                ],
                monthly: [
                    { month: '2025-03', amount: 4500 },
                    { month: '2025-02', amount: 500 },
                ]
            },
            topDonors: [
                { donorId: 1, name: "John Doe", amount: 2500, lastDonation: "2025-03-20" },
                { donorId: 3, name: "Alice Johnson", amount: 1500, lastDonation: "2025-03-19" },
                { donorId: 4, name: "Robert Chen", amount: 800, lastDonation: "2025-03-17" },
                { donorId: 5, name: "Elena Garcia", amount: 600, lastDonation: "2025-03-13" },
                { donorId: 6, name: "Michael Wong", amount: 400, lastDonation: "2025-03-12" }
            ]
        }
    };

    // Mock user ID for the current user (if they are a donor)
    // In a real application, this would come from your auth context
    const currentUserDonorId = 3; // Example: Alice Johnson

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Top Donors & Donation Tracker</h1>

            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Combined Component Usage Example</h2>
                <DonorLeaderboardAndTracker
                    tracker={exampleTracker}
                    userDonorId={currentUserDonorId}
                />
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Usage Instructions</h2>
                <div className="bg-gray-100 rounded-lg p-4">
                    <p className="mb-2"><strong>Props:</strong></p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><code>tracker</code>: A DonationTrackerType object containing all donation and donor data</li>
                        <li><code>userDonorId</code>: Optional - The donor ID of the current user if they're a donor</li>
                        <li><code>className</code>: Optional - Additional CSS classes to apply to the component</li>
                    </ul>

                    <p className="mt-4 mb-2"><strong>Features:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Tabbed interface for Leaderboard, My Donations, and All Donations</li>
                        <li>Modern leaderboard with podium-style display for top 3 donors</li>
                        <li>Scrollable list for donors ranked 4+ with avatar placeholders</li>
                        <li>Donation policy breakdown for campaign-specific views</li>
                        <li>Detailed donation entries with expandable transaction information</li>
                        <li>Mobile-friendly and responsive design</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DonorLeaderboardAndTrackerExample; 