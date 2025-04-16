import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaComments } from "react-icons/fa";
import { motion } from "framer-motion";
import CharityChats from "./V.CharityChats";
import CharitySearch from "./CharitySearch";

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-[var(--background)] text-[var(--paragraph)] max-w-7xl mx-auto min-h-screen"
    >
      {/* Header with gradient background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)] rounded-xl p-8 mb-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white opacity-5 z-0">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center">
            <FaSearch className="text-white opacity-80 mr-3 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold">Vendor Dashboard</h1>
          </div>
          <p className="mt-3 opacity-90 max-w-2xl">
            Communicate with charity organizations and discover new opportunities to collaborate.
          </p>
        </div>
      </motion.div>

      {/* Combined Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Find Organizations Section (3/4 width) */}
        <div className="w-full lg:w-3/4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[var(--main)] rounded-xl shadow-md overflow-hidden h-full"
          >
            <CharitySearch />
          </motion.div>
        </div>
        
        {/* Charity Chat Section (1/4 width) */}
        <div className="w-full lg:w-1/4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[var(--main)] rounded-xl shadow-md overflow-hidden h-full"
          >
            <CharityChats />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default VendorDashboard;