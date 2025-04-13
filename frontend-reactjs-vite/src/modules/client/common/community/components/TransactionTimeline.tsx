import React, { useMemo } from "react";
import { 
  FaFileInvoiceDollar, 
  FaMoneyBillWave, 
  FaBuilding, 
  FaUsers, 
  FaChevronRight,
  FaCalendarAlt
} from "react-icons/fa";

interface TransactionTimelineProps {
  communityId: number;
  communityType: string;
}

interface Transaction {
  id: number;
  date: string;
  vendor: string;
  amount: number;
  description: string;
  hasInvoice: boolean;
  type: string;
  status: string;
}

interface GroupedTransactions {
  [key: string]: {
    transactions: Transaction[];
    totalExpenses: number;
  };
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ communityId, communityType }) => {
  // Mock transaction data - filtered to only include expenses
  const transactions = [
    {
      id: 2,
      date: "2024-03-10",
      vendor: "Medical Supplies Co.",
      amount: 3500,
      description: "Purchase of water filtration systems",
      hasInvoice: true,
      type: "expense",
      status: "pending" // Added status field
    },
    {
      id: 4,
      date: "2024-02-28",
      vendor: "Transport Services Ltd",
      amount: 1500,
      description: "Transportation of supplies to affected areas",
      hasInvoice: true,
      type: "expense",
      status: "completed"
    },
    {
      id: 6,
      date: "2024-02-15",
      vendor: "Community Center",
      amount: 1200,
      description: "Venue rental for community training",
      hasInvoice: true,
      type: "expense",
      status: "completed"
    }
  ];

  const groupedTransactions = useMemo(() => {
    return transactions.reduce((groups: GroupedTransactions, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = {
          transactions: [],
          totalExpenses: 0
        };
      }
      
      groups[monthYear].transactions.push(transaction);
      groups[monthYear].totalExpenses += transaction.amount;
      
      return groups;
    }, {});
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="bg-[var(--main)] p-6 rounded-xl border border-[var(--stroke)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[var(--headline)]">Expense Timeline</h3>
            <p className="text-[var(--paragraph)] mt-1">
              Track campaign expenses and upcoming payments
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              Pending
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[var(--tertiary)]"></div>
              Completed
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--tertiary)]"></div>
          
          <div className="space-y-8">
            {Object.entries(groupedTransactions).map(([monthYear, group]) => (
              <div key={monthYear} className="relative">
                <div className="mb-4 flex items-center gap-2 pl-14">
                  <FaCalendarAlt className="text-[var(--headline)]" />
                  <h4 className="font-semibold text-[var(--headline)]">{monthYear}</h4>
                  <div className="flex-1 border-b border-dashed border-[var(--stroke)]"></div>
                  <div className="text-sm text-[var(--paragraph)]">
                    <span className="text-red-600">-RM{group.totalExpenses.toLocaleString()}</span>
                  </div>
                </div>

                {group.transactions.map((transaction) => (
                  <div key={transaction.id} className="relative pl-14 group">
                    <div className={`absolute left-4 top-0 w-4 h-4 rounded-full transform -translate-x-1/2 border-4 border-[var(--main)] transition-all group-hover:scale-110 ${
                      transaction.status === 'pending' 
                        ? 'bg-yellow-500' 
                        : 'bg-[var(--tertiary)]'
                    }`}></div>

                    <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--stroke)] transition-all hover:border-[var(--highlight)] hover:shadow-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg bg-gray-100`}>
                            <FaBuilding className="text-gray-500" />
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--headline)]">
                              {transaction.type === 'expense' ? 'Expense' : 'Donation'}
                            </span>
                            <div className="text-sm text-[var(--paragraph)]">
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <span className={`text-lg font-bold ${
                          transaction.type === 'expense' 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {transaction.type === 'expense' ? '-' : '+'} RM{transaction.amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg bg-gray-100`}>
                          <FaUsers className="text-gray-500" />
                        </div>
                        <span className="font-medium text-[var(--headline)]">{transaction.vendor}</span>
                      </div>

                      <p className="text-[var(--paragraph)] mb-3">{transaction.description}</p>

                      {transaction.hasInvoice && (
                        <button className="flex items-center gap-2 text-sm text-[var(--tertiary)] hover:text-[var(--highlight)] transition-colors group">
                          <FaFileInvoiceDollar />
                          <span>View Invoice</span>
                          <FaChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTimeline; 