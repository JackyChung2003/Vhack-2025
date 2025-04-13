import React, { useState } from "react";
import { FaBox, FaClipboardList, FaTruck, FaCalendarAlt, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OrderHistory from "./OrderManagement/OrderHistory";
import OrderRequest from "./OrderManagement/OrderRequest";
import OrderManagement from "./VendorHomePage/OrderManagement";
import FinancialDashboard from "./FinancialManagement/FinancialDashboard"; // Import Financial Dashboard
import TransactionHistory from "./FinancialManagement/TransactionHistory"; // Import Transaction History
import Report from "./FinancialManagement/Report"; // Import Report

const VendorProfile: React.FC = () => {
  const navigate = useNavigate();

  // State for active tab
  const [activeTab, setActiveTab] = useState<"manageOrders" | "financialReport">("manageOrders");

  // Mock vendor data - In a real app, fetch this from your backend
  const vendorData = {
    name: "Vendor ABC",
    walletAddress: "0xEBC8...62D9",
    joinDate: "2023-05-10",
    totalOrders: 15,
    pendingOrders: 5,
    completedOrders: 10,
    totalEarnings: "RM120,000",
  };

  const handleViewAllOrders = () => {
    navigate("/vendor/order-history-details"); // Redirect to the detailed order history page
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] h-48">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-white text-3xl font-bold pt-12 relative z-10 drop-shadow-md">Vendor Profile</h1>
          <p className="text-white text-opacity-90 relative z-10 drop-shadow-sm">Manage your orders and finances</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16">
        {/* Profile Card - Overlapping Hero */}
        <div className="bg-[var(--main)] rounded-xl shadow-xl border border-[var(--stroke)] p-6 mb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[var(--highlight)] to-[var(--tertiary)] flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg border-4 border-[var(--main)]">
              {vendorData.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--headline)]">{vendorData.name}</h1>
                  <div className="flex items-center gap-2 text-[var(--paragraph)] mt-1">
                    <span className="bg-[var(--highlight)] bg-opacity-20 text-white font-bold px-3 py-1 rounded-full text-sm drop-shadow-sm">
                      Vendor
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <FaCalendarAlt />
                      Joined {new Date(vendorData.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="bg-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium text-[var(--headline)] flex items-center gap-2 border border-[var(--stroke)]">
                    <span className="font-bold">Wallet:</span>
                    <span className="font-mono">{vendorData.walletAddress}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Stat icon={<FaBox />} value={vendorData.totalOrders} label="Total Orders" />
                <Stat icon={<FaClipboardList />} value={vendorData.pendingOrders} label="Pending Orders" />
                <Stat icon={<FaTruck />} value={vendorData.completedOrders} label="Completed Orders" />
                <Stat icon={<FaMoneyBillWave />} value={vendorData.totalEarnings} label="Total Earnings" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] mb-8">
          <div className="flex p-2">
            <button
              onClick={() => setActiveTab("manageOrders")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "manageOrders"
                  ? "bg-[var(--highlight)] text-white font-bold shadow-sm"
                  : "text-[var(--paragraph)] hover:text-[var(--headline)] hover:bg-[var(--background)]"
              }`}
            >
              <FaBox className="inline mr-2" />
              Manage Your Orders
            </button>
            <button
              onClick={() => setActiveTab("financialReport")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "financialReport"
                  ? "bg-[var(--highlight)] text-white font-bold shadow-sm"
                  : "text-[var(--paragraph)] hover:text-[var(--headline)] hover:bg-[var(--background)]"
              }`}
            >
              <FaChartLine className="inline mr-2" />
              Financial Report
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 mb-12">
          {activeTab === "manageOrders" && (
            <>
              {/* Order History Section */}
              <div className="animate-fadeIn">
                <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[var(--headline)]">Order History</h2>
                    <button
                      onClick={handleViewAllOrders}
                      className="flex items-center justify-center w-10 h-10 bg-white text-[var(--highlight)] rounded-full shadow-md hover:opacity-90 transition-all"
                    >
                      →
                    </button>
                  </div>
                  <OrderHistory />
                </div>
              </div>

              {/* Order Management Section */}
              <div className="animate-fadeIn delay-100">
                <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] p-6">
                  <OrderManagement />
                </div>
              </div>

              {/* Order Request Section */}
              <div className="animate-fadeIn delay-200">
                <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] p-6">
                  <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Order Requests</h2>
                  <OrderRequest />
                </div>
              </div>
            </>
          )}

          {activeTab === "financialReport" && (
            <>
              {/* Financial Dashboard Section */}
              <div className="animate-fadeIn">
                <FinancialDashboard />
              </div>

              {/* Transaction History Section */}
              <div className="animate-fadeIn delay-100">
                <TransactionHistory />
              </div>

              {/* Reports Section */}
              <div className="animate-fadeIn delay-200">
                <Report />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat component with improved contrast
const Stat: React.FC<{ icon: React.ReactNode; value: number | string; label: string }> = ({ icon, value, label }) => (
  <div className="bg-[var(--background)] p-4 rounded-lg hover:shadow-md transition-shadow border border-[var(--stroke)]">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[var(--highlight)]">{icon}</span>
      <span className="font-semibold text-[var(--headline)]">{label}</span>
    </div>
    <p className="text-xl font-bold text-[var(--headline)]">{value}</p>
  </div>
);

export default VendorProfile;