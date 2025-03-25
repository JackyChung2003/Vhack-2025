import { useActiveAccount } from "thirdweb/react";
import { useAuthCheck } from "../../../hooks/useAuthCheck";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginButton from "../../../components/Button/LoginButton";
import logoPNGImage from "../../../assets/images/logo-png.png";
import profilePicture1 from "../../../assets/images/profile-picture-login-1.jpg";
import './index.css';

const LoginPage = () => {
    const activeAccount = useActiveAccount();
    const navigate = useNavigate();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { userRole, roleChecked, isLoading, roleFetched } = useAuthCheck();

    useEffect(() => {
        console.log("🔎 Checking conditions:");
        console.log("✅ activeAccount:", activeAccount?.address);
        console.log("✅ roleChecked:", roleChecked);
        console.log("✅ isLoading:", isLoading);
        console.log("✅ roleFetched:", roleFetched);
        console.log("✅ userRole (Latest):", userRole);
    
        // 🚨 Key Change: Delay navigation until role is set in context
        if (!activeAccount || isLoading || !roleFetched) return;
    
        // ✅ Wait for `userRole` to populate correctly
        if (userRole === null) {
            console.log("⏳ Waiting for `userRole` update...");
            return;  // Prevent navigation while `userRole` is still null
        }
    
        if (userRole) {
            console.log("🎯 Role Found:", userRole);
            switch (userRole) {
                case 'charity':
                    navigate('/charity');
                    break;
                case 'vendor':
                    navigate('/Vhack-2025/vendor/dashboard');
                    break;
                case 'donor':
                    navigate('/donor');
                    break;
                default:
                    navigate('/register');  // Unknown role - Go to Register
            }
        } else {
            console.log("⚠️ No role found — Sending to Register");
            navigate('/register');
        }
    }, [activeAccount, roleChecked, userRole, isLoading, roleFetched, navigate]);
    

    const handleConnectWallet = async () => {
        if (!isChecked) {
            setError('❗ Please accept the Privacy Policy to continue.');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            // Simulate connection delay for better UX
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert("✅ Wallet connected successfully!");
        } catch (err) {
            setError('❌ Failed to connect wallet. Please try again.');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="brand-logo">
                    <img src={logoPNGImage} alt="DermaNow Logo" className="logo-login" />
                </div>
                <h1>Empower Generosity, Inspire Change</h1>
                <p>Your donations make a difference. Track your impact in real-time.</p>

                {isLoading && <div className="loading-spinner">⏳ Checking your account...</div>}  {/* ✅ Improved Loader */}

                <div className="testimonial">
                    <p>"DermaNow has revolutionized the way I connect with charities. It’s fast, secure, and simple. Highly recommended!"</p>
                    <div className="testimonial-author">
                        <img src={profilePicture1} alt="Casey Bachmeyer" className=""/>
                        <div className="author-details">
                            <span className="author-name">Casey Bachmeyer</span>
                            <span className="author-position">Philanthropist</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <h2>Login</h2>

                {error && <p className="error-message">{error}</p>}

                <LoginButton onClick={handleConnectWallet} isLoading={isConnecting} />

                <div className="security-info">
                    <p>🔒 Your transactions are secure with blockchain technology.</p>
                </div>

                <div className="support-links">
                    <span onClick={() => navigate('/faq')} className="link-text">❓ FAQ</span>
                    <span onClick={() => navigate('/contact')} className="link-text">📩 Contact Us</span>
                </div>

                <p className="signup-footer">
                    Don't have an account yet? 
                    <span onClick={() => navigate('/register')} className="link-text"> Sign Up</span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
