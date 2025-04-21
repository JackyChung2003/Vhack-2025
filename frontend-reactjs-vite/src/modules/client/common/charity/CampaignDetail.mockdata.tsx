// This is a reference implementation showing how to use DonorLeaderboardAndTracker with mock data
// Use this as a template when implementing with real Supabase data

import React from 'react';
import DonorLeaderboardAndTracker from '../../../../components/donation/DonorLeaderboardAndTracker';

/**
 * Example of how to use DonorLeaderboardAndTracker with mock data
 * This can serve as a reference for implementing with real data from Supabase
 */
const CampaignDetailMockData: React.FC = () => {
    // In a real implementation, this would be fetched from Supabase
    const campaign = {
        id: "123",
        title: "Example Campaign",
        current_amount: 10000
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Example Donor Leaderboard Implementation</h2>

            {/* Example implementation of DonorLeaderboardAndTracker */}
            <DonorLeaderboardAndTracker
                tracker={{
                    id: parseInt(campaign.id),
                    recipientId: parseInt(campaign.id),
                    recipientType: 'campaign',
                    donations: {
                        total: campaign.current_amount,
                        count: 45, // This would come from a real donor count
                        campaignSpecificTotal: Math.round(campaign.current_amount * 0.6), // Campaign-specific donations
                        alwaysDonateTotal: Math.round(campaign.current_amount * 0.4), // Always-donate donations
                        timeline: {
                            daily: [
                                // Mock donation history for display - in real app, would come from Supabase
                                { date: new Date().toISOString().split('T')[0], amount: Math.round(campaign.current_amount * 0.2), donationPolicy: 'campaign-specific' },
                                { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], amount: Math.round(campaign.current_amount * 0.1), donationPolicy: 'always-donate' },
                                { date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], amount: Math.round(campaign.current_amount * 0.15), donationPolicy: 'campaign-specific', isRecurring: true }
                            ],
                            weekly: [{ week: new Date().toISOString().split('T')[0].slice(0, 7) + '-W' + Math.ceil(new Date().getDate() / 7), amount: Math.round(campaign.current_amount * 0.5) }],
                            monthly: [{ month: new Date().toISOString().split('T')[0].slice(0, 7), amount: campaign.current_amount }]
                        },
                        topDonors: [
                            // Mock top donors for demonstration - would come from Supabase query
                            { donorId: 1, name: "Sarah Johnson", amount: Math.round(campaign.current_amount * 0.25), lastDonation: new Date(Date.now() - 2 * 86400000).toISOString() },
                            { donorId: 2, name: "Michael Chen", amount: Math.round(campaign.current_amount * 0.18), lastDonation: new Date(Date.now() - 3 * 86400000).toISOString() },
                            { donorId: 3, name: "Priya Sharma", amount: Math.round(campaign.current_amount * 0.15), lastDonation: new Date(Date.now() - 5 * 86400000).toISOString() },
                            { donorId: 4, name: "David Brown", amount: Math.round(campaign.current_amount * 0.10), lastDonation: new Date(Date.now() - 6 * 86400000).toISOString() },
                            { donorId: 5, name: "Emma Wilson", amount: Math.round(campaign.current_amount * 0.05), lastDonation: new Date(Date.now() - 7 * 86400000).toISOString() }
                        ]
                    }
                }}
                userDonorId={1} // Current user's donor ID (if they are a donor)
            />

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Integration Notes</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Replace the mock data with actual data from Supabase queries</li>
                    <li>For `topDonors`, query the donations table to find the top donors for this campaign</li>
                    <li>For timeline data, aggregate donations by day/week/month</li>
                    <li>Campaign-specific vs always-donate counts would come from donation records with their donation policy</li>
                    <li>Transaction counts can be obtained by counting the number of donations per user</li>
                    <li>Use the current user's ID for the `userDonorId` to highlight their position</li>
                </ul>
            </div>
        </div>
    );
};

export default CampaignDetailMockData; 