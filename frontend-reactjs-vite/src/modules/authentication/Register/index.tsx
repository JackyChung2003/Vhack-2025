import React, { useState, useEffect } from 'react';
import supabase from '../../../services/supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useRole } from '../../../contexts/RoleContext';
import coverPicture from "../../../assets/images/register-page-picture.jpg";
import './index.css';

const RegisterPage: React.FC = () => {
    const [role, setRole] = useState<'vendor' | 'charity' | 'donor'>('donor');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');
    const [phone, setPhone] = useState('');
    const [logo, setLogo] = useState<File | null>(null);

    // Vendor Fields
    const [ssm, setSSM] = useState<File | null>(null);
    const [tinNumber, setTinNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [bankStatement, setBankStatement] = useState<File | null>(null);
    const [founded, setFounded] = useState<string>('');

    const [isRegistering, setIsRegistering] = useState(false);
    const [isGoogleRegistering, setIsGoogleRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user, signUp, signInWithProvider } = useAuth();
    const { userRole, refetchRole } = useRole();
    const navigate = useNavigate();

    // Auto-Redirect if Role Already Exists
    useEffect(() => {
        if (user && userRole) {
            console.log(`✅ Found existing role: ${userRole} - Redirecting...`);
            switch (userRole) {
                case 'charity':
                    navigate('/charity/home');
                    break;
                case 'vendor':
                    navigate('/vendor/dashboard');
                    break;
                case 'donor':
                    navigate('/donor-homepage');
                    break;
                default:
                    console.warn('❗ Unknown role found:', userRole);
                    navigate('/');
            }
        }
    }, [userRole, user, navigate]);

    // Set email from user if already authenticated with Google
    useEffect(() => {
        if (user?.email && email === '') {
            setEmail(user.email);
        }
    }, [user, email]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            // Email/password validation
            if (!email || !password) {
                setError("❗ Email and password are required.");
                return;
            }

            if (password !== confirmPassword) {
                setError("❗ Passwords do not match.");
                return;
            }

            if (password.length < 6) {
                setError("❗ Password must be at least 6 characters long.");
                return;
            }
        }

        if (!username) {
            setError("❗ Username is required.");
            return;
        }
    
        setIsRegistering(true);
        setError(null);
    
        try {
            // If user is not authenticated, sign them up first
            if (!user) {
                const { data: authData, error: authError } = await signUp({ 
                    email, 
                    password 
                });
                
                if (authError) {
                    throw new Error(authError.message);
                }

                if (!authData.user) {
                    setError("❗ Please check your email to verify your account before continuing.");
                    setIsRegistering(false);
                    return;
                }
            }

            // Use the current authenticated user's ID or the newly registered user
            const userId = user?.id;
            
            if (!userId) {
                setError("❗ Authentication issue. Please try again or check your email for verification.");
                setIsRegistering(false);
                return;
            }
            
            const userData = {
                id: userId,
                role: role || 'donor',
                name: username,
                wallet_address: user?.email || 'supabase-auth-user',
                verified: false,
                created_at: new Date().toISOString()
            };
        
            const { error: userError } = await supabase
                .from('users')
                .upsert(userData)
                .select('id')
                .single();
        
            if (userError) {
                console.error('Error registering:', userError.message);
                setError("❌ Failed to register user data. Please try again.");
                setIsRegistering(false);
                return;
            }
        
            // Push to 'charity_profiles' if the role is 'charity'
            if (role === 'charity') {
                const charityProfileData = {
                    user_id: userId,
                    description,
                    logo: logo ? logo.name : null,
                    founded: new Date().getFullYear(),
                    location,
                    website,
                    email: email || user?.email || '',
                    phone,
                    created_at: new Date().toISOString()
                };
        
                const { error: charityError } = await supabase
                    .from('charity_profiles')
                    .upsert(charityProfileData);
        
                if (charityError) {
                    console.error('Error creating charity profile:', charityError.message);
                    setError("❌ Charity profile creation failed. Please try again.");
                    setIsRegistering(false);
                    return;
                }
            }
        
            // Push to 'vendor_profiles' if the role is 'vendor'
            if (role === 'vendor') {
                const vendorProfileData = {
                    user_id: userId,
                    company_name: companyName,
                    founded: founded || new Date().getFullYear(),
                    ssm: ssm ? ssm.name : null,
                    tin_number: tinNumber,
                    bank_statement: bankStatement ? bankStatement.name : null,
                    location,
                    email: email || user?.email || '',
                    phone,
                    created_at: new Date().toISOString()
                };

                const { error: vendorError } = await supabase
                    .from('vendor_profiles')
                    .upsert(vendorProfileData);

                if (vendorError) {
                    console.error('Error creating vendor profile:', vendorError.message);
                    setError("❌ Vendor profile creation failed. Please try again.");
                    setIsRegistering(false);
                    return;
                }
            }

            // Refresh role data
            await refetchRole();
        
            alert("✅ Registration successful!");
            if (role === 'charity') {
                navigate('/charity/home');
            } else if (role === 'vendor') {
                navigate('/vendor/dashboard');
            } else {
                navigate('/donor-homepage');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
            console.error('Registration error:', errorMessage);
            setError(`❌ ${errorMessage}`);
        }
    
        setIsRegistering(false);
    };
    
    const handleGoogleSignUp = async () => {
        setIsGoogleRegistering(true);
        setError(null);

        try {
            const { error } = await signInWithProvider('google');
            if (error) {
                throw new Error(error.message);
            }
            // No need to navigate - the OAuth flow will redirect the user
            // and the useEffect will handle checking if they need to complete registration
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign up with Google';
            setError(`❌ ${errorMessage}`);
            setIsGoogleRegistering(false);
        }
    };
    
    return (
        <div className="register-page">
            {/* Left Side - Big Image */}
            <div className="register-left">
                <img src={coverPicture} alt="Register Image" className="register-image" />
            </div>

            {/* Right Side - Registration Form */}
            <div className="register-right">
                <h1>Create an Account</h1>

                {/* Role Tabs */}
                <div className="role-tabs">
                    {['donor', 'charity', 'vendor'].map((r) => (
                        <div
                            key={r}
                            className={`role-tab ${role === r ? 'active' : ''}`}
                            onClick={() => setRole(r as 'vendor' | 'charity' | 'donor')}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </div>
                    ))}
                </div>

                {error && <p className="error-message">{error}</p>}

                {!user && (
                    <div className="social-login">
                        <button 
                            type="button" 
                            className="google-login-button" 
                            onClick={handleGoogleSignUp}
                            disabled={isGoogleRegistering || isRegistering}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                                </g>
                            </svg>
                            {isGoogleRegistering ? 'Connecting...' : 'Continue with Google'}
                        </button>
                        <div className="divider">
                            <span>OR</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    {/* Authentication Information - Show only if not already authenticated */}
                    {!user && (
                        <>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Username Field */}
                    <div className="form-group">
                        <label>Username (Required for Display)</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {/* Additional Fields for Charity */}
                    {role === 'charity' && (
                        <div className="charity-fields">
                            <div className="form-group">
                                <label>Logo (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLogo(e.target.files?.[0] || null)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea
                                    placeholder="Tell us about your charity"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Location (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Where are you based?"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Website (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="Your website URL"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Contact Email (Optional)</label>
                                <input
                                    type="email"
                                    placeholder="Contact email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number (Optional)</label>
                                <input
                                    type="tel"
                                    placeholder="Contact phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Additional Fields for Vendor */}
                    {role === 'vendor' && (
                        <div className="vendor-fields">
                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    placeholder="Your company name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Year Founded</label>
                                <input
                                    type="number"
                                    placeholder="Year founded"
                                    value={founded}
                                    onChange={(e) => setFounded(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>SSM Certificate (Optional)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setSSM(e.target.files?.[0] || null)}
                                />
                            </div>

                            <div className="form-group">
                                <label>TIN Number (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Tax identification number"
                                    value={tinNumber}
                                    onChange={(e) => setTinNumber(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Bank Statement (Optional)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setBankStatement(e.target.files?.[0] || null)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    placeholder="Business location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Business Email</label>
                                <input
                                    type="email"
                                    placeholder="Business email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Business Phone</label>
                                <input
                                    type="tel"
                                    placeholder="Business phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={isRegistering || isGoogleRegistering}
                    >
                        {isRegistering ? 'Registering...' : 'Register'}
                    </button>

                    {/* Already have an account? Login */}
                    <p className="login-link">
                        Already have an account? 
                        <span onClick={() => navigate('/login')} className="link-text">
                            Login here
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
