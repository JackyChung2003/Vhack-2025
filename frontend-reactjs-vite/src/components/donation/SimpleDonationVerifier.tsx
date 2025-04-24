import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaReceipt, FaExternalLinkAlt, FaTimes, FaArrowRight, FaSort, FaSortUp, FaSortDown, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { getTransactionExplorerUrl } from '../../services/blockchain/blockchainService';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  transactionHash: string;
  donorName?: string;
}

interface SimpleDonationVerifierProps {
  title: string;
  campaignName: string;
  transactions: Transaction[];
  showDonorNames?: boolean;
}

const SimpleDonationVerifier: React.FC<SimpleDonationVerifierProps> = ({
  title,
  campaignName,
  transactions,
  showDonorNames = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'date',
    direction: 'descending',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  // Shorten transaction hash
  const shortenHash = (hash: string) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
    } else if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'ascending' ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortConfig.key === 'donorName' && showDonorNames) {
      const nameA = a.donorName || '';
      const nameB = b.donorName || '';
      return sortConfig.direction === 'ascending'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    return 0;
  });

  // Filter transactions based on search term
  const filteredTransactions = sortedTransactions.filter(
    (tx) =>
      tx.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatCurrency(tx.amount).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction icon
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 text-gray-400" />;
    return sortConfig.direction === 'ascending' ? (
      <FaSortUp className="ml-1 text-[var(--highlight)]" />
    ) : (
      <FaSortDown className="ml-1 text-[var(--highlight)]" />
    );
  };

  // Display limited transactions for the main view
  const displayTransactions = sortedTransactions.slice(0, 3);

  return (
    <>
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--panel)] p-4 border-b border-[var(--stroke)]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaReceipt className="text-[var(--highlight)]" />
              <h3 className="text-lg font-bold text-[var(--headline)]">{title}</h3>
            </div>
            {transactions.length > 3 && (
              <button
                className="text-sm text-[var(--highlight)] hover:underline flex items-center"
                onClick={() => setModalOpen(true)}
              >
                View All <FaArrowRight className="ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4">
          <p className="text-sm text-[var(--paragraph)] mb-4">
            Showing recent donation transactions from all donors verified on the blockchain for {campaignName}
          </p>
          
          <div className="space-y-3">
            {displayTransactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-[var(--stroke)] bg-[var(--panel)] hover:border-[var(--highlight)] hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-[var(--headline)] text-lg">{formatCurrency(tx.amount)}</div>
                  <div className="text-sm text-[var(--subtext)] bg-[var(--main)] px-2 py-1 rounded-full">{formatDate(tx.date)}</div>
                </div>
                
                {showDonorNames && tx.donorName && (
                  <div className="text-sm text-[var(--paragraph)] mb-2">
                    From: <span className="font-medium text-[var(--headline)]">{tx.donorName}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-[var(--stroke)] border-dashed">
                  <div className="text-xs text-[var(--subtext)] truncate max-w-[70%] bg-[var(--main)] px-2 py-1 rounded-md">
                    TX: {shortenHash(tx.transactionHash)}
                  </div>
                  <a
                    href={getTransactionExplorerUrl(tx.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-[var(--main)] text-[var(--highlight)] hover:bg-[var(--highlight)] hover:text-white px-3 py-1 rounded-md flex items-center transition-colors"
                  >
                    Verify <FaExternalLinkAlt className="ml-1 text-xs" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          
          {transactions.length === 0 && (
            <div className="text-center py-8 text-[var(--paragraph)] bg-[var(--panel)] rounded-lg border border-dashed border-[var(--stroke)]">
              <FaReceipt className="mx-auto text-3xl text-[var(--subtext)] mb-2" />
              <p>No verified transactions available yet.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-[var(--stroke)] p-3 bg-[var(--panel)]">
          <p className="text-xs text-center text-[var(--subtext)] italic">
            All donations are securely verified on the blockchain for complete transparency
          </p>
        </div>
      </div>

      {/* Modal for all transactions */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--main)] rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[var(--panel)] p-4 border-b border-[var(--stroke)] flex justify-between items-center">
                <h3 className="text-lg font-bold text-[var(--headline)]">
                  All Donations for {campaignName}
                </h3>
                <button
                  className="text-[var(--paragraph)] hover:text-[var(--headline)] p-1"
                  onClick={() => setModalOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-4">
                {/* Search and filters */}
                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--subtext)]" />
                    <input
                      type="text"
                      placeholder="Search donors, amounts, or transaction IDs..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--stroke)] bg-[var(--panel)] text-[var(--paragraph)] focus:outline-none focus:border-[var(--highlight)]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3 text-sm text-[var(--paragraph)]">
                  Showing all verified blockchain donations from all donors for this campaign
                </div>

                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 py-2 border-b border-[var(--stroke)] font-medium text-[var(--headline)]">
                  <div 
                    className="col-span-3 sm:col-span-2 flex items-center cursor-pointer"
                    onClick={() => requestSort('date')}
                  >
                    Date {getSortIcon('date')}
                  </div>
                  <div 
                    className="col-span-3 sm:col-span-2 flex items-center cursor-pointer"
                    onClick={() => requestSort('amount')}
                  >
                    Amount {getSortIcon('amount')}
                  </div>
                  {showDonorNames && (
                    <div 
                      className="col-span-3 sm:col-span-3 flex items-center cursor-pointer"
                      onClick={() => requestSort('donorName')}
                    >
                      Donor {getSortIcon('donorName')}
                    </div>
                  )}
                  <div className="hidden sm:block sm:col-span-3">Transaction ID</div>
                  <div className="col-span-3 sm:col-span-2 text-right">Verify</div>
                </div>

                {/* Table body */}
                <div className="max-h-[50vh] overflow-y-auto">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="grid grid-cols-12 gap-2 py-3 border-b border-[var(--stroke)] hover:bg-[var(--panel)] transition-colors text-sm"
                      >
                        <div className="col-span-3 sm:col-span-2 text-[var(--paragraph)]">
                          <div>{formatDate(tx.date)}</div>
                          <div className="text-xs text-[var(--subtext)]">{formatTime(tx.date)}</div>
                        </div>
                        <div className="col-span-3 sm:col-span-2 font-medium text-[var(--headline)]">
                          {formatCurrency(tx.amount)}
                        </div>
                        {showDonorNames && (
                          <div className="col-span-3 sm:col-span-3 text-[var(--paragraph)]">
                            {tx.donorName || 'Anonymous'}
                          </div>
                        )}
                        <div className="hidden sm:block sm:col-span-3 text-[var(--subtext)] truncate">
                          {shortenHash(tx.transactionHash)}
                        </div>
                        <div className="col-span-3 sm:col-span-2 text-right">
                          <a
                            href={getTransactionExplorerUrl(tx.transactionHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--highlight)] hover:underline inline-flex items-center"
                          >
                            Verify <FaExternalLinkAlt className="ml-1 text-xs" />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-[var(--paragraph)]">
                      {searchTerm ? 'No transactions matching your search' : 'No transactions found'}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[var(--panel)] p-4 border-t border-[var(--stroke)] flex justify-between">
                <div className="text-sm text-[var(--paragraph)]">
                  Total transactions: <span className="font-medium">{transactions.length}</span>
                </div>
                <button
                  className="px-4 py-2 bg-[var(--highlight)] text-[var(--paragraph)] rounded-lg hover:bg-opacity-80"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SimpleDonationVerifier; 