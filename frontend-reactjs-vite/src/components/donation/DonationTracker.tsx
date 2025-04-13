import React, { useState } from 'react';
import { FaHistory, FaCalendarAlt, FaExternalLinkAlt, FaUser, FaReceipt, FaInfoCircle, FaSync, FaLock, FaHandHoldingHeart, FaExchangeAlt, FaComments } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { DonationTracker as DonationTrackerType } from '../../utils/mockData';

interface DonationTrackerProps {
  tracker: DonationTrackerType;
  className?: string;
}

interface TimelineEntry {
  date: string;
  amount: number;
  donorName?: string;
  transactionHash?: string;
  message?: string;
  isRecurring?: boolean;
  donationPolicy?: 'always-donate' | 'campaign-specific';
}

const DonationTracker: React.FC<DonationTrackerProps> = ({ tracker, className = '' }) => {
  const [expandedDonationId, setExpandedDonationId] = useState<string | null>(null);
  const [showAllDonations, setShowAllDonations] = useState<boolean>(false);

  // Number of donations to show initially
  const initialDisplayCount = 5;

  const formatTimelineEntry = (entry: TimelineEntry) => {
    const date = new Date(entry.date);
    return {
      ...entry,
      formattedDate: date.toLocaleDateString(),
      formattedTime: date.toLocaleTimeString(),
    };
  };

  const isCampaign = tracker.recipientType === 'campaign';
  const visibleDonations = showAllDonations 
    ? tracker.donations.timeline.daily 
    : tracker.donations.timeline.daily.slice(0, initialDisplayCount);
  const hasMoreDonations = tracker.donations.timeline.daily.length > initialDisplayCount;

  return (
    <div className={`bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2 mb-4">
        <FaHistory className="text-[var(--highlight)]" />
        Donation Tracker
      </h2>

      {/* Campaign-specific donation policy summary - only show for campaigns */}
      {isCampaign && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--headline)] mb-3">
            Donation Policy Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campaign-specific donations */}
            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <FaLock className="text-green-600" />
                  </div>
                  <span className="font-medium text-[var(--headline)]">Campaign-Specific</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--headline)] mb-1">
                RM{tracker.donations.campaignSpecificTotal?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-[var(--paragraph)]">
                {tracker.donations.campaignSpecificTotal && tracker.donations.total ? 
                  `${Math.round((tracker.donations.campaignSpecificTotal / tracker.donations.total) * 100)}% of total donations` :
                  '0% of total donations'}
              </p>
            </div>

            {/* Always-donate donations */}
            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaHandHoldingHeart className="text-blue-600" />
                  </div>
                  <span className="font-medium text-[var(--headline)]">Always Donate</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--headline)] mb-1">
                RM{tracker.donations.alwaysDonateTotal?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-[var(--paragraph)]">
                {tracker.donations.alwaysDonateTotal && tracker.donations.total ? 
                  `${Math.round((tracker.donations.alwaysDonateTotal / tracker.donations.total) * 100)}% of total donations` :
                  '0% of total donations'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Timeline */}
      <div className={`space-y-4 overflow-hidden ${showAllDonations && visibleDonations.length > 7 ? 'max-h-[60vh] overflow-y-auto pr-2' : ''}`}>
        {visibleDonations.map((day, index) => (
          <motion.div 
            key={day.date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] transition-all duration-200
              ${expandedDonationId === day.date ? 'bg-[var(--background)]' : ''}`}
          >
            {/* Basic Information Row */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setExpandedDonationId(expandedDonationId === day.date ? null : day.date)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center">
                  <FaCalendarAlt className="text-[var(--highlight)]" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-medium text-[var(--headline)]">
                    RM{day.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-[var(--paragraph)] truncate">
                    {new Date(day.date).toLocaleDateString()} at {new Date(day.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {day.isRecurring && (
                  <FaSync className="text-[var(--highlight)]" title="Recurring Donation" />
                )}
                {day.message && (
                  <FaComments className="text-[var(--secondary)]" title="Has message" />
                )}
                {isCampaign && day.donationPolicy && (
                  <div title={day.donationPolicy === 'campaign-specific' ? 'Campaign-Specific (Refundable)' : 'Always Donate (Non-refundable)'}>
                    {day.donationPolicy === 'campaign-specific' ? (
                      <FaLock className="text-green-600" />
                    ) : (
                      <FaHandHoldingHeart className="text-blue-600" />
                    )}
                  </div>
                )}
                <FaInfoCircle 
                  className={`transition-transform ${expandedDonationId === day.date ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {/* Expanded Details */}
            {expandedDonationId === day.date && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4 border-t border-[var(--stroke)]"
              >
                <div className="pt-4 space-y-3 overflow-hidden">
                  {/* Donor Information */}
                  <div className="flex items-center gap-2 text-sm">
                    <FaUser className="text-[var(--highlight)] flex-shrink-0" />
                    <span className="text-[var(--paragraph)] flex-shrink-0">Donor:</span>
                    <span className="font-medium text-[var(--headline)] truncate">
                      {tracker.donations.topDonors.find(donor => 
                        new Date(donor.lastDonation).toISOString().split('T')[0] === day.date
                      )?.name || 'Anonymous'}
                    </span>
                  </div>

                  {/* Transaction Hash */}
                  {day.transactionHash && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaReceipt className="text-[var(--highlight)] flex-shrink-0" />
                      <span className="text-[var(--paragraph)] flex-shrink-0">Transaction:</span>
                      <div className="overflow-hidden">
                        <a
                          href={`https://etherscan.io/tx/${day.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[var(--highlight)] hover:underline flex items-center gap-1 truncate"
                          title={day.transactionHash}
                        >
                          {`${day.transactionHash.slice(0, 6)}...${day.transactionHash.slice(-4)}`}
                          <FaExternalLinkAlt size={12} className="flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Donation Policy - only show for campaigns */}
                  {isCampaign && day.donationPolicy && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaExchangeAlt className="text-[var(--highlight)] flex-shrink-0" />
                      <span className="text-[var(--paragraph)] flex-shrink-0">Policy:</span>
                      <span className={`font-medium ${
                        day.donationPolicy === 'campaign-specific' 
                          ? 'text-green-600' 
                          : 'text-blue-600'
                      } truncate`}>
                        {day.donationPolicy === 'campaign-specific' 
                          ? 'Campaign-Specific (Refundable)' 
                          : 'Always Donate (Non-refundable)'}
                      </span>
                    </div>
                  )}

                  {/* Optional Message */}
                  {day.message && (
                    <div className="text-sm bg-[var(--main)] p-3 rounded-lg border border-[var(--stroke)] break-words max-h-24 overflow-y-auto">
                      <div className="flex items-center gap-1 text-[var(--highlight)] mb-1">
                        <FaComments size={14} className="flex-shrink-0" />
                        <span className="font-medium">Message:</span>
                      </div>
                      <p className="text-[var(--paragraph)] italic">"{day.message}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Show More/Less Button */}
        {hasMoreDonations && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowAllDonations(!showAllDonations)}
              className="px-4 py-2 bg-[var(--background)] rounded-lg border border-[var(--stroke)] text-sm hover:border-[var(--highlight)] transition-colors"
            >
              {showAllDonations ? 'Show Less' : `Show ${tracker.donations.timeline.daily.length - initialDisplayCount} More Donations`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationTracker; 