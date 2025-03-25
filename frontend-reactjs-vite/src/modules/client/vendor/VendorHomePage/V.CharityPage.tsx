import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaHandHoldingHeart, FaComments, FaBoxOpen } from "react-icons/fa";

// Import the components
import CharityChats from "./V.CharityChats";
import OrderManagement from "./OrderManagement";
import CharitySearch from "./CharitySearch";

const VendorCharityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "chats" | "charities">("orders");

  // Animation variants
  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--highlight)] to-purple-600 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Charity Dashboard</h1>
          <div className="flex items-center space-x-1 bg-white/10 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === "orders"
                  ? "bg-white text-[var(--highlight)]"
                  : "text-white hover:bg-white/20"
              } transition-all duration-200`}
            >
              <FaBoxOpen className="mr-2" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === "chats"
                  ? "bg-white text-[var(--highlight)]"
                  : "text-white hover:bg-white/20"
              } transition-all duration-200`}
            >
              <FaComments className="mr-2" />
              Chats
            </button>
            <button
              onClick={() => setActiveTab("charities")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === "charities"
                  ? "bg-white text-[var(--highlight)]"
                  : "text-white hover:bg-white/20"
              } transition-all duration-200`}
            >
              <FaHandHoldingHeart className="mr-2" />
              Charities
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto mt-6 pb-10">
        {activeTab === "orders" && (
          <motion.div
            key="orders"
            initial="hidden"
            animate="visible"
            variants={tabVariants}
            className="bg-white rounded-lg shadow-sm"
          >
            <OrderManagement />
          </motion.div>
        )}

        {activeTab === "chats" && (
          <motion.div
            key="chats"
            initial="hidden"
            animate="visible"
            variants={tabVariants}
            className="bg-white rounded-lg shadow-sm"
          >
            <CharityChats />
          </motion.div>
        )}

        {activeTab === "charities" && (
          <motion.div
            key="charities"
            initial="hidden"
            animate="visible"
            variants={tabVariants}
            className="bg-white rounded-lg shadow-sm"
          >
            <CharitySearch />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VendorCharityPage;