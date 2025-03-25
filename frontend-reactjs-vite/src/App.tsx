import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";
import { client } from "./client";

import HorizontalNavbar from "./modules/client/navigation/HorizontalNavBar/HorizontalNavBar";
import BottomNavBar from "./modules/client/navigation/BottomNavBar/BottomNavBar";

import ThemeToggle from "./components/Button/ThemeToggleButton";
export function App() {
	const activeAccount = useActiveAccount();
	// console.log("address", activeAccount?.address);
	const [isConnected, setIsConnected] = useState(false); 

	const [isopen, setisopen] = useState(false);
	
	const toggle = () => {
	  setisopen(!isopen);
	};

	useEffect(() => {
		if (activeAccount?.address) {
		  setIsConnected(true);
		} else {
		  setIsConnected(false);
		}
		console.log("Address:", activeAccount?.address);
	  }, [activeAccount]);

	return (
		<div className="App">
			<HorizontalNavbar toggle={toggle} />
			<div className="stickyBottm">
				<BottomNavBar toggle={toggle} />
			</div>
			{/* <main>
			{!isConnected ? (
        		<WelcomeUser />
				) : (
    				  <Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/campaign" element={<Campaigns />} />
						<Route path="/campaign/:address" element={<CampaignDetails data={[]} />} />
						<Route path="/user" element={<ProfilePage />} />
						<Route path="/user/:userAddress" element={<UserDetails />} />
						<Route path="/scan" element={<QRScanner />} />
						<Route path="*" element={<WelcomeUser />} />
    				  </Routes>
				)}
			</main> */}
			<main>
				{!isConnected ? (
					<div>Welcome, please connect your account.
						<ThemeToggle />
					</div>
				) : (
					<div>Welcome back, your account is connected.
						<ThemeToggle />

					</div>
				)}
			</main>
			{/* Footer */}
			<footer className="bg-[#051F20] text-white text-center py-2 w-full mt-auto">
      		  <p>© Vhack2025 - All Rights Reserved</p>
      		</footer>
		</div>
	);
}