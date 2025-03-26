import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaSearch, 
  FaComments, 
  FaExchangeAlt, 
  FaHandHoldingHeart, 
  FaBuilding,
  FaBoxOpen,
  FaChartLine
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import CharityChats from "./V.CharityChats";
import OrderManagement from "./OrderManagement";
import CharitySearch from "./CharitySearch";

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'orders' | 'chats' | 'charities'>('orders');

  // Read tab from URL parameters on component mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    if (tab === 'chats' || tab === 'charities' || tab === 'orders') {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Update URL when tab changes
  const handleTabChange = (tab: 'orders' | 'chats' | 'charities') => {
    setActiveTab(tab);
    navigate(`/Vhack-2025/vendor/dashboard?tab=${tab}`, { replace: true });
  };

  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2 
      }
    }
  };
  
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

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
            <FaBoxOpen className="text-white opacity-80 mr-3 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold">Vendor Dashboard</h1>
          </div>
          <p className="mt-3 opacity-90 max-w-2xl">
            Manage your orders, communicate with charity organizations, and grow your impact by connecting with more charitable causes.
          </p>
          <div className="flex mt-6 gap-3">
            <button
              onClick={() => handleTabChange('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'orders' 
                  ? 'bg-white text-[var(--highlight)] shadow-md' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <FaExchangeAlt size={14} /> Orders
            </button>
            <button
              onClick={() => handleTabChange('chats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'chats' 
                  ? 'bg-white text-[var(--highlight)] shadow-md' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <FaComments size={14} /> Messages
            </button>
            <button
              onClick={() => handleTabChange('charities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'charities' 
                  ? 'bg-white text-[var(--highlight)] shadow-md' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <FaSearch size={14} /> Find Organisation
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Secondary Tab Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] mb-6 overflow-hidden"
      >
        <div className="flex border-b border-[var(--stroke)]">
          <TabButton 
            isActive={activeTab === 'orders'} 
            onClick={() => handleTabChange('orders')}
            icon={<FaExchangeAlt />}
            label="Order Management"
          />
          <TabButton 
            isActive={activeTab === 'chats'} 
            onClick={() => handleTabChange('chats')}
            icon={<FaComments />}
            label="Charity Chat"
          />
          <TabButton 
            isActive={activeTab === 'charities'} 
            onClick={() => handleTabChange('charities')}
            icon={<FaSearch />}
            label="Find Organisations"
          />
        </div>

        {/* Tab Description */}
        <div className="p-4 bg-[var(--background)] bg-opacity-50">
          {activeTab === 'orders' && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FaExchangeAlt className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-medium text-[var(--headline)]">Order Management</h2>
                <p className="text-sm text-[var(--paragraph)]">Review and process orders from charity organizations</p>
              </div>
            </div>
          )}
          {activeTab === 'chats' && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <FaComments className="text-green-600" />
              </div>
              <div>
                <h2 className="font-medium text-[var(--headline)]">Charity Chat</h2>
                <p className="text-sm text-[var(--paragraph)]">Chat with charity organizations and respond to inquiries</p>
              </div>
            </div>
          )}
          {activeTab === 'charities' && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <FaSearch className="text-purple-600" />
              </div>
              <div>
                <h2 className="font-medium text-[var(--headline)]">Find Organizations</h2>
                <p className="text-sm text-[var(--paragraph)]">Discover charity organizations that might need your products</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={tabContentVariants}
          className="bg-[var(--main)] rounded-xl shadow-md overflow-hidden"
        >
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'chats' && <CharityChats />}
          {activeTab === 'charities' && <CharitySearch />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// Tab button component
interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, icon, label }) => {
  return (
    <button
      className={`px-5 py-3 font-medium flex items-center relative transition-all ${
        isActive 
          ? 'text-[var(--highlight)]' 
          : 'text-[var(--paragraph)] hover:text-[var(--headline)]'
      }`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
      {isActive && (
        <motion.div 
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--highlight)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </button>
  );
};

export default VendorDashboard; 