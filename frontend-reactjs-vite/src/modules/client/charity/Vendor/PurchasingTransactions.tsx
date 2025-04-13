import React, { useState } from "react";
import { FaCheckCircle, FaPlus, FaFilter, FaBuilding, FaTruck, FaMoneyBillWave } from "react-icons/fa";
import TransactionCard from "./TransactionCard";
import CreateTransactionModal from "./CreateTransactionModal";

// Define transaction status type
type TransactionStatus = 'pending' | 'approved' | 'payment_held' | 'shipped' | 'delivered' | 'completed' | 'rejected';

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

const PurchasingTransactions: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | TransactionStatus>('all');

  // Mock data for transactions with expanded statuses
  const transactions: Transaction[] = [
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
      status: 'approved',
      fundSource: "Education for All",
      createdBy: 'charity',
      date: "2023-05-10"
    },
    {
      id: 3,
      items: [
        { id: 4, name: "Solar Lamps", quantity: 50, price: 15 }
      ],
      totalPrice: 750,
      vendor: "Green Energy Co",
      status: 'payment_held',
      fundSource: "Renewable Energy Fund",
      createdBy: 'charity',
      date: "2023-05-08"
    },
    {
      id: 4,
      items: [
        { id: 5, name: "Medical Kits", quantity: 30, price: 40 }
      ],
      totalPrice: 1200,
      vendor: "MediSupply Inc",
      status: 'shipped',
      fundSource: "Healthcare Initiative",
      createdBy: 'charity',
      date: "2023-05-05"
    },
    {
      id: 5,
      items: [
        { id: 6, name: "Food Packages", quantity: 100, price: 20 }
      ],
      totalPrice: 2000,
      vendor: "Food Relief Suppliers",
      status: 'delivered',
      fundSource: "Hunger Relief Program",
      createdBy: 'vendor',
      date: "2023-04-28"
    },
    {
      id: 6,
      items: [
        { id: 7, name: "Blankets", quantity: 200, price: 8 },
        { id: 8, name: "Hygiene Kits", quantity: 100, price: 12 }
      ],
      totalPrice: 2800,
      vendor: "Essential Supplies Co",
      status: 'completed',
      fundSource: "Winter Relief Fund",
      createdBy: 'charity',
      date: "2023-04-20"
    },
    {
      id: 7,
      items: [
        { id: 9, name: "Construction Materials", quantity: 1, price: 5000 }
      ],
      totalPrice: 5000,
      vendor: "BuildRight Materials",
      status: 'rejected',
      fundSource: "Shelter Program",
      createdBy: 'vendor',
      date: "2023-04-15"
    }
  ];

  // Sort transactions by status
  const sortTransactions = (transactions: Transaction[]) => {
    const statusOrder: Record<TransactionStatus, number> = { 
      'pending': 0, 
      'approved': 1, 
      'payment_held': 2, 
      'shipped': 3, 
      'delivered': 4, 
      'completed': 5,
      'rejected': 6
    };
    
    return [...transactions].sort((a, b) => {
      // First sort by status
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // If status is the same, sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
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

  const handleConfirmDelivery = () => {
    // In a real app, this would call an API to update the transaction status
    if (selectedTransaction) {
      // Update the transaction status to 'delivered'
      console.log(`Confirmed delivery for transaction ${selectedTransaction.id}`);
      // Close the modal after action
      setSelectedTransaction(null);
    }
  };

  // Function to get step value based on status
  const getStepValue = (status: TransactionStatus): number => {
    const stepMap: Record<TransactionStatus, number> = {
      'pending': 0,
      'approved': 1,
      'payment_held': 2,
      'shipped': 3,
      'delivered': 4,
      'completed': 5,
      'rejected': -1
    };
    return stepMap[status];
  };

  // Get status icon based on transaction status
  const getStatusIcon = (status: TransactionStatus) => {
    switch(status) {
      case 'pending':
        return <FaCheckCircle className="w-5 h-5 opacity-30 text-gray-400" />;
      case 'approved':
        return <FaCheckCircle className="w-5 h-5 text-blue-500" />;
      case 'payment_held':
        return <FaMoneyBillWave className="w-5 h-5 text-purple-500" />;
      case 'shipped':
        return <FaTruck className="w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <FaCheckCircle className="w-5 h-5 text-teal-500" />;
      case 'completed':
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <FaCheckCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FaCheckCircle className="w-5 h-5 opacity-30 text-gray-400" />;
    }
  };

  return (
    <div className="bg-[var(--main)] p-6 rounded-lg shadow-xl border border-[var(--stroke)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[var(--headline)]">Transactions</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-1"
          >
            <FaPlus size={12} /> New Order
          </button>
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | TransactionStatus)}
              className="appearance-none bg-[var(--card-background)] border border-[var(--card-border)] text-[var(--paragraph)] py-1.5 px-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="payment_held">Payment Held</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--paragraph)] pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => handleTransactionClick(transaction)}
              className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] cursor-pointer hover:bg-[var(--background)] transition-all"
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className={`text-[var(--headline)] font-semibold ${
                      transaction.status === 'completed' ? 'line-through' : ''
                    }`}>
                      {transaction.vendor} - {transaction.items.length} item(s)
                    </p>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      transaction.status === 'payment_held' ? 'bg-purple-100 text-purple-800' :
                      transaction.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
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
                    {['pending', 'approved', 'payment_held', 'shipped', 'delivered', 'completed'].map((step, index) => {
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
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No transactions found
          </div>
        )}
      </div>

      {/* Transaction Card Modal */}
      {selectedTransaction && (
        <TransactionCard
          transaction={selectedTransaction}
          onClose={handleCloseCard}
          onConfirmDelivery={selectedTransaction.status === 'shipped' ? handleConfirmDelivery : undefined}
        />
      )}

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <CreateTransactionModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default PurchasingTransactions; 