import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt, FaCheckCircle, FaTruck, FaMoneyBillWave, FaBoxOpen } from "react-icons/fa";
import VendorChats from "./VendorChats";
import PurchasingTransactions from "./PurchasingTransactions";
import ChatModal from "./ChatModal";
import TransactionCard from "./TransactionCard";
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
  // These fields are for UI display
  items?: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
};

const VendorManagement: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
  
  const handleChatClick = (id: number) => {
    setActiveChatId(id);
  };
  
  const handleCloseChat = () => {
    setActiveChatId(null);
  };

  const handleCloseTransaction = () => {
    setSelectedTransaction(null);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleConfirmDelivery = async () => {
    if (selectedTransaction) {
      try {
        // Update the transaction status to 'completed'
        await charityService.updateTransactionStatus(selectedTransaction.id, 'completed');
        
        // Update local state
        setTransactions(prevTransactions => 
          prevTransactions.map(tx => 
            tx.id === selectedTransaction.id 
              ? { ...tx, status: 'completed' as TransactionStatus } 
              : tx
          )
        );
        
        toast.success('Transaction marked as completed');
        
        // Close the modal after action
        setSelectedTransaction(null);
      } catch (error) {
        console.error('Error updating transaction status:', error);
        toast.error('Failed to update transaction status');
      }
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
    return stepMap[status];
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
        return <FaMoneyBillWave className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <FaCheckCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FaCheckCircle className="w-5 h-5 opacity-30 text-gray-400" />;
    }
  };

  // Get recent transactions (limit to 5)
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="pt-0.1 bg-[var(--background)] text-[var(--paragraph)] max-w-7xl mx-auto space-y-6">
      {/* Vendor Chats Section with View All link */}
      <div className="relative">
        <VendorChats limit={3} />
        <Link 
          to="/Vhack-2025/charity/vendor-page?tab=chats" 
          className="absolute top-6 right-6 text-[var(--highlight)] hover:underline flex items-center gap-1 text-sm"
        >
          View All <FaExternalLinkAlt size={12} />
        </Link>
      </div>

      {/* Recent Transactions Section with View All link */}
      <div className="relative">
        <div className="bg-[var(--main)] p-6 rounded-lg shadow-xl border border-[var(--stroke)]">
          <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Recent Transactions</h2>
          
          {loading ? (
            <p className="text-center py-6">Loading transactions...</p>
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map(transaction => (
                <div 
                  key={transaction.id}
                  onClick={() => handleTransactionClick(transaction)}
                  className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] cursor-pointer hover:bg-[var(--background)] transition-all"
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-[var(--headline)] font-semibold">
                          {transaction.vendor_name} - {transaction.description}
                        </p>
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
            <p className="text-center py-6">No transactions found. Accept quotations to create transactions.</p>
          )}
        </div>
        
        <Link 
          to="/Vhack-2025/charity/vendor-page?tab=transactions" 
          className="absolute top-6 right-6 text-[var(--highlight)] hover:underline flex items-center gap-1 text-sm"
        >
          View All <FaExternalLinkAlt size={12} />
        </Link>
      </div>
      
      {/* Chat Modal */}
      {activeChatId !== null && (
        <ChatModal 
          chatId={activeChatId} 
          onClose={handleCloseChat} 
        />
      )}

      {/* Transaction Card Modal */}
      {selectedTransaction && (
        <TransactionCard
          transaction={selectedTransaction}
          onClose={handleCloseTransaction}
          onConfirmDelivery={selectedTransaction.status === 'shipping' ? handleConfirmDelivery : undefined}
        />
      )}
    </div>
  );
};

export default VendorManagement;