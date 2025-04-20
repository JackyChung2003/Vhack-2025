import React, { useState, useEffect } from "react";
import { FaBox, FaClipboardList, FaTruck, FaCalendarAlt, FaMoneyBillWave, FaChartLine, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import supabase from "../../../services/supabase/supabaseClient";
import FinancialDashboard from "./FinancialManagement/FinancialDashboard"; // Import Financial Dashboard
import TransactionHistory from "./FinancialManagement/TransactionHistory"; // Import Transaction History
import Report from "./FinancialManagement/Report"; // Import Report

interface VendorData {
  name: string;
  id: string;
  created_at: string;
  email?: string;
  company_name?: string;
  location?: string;
  wallet_address?: string;
  // Statistics
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalEarnings: string;
}

const VendorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendorData, setVendorData] = useState<VendorData>({
    name: "",
    id: "",
    created_at: new Date().toISOString(),
    wallet_address: "",
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalEarnings: "RM0"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendor data from the database
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get vendor profile from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .eq('role', 'vendor')
          .single();
        
        if (userError) {
          console.error('Error fetching vendor data:', userError);
          setError('Failed to load vendor profile');
          return;
        }

        // Get detailed vendor information from vendor_profiles table
        const { data: vendorProfileData, error: vendorProfileError } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();
        
        if (vendorProfileError && vendorProfileError.code !== 'PGRST116') {
          console.error('Error fetching vendor profile data:', vendorProfileError);
        }

        // Get order statistics - in a real app, this would come from an orders table
        // For now, we'll use mock data as a fallback but structured to be extensible
        // In the future, you can replace this with actual queries from your orders table
        
        // Example of how to fetch order statistics (commented as placeholder):
        // const { data: ordersData, error: ordersError } = await supabase
        //   .from('orders')
        //   .select('status')
        //   .eq('vendor_id', userData.id);
        
        // const totalOrders = ordersData?.length || 0;
        // const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
        // const completedOrders = ordersData?.filter(order => order.status === 'completed').length || 0;
        
        // Get transaction data for total earnings (placeholder)
        // const { data: transactionsData, error: transactionsError } = await supabase
        //   .from('transactions')
        //   .select('amount')
        //   .eq('vendor_id', userData.id)
        //   .eq('status', 'completed');
        
        // const totalEarnings = transactionsData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

        // Use mock data for statistics that aren't yet implemented
        const mockTotalOrders = 15;
        const mockPendingOrders = 5;
        const mockCompletedOrders = 10;
        const mockTotalEarnings = "RM120,000";

        // Combine all data
        setVendorData({
          name: userData.name || "Vendor",
          id: userData.id,
          created_at: userData.created_at,
          email: user.email,
          company_name: vendorProfileData?.company_name,
          location: vendorProfileData?.location,
          wallet_address: userData.wallet_address || user.id.substring(0, 6) + "..." + user.id.substring(user.id.length - 4),
          totalOrders: mockTotalOrders,
          pendingOrders: mockPendingOrders,
          completedOrders: mockCompletedOrders, 
          totalEarnings: mockTotalEarnings
        });
        
        setError(null);
      } catch (err: any) {
        console.error('Error in fetchVendorData:', err);
        setError(err.message || 'Failed to load vendor data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [user]);

  if (isLoading && !vendorData.name) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="spinner mx-auto text-[var(--highlight)] text-4xl mb-4" />
          <p className="text-[var(--paragraph)]">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  if (error && !vendorData.name) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="bg-[var(--main)] p-8 rounded-xl shadow-xl border border-[var(--stroke)] max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">Error Loading Profile</h2>
          <p className="text-[var(--paragraph)] mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
                  <div className="flex flex-wrap items-center gap-2 text-[var(--paragraph)] mt-1">
                    <span className="flex items-center gap-1 text-sm">
                      <FaCalendarAlt />
                      Joined {new Date(vendorData.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                    {vendorData.company_name && (
                      <span className="flex items-center gap-1 text-sm ml-2">
                        <span className="font-medium">{vendorData.company_name}</span>
                      </span>
                    )}
                    {vendorData.location && (
                      <span className="flex items-center gap-1 text-sm ml-2">
                        <span>{vendorData.location}</span>
                      </span>
                    )}
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

        {/* Content Sections - Now only showing Financial Report */}
        <div className="space-y-8 mb-12">
          {/* Always render Financial Report Content */}
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