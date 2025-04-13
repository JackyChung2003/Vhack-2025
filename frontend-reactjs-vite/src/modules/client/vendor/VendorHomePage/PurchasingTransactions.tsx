import React, { useState } from "react";
import { FaCheckCircle, FaPlus, FaFilter, FaBuilding } from "react-icons/fa";
import TransactionCard from "./TransactionCard";
import CreateTransactionModal from "./CreateTransactionModal";
import { mockOrganizations } from "../../../../utils/mockData";

const PurchasingTransactions: React.FC = () => {
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
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    fundSource: string;
    createdBy: 'charity' | 'vendor';
    date: string;
  }>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  // Mock data for transactions
  const transactions = [
    {
      id: 1,
      items: [
        { id: 1, name: "Water Filters", quantity: 100, price: 5 },
        { id: 2, name: "Water Testing Kits", quantity: 50, price: 10 }
      ],
      totalPrice: 1000,
      organizationId: 1, // Global Relief
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
      organizationId: 2, // EduCare
      status: 'approved',
      fundSource: "Education for All",
      createdBy: 'vendor',
      date: "2023-05-10"
    },
    {
      id: 3,
      items: [
        { id: 4, name: "Medical Kits", quantity: 80, price: 10 }
      ],
      totalPrice: 800,
      organizationId: 4, // Health Alliance
      status: 'completed',
      fundSource: "General Fund",
      createdBy: 'charity',
      date: "2023-04-28"
    },
    {
      id: 4,
      items: [
        { id: 5, name: "Food Packages", quantity: 150, price: 10 }
      ],
      totalPrice: 1500,
      organizationId: 3, // Nature First
      status: 'completed',
      fundSource: "Hunger Relief",
      createdBy: 'vendor',
      date: "2023-04-20"
    },
  ];

  // Filter transactions based on status
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === filter);

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseCard = () => {
    setSelectedTransaction(null);
  };

  const handleApprove = () => {
    console.log(`Approved transaction ID: ${selectedTransaction?.id}`);
    setSelectedTransaction(null);
  };

  const handleCreateTransaction = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="bg-[var(--main)] p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--headline)]">Organization Transactions</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--stroke)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            >
              <option value="all">All Transactions</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button 
            onClick={handleCreateTransaction}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 flex items-center gap-2 transition-all"
          >
            <FaPlus /> New Transaction
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => {
            const organization = mockOrganizations.find(org => org.id === transaction.organizationId);
            return (
              <div
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)}
                className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] flex items-center cursor-pointer hover:bg-[var(--background)] transition-all"
              >
                <div className="flex-1">
                  <div className="flex justify-between">
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
                      'bg-green-100 text-green-800'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--paragraph)]">
                    Total: RM{transaction.totalPrice.toLocaleString()} | Fund: {transaction.fundSource}
                  </p>
                  <p className="text-sm text-[var(--paragraph)]">
                    Created by: {transaction.createdBy === 'vendor' ? 'You' : organization?.name} | Date: {transaction.date}
                  </p>
                </div>
                {/* Status icon */}
                <div className={transaction.status === 'completed' ? "text-green-500" : "text-gray-400"}>
                  <FaCheckCircle className={`w-5 h-5 ${transaction.status === 'completed' ? '' : 'opacity-30'}`} />
                </div>
              </div>
            );
          })
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
          onApprove={selectedTransaction.status === 'pending' && selectedTransaction.createdBy === 'vendor' ? handleApprove : undefined}
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