import React, { useState, useEffect } from 'react';
import { FaHistory, FaCalendarAlt, FaExternalLinkAlt, FaUser, FaReceipt, FaInfoCircle, FaLock, FaHandHoldingHeart, FaTag, FaBuilding, FaChartLine, FaSync, FaClock, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getTransactionExplorerUrl } from '../../services/blockchain/blockchainService';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  donorName: string | null; // null for anonymous donations
  donorId?: string | null;
  transactionHash?: string;
  donationPolicy?: 'always-donate' | 'campaign-specific';
  message?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

interface BlockchainTransparencyTrackerProps {
  title?: string;
  recipientType: 'campaign' | 'organization';
  recipientId: string;
  recipientName: string;
  transactions: Transaction[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

const BlockchainTransparencyTracker: React.FC<BlockchainTransparencyTrackerProps> = ({
  title = 'Blockchain Transparency Tracker',
  recipientType,
  recipientId,
  recipientName,
  transactions,
  loading = false,
  error = null,
  onRefresh,
  className = ''
}) => {
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState<boolean>(false);
  
  // Number of transactions to show initially
  const initialDisplayCount = 5;
  
  // Sorted transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Visible transactions based on show all toggle
  const visibleTransactions = showAllTransactions 
    ? sortedTransactions
    : sortedTransactions.slice(0, initialDisplayCount);
    
  const hasMoreTransactions = sortedTransactions.length > initialDisplayCount;
  
  // Calculate some statistics
  const totalContributed = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalTransactions = transactions.length;
  const confirmedTransactions = transactions.filter(tx => tx.status === 'confirmed').length;
  const verificationRate = totalTransactions > 0 ? (confirmedTransactions / totalTransactions) * 100 : 0;
  
  return (
    <div className={`bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden ${className}`}>
      <div className="p-6 border-b border-[var(--stroke)] bg-gradient-to-r from-[var(--highlight)] to-[var(--highlight)] bg-opacity-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--headline)] flex items-center gap-2">
            <FaHistory className="text-[var(--highlight)]" />
            {title}
          </h2>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="p-2 rounded-full hover:bg-[var(--background)] transition-colors"
              title="Refresh data"
            >
              <FaSync className="text-[var(--paragraph)]" />
            </button>
          )}
        </div>
        
        <p className="text-[var(--paragraph)] mt-1 text-sm">
          All transactions for {recipientType === 'campaign' ? 'campaign' : 'organization'}: {recipientName}
        </p>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-[var(--background)] border-b border-[var(--stroke)]">
        <div className="bg-[var(--main)] p-4 rounded-lg border border-[var(--stroke)]">
          <div className="flex items-center gap-2 mb-1">
            <FaChartLine className="text-[var(--highlight)]" />
            <span className="text-sm text-[var(--paragraph)]">Total Raised</span>
          </div>
          <div className="text-xl font-bold text-[var(--headline)]">
            RM{totalContributed.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-[var(--main)] p-4 rounded-lg border border-[var(--stroke)]">
          <div className="flex items-center gap-2 mb-1">
            <FaReceipt className="text-[var(--highlight)]" />
            <span className="text-sm text-[var(--paragraph)]">Transactions</span>
          </div>
          <div className="text-xl font-bold text-[var(--headline)]">
            {totalTransactions}
          </div>
        </div>
        
        <div className="bg-[var(--main)] p-4 rounded-lg border border-[var(--stroke)]">
          <div className="flex items-center gap-2 mb-1">
            <FaExternalLinkAlt className="text-[var(--highlight)]" />
            <span className="text-sm text-[var(--paragraph)]">Verification</span>
          </div>
          <div className="text-xl font-bold text-[var(--headline)]">
            {verificationRate.toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Transaction List */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--highlight)]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <div className="font-medium mb-1">Error loading transactions</div>
            <div className="text-sm">{error}</div>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="mt-2 px-4 py-2 bg-red-700 text-white rounded-lg text-sm hover:bg-red-800 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        ) : visibleTransactions.length === 0 ? (
          <div className="text-center py-12 text-[var(--paragraph)]">
            <FaReceipt className="mx-auto mb-4 text-4xl opacity-30" />
            <p className="font-medium">No transactions recorded yet</p>
            <p className="text-sm mt-1">Transactions will appear here when donations are made</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border border-[var(--stroke)] hover:border-[var(--highlight)] transition-all duration-200
                  ${expandedTransactionId === transaction.id ? 'bg-[var(--background)]' : ''}`}
              >
                {/* Basic Transaction Row */}
                <div 
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => setExpandedTransactionId(
                    expandedTransactionId === transaction.id ? null : transaction.id
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${transaction.status === 'confirmed' 
                        ? 'bg-green-100 text-green-600' 
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.status === 'confirmed' 
                        ? <FaReceipt /> 
                        : transaction.status === 'pending'
                        ? <FaClock />
                        : <FaTimes />
                      }
                    </div>
                    <div>
                      <div className="font-medium text-[var(--headline)]">
                        RM{transaction.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-[var(--paragraph)]">
                        {new Date(transaction.date).toLocaleDateString()} at {
                          new Date(transaction.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {transaction.donationPolicy && (
                      <span className={`px-2 py-0.5 rounded-full text-xs
                        ${transaction.donationPolicy === 'campaign-specific' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {transaction.donationPolicy === 'campaign-specific' ? 'Campaign' : 'Always'}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs
                      ${transaction.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {transaction.status === 'confirmed' ? 'Confirmed' : transaction.status === 'pending' ? 'Pending' : 'Failed'}
                    </span>
                    <FaInfoCircle className={`transition-transform duration-200 ${
                      expandedTransactionId === transaction.id ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>
                
                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedTransactionId === transaction.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[var(--stroke)] px-4 pb-4"
                    >
                      <div className="pt-4 space-y-3">
                        {/* Donor Information */}
                        <div className="flex items-center gap-2 text-sm">
                          <FaUser className="text-[var(--highlight)]" />
                          <span className="text-[var(--paragraph)]">Donor:</span>
                          <span className="font-medium text-[var(--headline)]">
                            {transaction.donorName || 'Anonymous Donor'}
                          </span>
                        </div>
                        
                        {/* Recipient Information */}
                        <div className="flex items-center gap-2 text-sm">
                          {recipientType === 'campaign' 
                            ? <FaTag className="text-[var(--highlight)]" />
                            : <FaBuilding className="text-[var(--highlight)]" />
                          }
                          <span className="text-[var(--paragraph)]">Recipient:</span>
                          <span className="font-medium text-[var(--headline)]">
                            {recipientName} ({recipientType})
                          </span>
                        </div>
                        
                        {/* Transaction Hash - with link to blockchain explorer */}
                        {transaction.transactionHash && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaReceipt className="text-[var(--highlight)]" />
                            <span className="text-[var(--paragraph)]">Transaction:</span>
                            <a
                              href={getTransactionExplorerUrl(transaction.transactionHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-[var(--highlight)] hover:underline flex items-center gap-1"
                              title="View transaction on blockchain explorer"
                            >
                              {`${transaction.transactionHash.slice(0, 6)}...${transaction.transactionHash.slice(-4)}`}
                              <FaExternalLinkAlt size={12} />
                            </a>
                          </div>
                        )}
                        
                        {/* Donation Policy - only for campaigns */}
                        {recipientType === 'campaign' && transaction.donationPolicy && (
                          <div className="flex items-center gap-2 text-sm">
                            {transaction.donationPolicy === 'campaign-specific' 
                              ? <FaLock className="text-green-600" />
                              : <FaHandHoldingHeart className="text-blue-600" />
                            }
                            <span className="text-[var(--paragraph)]">Policy:</span>
                            <span className={`font-medium ${
                              transaction.donationPolicy === 'campaign-specific' 
                                ? 'text-green-600' 
                                : 'text-blue-600'
                            }`}>
                              {transaction.donationPolicy === 'campaign-specific' 
                                ? 'Campaign-Specific (Refundable)' 
                                : 'Always Donate (Non-refundable)'}
                            </span>
                          </div>
                        )}
                        
                        {/* Message if available */}
                        {transaction.message && (
                          <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--stroke)] text-sm">
                            <div className="font-medium text-[var(--headline)] mb-1">Message:</div>
                            <p className="text-[var(--paragraph)] italic">"{transaction.message}"</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            
            {/* Show More/Less Button */}
            {hasMoreTransactions && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="px-4 py-2 bg-[var(--background)] rounded-lg border border-[var(--stroke)] text-sm hover:border-[var(--highlight)] transition-colors"
                >
                  {showAllTransactions 
                    ? 'Show Less' 
                    : `Show ${sortedTransactions.length - initialDisplayCount} More Transactions`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainTransparencyTracker; 