import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

import HorizontalNavbar from "./modules/client/navigation/HorizontalNavBar/HorizontalNavBar";
import BottomNavBar from "./modules/client/navigation/BottomNavBar/BottomNavBar";
import ProtectedRoute from "./utils/ProtectedRoute";

import { useRole } from "./contexts/RoleContext"; // New role context
import RegisterPage from "./modules/authentication/Register";
import LoginPage from "./modules/authentication/Login";
import LandingPage from "./modules/client/common/Dashboard"; // Renamed import for clarity
import DonorHomePage from "./modules/client/donor/DonorHomePage"; // Import new Donor HomePage

import ThemeToggle from "./components/Button/ThemeToggleButton";
import CharityPage from "./modules/client/common/charity/CharityPage";
import CampaignDetail from "./modules/client/common/charity/CampaignDetail";
import OrganizationDetail from "./modules/client/common/charity/OrganizationDetail";
import DonorProfile from "./modules/client/donor/profile/DonorProfile";
import CharityProfile from "./modules/client/charity/profile/CharityProfile";
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
import CharityOpenMarket from "./modules/client/charity/CharityOpenMarket/CharityOpenMarket";
import VendorOpenMarket from "./modules/client/vendor/OpenMarket/OpenMarket";

// Detect if URL contains OAuth tokens from any provider
const hasOAuthTokens = window.location.hash.includes('access_token=') || 
                      window.location.search.includes('access_token=') ||
                      window.location.hash.includes('refresh_token=') ||
                      window.location.search.includes('refresh_token=');

export function App() {
	const { user, loading: authLoading } = useAuth();
	const { userRole, isLoading, roleChecked } = useRole(); // Removed clearRole as it's handled elsewhere
	const location = useLocation();
	const navigate = useNavigate();

	console.log("User:", user?.id);
	console.log("userRole", userRole);

	// Handle OAuth callback if tokens are present
	useEffect(() => {
		if (hasOAuthTokens && user) {
			console.log("OAuth login successful, redirecting based on role");
			if (roleChecked) {
				if (userRole) {
					// User has a role, redirect to appropriate dashboard
					let targetPath = "/";
					switch (userRole) {
						case 'charity':
							targetPath = "/charity/home";
							break;
						case 'vendor':
							targetPath = "/vendor/dashboard";
							break;
						case 'donor':
							targetPath = "/donor-homepage";
							break;
					}
					// Use window.location for a full page reload to reset URL
					window.location.href = `${window.location.origin}/Vhack-2025${targetPath}`;
				} else {
					// User doesn't have a role, redirect to registration
					window.location.href = `${window.location.origin}/Vhack-2025/register`;
				}
			}
		}
	}, [user, userRole, roleChecked, hasOAuthTokens]);

	// Show loading state if we're authenticating via OAuth
	if (hasOAuthTokens && (authLoading || isLoading || !roleChecked)) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center">
					<h2 className="text-xl mb-4">Processing authentication...</h2>
					<p>Please wait while we complete your login.</p>
					<div className="mt-4 w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
				</div>
			</div>
		);
	}

	const [isopen, setisopen] = useState(false);
	const toggle = () => setisopen(!isopen);

	if (authLoading || isLoading) { // Check role loading as well
		return <div>Loading...</div>; // Keep a loading state
	}

	// Determine the default PROTECTED path after login based on role
	let loggedInHomepage = "/"; // Start with root relative path
	if (roleChecked) {
		if (userRole === 'charity') {
			loggedInHomepage = "/charity/home";
		} else if (userRole === 'vendor') {
			loggedInHomepage = "/vendor/dashboard";
		} else if (userRole === 'donor') {
			loggedInHomepage = "/donor-homepage"; // New donor homepage
		}
	}

	// Conditionally render Navbars only if user is logged in
	const renderAppLayout = (children: React.ReactNode) => (
		<>
			<HorizontalNavbar toggle={toggle} />
			<div className="main-content"> {/* Optional: Add class for main content styling */} 
				{children}
			</div>
			<div className="stickyBottm">
				<BottomNavBar toggle={toggle} />
			</div>
			<footer className="footer">
				<p>© Vhack2025 - All Rights Reserved</p>
			</footer>
		</>
	);

	return (
		<div className="App">
			<Routes>
				{/* Public Routes - Render WITHOUT Navbars */}
				<Route path="/" element={<LandingPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				{/* Protected Routes - Render WITH Navbars */} 
				{user && roleChecked && (
					<Route path="/*" element={renderAppLayout(
						<Routes> {/* Nested Routes for authenticated layout */} 
							{/* Redirect logged-in user away from root if they land there */}
							<Route path="/" element={<Navigate to={loggedInHomepage} replace state={{ from: location }} />} />

							{/* Common Protected Routes */}
							<Route element={<ProtectedRoute allowedRoles={['charity', 'vendor', 'donor']} redirectPath="/" />}>
								<Route path="/charity" element={<CharityPage />} />
								<Route path="/charity/:id" element={<CampaignDetail />} />
								<Route path="/organization/:id" element={<OrganizationDetail />} />
								<Route path="/settings" element={<SettingsPage />} />
							</Route>

							{/* Charity-Specific Routes */}
							<Route element={<ProtectedRoute allowedRoles={['charity']} redirectPath="/" />}>
								<Route path="/charity/home" element={<CharityHomePage />} />
								<Route path="/charity/profile" element={<CharityProfile />} />
								<Route path="/charity/vendor-page" element={<VendorPage />} />
								<Route path="/charity-management" element={<CharityManagementPage />} />
								<Route path="/charity/open-market" element={<CharityOpenMarket />} />
							</Route>

							{/* Vendor-Specific Routes */}
							<Route element={<ProtectedRoute allowedRoles={['vendor']} redirectPath="/" />}>
								<Route path="/vendor/dashboard" element={<VendorDashboard />} />
								<Route path="/vendor/profile" element={<VendorProfile />} />
								<Route path="/vendor/order-history/:id" element={<OrderHistoryCard />} />
								<Route path="/vendor/order-history-details" element={<OrderHistoryDetails />} />
								<Route path="/vendor/order-tracker" element={<OrderTracker />} />
								<Route path="/vendor/order-tracker-details" element={<OrderTrackerDetails />} />
								<Route path="/vendor/transaction-history-details" element={<TransactionHistoryDetails />} />
								<Route path="/vendor/order-management" element={<OrderManagement />} />
								<Route path="/vendor/open-market" element={<VendorOpenMarket />} />
							</Route>

							{/* Donor-Specific Routes */}
							<Route element={<ProtectedRoute allowedRoles={['donor']} redirectPath="/" />}>
								<Route path="/donor-homepage" element={<DonorHomePage />} />
								<Route path="/donor/profile" element={<DonorProfile />} />
							</Route>

							{/* Fallback for logged-in users hitting an unknown protected path */}
							<Route path="*" element={<Navigate to={loggedInHomepage} replace />} />
						</Routes>
					)} />
				)}

				{/* Fallback for when user is not logged in and tries to access a non-public route */}
				{!user && (
					<Route path="*" element={<Navigate to="/login" replace />} />
				)}
			</Routes>
		</div>
	);
}