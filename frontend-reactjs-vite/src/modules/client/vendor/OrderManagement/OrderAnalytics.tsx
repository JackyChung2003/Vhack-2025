import React from 'react';
import { FaBoxOpen, FaCalendarWeek, FaExclamationCircle } from 'react-icons/fa';

// Mock data for analytics - Replace with actual data fetching later
const mockAnalytics = {
  todayOrders: 5,
  weeklySales: 1250.75,
  pendingOrders: 3,
};

const OrderAnalytics: React.FC = () => {
  return (
    <div className="bg-[var(--card-background)] p-6 rounded-xl shadow-md border border-[var(--card-border)] mb-8">
      <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Order Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Orders */}
        <div className="bg-[var(--background)] p-4 rounded-lg flex items-center gap-4">
          <FaBoxOpen className="text-blue-500 text-2xl" />
          <div>
            <p className="text-sm text-[var(--paragraph)]">Today's Orders</p>
            <p className="text-lg font-semibold text-[var(--headline)]">{mockAnalytics.todayOrders}</p>
          </div>
        </div>

        {/* Weekly Sales */}
        <div className="bg-[var(--background)] p-4 rounded-lg flex items-center gap-4">
          <FaCalendarWeek className="text-green-500 text-2xl" />
          <div>
            <p className="text-sm text-[var(--paragraph)]">Sales This Week</p>
            <p className="text-lg font-semibold text-[var(--headline)]">RM{mockAnalytics.weeklySales.toLocaleString()}</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-[var(--background)] p-4 rounded-lg flex items-center gap-4">
          <FaExclamationCircle className="text-yellow-500 text-2xl" />
          <div>
            <p className="text-sm text-[var(--paragraph)]">Pending Orders</p>
            <p className="text-lg font-semibold text-[var(--headline)]">{mockAnalytics.pendingOrders}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics;
