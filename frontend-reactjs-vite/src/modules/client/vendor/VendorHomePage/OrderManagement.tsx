import React, { useState } from "react";
import { FaCheckCircle, FaPlus, FaFilter, FaBuilding, FaTruck, FaMoneyBillWave } from "react-icons/fa";
import TransactionCard from "./TransactionCard";
import CreateTransactionModal from "./CreateTransactionModal";
import { mockOrganizations } from "../../../../utils/mockData";

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
  organizationId: number;
  status: TransactionStatus;
  fundSource: string;
  createdBy: 'charity' | 'vendor';
  date: string;
};

const OrderManagement: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<null | {
    id: number;
    items: Array<{
      id: number;
      name: string;
      quantity: number;
      price: number;
    }>;
    totalPrice: number;
    organizationId: number;
    status: TransactionStatus;
    fundSource: string;
    createdBy: 'charity' | 'vendor';
    date: string;
  }>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | TransactionStatus>('all');

  // Mock data for transactions with expanded statuses
  const transactions: Transaction[] = [
    {
      id: 1,
      items: [
        { id: 1, name: "Water Filter X200", quantity: 100, price: 50 }
      ],
      totalPrice: 5000,
      organizationId: 1, // Global Relief
      status: 'completed' as TransactionStatus,
      fundSource: "Clean Water Initiative",
      createdBy: 'charity' as 'charity' | 'vendor',
      date: "2023-05-15"
    },
    {
      id: 2,
      items: [
        { id: 2, name: "Water Filters", quantity: 100, price: 5 },
        { id: 3, name: "Water Testing Kits", quantity: 50, price: 10 }
      ],
      totalPrice: 1000,
      organizationId: 1, // Global Relief
      status: 'pending' as TransactionStatus,
      fundSource: "Clean Water Initiative",
      createdBy: 'charity' as 'charity' | 'vendor',
      date: "2023-05-15"
    },
    {
      id: 3,
      items: [
        { id: 4, name: "School Supplies Kit", quantity: 200, price: 6 }
      ],
      totalPrice: 1200,
      organizationId: 2, // EduCare
      status: 'approved' as TransactionStatus,
      fundSource: "Education for All",
      createdBy: 'vendor' as 'charity' | 'vendor',
      date: "2023-05-10"
    },
    {
      id: 4,
      items: [
        { id: 5, name: "Medical Kits", quantity: 80, price: 10 }
      ],
      totalPrice: 800,
      organizationId: 4, // Health Alliance
      status: 'payment_held' as TransactionStatus,
      fundSource: "General Fund",
      createdBy: 'charity' as 'charity' | 'vendor',
      date: "2023-04-28"
    },
    {
      id: 5,
      items: [
        { id: 6, name: "Food Packages", quantity: 150, price: 10 }
      ],
      totalPrice: 1500,
      organizationId: 3, // Nature First
      status: 'shipped' as TransactionStatus,
      fundSource: "Hunger Relief",
      createdBy: 'vendor' as 'charity' | 'vendor',
      date: "2023-04-20"
    },
    {
      id: 6,
      items: [
        { id: 7, name: "Hygiene Kits", quantity: 120, price: 8 }
      ],
      totalPrice: 960,
      organizationId: 1, // Global Relief
      status: 'delivered' as TransactionStatus,
      fundSource: "Emergency Response",
      createdBy: 'charity' as 'charity' | 'vendor',
      date: "2023-04-15"
    },
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

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseCard = () => {
    setSelectedTransaction(null);
  };

  const handleApprove = () => {
    if (selectedTransaction) {
      console.log(`Approved transaction ID: ${selectedTransaction.id}`);
      // In a real app, you would call an API to update the transaction
      // For now, we'll just simulate the update
      const updatedTransaction = {
        ...selectedTransaction,
        status: 'payment_held' as TransactionStatus
      };
      setSelectedTransaction(updatedTransaction);
      
      // Here you would typically update the transactions list as well
      // For demo purposes, we're just logging
      console.log("Payment is now held in escrow until delivery confirmation");
    }
  };

  const handleMarkAsShipped = () => {
    if (selectedTransaction) {
      console.log(`Marked as shipped transaction ID: ${selectedTransaction.id}`);
      // In a real app, you would call an API to update the transaction
      const updatedTransaction = {
        ...selectedTransaction,
        status: 'shipped' as TransactionStatus
      };
      setSelectedTransaction(updatedTransaction);
      
      // Here you would typically update the transactions list as well
      console.log("Order has been marked as shipped. Waiting for charity to confirm delivery.");
    }
  };

  const handleCreateTransaction = () => {
    setShowCreateModal(true);
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

  // Function to get progress percentage based on status
  const getProgressPercentage = (status: TransactionStatus) => {
    switch(status) {
      case 'pending': return 10;
      case 'approved': return 25;
      case 'payment_held': return 40;
      case 'shipped': return 60;
      case 'delivered': return 80;
      case 'completed': return 100;
      case 'rejected': return 0;
      default: return 0;
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

  return (
    <div className="bg-[var(--main)] p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--headline)]">Organization Orders</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--stroke)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="payment_held">Payment Held</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
            </select>
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button 
            onClick={handleCreateTransaction}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 flex items-center gap-2 transition-all"
          >
            <FaPlus /> New Order
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => {
            const organization = mockOrganizations.find(org => org.id === transaction.organizationId);
            return (
              <div
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)}
                className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] cursor-pointer hover:bg-[var(--background)] transition-all"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-[var(--highlight)]" />
                        <p className={`text-[var(--headline)] font-semibold ${
                          transaction.status === 'completed' ? 'line-through' : ''
                        }`}>
                          {organization?.name || 'Unknown Organization'} - {transaction.items.length} item(s)
                        </p>
                      </div>
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
                      Created by: {transaction.createdBy === 'vendor' ? 'You' : organization?.name} | Date: {transaction.date}
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
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            No orders found
          </div>
        )}
      </div>

      {/* Transaction Card Modal */}
      {selectedTransaction && (
        <TransactionCard
          transaction={selectedTransaction}
          onClose={handleCloseCard}
          onApprove={selectedTransaction.status === 'pending' && selectedTransaction.createdBy === 'charity' ? handleApprove : undefined}
          onMarkAsShipped={selectedTransaction.status === 'payment_held' ? handleMarkAsShipped : undefined}
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

export default OrderManagement; 