import React, { useState, useCallback } from 'react';
import { FaCalendarAlt, FaChartLine, FaFlag, FaMoneyBillWave, FaClock, FaFileInvoice, FaCheckCircle, FaReceipt, FaCamera, FaTruck, FaHandHoldingUsd, FaChevronDown, FaChevronUp, FaInfoCircle, FaTag, FaBox, FaTools, FaUsers, FaTags, FaLongArrowAltRight } from 'react-icons/fa';

// Timeline entry represents any event in the timeline
interface TimelineEntry {
    id: string;
    date: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    color: string;
    type: 'milestone' | 'status' | 'activity';
    category?: 'quotation' | 'payment' | 'receipt' | 'delivery' | 'photo' | 'other';
    relatedTo?: string; // ID of a milestone this entry is related to
    statusTag?: {
        text: string;
        color: string;
    };
    visualProof?: {
        type: 'image' | 'document';
        url: string;
        thumbnailUrl?: string;
    };
    amount?: string | number;
}

interface CampaignTimelineProps {
    entries?: TimelineEntry[];
    campaignName?: string;
    className?: string;
    // Campaign status props for calculating progress
    currentAmount?: number;
    goalAmount?: number;
    deadline?: string;
    daysLeft?: number;
    startDate?: string;
}

const CampaignTimeline: React.FC<CampaignTimelineProps> = ({
    entries,
    campaignName = "Water for Rural Villages",
    className = "",
    currentAmount,
    goalAmount,
    deadline,
    daysLeft,
    startDate
}) => {
    // Calculate progress percentage
    const progressPercentage = currentAmount && goalAmount
        ? Math.min(Math.round((currentAmount / goalAmount) * 100), 100)
        : 0;

    // State to track which milestone sections are expanded
    const [expandedMilestones, setExpandedMilestones] = useState<{ [key: string]: boolean }>({});

    // Toggle function for expanding/collapsing milestone sections
    const toggleMilestone = useCallback((milestoneId: string) => {
        setExpandedMilestones(prev => ({
            ...prev,
            [milestoneId]: !prev[milestoneId]
        }));
    }, []);

    // Get icon and color based on event category
    const getCategoryStyles = (entry: TimelineEntry) => {
        // Default styling
        let iconComponent = entry.icon;
        let bgColor = entry.color;

        // Override with category-specific styling if available
        if (entry.category) {
            switch (entry.category) {
                case 'quotation':
                    iconComponent = <FaFileInvoice />;
                    bgColor = 'bg-blue-500';
                    break;
                case 'payment':
                    iconComponent = <FaHandHoldingUsd />;
                    bgColor = 'bg-green-600';
                    break;
                case 'receipt':
                    iconComponent = <FaReceipt />;
                    bgColor = 'bg-teal-500';
                    break;
                case 'delivery':
                    iconComponent = <FaTruck />;
                    bgColor = 'bg-indigo-600';
                    break;
                case 'photo':
                    iconComponent = <FaCamera />;
                    bgColor = 'bg-purple-500';
                    break;
                default:
                    break;
            }
        }

        return { icon: iconComponent, color: bgColor };
    };

    // If no entries provided, generate default entries including status items
    const generateDefaultEntries = (): TimelineEntry[] => {
        const defaultStartDate = startDate || "Jan 15, 2023";
        const defaultEntries: TimelineEntry[] = [
            {
                id: 'campaign-start',
                date: defaultStartDate,
                title: 'Campaign Started',
                description: 'Campaign was published and started accepting donations',
                icon: <FaFlag />,
                color: 'bg-blue-500',
                type: 'status',
                statusTag: {
                    text: 'Active',
                    color: 'bg-green-100 text-green-800'
                }
            },
            {
                id: '25-percent-milestone',
                date: 'Feb 28, 2023',
                title: '25% Funding Goal Reached',
                description: `Raised ${currentAmount && goalAmount ? `RM${(goalAmount * 0.25).toLocaleString()}` : 'RM2,500'} - 25% of the goal`,
                icon: <FaChartLine />,
                color: 'bg-amber-500',
                type: 'milestone',
                statusTag: {
                    text: 'Milestone',
                    color: 'bg-amber-100 text-amber-800'
                }
            },
            {
                id: 'quotation-water',
                date: 'Jan 16, 2023',
                title: 'Water Company Quotation',
                description: 'Received quotation for water supply equipment',
                icon: <FaFileInvoice />,
                color: 'bg-blue-500',
                type: 'activity',
                category: 'quotation',
                relatedTo: '25-percent-milestone',
                amount: 'RM5,000',
                visualProof: {
                    type: 'document',
                    url: '/documents/quotation-water.pdf',
                    thumbnailUrl: '/thumbnails/quotation-water.jpg'
                }
            },
            {
                id: 'site-photos',
                date: 'Jan 17, 2023',
                title: 'Site Photos Uploaded',
                description: 'Initial site assessment photos',
                icon: <FaCamera />,
                color: 'bg-purple-500',
                type: 'activity',
                category: 'photo',
                relatedTo: '25-percent-milestone',
                visualProof: {
                    type: 'image',
                    url: '/images/site-photos.jpg',
                    thumbnailUrl: '/thumbnails/site-photos.jpg'
                }
            },
            {
                id: '50-percent-milestone',
                date: 'Mar 20, 2023',
                title: '50% Funding Goal Reached',
                description: `Raised ${currentAmount && goalAmount ? `RM${(goalAmount * 0.5).toLocaleString()}` : 'RM5,000'} - 50% of the goal`,
                icon: <FaChartLine />,
                color: 'bg-green-500',
                type: 'milestone',
                statusTag: {
                    text: 'Milestone',
                    color: 'bg-green-100 text-green-800'
                }
            },
            {
                id: 'quotation-transport',
                date: 'Mar 1, 2023',
                title: 'Transport Company Quotation',
                description: 'Received quotation for transportation services',
                icon: <FaFileInvoice />,
                color: 'bg-blue-500',
                type: 'activity',
                category: 'quotation',
                relatedTo: '50-percent-milestone',
                amount: 'RM1,500',
                visualProof: {
                    type: 'document',
                    url: '/documents/quotation-transport.pdf'
                }
            },
            {
                id: 'payment-transport',
                date: 'Mar 5, 2023',
                title: 'Transport Payment Made',
                description: 'Payment to transport company for initial logistics',
                icon: <FaHandHoldingUsd />,
                color: 'bg-green-600',
                type: 'activity',
                category: 'payment',
                relatedTo: '50-percent-milestone',
                amount: 'RM1,500'
            },
            {
                id: 'receipt-transport',
                date: 'Mar 6, 2023',
                title: 'Transport Receipt Uploaded',
                description: 'Receipt from transport company confirmed',
                icon: <FaReceipt />,
                color: 'bg-teal-500',
                type: 'activity',
                category: 'receipt',
                relatedTo: '50-percent-milestone',
                visualProof: {
                    type: 'document',
                    url: '/documents/receipt-transport.pdf'
                }
            },
            {
                id: 'quotation-medical',
                date: 'Mar 22, 2023',
                title: 'Medical Supplies Quotation',
                description: 'Received quotation for medical supplies',
                icon: <FaFileInvoice />,
                color: 'bg-blue-500',
                type: 'activity',
                category: 'quotation',
                relatedTo: '50-percent-milestone',
                amount: 'RM3,500',
                visualProof: {
                    type: 'document',
                    url: '/documents/quotation-medical.pdf'
                }
            },
            {
                id: 'delivery-confirmed',
                date: 'Mar 28, 2023',
                title: 'Delivery Confirmed',
                description: 'Medical supplies delivered to site',
                icon: <FaTruck />,
                color: 'bg-indigo-600',
                type: 'activity',
                category: 'delivery',
                relatedTo: '50-percent-milestone',
                statusTag: {
                    text: 'Completed',
                    color: 'bg-blue-100 text-blue-800'
                }
            },
            {
                id: 'receipt-medical',
                date: 'Mar 30, 2023',
                title: 'Medical Supplies Receipt',
                description: 'Receipt from medical supplier confirmed',
                icon: <FaReceipt />,
                color: 'bg-teal-500',
                type: 'activity',
                category: 'receipt',
                relatedTo: '50-percent-milestone',
                visualProof: {
                    type: 'document',
                    url: '/documents/receipt-medical.pdf'
                }
            }
        ];

        // Add campaign progress entry based on current progress
        if (currentAmount && goalAmount) {
            defaultEntries.push({
                id: 'current-progress',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                title: `Current Progress: ${progressPercentage}%`,
                description: `RM${currentAmount.toLocaleString()} raised of RM${goalAmount.toLocaleString()} goal`,
                icon: <FaMoneyBillWave />,
                color: 'bg-orange-500',
                type: 'status'
            });
        }

        // Add deadline entry if available
        if (deadline) {
            defaultEntries.push({
                id: 'deadline',
                date: deadline,
                title: 'Campaign Deadline',
                description: daysLeft !== undefined ? (daysLeft > 0 ? `${daysLeft} days remaining` : 'Campaign ended') : '',
                icon: <FaClock />,
                color: 'bg-red-500',
                type: 'status',
                statusTag: {
                    text: daysLeft !== undefined ? (daysLeft > 0 ? `${daysLeft} days left` : 'Ended') : 'Deadline',
                    color: daysLeft !== undefined ? (daysLeft > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 'bg-gray-100 text-gray-800'
                }
            });
        }

        return defaultEntries;
    };

    // Use provided entries or generate default ones
    const allTimelineEntries = entries || generateDefaultEntries();

    // Sort entries so most recent comes first, but keep Campaign Started at the bottom
    const timelineEntries = [...allTimelineEntries].sort((a, b) => {
        // Special case: Always keep "campaign-start" at the bottom
        if (a.id === 'campaign-start') return 1;
        if (b.id === 'campaign-start') return -1;

        // Otherwise sort by date, most recent first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Organize entries by milestones and categories
    const milestones = timelineEntries.filter(entry => entry.type === 'milestone' || (entry.type === 'status' && entry.id !== 'campaign-start'));
    const campaignStart = timelineEntries.find(entry => entry.id === 'campaign-start');

    // Group related activities by their milestone
    const groupedActivities: { [key: string]: TimelineEntry[] } = {};

    timelineEntries.forEach(entry => {
        if (entry.relatedTo && entry.type === 'activity') {
            if (!groupedActivities[entry.relatedTo]) {
                groupedActivities[entry.relatedTo] = [];
            }
            groupedActivities[entry.relatedTo].push(entry);
        }
    });

    // Sort activities within each group by date (newest first)
    Object.keys(groupedActivities).forEach(milestoneId => {
        groupedActivities[milestoneId].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    });

    return (
        <div className={`bg-[var(--background)] rounded-lg p-4 ${className}`}>
            <h2 className="text-xl font-bold text-[var(--headline)] mb-2">Campaign Timeline</h2>
            <div className="flex items-center gap-2 mb-4">
                <p className="text-[var(--paragraph)] text-sm">
                    Latest campaign updates and activities
                </p>
                <div className="flex-grow"></div>
                <div className="flex items-center gap-2 text-xs text-[var(--paragraph)]">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        <span>Milestone</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span>Quotation</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-600"></span>
                        <span>Payment</span>
                    </div>
                </div>
            </div>

            {/* Timeline entries */}
            <div className="relative pl-4">
                {/* Vertical timeline line */}
                <div className="absolute left-20 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

                <div className="space-y-8">
                    {/* Main entries */}
                    {milestones.map((milestone, index) => {
                        const hasRelatedActivities = !!groupedActivities[milestone.id]?.length;
                        const isExpanded = expandedMilestones[milestone.id] !== false; // Default to expanded

                        // Special handling for deadline
                        const isDeadline = milestone.id === 'deadline';

                        // Use different color style for different milestones based on the mockup
                        let bgColor = milestone.id.includes('current-progress') ? 'bg-orange-500' :
                            milestone.id.includes('deadline') ? 'bg-red-500' :
                                milestone.id.includes('50-percent') ? 'bg-green-500' :
                                    milestone.id.includes('25-percent') ? 'bg-amber-500' :
                                        'bg-blue-500';

                        return (
                            <div key={milestone.id} className={`flex items-start ${isDeadline ? 'opacity-90' : ''}`}>
                                {/* Date column */}
                                <div className="w-16 text-right pr-4 mt-4">
                                    <div className="text-blue-500 text-sm font-medium">{milestone.date.split(' ')[0]}</div>
                                    <div className="text-gray-500 text-xs">{milestone.date.split(' ').slice(1).join(' ')}</div>
                                </div>

                                {/* Circle on timeline */}
                                <div className="relative">
                                    <div className={`${bgColor} w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm z-10`}>
                                        <span className="text-sm">{milestone.icon}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="ml-4 flex-1">
                                    <div className={`rounded-lg overflow-hidden shadow-sm ${isDeadline ? 'bg-red-100' : (milestone.id === 'current-progress' ? 'bg-orange-100' : 'bg-white')}`}>
                                        <div className={`p-3 ${isDeadline ? 'bg-red-100' : (milestone.id === 'current-progress' ? 'bg-orange-100' : 'bg-white')}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-800">{milestone.title}</h3>
                                                        {milestone.statusTag && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${milestone.statusTag.color}`}>
                                                                {milestone.statusTag.text}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {milestone.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {milestone.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Toggle button for expandable content */}
                                                {hasRelatedActivities && (
                                                    <button
                                                        onClick={() => toggleMilestone(milestone.id)}
                                                        className={`${bgColor} text-white rounded-full p-1 ml-2 h-6 w-6 flex items-center justify-center flex-shrink-0`}
                                                    >
                                                        {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                                    </button>
                                                )}

                                                {/* Progress bar for milestone entries */}
                                                {milestone.id.includes('percent') && (
                                                    <div className="ml-4 w-24 hidden md:block">
                                                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${bgColor}`}
                                                                style={{ width: milestone.id.split('-')[0] + '%' }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Related activities */}
                                        {hasRelatedActivities && isExpanded && (
                                            <div className="border-t border-gray-100">
                                                <div className="p-3 space-y-3">
                                                    {groupedActivities[milestone.id].map((activity) => {
                                                        const { icon, color } = getCategoryStyles(activity);

                                                        return (
                                                            <div key={activity.id} className="ml-2">
                                                                <div className="flex items-start">
                                                                    <div className={`mt-1 ${color} w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                                                                        <span className="text-xs">{icon}</span>
                                                                    </div>

                                                                    <div className="ml-3 flex-1">
                                                                        <div className="flex items-center flex-wrap gap-2">
                                                                            <h4 className="text-sm font-medium text-gray-800">
                                                                                {activity.title}
                                                                            </h4>

                                                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                                                {activity.category?.charAt(0).toUpperCase() + activity.category?.slice(1)}
                                                                            </span>

                                                                            {activity.amount && (
                                                                                <span className="text-xs font-semibold text-green-600">
                                                                                    {typeof activity.amount === 'string' ? activity.amount : `RM${activity.amount.toLocaleString()}`}
                                                                                </span>
                                                                            )}

                                                                            {activity.statusTag && (
                                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activity.statusTag.color}`}>
                                                                                    {activity.statusTag.text}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            {activity.date}
                                                                        </div>

                                                                        {activity.description && (
                                                                            <p className="text-xs text-gray-600 mt-1">
                                                                                {activity.description}
                                                                            </p>
                                                                        )}

                                                                        {/* Visual proof with simple display */}
                                                                        {activity.visualProof && (
                                                                            <div className="mt-2 border border-gray-100 rounded overflow-hidden bg-gray-50 max-w-xs">
                                                                                {activity.visualProof.thumbnailUrl && (
                                                                                    <img
                                                                                        src={activity.visualProof.thumbnailUrl}
                                                                                        alt="Document thumbnail"
                                                                                        className="w-full object-cover h-12"
                                                                                    />
                                                                                )}
                                                                                <div className="px-2 py-1 flex justify-between items-center">
                                                                                    <span className="text-xs text-gray-500">
                                                                                        {activity.visualProof.type === 'image' ? 'Photo' : 'Document'}
                                                                                    </span>
                                                                                    <a
                                                                                        href={activity.visualProof.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="text-blue-500 text-xs flex items-center"
                                                                                    >
                                                                                        View <FaLongArrowAltRight className="ml-1" />
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Campaign Start */}
                    {campaignStart && (
                        <div className="flex items-start">
                            {/* Date column */}
                            <div className="w-16 text-right pr-4 mt-4">
                                <div className="text-blue-500 text-sm font-medium">{campaignStart.date.split(' ')[0]}</div>
                                <div className="text-gray-500 text-xs">{campaignStart.date.split(' ').slice(1).join(' ')}</div>
                            </div>

                            {/* Circle on timeline */}
                            <div className="relative">
                                <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm z-10">
                                    <FaFlag className="text-sm" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="ml-4 flex-1">
                                <div className="bg-white rounded-lg overflow-hidden shadow-sm p-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-800">Campaign Started</h3>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">
                                            First Event
                                        </span>
                                    </div>
                                    {campaignStart.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {campaignStart.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignTimeline; 