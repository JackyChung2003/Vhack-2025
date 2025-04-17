import React from 'react';
import { FaCalendarAlt, FaChartLine, FaFlag, FaMoneyBillWave, FaClock, FaFileInvoice, FaCheckCircle, FaReceipt, FaCamera, FaBox, FaTruck, FaHandHoldingUsd, FaTools, FaUsers } from 'react-icons/fa';

// Timeline entry represents any event in the timeline
interface TimelineEntry {
    id: string;
    date: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    color: string;
    type: 'milestone' | 'status' | 'activity';
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

    // If no entries provided, generate default entries including status items
    const generateDefaultEntries = (): TimelineEntry[] => {
        const defaultStartDate = startDate || "Jan 15, 2023";
        const defaultEntries: TimelineEntry[] = [
            {
                id: 'campaign-start',
                date: defaultStartDate,
                title: 'Campaign Started',
                description: 'Campaign was published and started accepting donations',
                icon: <FaCalendarAlt />,
                color: 'bg-blue-500',
                type: 'status',
                statusTag: {
                    text: 'Active',
                    color: 'bg-green-100 text-green-800'
                }
            },
            {
                id: 'quotation-water',
                date: 'Jan 16, 2023',
                title: 'Water Company Quotation',
                description: 'Received quotation for water supply equipment',
                icon: <FaFileInvoice />,
                color: 'bg-gray-500',
                type: 'activity',
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
                visualProof: {
                    type: 'image',
                    url: '/images/site-photos.jpg',
                    thumbnailUrl: '/thumbnails/site-photos.jpg'
                }
            },
            {
                id: '25-percent',
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
                id: 'quotation-transport',
                date: 'Mar 1, 2023',
                title: 'Transport Company Quotation',
                description: 'Received quotation for transportation services',
                icon: <FaFileInvoice />,
                color: 'bg-gray-500',
                type: 'activity',
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
                visualProof: {
                    type: 'document',
                    url: '/documents/receipt-transport.pdf'
                }
            },
            {
                id: '50-percent',
                date: 'Mar 20, 2023',
                title: '50% Funding Goal Reached',
                description: `Raised ${currentAmount && goalAmount ? `RM${(goalAmount * 0.5).toLocaleString()}` : 'RM5,000'} - 50% of the goal`,
                icon: <FaFlag />,
                color: 'bg-green-500',
                type: 'milestone',
                statusTag: {
                    text: 'Milestone',
                    color: 'bg-green-100 text-green-800'
                }
            },
            {
                id: 'quotation-medical',
                date: 'Mar 22, 2023',
                title: 'Medical Supplies Quotation',
                description: 'Received quotation for medical supplies',
                icon: <FaFileInvoice />,
                color: 'bg-gray-500',
                type: 'activity',
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
                color: 'bg-blue-600',
                type: 'activity',
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
                color: 'bg-[var(--highlight)]',
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
                color: 'bg-[var(--tertiary)]',
                type: 'status',
                statusTag: {
                    text: daysLeft !== undefined ? (daysLeft > 0 ? `${daysLeft} days left` : 'Ended') : 'Deadline',
                    color: daysLeft !== undefined ? (daysLeft > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 'bg-gray-100 text-gray-800'
                }
            });
        }

        // Sort entries by date
        return defaultEntries.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    };

    // Use provided entries or generate default ones
    const timelineEntries = entries || generateDefaultEntries();

    return (
        <div className={`bg-[var(--background)] rounded-lg p-4 ${className}`}>
            <h2 className="text-xl font-bold text-[var(--headline)] mb-2">Campaign Timeline</h2>
            <p className="text-[var(--paragraph)] text-sm mb-4">
                Track campaign progress, milestones, and activities
            </p>

            {timelineEntries.map((entry, index) => (
                <div key={entry.id} className="mb-6" data-testid={`timeline-entry-${index}`}>
                    <div className="flex">
                        {/* Left side - Date */}
                        <div className="text-sm text-blue-600 w-16 flex-shrink-0 font-normal">
                            {entry.date.split(' ')[0]} <br />
                            {entry.date.split(' ')[1]}
                        </div>

                        {/* Center - Circle icon */}
                        <div className="flex flex-col items-center mx-2 flex-shrink-0">
                            <div className={`${entry.color} w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm`}>
                                <span className="text-xs">{entry.icon}</span>
                            </div>
                            {/* Connect with line to next item if not the last one */}
                            {index < timelineEntries.length - 1 && (
                                <div className="w-0.5 bg-gray-300 h-full flex-grow my-1"></div>
                            )}
                        </div>

                        {/* Right side - Content */}
                        <div className="flex-grow pl-2">
                            {/* Title row with tags */}
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-base font-semibold text-[var(--headline)]">
                                    {entry.title}
                                </h3>

                                {/* Status tag */}
                                {entry.statusTag && entry.type === 'milestone' && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.statusTag.color}`}>
                                        {entry.statusTag.text}
                                    </span>
                                )}

                                {/* Amount */}
                                {entry.amount && (
                                    <span className="font-semibold text-orange-500">
                                        {typeof entry.amount === 'string' ? entry.amount : `RM${entry.amount.toLocaleString()}`}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            {entry.description && (
                                <p className="text-sm text-[var(--paragraph)] mb-2">
                                    {entry.description}
                                </p>
                            )}

                            {/* Visual proof documents or images */}
                            {entry.visualProof && (
                                <div>
                                    <div className="text-xs uppercase font-medium text-gray-500 mb-1">
                                        {entry.visualProof.type === 'image' ? 'PHOTO' : 'DOCUMENT'}
                                    </div>

                                    <div className="border border-gray-200 rounded overflow-hidden bg-white">
                                        {/* Thumbnail if available */}
                                        {entry.visualProof.thumbnailUrl && (
                                            <div>
                                                <img
                                                    src={entry.visualProof.thumbnailUrl}
                                                    alt="Thumbnail"
                                                    className="w-full object-cover h-16"
                                                />
                                            </div>
                                        )}

                                        {/* View document link */}
                                        <div className="px-4 py-2 flex justify-end border-t border-gray-100">
                                            <a
                                                href={entry.visualProof.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-orange-500 text-sm hover:underline flex items-center gap-1"
                                            >
                                                View {entry.visualProof.type === 'image' ? 'Photo' : 'Document'} →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CampaignTimeline; 