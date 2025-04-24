import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaPlus, FaFilter, FaBuilding, FaTruck, FaMoneyBillWave, FaBoxOpen, FaExclamationTriangle } from "react-icons/fa";
import TransactionCard from "./TransactionCard";
import CreateTransactionModal from "./CreateTransactionModal";
import ReportIssueModal from "./ReportIssueModal";
import { charityService } from "../../../../services/supabase/charityService";
import { toast } from "react-toastify";
import supabase from "../../../../services/supabase/supabaseClient";

// Define transaction status type
type TransactionStatus = 'pending' | 'shipping' | 'delivered' | 'completed' | 'rejected';

// Define a Transaction type matching our database structure
type Transaction = {
  id: string;
  campaign_id: string | null;
  vendor_id: string;
  vendor_name: string;
  amount: number;
  status: TransactionStatus;
  description: string;
  created_at: string;
  details: string;
  quotation_id: string;
  request_id: string;
  charity_id: string;
  campaign_name?: string;
  items?: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryPhoto?: string; // URL to delivery confirmation photo
};

const PurchasingTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filter, setFilter] = useState<'all' | TransactionStatus>('all');
  const [loading, setLoading] = useState(false);

  // Fetch transactions when component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        console.log("Fetching transactions...");
        
        // Check if the campaign_expenses table exists by making a test query
        try {
          const { count, error: tableError } = await supabase
            .from('campaign_expenses')
            .select('*', { count: 'exact', head: true });
          
          if (tableError) {
            console.error("Error checking campaign_expenses table:", tableError);
            toast.error(`Table error: ${tableError.message}`);
            setLoading(false);
            return;
          }
          
          console.log(`campaign_expenses table exists with ${count} records`);
        } catch (tableCheckError) {
          console.error("Exception checking table:", tableCheckError);
          toast.error("Failed to verify database table: " + 
            (tableCheckError instanceof Error ? tableCheckError.message : String(tableCheckError)));
          setLoading(false);
          return;
        }
        
        // Now try to fetch the transactions
        const data = await charityService.getCharityTransactions();
        console.log("Transaction data received:", data);
        
        // Convert data to our Transaction type
        const formattedTransactions = data.map(tx => {
          // Parse details to see if it contains items information
          let items = [];
          try {
            if (tx.details && tx.details.includes('"items"')) {
              const parsedDetails = JSON.parse(tx.details);
              if (parsedDetails.items && Array.isArray(parsedDetails.items)) {
                items = parsedDetails.items;
              }
            }
          } catch (e) {
            console.error('Error parsing transaction details:', e);
          }
          
          return {
            ...tx,
            status: tx.status as TransactionStatus,
            items: items.length > 0 ? items : undefined
          };
        });
        
        console.log("Formatted transactions:", formattedTransactions);
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        
        // More detailed error information
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          toast.error(`Failed to load transactions: ${error.message}`);
        } else {
          toast.error('Failed to load transactions: Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  // Sort transactions by status
  const sortTransactions = (transactionsToSort: Transaction[]) => {
    const statusOrder: Record<TransactionStatus, number> = {
      'pending': 0,
      'shipping': 1,
      'delivered': 2,
      'completed': 3,
      'rejected': 4
    };
    
    return [...transactionsToSort].sort((a, b) => {
      // First sort by status
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // If status is the same, sort by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  // Filter transactions based on status
  const filteredTransactions = filter === 'all'
    ? sortTransactions(transactions)
    : sortTransactions(transactions.filter(t => t.status === filter));

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseCard = () => {
    setSelectedTransaction(null);
  };

  const handleReleasePayment = async () => {
    if (selectedTransaction) {
      try {
        // Update transaction status to completed
        await charityService.updateTransactionStatus(selectedTransaction.id, 'completed');
        
        // Update local state
        setTransactions(prevTransactions =>
          prevTransactions.map(t =>
            t.id === selectedTransaction.id ? { ...t, status: 'completed' as TransactionStatus } : t
          )
        );
        
        // Update the selected transaction state to reflect the change immediately in the modal
        setSelectedTransaction(prevSelected =>
          prevSelected ? { ...prevSelected, status: 'completed' as TransactionStatus } : null
        );
        
        toast.success('Payment released successfully');
      } catch (error) {
        console.error('Error releasing payment:', error);
        toast.error('Failed to release payment');
      }
    }
  };

  const handleShowReportIssue = () => {
    if (selectedTransaction) {
      setShowReportModal(true);
    }
  };

  const handleSubmitIssueReport = async (issueDetails: string) => {
    if (selectedTransaction) {
      try {
        // Update transaction status to rejected
        await charityService.updateTransactionStatus(selectedTransaction.id, 'rejected');
        
        // Update local state
        setTransactions(prevTransactions =>
          prevTransactions.map(t =>
            t.id === selectedTransaction.id ? { ...t, status: 'rejected' as TransactionStatus } : t
          )
        );
        
        toast.success('Issue reported successfully');
        setShowReportModal(false);
        setSelectedTransaction(null);
      } catch (error) {
        console.error('Error reporting issue:', error);
        toast.error('Failed to report issue');
      }
    }
  };

  // Get status icon based on transaction status
  const getStatusIcon = (status: TransactionStatus) => {
    switch(status) {
      case 'pending':
        return <FaBoxOpen className="w-5 h-5 text-yellow-500" />;
      case 'shipping':
        return <FaTruck className="w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <FaCheckCircle className="w-5 h-5 text-teal-500" />;
      case 'completed':
        return <FaMoneyBillWave className="w-5 h-5 text-green-500" />; // Reverted: Completed uses MoneyBillWave
      case 'rejected':
        return <FaExclamationTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <FaCheckCircle className="w-5 h-5 opacity-30 text-gray-400" />;
    }
  };

  // Function to get step value based on status
  const getStepValue = (status: TransactionStatus): number => {
    const stepMap: Record<TransactionStatus, number> = {
      'pending': 0,
      'shipping': 1,
      'delivered': 2,
      'completed': 3,
      'rejected': -1
    };
    return stepMap[status] ?? -1;
  };

  return (
    <div className="bg-[var(--main)] p-6 rounded-lg shadow-xl border border-[var(--stroke)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[var(--headline)]">Transactions</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | TransactionStatus)}
              className="appearance-none bg-[var(--card-background)] border border-[var(--card-border)] text-[var(--paragraph)] py-1.5 px-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="shipping">Shipping</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--paragraph)] pointer-events-none" />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading transactions...</p>
        </div>
      ) : filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => handleTransactionClick(transaction)}
              className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] cursor-pointer hover:bg-[var(--background)] transition-all"
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[var(--headline)] font-semibold">{transaction.vendor_name}</p>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.status === 'shipping' ? 'bg-indigo-100 text-indigo-800' :
                      transaction.status === 'delivered' ? 'bg-teal-100 text-teal-800' :
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--paragraph)]">
                    Total: RM{transaction.amount.toLocaleString()} | Fund: {transaction.campaign_name || 'General Fund'}
                  </p>
                  <p className="text-sm text-[var(--paragraph)]">
                    Date: {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                  
                  {/* Compact step indicators */}
                  <div className="flex mt-3 space-x-1">
                    {['pending', 'shipping', 'delivered', 'completed'].map((step, index) => {
                      const isActive = getStepValue(transaction.status) >= index;
                      const isCurrentStep = getStepValue(transaction.status) === index;
                      return (
                        <div 
                          key={index}
                          className={`h-1.5 flex-1 rounded-full ${
                            isActive ? 
                              (isCurrentStep ? 'bg-[var(--highlight)]' : 'bg-[var(--highlight)] bg-opacity-60') : 
                              'bg-gray-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {/* Status icon */}
                <div className="ml-4">
                  {getStatusIcon(transaction.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p>No transactions found. Accept quotations to create transactions.</p>
        </div>
      )}
      
      {/* Transaction detail modal */}
      {selectedTransaction && (
        <TransactionCard
          transaction={selectedTransaction}
          onClose={handleCloseCard}
          onReleasePayment={selectedTransaction.status === 'delivered' ? handleReleasePayment : undefined}
          onReportIssue={selectedTransaction.status === 'delivered' ? handleShowReportIssue : undefined}
        />
      )}
      
      {/* Report issue modal */}
      {showReportModal && selectedTransaction && (
        <ReportIssueModal
          transaction={selectedTransaction}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSubmitIssueReport}
        />
      )}
    </div>
  );
};

export default PurchasingTransactions; 