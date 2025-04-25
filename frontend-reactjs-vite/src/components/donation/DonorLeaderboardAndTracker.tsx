import React, { useState, useRef, useEffect } from 'react';
import {
    FaTrophy, FaMedal, FaHistory, FaCalendarAlt, FaExternalLinkAlt, FaUser, FaReceipt,
    FaInfoCircle, FaSync, FaExchangeAlt, FaComments, FaChartLine, FaUserCircle, FaTimes,
    FaQuestionCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { DonationTracker as DonationTrackerType } from '../../utils/mockData';
import { getTransactionExplorerUrl } from '../../services/blockchain/blockchainService';
import supabase from '../../services/supabase/supabaseClient';

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

interface CampaignDonation {
    id: string;
    amount: number;
    created_at: string;
    transaction_hash?: string;
    donation_policy?: 'always-donate' | 'campaign-specific';
    message?: string;
    is_recurring?: boolean;
}

interface DonorLeaderboardAndTrackerProps {
    tracker: DonationTrackerType;
    className?: string;
    userDonorId?: number; // Current user's donor ID if they are a donor
    campaignId?: string; // Add campaign ID prop to filter donations by campaign
}

// Add new interfaces for tooltip state
interface TooltipState {
    isVisible: boolean;
    content: string;
    title: string;
    x: number;
    y: number;
}

const DonorLeaderboardAndTracker: React.FC<DonorLeaderboardAndTrackerProps> = ({
    tracker,
    className = '',
    userDonorId,
    campaignId
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

    // Add new state for real donations data
    const [donorDonations, setDonorDonations] = useState<Record<number, CampaignDonation[]>>({});
    const [isLoadingDonations, setIsLoadingDonations] = useState<boolean>(false);

    // Log campaignId to debug
    useEffect(() => {
        console.log('DonorLeaderboardAndTracker - campaignId:', campaignId);
        // Clear donor donations when campaignId changes to force refetch
        setDonorDonations({});
    }, [campaignId]);

    // Updated function to get donations for a donor
    const getDonationsForDonor = async (donorId: number) => {
        // Check if we already have this donor's donations in state
        if (donorDonations[donorId] && donorDonations[donorId].length > 0) {
            return donorDonations[donorId];
        }
        
        // Find donor in top donors to get their user ID
        const donor = topDonors.find(d => d.donorId === donorId);
        if (!donor) return [];
        
        try {
            setIsLoadingDonations(true);
            console.log('Fetching donations for donor:', donorId, 'campaignId:', campaignId);
            
            // Start building the query
            let query = supabase
                .from('campaign_donations')
                .select('*')
                .eq('user_id', donor.donorId.toString()); // Assuming donorId matches user_id
                
            // If campaignId is provided, filter by campaign
            if (campaignId) {
                console.log('Filtering by campaign ID:', campaignId);
                query = query.eq('campaign_id', campaignId);
            }
            
            // Execute the query with ordering
            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error fetching donor donations:', error);
                return [];
            }
            
            console.log('Fetched donations:', data);
            
            // Convert donations to the format expected by the component
            const formattedDonations = data?.map((donation: any) => ({
                id: donation.id,
                amount: donation.amount,
                created_at: donation.created_at,
                transaction_hash: donation.transaction_hash || undefined,
                donation_policy: donation.donation_policy as 'always-donate' | 'campaign-specific' || undefined,
                message: donation.message || undefined,
                is_recurring: donation.is_recurring || false
            })) || [];
            
            // Update state with fetched donations
            setDonorDonations(prev => ({
                ...prev,
                [donorId]: formattedDonations
            }));
            
            return formattedDonations;
        } catch (error) {
            console.error('Error in getDonationsForDonor:', error);
            return [];
        } finally {
            setIsLoadingDonations(false);
        }
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

    // Prepare donations for rendering in the Donation History Section
    const renderDonationHistory = (selectedDonor: Donor) => {
        const donations = donorDonations[selectedDonor.donorId] || [];
        
        if (isLoadingDonations) {
            return (
                <div className="text-center py-8 text-[var(--paragraph)]">
                    Loading donation history...
                </div>
            );
        }
        
        if (donations.length === 0) {
            return (
                <div className="text-center py-8 text-[var(--paragraph)]">
                    No donation history available
                </div>
            );
        }
        
        return donations.map((donation, dIndex) => (
            <div
                key={`${selectedDonor.donorId}-${dIndex}`}
                className="bg-[var(--main)] p-4 rounded-lg border border-[var(--stroke)] flex justify-between items-center"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center">
                        <FaCalendarAlt className="text-[var(--highlight)]" />
                    </div>
                    <div>
                        <div className="font-medium text-lg text-[#00674D]">
                            RM{donation.amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-[var(--paragraph)]">
                                {formatDate(donation.created_at)}
                            </div>
                            {donation.donation_policy && (
                                <div
                                    className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help ${donation.donation_policy === 'campaign-specific'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}
                                    onMouseEnter={(e) => showTooltip(
                                        e,
                                        donation.donation_policy === 'campaign-specific' ? 'Campaign-specific' : 'Always-donate',
                                        donation.donation_policy === 'campaign-specific'
                                            ? 'Refundable if campaign goal isn\'t reached'
                                            : 'Benefits the organization regardless of campaign outcome'
                                    )}
                                    onMouseLeave={hideTooltip}
                                >
                                    {donation.donation_policy === 'campaign-specific' ? 'Campaign-specific' : 'Always-donate'}
                                    <FaQuestionCircle className="text-xs opacity-60" />
                                </div>
                            )}
                            {donation.is_recurring && (
                                <div
                                    className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1 cursor-help"
                                    onMouseEnter={(e) => showTooltip(
                                        e,
                                        'Recurring Donation',
                                        'This donation is part of a monthly recurring commitment'
                                    )}
                                    onMouseLeave={hideTooltip}
                                >
                                    Monthly
                                    <FaSync className="text-xs" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {donation.transaction_hash && (
                    <a
                        href={getTransactionExplorerUrl(donation.transaction_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#FFA500] bg-opacity-10 text-[#FF8C00] rounded-md hover:bg-opacity-20 transition-colors flex items-center gap-1.5 text-xs font-medium ml-2"
                    >
                        <FaReceipt className="text-sm" />
                        <span>Transaction</span>
                    </a>
                )}
            </div>
        ));
    };

    // Fetch donations when selected donor changes
    useEffect(() => {
        if (selectedDonorId) {
            getDonationsForDonor(selectedDonorId);
        }
    }, [selectedDonorId]);

    return (
        <div className={`bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden ${className}`}>
            <div className="p-4">
                {/* Header with total */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" />
                        <h2 className="text-lg font-bold text-[#00674D]">Donor Leaderboard</h2>
                    </div>
                    <div className="text-sm">
                        Total: <span className="font-semibold">RM{tracker.donations.total.toLocaleString()}</span>
                    </div>
                </div>

                {/* Top 3 Donors with Podium Style */}
                {topThreeDonors.length > 0 && (
                    <div className="flex justify-center mb-6">
                        {/* Display order: 2nd (left), 1st (center), 3rd (right) */}
                        <div className="flex items-end gap-3 sm:gap-4">
                            {/* Second Place */}
                            {topThreeDonors.length > 1 && (
                                <div className="flex flex-col items-center">
                                    <div className="text-blue-400 mb-1">
                                        {getRankEmoji(1)}
                                    </div>
                                    <div
                                        className="w-16 h-16 rounded-full cursor-pointer relative"
                                        onClick={() => handleDonorClick(topThreeDonors[1].donorId)}
                                    >
                                        {topThreeDonors[1].avatar ? (
                                            <img
                                                src={topThreeDonors[1].avatar}
                                                alt={topThreeDonors[1].name}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center rounded-full ${getAvatarColor(1)} text-white text-2xl font-bold`}>
                                                {topThreeDonors[1].name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${userDonorId === topThreeDonors[1].donorId ? 'text-[var(--highlight)]' : 'text-[#00674D]'} truncate max-w-[90px]`}>
                                            {topThreeDonors[1].name}
                                            {userDonorId === topThreeDonors[1].donorId && <span className="text-xs ml-1">(You)</span>}
                                        </div>
                                        <div className="text-sm font-bold text-[var(--highlight)]">
                                            RM{topThreeDonors[1].amount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[var(--paragraph)]">
                                            {topThreeDonors[1].transactionCount} transaction
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* First Place */}
                            <div className="flex flex-col items-center -mt-5">
                                <div className="text-yellow-500 mb-1">
                                    {getRankEmoji(0)}
                                </div>
                                <div
                                    className="w-20 h-20 rounded-full cursor-pointer relative"
                                    onClick={() => handleDonorClick(topThreeDonors[0].donorId)}
                                >
                                    {topThreeDonors[0].avatar ? (
                                        <img
                                            src={topThreeDonors[0].avatar}
                                            alt={topThreeDonors[0].name}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center rounded-full ${getAvatarColor(0)} text-white text-3xl font-bold`}>
                                            {topThreeDonors[0].name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <div className={`text-sm font-medium ${userDonorId === topThreeDonors[0].donorId ? 'text-[var(--highlight)]' : 'text-[#00674D]'} truncate max-w-[100px]`}>
                                        {topThreeDonors[0].name}
                                        {userDonorId === topThreeDonors[0].donorId && <span className="text-xs ml-1">(You)</span>}
                                    </div>
                                    <div className="text-sm font-bold text-[var(--highlight)]">
                                        RM{topThreeDonors[0].amount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-[var(--paragraph)]">
                                        {topThreeDonors[0].transactionCount} transaction
                                    </div>
                                </div>
                            </div>

                            {/* Third Place */}
                            {topThreeDonors.length > 2 && (
                                <div className="flex flex-col items-center">
                                    <div className="text-amber-600 mb-1">
                                        {getRankEmoji(2)}
                                    </div>
                                    <div
                                        className="w-16 h-16 rounded-full cursor-pointer relative"
                                        onClick={() => handleDonorClick(topThreeDonors[2].donorId)}
                                    >
                                        {topThreeDonors[2].avatar ? (
                                            <img
                                                src={topThreeDonors[2].avatar}
                                                alt={topThreeDonors[2].name}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center rounded-full ${getAvatarColor(2)} text-white text-2xl font-bold`}>
                                                {topThreeDonors[2].name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${userDonorId === topThreeDonors[2].donorId ? 'text-[var(--highlight)]' : 'text-[#00674D]'} truncate max-w-[90px]`}>
                                            {topThreeDonors[2].name}
                                            {userDonorId === topThreeDonors[2].donorId && <span className="text-xs ml-1">(You)</span>}
                                        </div>
                                        <div className="text-sm font-bold text-[var(--highlight)]">
                                            RM{topThreeDonors[2].amount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[var(--paragraph)]">
                                            {topThreeDonors[2].transactionCount} transaction
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Donors Table (ranks 4 and beyond) */}
                <div className="mt-2">
                    <div className="bg-[var(--background)] rounded-lg overflow-hidden border border-[var(--stroke)]">
                        {/* Table Header */}
                        <div className="flex px-4 py-2 border-b border-[var(--stroke)] bg-[#F9F9F9] text-xs font-medium text-[#00674D] uppercase">
                            <div className="flex-grow">Donor</div>
                            <div className="w-24 text-right">Amount</div>
                            <div className="w-28 text-right">Transactions</div>
                        </div>

                        {/* Table Body */}
                        <div className="max-h-[150px] overflow-y-auto">
                            {visibleDonors.map((donor, index) => {
                                const isCurrentUser = userDonorId === donor.donorId;
                                const rank = index + 4; // Start counting from 4

                                return (
                                    <div
                                        key={donor.donorId}
                                        className={`flex items-center px-4 py-3 hover:bg-gray-50 border-b border-[var(--stroke)] ${isCurrentUser ? 'bg-[var(--highlight)] bg-opacity-5' : ''
                                            } cursor-pointer transition-colors`}
                                        onClick={() => handleDonorClick(donor.donorId)}
                                    >
                                        {/* Rank Number */}
                                        <div className="w-6 mr-2 text-center">
                                            <span className="text-sm font-medium text-[var(--paragraph)]">{rank}</span>
                                        </div>

                                        {/* Donor Info */}
                                        <div className="flex items-center flex-grow">
                                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(rank)} text-white flex items-center justify-center font-bold text-lg mr-3`}>
                                                {donor.avatar ? (
                                                    <img
                                                        src={donor.avatar}
                                                        alt={donor.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    donor.name.charAt(0)
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className={`text-sm font-medium ${isCurrentUser ? 'text-[var(--highlight)]' : 'text-[#00674D]'} truncate`}>
                                                    {donor.name}
                                                    {isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
                                                </div>
                                                <div className="text-xs text-[var(--paragraph)] truncate">
                                                    Last: {formatDate(donor.lastDonation)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="w-24 text-right">
                                            <div className={`text-sm font-semibold ${isCurrentUser ? 'text-[var(--highlight)]' : 'text-[#00674D]'}`}>
                                                RM{donor.amount.toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Transactions */}
                                        <div className="w-28 text-right">
                                            <div className="text-xs text-[var(--paragraph)]">
                                                {donor.transactionCount} transaction
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Navigation Dots */}
                            {visibleDonors.length > 0 && hasMoreDonors && (
                                <div className="py-2 text-center border-t border-[var(--stroke)]">
                                    <button
                                        onClick={() => setShowAllDonors(true)}
                                        className="px-4 py-1 text-xs text-[#00674D] hover:underline focus:outline-none"
                                    >
                                        View More Donors
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Donor Profile Popout Dialog */}
            <AnimatePresence>
                {selectedDonor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm"
                        onClick={handleClosePopout}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[var(--main)] rounded-xl overflow-hidden shadow-xl max-w-3xl w-full"
                            onClick={(e) => e.stopPropagation()}>

                            {/* Popout Header */}
                            <div className="p-4 border-b border-[var(--stroke)] flex justify-between items-center bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] text-white">
                                <h3 className="text-xl font-bold">Donor Profile</h3>
                                <button
                                    onClick={handleClosePopout}
                                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                                    aria-label="Close"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Popout Content - Removed max-height and overflow on this container */}
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Donor Profile Section */}
                                    <div className="md:w-1/3 bg-[var(--background)] rounded-lg border border-[var(--stroke)] p-5">
                                        <div className="flex flex-col items-center mb-6">
                                            {/* Check rank to show correct badge */}
                                            {topThreeDonors.findIndex(d => d.donorId === selectedDonor.donorId) >= 0 && (
                                                <div className="mb-2 text-3xl">
                                                    {getRankEmoji(topThreeDonors.findIndex(d => d.donorId === selectedDonor.donorId))}
                                                </div>
                                            )}

                                            {/* Avatar */}
                                            <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-[var(--highlight)] p-1">
                                                {selectedDonor.avatar ? (
                                                    <img
                                                        src={selectedDonor.avatar}
                                                        alt={selectedDonor.name}
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center rounded-full ${getAvatarColor(topDonors.findIndex(d => d.donorId === selectedDonor.donorId))} text-white text-3xl font-bold`}>
                                                        {selectedDonor.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Donor name and rank */}
                                            <h4 className={`text-xl font-bold ${userDonorId === selectedDonor.donorId ? 'text-[var(--highlight)]' : 'text-[#00674D]'}`}>
                                                {selectedDonor.name}
                                                {userDonorId === selectedDonor.donorId && <span className="ml-1 text-sm">(You)</span>}
                                            </h4>

                                            <div className="text-[var(--paragraph)] mt-1">
                                                Rank: {topDonors.findIndex(d => d.donorId === selectedDonor.donorId) + 1}
                                            </div>
                                        </div>

                                        {/* Donor stats */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-[var(--main)] rounded-lg border border-[var(--stroke)]">
                                                <div className="text-sm text-[var(--paragraph)]">Total Donated</div>
                                                <div className="font-bold text-[#00674D]">RM{selectedDonor.amount.toLocaleString()}</div>
                                            </div>

                                            <div className="flex justify-between items-center p-3 bg-[var(--main)] rounded-lg border border-[var(--stroke)]">
                                                <div className="text-sm text-[var(--paragraph)]">Transactions</div>
                                                <div className="font-bold text-[#00674D]">{selectedDonor.transactionCount}</div>
                                            </div>

                                            <div className="flex justify-between items-center p-3 bg-[var(--main)] rounded-lg border border-[var(--stroke)]">
                                                <div className="text-sm text-[var(--paragraph)]">Last Donation</div>
                                                <div className="font-bold text-[#00674D]">{formatDate(selectedDonor.lastDonation)}</div>
                                            </div>
                                        </div>

                                        {/* View full profile button */}
                                        <button
                                            className="w-full mt-6 px-4 py-3 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                                            onClick={() => {
                                                // Navigate to donor profile would go here
                                                console.log(`View profile of donor ${selectedDonor.donorId}`);
                                            }}
                                        >
                                            <FaUserCircle size={16} />
                                            View Full Profile
                                        </button>
                                    </div>

                                    {/* Donation History Section */}
                                    <div className="md:w-2/3 bg-[var(--background)] rounded-lg border border-[var(--stroke)] p-5 flex flex-col h-full">
                                        <h3 className="text-lg font-bold text-[#00674D] flex items-center gap-2 mb-4">
                                            <FaHistory className="text-[var(--highlight)]" />
                                            Donation History
                                        </h3>

                                        {/* Donation timeline - Only this part scrolls when needed */}
                                        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: "350px" }}>
                                            <div className="space-y-2">
                                                {renderDonationHistory(selectedDonor)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global tooltip that will be positioned absolutely in the viewport */}
            <AnimatePresence>
                {tooltip.isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed z-[9999] pointer-events-none"
                        style={{
                            top: tooltip.y - 80, // Increased spacing to move tooltip up
                            left: tooltip.x + 5, // Slight offset to the right of the left edge
                            maxWidth: '220px'
                        }}
                    >
                        <div className="bg-[#1A1A2E] text-white text-xs rounded-md p-3 shadow-lg">
                            <div className="text-center font-semibold mb-1">{tooltip.title}</div>
                            <div>{tooltip.content}</div>
                            <div className="absolute bottom-[-6px] left-4 w-3 h-3 bg-[#1A1A2E] rotate-45"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DonorLeaderboardAndTracker; 