import React, { useEffect } from 'react';
import { FaTimes, FaHistory, FaCalendarAlt, FaMoneyBillWave, FaChartLine, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface MyContributionPopupProps {
    isOpen: boolean;
    onClose: () => void;
    totalContributed?: number;
    donationsCount?: number;
    percentageOfTotal?: number;
    contributions?: Array<{
        date: string;
        amount: number;
        id: string;
    }>;
    displayAsCenterModal?: boolean;
}

const MyContributionPopup: React.FC<MyContributionPopupProps> = ({
    isOpen,
    onClose,
    totalContributed = 500,
    donationsCount = 2,
    percentageOfTotal = 10.0,
    contributions = [
        { id: '1', date: '2024-03-15T10:30:00', amount: 300 },
        { id: '2', date: '2024-02-10T15:45:00', amount: 200 },
    ],
    displayAsCenterModal = false
}) => {
    // Handle keyboard events (Escape key)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleDownloadReceipt = (contributionId: string) => {
        // In a real app, this would trigger a download of the receipt
        console.log(`Downloading receipt for contribution ${contributionId}`);
        // TODO: Implement actual receipt download
    };

    // Close when clicking outside the modal (for center modal)
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (displayAsCenterModal && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={displayAsCenterModal ? handleBackdropClick : onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
                    />

                    {displayAsCenterModal ? (
                        // Center Modal Version
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={handleBackdropClick}
                        >
                            <motion.div
                                className="bg-[var(--main)] rounded-xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="sticky top-0 bg-[var(--main)] border-b border-[var(--stroke)] p-6 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2">
                                        <FaHistory className="text-[var(--highlight)]" />
                                        Your Contributions
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[var(--background)] transition-colors text-[var(--paragraph)] hover:text-[var(--headline)]"
                                        aria-label="Close"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                {/* Content - Scrollable */}
                                <div className="overflow-y-auto">
                                    <div className="p-6 space-y-6">
                                        {/* Summary Stats */}
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight)] bg-opacity-5 p-4">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--highlight)] opacity-5 rounded-bl-full"></div>
                                                <span className="text-3xl font-bold text-[var(--headline)]">RM{totalContributed}</span>
                                                <p className="text-sm text-[var(--paragraph)] font-medium mt-1">Total Contributed</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary)] bg-opacity-5 p-4">
                                                    <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--secondary)] opacity-5 rounded-bl-full"></div>
                                                    <span className="text-2xl font-bold text-[var(--headline)]">{donationsCount}</span>
                                                    <p className="text-sm text-[var(--paragraph)] font-medium mt-1">Donations Made</p>
                                                </div>

                                                <div className="relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-gradient-to-r from-[var(--tertiary)] to-[var(--tertiary)] bg-opacity-5 p-4">
                                                    <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--tertiary)] opacity-5 rounded-bl-full"></div>
                                                    <span className="text-2xl font-bold text-[var(--headline)]">{percentageOfTotal}%</span>
                                                    <p className="text-sm text-[var(--paragraph)] font-medium mt-1">Of Total Raised</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contribution History */}
                                        <div className="border-t border-[var(--stroke)] pt-5">
                                            <h3 className="font-semibold mb-4 flex items-center gap-2 text-[var(--headline)]">
                                                <FaCalendarAlt className="text-[var(--highlight)] text-sm" />
                                                Contribution History
                                            </h3>

                                            <div className="space-y-3">
                                                {contributions.map((contribution) => (
                                                    <div
                                                        key={contribution.id}
                                                        className="flex justify-between items-center p-3 border border-[var(--stroke)] rounded-lg hover:border-[var(--highlight)] hover:shadow-sm transition-all duration-200"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center text-[var(--highlight)]">
                                                                <FaMoneyBillWave />
                                                            </div>
                                                            <div>
                                                                <span className="text-[var(--headline)] font-medium">
                                                                    {new Date(contribution.date).toLocaleDateString()}
                                                                </span>
                                                                <p className="text-xs text-[var(--paragraph)]">
                                                                    {new Date(contribution.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="font-bold text-[var(--highlight)]">RM{contribution.amount}</div>
                                                            <button
                                                                onClick={() => handleDownloadReceipt(contribution.id)}
                                                                className="p-2 rounded-full hover:bg-[var(--background)] transition-colors text-[var(--paragraph)] hover:text-[var(--highlight)]"
                                                                aria-label="Download receipt"
                                                            >
                                                                <FaDownload />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        // Original Side Drawer Version
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--main)] shadow-xl z-50 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-[var(--main)] border-b border-[var(--stroke)] p-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-[var(--headline)] flex items-center gap-2">
                                    <FaHistory className="text-[var(--highlight)]" />
                                    Your Contributions
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[var(--background)] transition-colors text-[var(--paragraph)] hover:text-[var(--headline)]"
                                    aria-label="Close"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Summary Stats */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight)] bg-opacity-5 p-4">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--highlight)] opacity-5 rounded-bl-full"></div>
                                        <span className="text-3xl font-bold text-[var(--headline)]">RM{totalContributed}</span>
                                        <p className="text-sm text-[var(--paragraph)] font-medium mt-1">Total Contributed</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary)] bg-opacity-5 p-4">
                                            <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--secondary)] opacity-5 rounded-bl-full"></div>
                                            <span className="text-2xl font-bold text-[var(--headline)]">{donationsCount}</span>
                                            <p className="text-sm text-[var(--paragraph)] font-medium mt-1">Donations Made</p>
                                        </div>

                                        <div className="relative overflow-hidden rounded-lg border border-[var(--stroke)] bg-gradient-to-r from-[var(--tertiary)] to-[var(--tertiary)] bg-opacity-5 p-4">
                                            <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--tertiary)] opacity-5 rounded-bl-full"></div>
                                            <span className="text-2xl font-bold text-[var(--headline)]">{percentageOfTotal}%</span>
                                            <p className="text-sm text-[var(--paragraph)] font-medium mt-1">Of Total Raised</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contribution History */}
                                <div className="border-t border-[var(--stroke)] pt-5">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-[var(--headline)]">
                                        <FaCalendarAlt className="text-[var(--highlight)] text-sm" />
                                        Contribution History
                                    </h3>

                                    <div className="space-y-3">
                                        {contributions.map((contribution) => (
                                            <div
                                                key={contribution.id}
                                                className="flex justify-between items-center p-3 border border-[var(--stroke)] rounded-lg hover:border-[var(--highlight)] hover:shadow-sm transition-all duration-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center text-[var(--highlight)]">
                                                        <FaMoneyBillWave />
                                                    </div>
                                                    <div>
                                                        <span className="text-[var(--headline)] font-medium">
                                                            {new Date(contribution.date).toLocaleDateString()}
                                                        </span>
                                                        <p className="text-xs text-[var(--paragraph)]">
                                                            {new Date(contribution.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="font-bold text-[var(--highlight)]">RM{contribution.amount}</div>
                                                    <button
                                                        onClick={() => handleDownloadReceipt(contribution.id)}
                                                        className="p-2 rounded-full hover:bg-[var(--background)] transition-colors text-[var(--paragraph)] hover:text-[var(--highlight)]"
                                                        aria-label="Download receipt"
                                                    >
                                                        <FaDownload />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
};

export default MyContributionPopup; 