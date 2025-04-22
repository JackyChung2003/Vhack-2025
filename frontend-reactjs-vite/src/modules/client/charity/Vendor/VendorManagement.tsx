import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt, FaCheckCircle, FaTruck, FaMoneyBillWave, FaBoxOpen } from "react-icons/fa";
import VendorChats from "./VendorChats";
import PurchasingTransactions from "./PurchasingTransactions";
import ChatModal from "./ChatModal";
import TransactionCard from "./TransactionCard";

// Define transaction status type
type TransactionStatus = 'pending' | 'shipping' | 'delivered' | 'completed' | 'rejected';

// Define a Transaction type
type Transaction = {
  id: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  vendor: string;
  status: TransactionStatus;
  fundSource: string;
  createdBy: 'charity' | 'vendor';
  date: string;
};

const VendorManagement: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
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

  const handleConfirmDelivery = () => {
    // In a real app, this would call an API to update the transaction status
    if (selectedTransaction) {
      // Update the transaction status to 'delivered'
      console.log(`Confirmed delivery for transaction ${selectedTransaction.id}`);
      // Close the modal after action
      setSelectedTransaction(null);
    }
  };

  // Mock recent transactions with expanded statuses
  const recentTransactions: Transaction[] = [
    {
      id: 1,
      items: [
        { id: 1, name: "Water Filters", quantity: 100, price: 5 },
        { id: 2, name: "Water Testing Kits", quantity: 50, price: 10 }
      ],
      totalPrice: 1000,
      vendor: "ABC Supplies",
      status: 'pending',
      fundSource: "Clean Water Initiative",
      createdBy: 'charity',
      date: "2023-05-15"
    },
    {
      id: 2,
      items: [
        { id: 3, name: "School Supplies Kit", quantity: 200, price: 6 }
      ],
      totalPrice: 1200,
      vendor: "XYZ Traders",
      status: 'shipping',
      fundSource: "Education for All",
      createdBy: 'vendor',
      date: "2023-05-10"
    }
  ];

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
          
          {/* Display recent transactions with progress indicators */}
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
                        {transaction.vendor} - {transaction.items.length} item(s)
                      </p>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'shipping' ? 'bg-indigo-100 text-indigo-800' :
                        transaction.status === 'delivered' ? 'bg-teal-100 text-teal-800' :
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--paragraph)]">
                      Total: RM{transaction.totalPrice.toLocaleString()} | Fund: {transaction.fundSource}
                    </p>
                    <p className="text-sm text-[var(--paragraph)]">
                      Created by: {transaction.createdBy === 'charity' ? 'You' : transaction.vendor} | Date: {transaction.date}
                    </p>
                    
                    {/* Compact step indicators */}
                    <div className="flex mt-3 space-x-1">
                      {['pending', 'shipped', 'delivered', 'completed'].map((step, index) => {
                        const isActive = getStepValue(transaction.status as TransactionStatus) >= index;
                        const isCurrentStep = getStepValue(transaction.status as TransactionStatus) === index;
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
                    {getStatusIcon(transaction.status as TransactionStatus)}
                  </div>
                </div>
              </div>
            ))}
          </div>
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