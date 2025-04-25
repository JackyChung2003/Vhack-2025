import React, { useState } from 'react';
import { FaBoxOpen, FaCalendarWeek, FaExclamationCircle, FaTruck, FaMoneyBillWave, FaChartLine, FaEye, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TransactionCard from '../../vendor/VendorHomePage/TransactionCard';

// Mock data for analytics - Replace with actual data fetching later
const mockAnalytics = {
  todayOrders: 5,
  weeklySales: 1250.75,
  pendingOrders: 3,
  completedOrders: 42,
  averageOrderValue: 250.15,
  deliveryTime: "2.5 days",
};

// Mock transaction data for the TransactionCard
const mockTransactions = [
  {
    id: 2,
    items: [
      { id: 2, name: "Water Filters", quantity: 100, price: 5 },
      { id: 3, name: "Water Testing Kits", quantity: 50, price: 10 }
    ],
    totalPrice: 1000,
    organizationId: 1, // Global Relief
    status: 'pending',
    fundSource: "Clean Water Initiative",
    createdBy: 'charity',
    date: "2023-05-15"
  },
  {
    id: 3,
    items: [
      { id: 4, name: "School Supplies Kit", quantity: 200, price: 6 }
    ],
    totalPrice: 1200,
    organizationId: 2, // EduCare
    status: 'pending',
    fundSource: "Education for All",
    createdBy: 'charity',
    date: "2023-05-10"
  },
  {
    id: 4,
    items: [
      { id: 5, name: "Medical Kits", quantity: 80, price: 10 }
    ],
    totalPrice: 800,
    organizationId: 4, // Health Alliance
    status: 'pending',
    fundSource: "General Fund",
    createdBy: 'charity',
    date: "2023-04-28"
  }
];

// Mock data for pending orders
const mockPendingOrders = [
  {
    id: "PO-2023-001",
    transactionId: 2, // ID to link to the transaction detail view
    organization: "Global Relief Fund",
    items: [
      { name: "Water Filters", quantity: 100, price: 5 },
      { name: "Water Testing Kits", quantity: 50, price: 10 }
    ],
    totalAmount: 1000,
    requestDate: "2023-05-15",
    dueDate: "2023-05-30"
  },
  {
    id: "PO-2023-002",
    transactionId: 3, // ID to link to the transaction detail view
    organization: "EduCare Foundation",
    items: [
      { name: "School Supplies Kit", quantity: 200, price: 6 }
    ],
    totalAmount: 1200,
    requestDate: "2023-05-10",
    dueDate: "2023-05-25"
  },
  {
    id: "PO-2023-003",
    transactionId: 4, // ID to link to the transaction detail view
    organization: "Health Alliance",
    items: [
      { name: "Medical Kits", quantity: 80, price: 10 }
    ],
    totalAmount: 800,
    requestDate: "2023-04-28",
    dueDate: "2023-05-20"
  }
];

const OrderAnalytics: React.FC = () => {
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<null | any>(null);
  const navigate = useNavigate();
  
  const togglePendingOrders = () => {
    setShowPendingOrders(!showPendingOrders);
  };

  const handleProcessOrder = (transactionId: number) => {
    // Close the pending orders popup
    setShowPendingOrders(false);
    
    // Find the transaction data
    const transaction = mockTransactions.find(t => t.id === transactionId);
    
    // If found, set the selected transaction to display the TransactionCard
    if (transaction) {
      setSelectedTransaction(transaction);
    }
  };

  const handleCloseTransactionCard = () => {
    setSelectedTransaction(null);
  };

  const handleApproveOrder = () => {
    // Handle approval logic here
    console.log("Order approved");
    
    // Close the transaction card
    setSelectedTransaction(null);
  };

  return (
    <div className="bg-white p-4 h-full">
      <h2 className="text-xl font-bold text-[var(--headline)] mb-3">Order Summary</h2>
      <div className="grid grid-cols-1 gap-3">
        {/* Today's Orders */}
        <div className="bg-[var(--background)] p-3 rounded-lg flex items-center gap-3">
          <FaBoxOpen className="text-blue-500 text-2xl min-w-[28px]" />
          <div>
            <p className="text-xs text-[var(--paragraph)]">Today's Orders</p>
            <p className="text-lg font-semibold text-[var(--headline)]">{mockAnalytics.todayOrders}</p>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-[var(--background)] p-3 rounded-lg flex items-center gap-3">
          <FaChartLine className="text-purple-500 text-2xl min-w-[28px]" />
          <div>
            <p className="text-xs text-[var(--paragraph)]">Avg Order Value</p>
            <p className="text-lg font-semibold text-[var(--headline)]">RM{mockAnalytics.averageOrderValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Avg Delivery Time */}
        <div className="bg-[var(--background)] p-3 rounded-lg flex items-center gap-3">
          <FaTruck className="text-indigo-500 text-2xl min-w-[28px]" />
          <div>
            <p className="text-xs text-[var(--paragraph)]">Avg Delivery Time</p>
            <p className="text-lg font-semibold text-[var(--headline)]">{mockAnalytics.deliveryTime}</p>
          </div>
        </div>

        {/* Weekly Sales */}
        <div className="bg-[var(--background)] p-3 rounded-lg flex items-center gap-3">
          <FaCalendarWeek className="text-green-500 text-2xl min-w-[28px]" />
          <div>
            <p className="text-xs text-[var(--paragraph)]">Weekly Sales</p>
            <p className="text-lg font-semibold text-[var(--headline)]">RM{mockAnalytics.weeklySales.toLocaleString()}</p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-[var(--background)] p-3 rounded-lg flex items-center gap-3">
          <FaMoneyBillWave className="text-teal-500 text-2xl min-w-[28px]" />
          <div>
            <p className="text-xs text-[var(--paragraph)]">Completed Orders</p>
            <p className="text-lg font-semibold text-[var(--headline)]">{mockAnalytics.completedOrders}</p>
          </div>
        </div>

        {/* Pending Orders - Clickable */}
        <div 
          className="bg-[var(--background)] p-3 rounded-lg flex items-center gap-3 hover:bg-[var(--background-hover)] cursor-pointer relative"
          onClick={togglePendingOrders}
        >
          <FaExclamationCircle className="text-yellow-500 text-2xl min-w-[28px]" />
          <div>
            <p className="text-xs text-[var(--paragraph)]">Pending Orders</p>
            <p className="text-lg font-semibold text-[var(--headline)]">{mockAnalytics.pendingOrders}</p>
          </div>
          <FaEye className="text-[var(--paragraph)] ml-auto" />
        </div>
      </div>

      {/* Pending Orders Popup */}
      {showPendingOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--headline)]">Pending Orders</h3>
              <button 
                onClick={togglePendingOrders}
                className="text-[var(--paragraph)] hover:text-[var(--highlight)]"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              {mockPendingOrders.map((order) => (
                <div key={order.id} className="bg-[var(--background)] p-4 rounded-lg border border-[var(--stroke)]">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-[var(--headline)]">{order.id}</span>
                    <span className="text-sm text-yellow-500 font-medium">Pending</span>
                  </div>
                  <p className="text-[var(--paragraph)] mb-2">{order.organization}</p>
                  
                  <div className="mt-3 space-y-1 border-t border-[var(--stroke)] pt-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>RM{(item.quantity * item.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-3 pt-2 border-t border-[var(--stroke)]">
                    <span className="text-[var(--paragraph)]">Total:</span>
                    <span className="font-semibold text-[var(--headline)]">RM{order.totalAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--paragraph)]">
                    <div>
                      <span className="block">Requested:</span>
                      <span className="block font-medium">{order.requestDate}</span>
                    </div>
                    <div>
                      <span className="block">Due Date:</span>
                      <span className="block font-medium">{order.dueDate}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => handleProcessOrder(order.transactionId)}
                      className="px-3 py-1 bg-[var(--highlight)] text-white rounded-md text-sm"
                    >
                      Process
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Card Modal */}
      {selectedTransaction && (
        <TransactionCard
          transaction={selectedTransaction}
          onClose={handleCloseTransactionCard}
          onMarkAsShipped={handleApproveOrder}
        />
      )}
    </div>
  );
};

export default OrderAnalytics;
