import React, { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useNavigate } from 'react-router-dom';
import "./index.css";

const ConnectWalletPage: React.FC = () => {
    const activeAccount = useActiveAccount();
    const navigate = useNavigate();

    const [isConnecting, setIsConnecting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleConnectWallet = async () => {
        try {
            setIsConnecting(true);
            setErrorMessage(null);

            // Simulate wallet connection logic
            await new Promise(resolve => setTimeout(resolve, 2000)); 

            // Simulate role check
            const hasRole = Math.random() < 0.5;

            if (hasRole) {
                navigate('/', { replace: true }); // Redirect to home if role found
            } else {
                navigate('/register', { replace: true }); // Redirect to register if no role
            }
        } catch (error) {
            console.error("Connection error:", error);
            setErrorMessage("Failed to connect. Please try again.");
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="connect-wallet-container">
            {/* Left Section - Branding & Comments */}
            <div className="left-section">
                <div className="logo">DERMANOW</div>
                <h1>Empower Change.<br /> One Click at a Time.</h1>
                <p>Securely connect your wallet to join the DERMANOW community.</p>

                <div className="mock-comments">
                    <div className="comment">
                        “DERMANOW helped me find incredible donation opportunities. 
                        The seamless wallet integration is amazing!”  
                        <span>- Alex Johnson, Donor</span>
                    </div>

                    <div className="comment">
                        “As a charity organizer, DERMANOW simplified fund collection 
                        and helped us connect with vendors easily!”  
                        <span>- Sarah Lee, Charity Manager</span>
                    </div>

                    <div className="comment">
                        “Power Stake's features are perfect for managing transactions 
                        securely and efficiently.”  
                        <span>- Kevin Tan, Vendor</span>
                    </div>
                </div>
            </div>

            {/* Right Section - Connect Wallet CTA */}
            <div className="right-section">
                <h2>Connect Your Wallet</h2>

                {isConnecting ? (
                    <div className="loading-section">
                        <div className="spinner"></div>
                        Connecting...
                    </div>
                ) : (
                    <button className="button" onClick={handleConnectWallet}>
                        🔥 Connect Wallet
                    </button>
                )}

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <div className="footer-links">
                    <p>Need help? <a href="/help">Visit our Help Center</a></p>
                    <p>
                        By connecting your wallet, you agree to our
                        <a href="/privacy"> Privacy Policy</a> and
                        <a href="/terms"> Terms of Service</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConnectWalletPage;
