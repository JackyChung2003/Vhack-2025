import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";

import HorizontalNavbar from "./modules/client/navigation/HorizontalNavBar/HorizontalNavBar";
import BottomNavBar from "./modules/client/navigation/BottomNavBar/BottomNavBar";
import ProtectedRoute from "./utils/ProtectedRoute";
import { useRole } from "./hooks/useRole"; // Adjust the path based on your project structure

import RegisterPage from "./modules/authentication/Register";
import HomePage from "./modules/client/common/Dashboard";
import ThemeToggle from "./components/Button/ThemeToggleButton";
import CharityPage from "./modules/client/common/charity/CharityPage";
import CampaignDetail from "./modules/client/common/charity/CampaignDetail";
import OrganizationDetail from "./modules/client/common/charity/OrganizationDetail";
import CommunityPage from "./modules/client/common/community/CommunityPage";
import CommunityDetail from "./modules/client/common/community/CommunityDetail";
import DonorProfile from "./modules/client/donor/profile/DonorProfile";
import CharityProfile from "./modules/client/charity/profile/CharityProfile";
import CharityHomePage from "./modules/client/charity/CharityHomePage/CharityHomePage";
import CreateCampaign from "./components/form/CreateCampaign";
import VendorPage from "./modules/client/charity/Vendor/VendorPage";
import VendorProfile from "./modules/client/vendor/VendorProfile";
import OrderHistoryDetails from "./modules/client/vendor/OrderManagement/OrderHistoryDetails";
import OrderHistoryCard from "./modules/client/vendor/OrderManagement/OrderHistoryCard";

export function App() {
  const activeAccount = useActiveAccount();

  const [isConnected, setIsConnected] = useState(false);

  const toggleConnect = () => setIsConnected(!isConnected);

  const navigate = useNavigate();
  const [isopen, setisopen] = useState(false);

  const toggle = () => setisopen(!isopen);

  useEffect(() => {
    if (activeAccount?.address) {
      setIsConnected(true);
      localStorage.setItem("walletAddress", activeAccount.address);
    } else {
      setIsConnected(false);
    }
    console.log("Address: now", activeAccount?.address);
  }, [activeAccount]);

  return (
    <div className="App">
      <HorizontalNavbar toggle={toggle} />
      <div className="stickyBottm">
        <BottomNavBar toggle={toggle} />
      </div>

      <main>
        {!isConnected ? (
          <div>
            Welcome, please connect your account.
            <ThemeToggle />
          </div>
        ) : (
          <div>
            Welcome back, your account is connected.
            <ThemeToggle />
          </div>
        )}
      </main>
      <Routes>
        {!isConnected ? (
          <>
            <Route path="*" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<RegisterPage />} />
          </>
        ) : (
          <>
            {/* Common Routes - Available to All Roles */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["charity", "vendor", "donor"]}
                  redirectPath="/"
                />
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/charity" element={<CharityPage />} />
              <Route path="/charity/:id" element={<CampaignDetail />} />
              <Route path="/organization/:id" element={<OrganizationDetail />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route
                path="/community/:type/:id"
                element={<CommunityDetail />}
              />
            </Route>

            {/* Charity-Specific Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["charity"]} redirectPath="/" />
              }
            >
              <Route path="/Vhack-2025/charity/home" element={<CharityHomePage />} />
              <Route path="/Vhack-2025/charity/profile" element={<CharityProfile />} />
              <Route path="/create-campaign" element={<CreateCampaign />} />
              <Route
                path="/Vhack-2025/charity/vendor-page"
                element={<VendorPage />}
              />
            </Route>

            {/* Vendor-Specific Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["vendor"]} redirectPath="/" />
              }
            >
              <Route path="/vendor/profile" element={<VendorProfile />} />
              <Route path="/vendor/order-history/:id" element={<OrderHistoryCard />} />
              <Route path="/vendor/order-history-details" element={<OrderHistoryDetails />} />
            </Route>

            {/* Donor-Specific Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["donor"]} redirectPath="/" />
              }
            >
              <Route path="/donor/profile" element={<DonorProfile />} />
            </Route>
          </>
        )}

        {/* Default Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Footer */}
      <footer className="bg-[#051F20] text-white text-center py-2 w-full mt-auto">
        <p>© Vhack2025 - All Rights Reserved</p>
      </footer>
    </div>
  );
}