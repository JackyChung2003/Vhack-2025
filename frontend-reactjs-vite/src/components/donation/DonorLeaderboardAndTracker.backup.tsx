import React, { useState, useRef, useEffect } from 'react';
import {
    FaTrophy, FaMedal, FaHistory, FaCalendarAlt, FaExternalLinkAlt, FaUser, FaReceipt,
    FaInfoCircle, FaSync, FaExchangeAlt, FaComments, FaChartLine, FaUserCircle, FaTimes,
    FaQuestionCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { DonationTracker as DonationTrackerType } from '../../utils/mockData';

// Updated Donor interface with avatar as optional
interface Donor {
    donorId: number;
    name: string;
    amount: number;
    lastDonation: string;
    avatar?: string;
    transactionCount?: number; // Add transaction count for user profile
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

interface DonorLeaderboardAndTrackerProps {
    tracker: DonationTrackerType;
    className?: string;
    userDonorId?: number; // Current user's donor ID if they are a donor
}

// Add new interfaces for tooltip state
interface TooltipState {
    isVisible: boolean;
    content: string;
    title: string;
    x: number;
    y: number;
}

// NOTE: This is a backup copy of the original DonorLeaderboardAndTracker component
// Use this file as a reference for keeping implementation details in case of conflicts with git pulls

const DonorLeaderboardAndTracker: React.FC<DonorLeaderboardAndTrackerProps> = ({
    tracker,
    className = '',
    userDonorId
}) => {
    // State for donor profile popout
    const [selectedDonorId, setSelectedDonorId] = useState<number | null>(null);
    const [showAllDonors, setShowAllDonors] = useState<boolean>(false);

    // New tooltip state
    const [tooltip, setTooltip] = useState<TooltipState>({
        isVisible: false,
        content: '',
        title: '',
        x: 0,
        y: 0
    });

    // Number of donors to show initially
    const initialDisplayCount = 2;

    // Get top donors from tracker and enhance with transaction count
    const topDonors: Donor[] = tracker.donations.topDonors.map(donor => {
        // Count the number of transactions for this donor (approximate based on daily timeline)
        const transactionCount = tracker.donations.timeline.daily.filter(donation =>
            tracker.donations.topDonors.find(d =>
                d.donorId === donor.donorId &&
                new Date(d.lastDonation).toISOString().split('T')[0] === donation.date
            )
        ).length;

        return {
            ...donor,
            transactionCount: transactionCount || 1 // At least 1 transaction
        };
    });

    // Get top 3 donors for podium display
    const topThreeDonors = topDonors.slice(0, 3);

    // Get remaining donors (position 4 and beyond)
    const remainingDonors = topDonors.slice(3);

    // Get visible donors based on show all toggle
    const visibleDonors = showAllDonors
        ? remainingDonors
        : remainingDonors.slice(0, initialDisplayCount);

    const hasMoreDonors = remainingDonors.length > initialDisplayCount && !showAllDonors;

    // Get selected donor for popout
    const selectedDonor = topDonors.find(donor => donor.donorId === selectedDonorId);

    // Get rank emoji for top 3 donors
    const getRankEmoji = (index: number) => {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return `${index + 1}`;
        }
    };

    // Get avatar colors for donors
    const getAvatarColor = (index: number) => {
        const colors = [
            'bg-[#FFC933]', // Gold/Yellow for 1st
            'bg-[#E1E1E8]', // Silver/Gray for 2nd
            'bg-[#CD6116]', // Bronze for 3rd
            'bg-[#FF5A5A]', // Red
            'bg-[#FF915A]'  // Orange
        ];
        return index < colors.length ? colors[index] : 'bg-[var(--tertiary)]';
    };

    // Get donations for a specific donor
    const getDonationsForDonor = (donorId: number) => {
        return tracker.donations.timeline.daily.filter(donation =>
            tracker.donations.topDonors.find(d =>
                d.donorId === donorId &&
                new Date(d.lastDonation).toISOString().split('T')[0] === donation.date
            )
        );
    };

    // Handle donor click to show popout profile
    const handleDonorClick = (donorId: number) => {
        setSelectedDonorId(donorId);
    };

    // Handle close popout
    const handleClosePopout = () => {
        setSelectedDonorId(null);
    };

    // Format date to be more compact
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    };

    // Handle showing tooltip
    const showTooltip = (e: React.MouseEvent, title: string, content: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            isVisible: true,
            title,
            content,
            x: rect.left, // Left edge of the element instead of center
            y: rect.top // Top of the element
        });
    };

    // Handle hiding tooltip
    const hideTooltip = () => {
        setTooltip(prev => ({ ...prev, isVisible: false }));
    };

    // Component implementation details are in the original file
    return (
        <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
            <div className="p-4 text-center">
                <h3 className="text-lg font-bold">DonorLeaderboardAndTracker Component Backup</h3>
                <p className="text-sm">This is a backup of the original implementation. Refer to the original file for full details.</p>
            </div>
        </div>
    );
};

export default DonorLeaderboardAndTracker; 