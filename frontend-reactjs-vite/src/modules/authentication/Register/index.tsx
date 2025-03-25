import React, { useState, useEffect } from 'react';
import supabase from '../../../services/supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useActiveAccount } from 'thirdweb/react';
import { useAuthCheck } from '../../../hooks/useAuthCheck'; // ✅ Import Role Check
import coverPicture from "../../../assets/images/register-page-picture.jpg";
import ConnectAccButton from '../../../components/Button/ConnectButton';
import './index.css';

const RegisterPage: React.FC = () => {
    const [role, setRole] = useState<'vendor' | 'charity' | 'donor'>('donor');
    const [walletAddress, setWalletAddress] = useState<string | null>('Please connect your wallet');
    const [username, setUsername] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [logo, setLogo] = useState<File | null>(null);

    // Vendor Fields
    const [ssm, setSSM] = useState<File | null>(null);
    const [tinNumber, setTinNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [bankStatement, setBankStatement] = useState<File | null>(null);
    const [founded, setFounded] = useState<string>('');

    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeAccount = useActiveAccount(); 
    const { userRole, roleFetched } = useAuthCheck(); // ✅ Import Role Check
    const navigate = useNavigate();

    // ✅ Auto-Redirect if Role Already Exists
    useEffect(() => {
        if (roleFetched && userRole) {
            console.log(`✅ Found existing role: ${userRole} - Redirecting...`);
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
                    console.warn('❗ Unknown role found:', userRole);
                    navigate('/dashboard');
            }
        }
    }, [userRole, roleFetched, navigate]);

    useEffect(() => {
        if (activeAccount?.address) {
            setWalletAddress(activeAccount.address);
            localStorage.setItem('walletAddress', activeAccount.address);
        } else {
            setWalletAddress('Please connect your wallet');
        }
    }, [activeAccount]);

    const handleRegister = async () => {
        const walletAddress = localStorage.getItem('walletAddress');
    
        if (!walletAddress || walletAddress === 'Please connect your wallet') {
            setError("❗ Please connect your wallet first.");
            return;
        }
    
        if (!username) {
            setError("❗ Username is required.");
            return;
        }
    
        setIsRegistering(true);
        setError(null);
    
        const userData = {
            wallet_address: walletAddress,
            role: role || 'donor', // Auto-set to 'donor' if no role selected
            name: username,
            verified: false,
            created_at: new Date().toISOString() // Timestamp for user creation
        };
    
        try {
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert(userData)
                .select('id')
                .single();
    
            if (userError) {
                console.error('Error registering:', userError.message);
                setError("❌ Failed to register. Please try again.");
                setIsRegistering(false);
                return;
            }
    
            // ✅ Push to 'charity_profiles' if the role is 'charity'
            if (role === 'charity') {
                const charityProfileData = {
                    user_id: newUser.id,
                    description,
                    logo: logo ? logo.name : null,
                    founded: new Date().getFullYear(), // Placeholder for founded year
                    location,
                    website,
                    email,
                    phone,
                    created_at: new Date().toISOString()
                };
    
                const { error: charityError } = await supabase
                    .from('charity_profiles')
                    .insert(charityProfileData);
    
                if (charityError) {
                    console.error('Error creating charity profile:', charityError.message);
                    setError("❌ Charity profile creation failed. Please try again.");
                    setIsRegistering(false);
                    return;
                }
            }
    
            // ✅ Push to 'vendor_profiles' if the role is 'vendor'
            if (role === 'vendor') {
                const vendorProfileData = {
                    user_id: newUser.id,
                    company_name: companyName, // Now explicitly defined as company name
                    founded: founded || new Date().getFullYear(), // Defaults to current year if empty
                    ssm: ssm ? ssm.name : null,
                    tin_number: tinNumber,
                    bank_statement: bankStatement ? bankStatement.name : null,
                    location,
                    email,
                    phone,
                    created_at: new Date().toISOString()
                };

                const { error: vendorError } = await supabase
                    .from('vendor_profiles')
                    .insert(vendorProfileData);

                if (vendorError) {
                    console.error('Error creating vendor profile:', vendorError.message);
                    setError("❌ Vendor profile creation failed. Please try again.");
                    setIsRegistering(false);
                    return;
                }
            }

    
            // ✅ Successful registration
            alert("✅ Registration successful!");
            if (role === 'charity') {
                navigate('/Vhack-2025/charity/home');
            } else if (role === 'vendor') {
                navigate('/Vhack-2025/vendor/home');
            } else {
                navigate(`/${role}`);
            }
    
            setTimeout(() => {
                alert("🎉 Redirecting to the homepage...");
                navigate('/dashboard');
            }, 2000);
    
        } catch (error) {
            console.error('Unexpected error:', error);
            setError("❌ Something went wrong. Please try again.");
        }
    
        setIsRegistering(false);
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

                {/* Auto-filled User Info */}
                <div className="user-info-container">
                    <div className="user-info">
                        <div className="form-group">
                            <label>Wallet Address</label>
                            <input type="text" value={walletAddress} disabled />
                        </div>
                    </div>

                    <div className="connect-button-container">
                        <ConnectAccButton />
                    </div>
                </div>

                {/* Compulsory Username Field */}
                <div className="form-group">
                    <label>Username (Required for Display)</label>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                                placeholder="Enter your location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Website (Optional)</label>
                            <input
                                type="url"
                                placeholder="https://yourwebsite.com"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email (Optional)</label>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone (Optional)</label>
                            <input
                                type="tel"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                )}


                {/* Additional Fields for Vendor */}
                {role === 'vendor' && (
                    <div className="vendor-fields">

                        {/* Company Name */}
                        <div className="form-group">
                            <label>Company Name (Required)</label>
                            <input
                                type="text"
                                placeholder="Enter your company name"
                                value={companyName} // Using username for now or you can add a new state
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>

                        {/* Founded Year */}
                        <div className="form-group">
                            <label>Founded Year (Optional)</label>
                            <input
                                type="number"
                                placeholder="Enter the year your company was founded"
                                value={founded}
                                onChange={(e) => setFounded(e.target.value)}
                            />
                        </div>

                        {/* SSM Field */}
                        <div className="form-group">
                            <label>SSM (Required)</label>
                            <input
                                type="file"
                                accept=".pdf, .jpg, .png"
                                onChange={(e) => setSSM(e.target.files?.[0] || null)}
                            />
                            {ssm && (
                                <p className="file-preview">
                                    📄 {ssm.name}
                                </p>
                            )}
                        </div>

                        {/* Company TIN Number */}
                        <div className="form-group">
                            <label>Company TIN Number (Required)</label>
                            <input
                                type="text"
                                placeholder="Enter Company TIN Number"
                                value={tinNumber}
                                onChange={(e) => setTinNumber(e.target.value)}
                            />
                        </div>

                        {/* Business Bank Statement */}
                        <div className="form-group">
                            <label>Business Bank Statement (Required)</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setBankStatement(e.target.files?.[0] || null)}
                            />
                            {bankStatement && (
                                <p className="file-preview">
                                    📄 {bankStatement.name}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="form-group">
                            <label>Location (Optional)</label>
                            <input
                                type="text"
                                placeholder="Enter your company location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label>Email (Optional)</label>
                            <input
                                type="email"
                                placeholder="example@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="form-group">
                            <label>Phone Number (Optional)</label>
                            <input
                                type="tel"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                )}


                {/* Error Message */}
                {error && <p className="error-message">{error}</p>}

                {/* Register Button */}
                <button
                    className={`register-button ${isRegistering ? 'loading' : ''}`}
                    onClick={handleRegister}
                    disabled={isRegistering}
                >
                    {isRegistering ? 'Registering...' : 'Create an Account'}
                </button>

                <p className="login-footer">
                    Already have an account?
                    <span onClick={() => navigate('/login')} className="link-text"> Log In</span>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
