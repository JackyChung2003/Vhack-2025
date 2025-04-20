import React from 'react';
import CampaignTimeline from './CampaignTimeline';

const CampaignTimelineExample: React.FC = () => {
    // Example of using custom timeline events
    const customEvents = [
        {
            id: 'start',
            title: 'Project Initiated',
            date: 'Apr 10, 2023',
            icon: <span className="text-sm font-bold">1</span>,
            color: 'bg-purple-500',
            subItems: [
                { id: 'c1', text: 'Initial project plan created', emoji: '📝', date: 'Apr 12, 2023' },
                { id: 'c2', text: 'Budget allocated (RM10,000)', emoji: '💰', date: 'Apr 15, 2023' },
            ],
        },
        {
            id: 'implementation',
            title: 'Implementation Phase',
            date: 'May 5, 2023',
            icon: <span className="text-sm font-bold">2</span>,
            color: 'bg-blue-500',
            subItems: [
                { id: 'c3', text: 'Materials purchased (RM6,500)', emoji: '🛒', date: 'May 8, 2023' },
                { id: 'c4', text: 'Construction started', emoji: '🏗️', date: 'May 10, 2023' },
                { id: 'c5', text: 'Progress report submitted', emoji: '📊', date: 'May 20, 2023' },
            ],
        },
        {
            id: 'completion',
            title: 'Project Completed',
            date: 'Jun 15, 2023',
            icon: <span className="text-sm font-bold">3</span>,
            color: 'bg-green-500',
            subItems: [
                { id: 'c6', text: 'Final inspection conducted', emoji: '✅', date: 'Jun 16, 2023' },
                { id: 'c7', text: 'Handover ceremony', emoji: '🎉', date: 'Jun 20, 2023' },
                { id: 'c8', text: 'Final report published', emoji: '📄', date: 'Jun 25, 2023' },
            ],
        },
    ];

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Campaign Timeline Examples</h1>

            {/* Example with default data */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Default Timeline</h2>
                <CampaignTimeline />
            </div>

            {/* Example with custom data */}
            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Custom Timeline</h2>
                <CampaignTimeline
                    events={customEvents}
                    campaignName="Clean Water Initiative"
                />
            </div>
        </div>
    );
};

export default CampaignTimelineExample; 