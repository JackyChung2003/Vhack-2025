import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRole } from "../../../contexts/RoleContext";
import logoPNGImage from "../../../assets/images/logo-png.png";
import profilePicture1 from "../../../assets/images/profile-picture-login-1.jpg";
import './index.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signIn, signInWithProvider, user } = useAuth();
    const { userRole, roleChecked, isLoading, roleFetched } = useRole();

    useEffect(() => {
        console.log("🔎 Checking conditions:");
        console.log("✅ authenticated:", !!user);
        console.log("✅ roleChecked:", roleChecked);
        console.log("✅ isLoading:", isLoading);
        console.log("✅ roleFetched:", roleFetched);
        console.log("✅ userRole (Latest):", userRole);
    
        // Wait for role checks to complete
        if (!roleChecked || isLoading || !roleFetched) return;
    
        // If user is authenticated but has no role, send to registration
        if (user && !userRole) {
            navigate('/register');
            return;
        }
    
        // If user is authenticated and has a role, redirect to appropriate dashboard
        if (user && userRole) {
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
                    navigate('/');  // Unknown role - Go to home
            }
        }
    }, [user, roleChecked, userRole, isLoading, roleFetched, navigate]);
    

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isChecked) {
            setError('❗ Please accept the Privacy Policy to continue.');
            return;
        }

        if (!email || !password) {
            setError('❗ Please enter both email and password.');
            return;
        }

        setIsLoggingIn(true);
        setError(null);

        try {
            const { error: signInError } = await signIn({ email, password });
            
            if (signInError) {
                throw new Error(signInError.message);
            }
            
            // No need to navigate here - useEffect will handle it based on role
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to login';
            setError(`❌ ${errorMessage}`);
            setIsLoggingIn(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!isChecked) {
            setError('❗ Please accept the Privacy Policy to continue.');
            return;
        }

        setIsGoogleLoggingIn(true);
        setError(null);

        try {
            const { error } = await signInWithProvider('google');
            if (error) {
                throw new Error(error.message);
            }
            // No need to navigate here - OAuth redirect will happen and
            // useEffect will handle it after the redirect back
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to login with Google';
            setError(`❌ ${errorMessage}`);
            setIsGoogleLoggingIn(false);
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

                {isLoading && <div className="loading-spinner">⏳ Checking your account...</div>}

                <div className="testimonial">
                    <p>"DermaNow has revolutionized the way I connect with charities. It's fast, secure, and simple. Highly recommended!"</p>
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

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="form-group checkbox">
                        <input
                            type="checkbox"
                            id="privacy"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                        />
                        <label htmlFor="privacy">I agree to the Privacy Policy</label>
                    </div>

                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={isLoggingIn || isGoogleLoggingIn}
                    >
                        {isLoggingIn ? 'Logging in...' : 'Login with Email'}
                    </button>
                </form>

                <div className="social-login">
                    <div className="divider">
                        <span>OR</span>
                    </div>
                    <button 
                        type="button" 
                        className="google-login-button" 
                        onClick={handleGoogleLogin}
                        disabled={isLoggingIn || isGoogleLoggingIn}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                            </g>
                        </svg>
                        {isGoogleLoggingIn ? 'Connecting...' : 'Continue with Google'}
                    </button>
                </div>

                <div className="security-info">
                    <p>🔒 Your data is secure with us.</p>
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
