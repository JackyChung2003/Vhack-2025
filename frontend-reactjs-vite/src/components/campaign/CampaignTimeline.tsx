import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FaCalendarAlt, FaChartLine, FaFlag, FaMoneyBillWave, FaClock, FaFileInvoice, FaCheckCircle, FaReceipt, FaCamera, FaTruck, FaHandHoldingUsd, FaChevronDown, FaChevronUp, FaInfoCircle, FaTag, FaBox, FaTools, FaUsers, FaTags, FaLongArrowAltRight, FaCheck } from 'react-icons/fa';

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
                icon: <FaCheckCircle />,
                color: 'bg-blue-500',
                type: 'status',
                statusTag: {
                    text: 'First Event',
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
                    url: '/Vhack-2025/documents/quotation-water.pdf',
                    thumbnailUrl: '/Vhack-2025/thumbnails/quotation-water.jpg'
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
                    url: '/Vhack-2025/images/site-photos.jpg',
                    thumbnailUrl: '/Vhack-2025/thumbnails/site-photos.jpg'
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
                    url: '/Vhack-2025/documents/quotation-transport.pdf'
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
                    url: '/Vhack-2025/documents/receipt-transport.pdf'
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
                    url: '/Vhack-2025/documents/quotation-medical.pdf'
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
                    url: '/Vhack-2025/documents/receipt-medical.pdf'
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

    // Add this function to determine if the milestone is the current progress indicator
    const isCurrentProgressMilestone = (milestoneId: string) => {
        return milestoneId === 'current-progress';
    };

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

    // Reference for the timeline container
    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const timelineLineRef = useRef<HTMLDivElement>(null);
    const [lineHeight, setLineHeight] = useState<number | null>(null);

    // Effect to ensure the line is positioned after the component is rendered
    useEffect(() => {
        const updateLineHeight = () => {
            if (timelineContainerRef.current) {
                const container = timelineContainerRef.current;
                const firstCircle = container.querySelector('.first-milestone');
                const lastCircle = container.querySelector('.last-milestone');

                if (firstCircle && lastCircle) {
                    const firstCircleRect = firstCircle.getBoundingClientRect();
                    const lastCircleRect = lastCircle.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    // Calculate the center points of both circles relative to the container
                    const firstCircleCenter = firstCircleRect.top + (firstCircleRect.height / 2) - containerRect.top;
                    const lastCircleCenter = lastCircleRect.top + (lastCircleRect.height / 2) - containerRect.top;

                    // Set the exact height
                    setLineHeight(lastCircleCenter - firstCircleCenter);
                }
            }
        };

        // Update once on mount and whenever expanded milestones change
        updateLineHeight();

        // Add window resize listener to handle layout changes
        window.addEventListener('resize', updateLineHeight);

        return () => {
            window.removeEventListener('resize', updateLineHeight);
        };
    }, [expandedMilestones]);

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

            {/* Timeline container with positioned line */}
            <div className="relative" ref={timelineContainerRef}>
                {/* Timeline entries with vertical line */}
                <div className="space-y-4 relative">
                    {/* Main continuous vertical line - positioned to connect all events */}
                    {milestones.length > 0 && (
                        <div
                            ref={timelineLineRef}
                            className="absolute w-0.5 bg-gray-300 z-0"
                            style={{
                                left: '88px',
                                top: '26px',
                                height: lineHeight ? `${lineHeight}px` : '0'
                            }}
                        ></div>
                    )}

                    {/* Main entries */}
                    {milestones.map((milestone, index) => {
                        const hasRelatedActivities = !!groupedActivities[milestone.id]?.length;
                        const isExpanded = expandedMilestones[milestone.id] !== false; // Default to expanded
                        const isFirst = index === 0;
                        const isLast = index === milestones.length - 1 && !campaignStart;
                        const isCurrent = isCurrentProgressMilestone(milestone.id);

                        // Special styling for different milestone types
                        const isDeadline = milestone.id === 'deadline';

                        // Use different color style for different milestones based on the mockup
                        let bgColor = 'bg-orange-500';
                        let bgClass = 'bg-orange-50';
                        let borderClass = 'border-orange-100';

                        if (isDeadline) {
                            bgColor = 'bg-red-500';
                            bgClass = 'bg-red-50';
                            borderClass = 'border-red-100';
                        } else if (milestone.id.includes('current-progress')) {
                            bgColor = 'bg-orange-500';
                            bgClass = 'bg-orange-50';
                            borderClass = 'border-orange-100';
                        } else if (milestone.id.includes('50-percent')) {
                            bgColor = 'bg-green-500';
                            bgClass = 'bg-green-50';
                            borderClass = 'border-green-100';
                        } else if (milestone.id.includes('25-percent')) {
                            bgColor = 'bg-amber-500';
                            bgClass = 'bg-amber-50';
                            borderClass = 'border-amber-100';
                        }

                        return (
                            <div key={milestone.id} className="flex items-start group">
                                {/* Date column */}
                                <div className="w-[75px] text-right pr-4 mt-2 flex-shrink-0">
                                    <div className="flex flex-col items-end">
                                        <div className="text-blue-500 text-sm font-medium">
                                            {milestone.date.split(' ')[0]}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-gray-500 text-xs">
                                                {milestone.date.split(' ').slice(1).join(' ')}
                                            </div>
                                            {new Date(milestone.date).toDateString() === new Date().toDateString() && (
                                                <span className="mt-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                                                    Today
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Circle column - positioned for line to go through center */}
                                <div className="relative w-8 flex-shrink-0 flex justify-center">
                                    {/* Circle on timeline */}
                                    <div className={`relative w-8 h-8 mt-2 z-10 ${isFirst ? 'first-milestone' : ''} ${isLast ? 'last-milestone' : ''}`}>
                                        <div className={`${bgColor} w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 ${isCurrent ? 'border-blue-400 animate-pulse shadow-lg' : 'border-white'}`}>
                                            <span className="text-sm">{milestone.icon}</span>
                                        </div>
                                        {isCurrent && (
                                            <div className="absolute -inset-0.5 rounded-full border-2 border-blue-400 animate-ping opacity-85"></div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="ml-4 flex-1">
                                    <div className={`rounded-lg border overflow-hidden ${bgClass} ${isCurrent ? 'border-blue-300 shadow-md' : `border-${borderClass}`}`}>
                                        <div className={`p-3 ${bgClass}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="pr-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-gray-800 text-sm">{milestone.title}</h3>
                                                        {milestone.statusTag && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${milestone.statusTag.color}`}>
                                                                {milestone.statusTag.text}
                                                            </span>
                                                        )}
                                                        {isCurrent && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {milestone.id.includes('percent') ?
                                                            `Achieved on ${milestone.date}` :
                                                            milestone.description
                                                        }
                                                    </p>
                                                </div>

                                                {/* Only keep the toggle button for expandable content */}
                                                {hasRelatedActivities && (
                                                    <button
                                                        onClick={() => toggleMilestone(milestone.id)}
                                                        className={`${bgColor} text-white rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 shadow-sm hover:opacity-90 transition-all duration-200 ml-auto`}
                                                    >
                                                        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            <FaChevronDown size={10} />
                                                        </div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Related activities */}
                                        {hasRelatedActivities && isExpanded && (
                                            <div className={`border-t ${borderClass}`}>
                                                <div className="pl-6 relative py-3">
                                                    {/* Subtimeline vertical line */}
                                                    <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-400"></div>

                                                    {groupedActivities[milestone.id].map((activity, activityIndex) => {
                                                        const { icon, color } = getCategoryStyles(activity);

                                                        // Get colors for activity badges
                                                        let badgeClass = 'bg-gray-50';
                                                        let badgeTextClass = 'text-gray-700';
                                                        let badgeBorderClass = 'border-gray-200';

                                                        if (activity.category) {
                                                            switch (activity.category) {
                                                                case 'receipt':
                                                                    badgeClass = 'bg-teal-50';
                                                                    badgeTextClass = 'text-teal-700';
                                                                    badgeBorderClass = 'border-teal-200';
                                                                    break;
                                                                case 'delivery':
                                                                    badgeClass = 'bg-indigo-50';
                                                                    badgeTextClass = 'text-indigo-700';
                                                                    badgeBorderClass = 'border-indigo-200';
                                                                    break;
                                                                case 'quotation':
                                                                    badgeClass = 'bg-blue-50';
                                                                    badgeTextClass = 'text-blue-700';
                                                                    badgeBorderClass = 'border-blue-200';
                                                                    break;
                                                                case 'payment':
                                                                    badgeClass = 'bg-green-50';
                                                                    badgeTextClass = 'text-green-700';
                                                                    badgeBorderClass = 'border-green-200';
                                                                    break;
                                                                case 'photo':
                                                                    badgeClass = 'bg-purple-50';
                                                                    badgeTextClass = 'text-purple-700';
                                                                    badgeBorderClass = 'border-purple-200';
                                                                    break;
                                                            }
                                                        }

                                                        return (
                                                            <div key={activity.id} className="mb-3 last:mb-1">
                                                                <div className="relative">
                                                                    {/* Horizontal connector line */}
                                                                    <div className="absolute left-3 top-4 w-4 h-px bg-gray-400"></div>

                                                                    {/* Activity circle */}
                                                                    <div className="absolute left-3 top-4 -mt-1.5 -ml-1.5 z-10">
                                                                        <div className={`${color} w-3 h-3 rounded-full border border-white shadow-sm`}></div>
                                                                    </div>

                                                                    {/* Activity card */}
                                                                    <div className="ml-8 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                                        <div className="p-3">
                                                                            <div className="flex items-start gap-3">
                                                                                {/* Activity icon */}
                                                                                <div className={`${color} mr-2 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                                                                                    <span className="text-xs">{icon}</span>
                                                                                </div>

                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                                        <h4 className="text-sm font-semibold text-gray-800">
                                                                                            {activity.title}
                                                                                        </h4>

                                                                                        {activity.category && (
                                                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${badgeClass} ${badgeTextClass} ${badgeBorderClass}`}>
                                                                                                {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                                                                                            </span>
                                                                                        )}

                                                                                        {activity.amount && (
                                                                                            <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                                                                                {typeof activity.amount === 'string' ? activity.amount : `RM${activity.amount.toLocaleString()}`}
                                                                                            </span>
                                                                                        )}

                                                                                        {activity.statusTag && (
                                                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${activity.statusTag.color}`}>
                                                                                                {activity.statusTag.text}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="text-xs text-gray-500 mb-2 flex items-center">
                                                                                        <span>{activity.date}</span>
                                                                                        {new Date(activity.date).toDateString() === new Date().toDateString() && (
                                                                                            <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                                                                                                Today
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    {activity.description && (
                                                                                        <p className="text-xs text-gray-600 mb-2">
                                                                                            {activity.description}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Visual proof */}
                                                                            {activity.visualProof && (
                                                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                                                    {activity.visualProof.thumbnailUrl && (
                                                                                        <div className="mb-2 border rounded-md overflow-hidden bg-gray-50 shadow-sm">
                                                                                            <img
                                                                                                src={activity.visualProof.thumbnailUrl}
                                                                                                alt="Document thumbnail"
                                                                                                className="w-full object-cover h-20"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                    <a
                                                                                        href={activity.visualProof.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="inline-flex items-center px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors"
                                                                                    >
                                                                                        📎 View {activity.visualProof.type === 'image' ? 'Photo' : 'Document'} <FaLongArrowAltRight className="ml-1" size={10} />
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                        </div>
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
                            <div className="w-[75px] text-right pr-4 mt-2 flex-shrink-0">
                                <div className="flex flex-col items-end">
                                    <div className="text-blue-500 text-sm font-medium">
                                        {campaignStart.date.split(' ')[0]}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-gray-500 text-xs">
                                            {campaignStart.date.split(' ').slice(1).join(' ')}
                                        </div>
                                        {new Date(campaignStart.date).toDateString() === new Date().toDateString() && (
                                            <span className="mt-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                                                Today
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Circle column - positioned for line to go through center */}
                            <div className="relative w-8 flex-shrink-0 flex justify-center">
                                {/* Circle on timeline */}
                                <div className="relative w-8 h-8 mt-2 z-10 last-milestone">
                                    <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
                                        <FaCheckCircle className="text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="ml-4 flex-1">
                                <div className="bg-white rounded-lg border border-gray-100 p-4">
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