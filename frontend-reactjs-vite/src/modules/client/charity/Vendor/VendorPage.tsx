import React, { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaComments, 
  FaExchangeAlt, 
  FaUserCircle, 
  FaStore, 
  FaHandshake, 
  FaThList, 
  FaBuilding, 
  FaArrowRight
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import VendorChats from "./VendorChats";
import PurchasingTransactions from "./PurchasingTransactions";
import VendorSearch from "./VendorSearch";

const VendorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'transactions' | 'chats' | 'search'>('transactions');

  // Read tab from URL parameters on component mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    if (tab === 'chats' || tab === 'search' || tab === 'transactions') {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Update URL when tab changes
  const handleTabChange = (tab: 'transactions' | 'chats' | 'search') => {
    setActiveTab(tab);
    navigate(`/Vhack-2025/charity/vendor-page?tab=${tab}`, { replace: true });
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
        className="bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] rounded-xl p-8 mb-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white opacity-5 z-0">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center">
            <FaStore className="text-white opacity-80 mr-3 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold">Vendor Management</h1>
          </div>
          <p className="mt-3 opacity-90 max-w-2xl">
            Connect with suppliers, manage purchasing transactions, and find new vendors to help your organization make a greater impact.
          </p>
          <div className="flex mt-6 gap-3">
            <button 
              onClick={() => handleTabChange('transactions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'transactions' 
                  ? 'bg-white text-[var(--highlight)] shadow-md' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <FaExchangeAlt size={14} /> Transactions
            </button>
            <button 
              onClick={() => handleTabChange('chats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'chats' 
                  ? 'bg-white text-[var(--highlight)] shadow-md' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <FaComments size={14} /> Chats
            </button>
            <button 
              onClick={() => handleTabChange('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'search' 
                  ? 'bg-white text-[var(--highlight)] shadow-md' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <FaSearch size={14} /> Find Vendors
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
            isActive={activeTab === 'transactions'} 
            onClick={() => handleTabChange('transactions')}
            icon={<FaExchangeAlt />}
            label="Purchasing Transactions"
          />
          <TabButton 
            isActive={activeTab === 'chats'} 
            onClick={() => handleTabChange('chats')}
            icon={<FaComments />}
            label="Vendor Chats"
          />
          <TabButton 
            isActive={activeTab === 'search'} 
            onClick={() => handleTabChange('search')}
            icon={<FaSearch />}
            label="Find Vendors"
          />
        </div>

        {/* Tab Description */}
        <div className="p-4 bg-[var(--background)] bg-opacity-50">
          {activeTab === 'transactions' && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FaExchangeAlt className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-medium text-[var(--headline)]">Purchase Transactions</h2>
                <p className="text-sm text-[var(--paragraph)]">View and manage your organization's transactions with vendors</p>
              </div>
            </div>
          )}
          {activeTab === 'chats' && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <FaComments className="text-green-600" />
              </div>
              <div>
                <h2 className="font-medium text-[var(--headline)]">Vendor Communications</h2>
                <p className="text-sm text-[var(--paragraph)]">Connect and chat with your suppliers and vendors</p>
              </div>
            </div>
          )}
          {activeTab === 'search' && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <FaSearch className="text-purple-600" />
              </div>
              <div>
                <h2 className="font-medium text-[var(--headline)]">Find Vendors</h2>
                <p className="text-sm text-[var(--paragraph)]">Search for new vendors to work with your organization</p>
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
          {activeTab === 'transactions' && <PurchasingTransactions />}
          {activeTab === 'chats' && <VendorChats />}
          {activeTab === 'search' && <VendorSearch />}
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

export default VendorPage; 