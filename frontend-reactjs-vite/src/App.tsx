import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

import HorizontalNavbar from "./modules/client/navigation/HorizontalNavBar/HorizontalNavBar";
import BottomNavBar from "./modules/client/navigation/BottomNavBar/BottomNavBar";
import ProtectedRoute from "./utils/ProtectedRoute";

import { useRole } from "./contexts/RoleContext"; // New role context
import RegisterPage from "./modules/authentication/Register";
import LoginPage from "./modules/authentication/Login";
import HomePage from "./modules/client/common/Dashboard";

import ThemeToggle from "./components/Button/ThemeToggleButton";
import CharityPage from "./modules/client/common/charity/CharityPage";
import CampaignDetail from "./modules/client/common/charity/CampaignDetail";
import CampaignDetailCopy from "./modules/client/common/charity/CampaignDetailCopy";
import OrganizationDetail from "./modules/client/common/charity/OrganizationDetail";
import DonorProfile from "./modules/client/donor/profile/DonorProfile";
import CharityHomePage from "./modules/client/charity/CharityHomePage/CharityHomePage";
import CharityManagementPage from "./modules/client/charity/management/CharityManagementPage";
import VendorPage from "./modules/client/charity/Vendor/VendorPage";
import VendorDashboard from "./modules/client/vendor/VendorHomePage/VendorDashboard";
import VendorProfile from "./modules/client/vendor/VendorProfile";
import OrderHistoryDetails from "./modules/client/vendor/OrderManagement/OrderHistoryDetails";
import OrderHistoryCard from "./modules/client/vendor/OrderManagement/OrderHistoryCard";
import OrderTracker from "./modules/client/vendor/OrderManagement/OrderTracker";
import OrderTrackerDetails from "./modules/client/vendor/OrderManagement/OrderTrackerDetails";
import TransactionHistoryDetails from "./modules/client/vendor/FinancialManagement/TransactionHistoryDetails";
import OrderManagement from "./modules/client/vendor/OrderManagement/OrderManagement";
import SettingsPage from "./modules/client/settings/SettingsPage";

export function App() {
	const { user, loading: authLoading } = useAuth();
	const { userRole, isLoading, roleChecked, clearRole } = useRole();

	console.log("User:", user?.id);
	console.log("userRole", userRole);

	const [isConnected, setIsConnected] = useState(false);
	const navigate = useNavigate();
	const [isopen, setisopen] = useState(false);

	const toggle = () => setisopen(!isopen);

	useEffect(() => {
		if (user) {
			setIsConnected(true);
		} else {
			setIsConnected(false);
			clearRole();
		}
	}, [user, clearRole]);

	if (authLoading || !roleChecked) {
		return <div>Loading...</div>;
	}

	return (
		<div className="App">
			<HorizontalNavbar toggle={toggle} />
			<div className="stickyBottm">
				<BottomNavBar toggle={toggle} />
			</div>
			<Routes>
				{(!isConnected || !roleChecked) ? (
					<>
						<Route path="/login" element={<LoginPage />} />
						<Route path="/register" element={<RegisterPage />} />
						<Route path="*" element={<Navigate to="/login" replace />} />
					</>
				) : (
					<>
						{/* Common Routes - Available to All Roles */}
						<Route element={<ProtectedRoute allowedRoles={['charity', 'vendor', 'donor']} redirectPath="/" />}>
							<Route path="/" element={<HomePage />} />
							<Route path="/charity" element={<CharityPage />} />
							<Route path="/charity/:id" element={<CampaignDetail />} />
							{/* <Route path="/charity/:id" element={<CampaignDetailCopy />} /> */}
							<Route path="/organization/:id" element={<OrganizationDetail />} />
							<Route path="/settings" element={<SettingsPage />} />
						</Route>

						{/* Charity-Specific Routes */}
						<Route element={<ProtectedRoute allowedRoles={['charity']} redirectPath="/" />}>
							<Route path="/Vhack-2025/charity/home" element={<CharityHomePage />} />
							<Route path="/Vhack-2025/charity/profile" element={<OrganizationDetail />} />
							<Route path="/Vhack-2025/charity/vendor-page" element={<VendorPage />} />
							<Route path="/charity-management" element={<CharityManagementPage />} />
						</Route>

						{/* Vendor-Specific Routes */}
						<Route element={<ProtectedRoute allowedRoles={['vendor']} redirectPath="/" />}>
							<Route path="/Vhack-2025/vendor/dashboard" element={<VendorDashboard />} />
							<Route path="/Vhack-2025/vendor/profile" element={<VendorProfile />} />
							<Route path="/vendor/profile" element={<VendorProfile />} />
							<Route path="/vendor/order-history/:id" element={<OrderHistoryCard />} />
							<Route path="/vendor/order-history-details" element={<OrderHistoryDetails />} />
							<Route path="/vendor/order-tracker" element={<OrderTracker />} />
							<Route path="/vendor/order-tracker-details" element={<OrderTrackerDetails />} />
							<Route path="/vendor/transaction-history-details" element={<TransactionHistoryDetails />} />
							<Route path="/vendor/order-management" element={<OrderManagement />} />
						</Route>

						{/* Donor-Specific Routes */}
						<Route element={<ProtectedRoute allowedRoles={['donor']} redirectPath="/" />}>
							<Route path="/donor/profile" element={<DonorProfile />} />

						</Route>

						<Route path="/register" element={<RegisterPage />} />
						<Route path="/login" element={<LoginPage />} />
					</>
				)}

				{/* Default Fallback */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
			{/* Footer */}
			<footer className="footer">
				<p>© Vhack2025 - All Rights Reserved</p>
			</footer>
		</div>
	);
}