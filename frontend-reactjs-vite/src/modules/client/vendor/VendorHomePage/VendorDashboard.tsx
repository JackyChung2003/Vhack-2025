import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaComments, FaFileInvoiceDollar, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import CharityChats from "./V.CharityChats";
import OrderManagement from "./OrderManagement";
import OrderAnalytics from "../OrderManagement/OrderAnalytics";

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-[var(--background)] text-[var(--paragraph)] max-w-7xl mx-auto min-h-screen relative"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-6 mb-8 shadow-md border border-[var(--stroke)]"
      >
        <div className="flex items-center">
          <FaFileInvoiceDollar className="text-[var(--highlight)] mr-3 text-3xl" />
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--headline)]">Vendor Dashboard</h1>
        </div>
        <p className="mt-3 text-[var(--paragraph)]">
          Manage your orders, track deliveries, and communicate with charity organizations.
        </p>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Order Management Section (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full lg:w-2/3"
        >
          <div className="bg-white rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden p-4">
            <OrderManagement />
          </div>
        </motion.div>
        
        {/* Right sidebar with CharityChats and OrderAnalytics */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* CharityChats Section with reduced height */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden">
              <div className="max-h-[400px] overflow-auto">
                <CharityChats />
              </div>
            </div>
          </motion.div>
          
          {/* Order Summary Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-md border border-[var(--stroke)] overflow-hidden">
              <OrderAnalytics />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default VendorDashboard;