import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRole } from '../../../contexts/RoleContext';
import supabase from '../../../services/supabase/supabaseClient';
import './SettingsPage.css';
import { 
  FaUser, 
  FaLock, 
  FaBell, 
  FaHandHoldingHeart, 
  FaUserCircle,
  FaCamera,
  FaSave,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { userRole } = useRole();
  const [activeTab, setActiveTab] = useState('account');
  const [anonymousDonation, setAnonymousDonation] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [userName, setUserName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [campaignUpdates, setCampaignUpdates] = useState(true);
  const [donationReceipts, setDonationReceipts] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user settings and name from database on component mount
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Function to fetch user data including settings and name
  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First fetch the user's name from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
      } else if (userData) {
        setUserName(userData.name || '');
      }
      
      // Then fetch user settings
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user settings:', error);
        // If no settings found, create default settings
        if (error.code === 'PGRST116') {
          // Use name from users table as default display name, fallback to other sources if needed
          setDisplayName(userData?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
          
          // For demo purposes, we'll still use localStorage for other settings
          const savedAnonymousSetting = localStorage.getItem('anonymousDonation');
          if (savedAnonymousSetting !== null) {
            setAnonymousDonation(savedAnonymousSetting === 'true');
          }
          
          const savedSavePaymentMethod = localStorage.getItem('savePaymentMethod');
          if (savedSavePaymentMethod !== null) {
            setSavePaymentMethod(savedSavePaymentMethod === 'true');
          }
          
          const savedEmailNotifications = localStorage.getItem('emailNotifications');
          if (savedEmailNotifications !== null) {
            setEmailNotifications(savedEmailNotifications === 'true');
          }
          
          const savedCampaignUpdates = localStorage.getItem('campaignUpdates');
          if (savedCampaignUpdates !== null) {
            setCampaignUpdates(savedCampaignUpdates === 'true');
          }
          
          const savedDonationReceipts = localStorage.getItem('donationReceipts');
          if (savedDonationReceipts !== null) {
            setDonationReceipts(savedDonationReceipts === 'true');
          }
          
          const savedTwoFactorAuth = localStorage.getItem('twoFactorAuth');
          if (savedTwoFactorAuth !== null) {
            setTwoFactorAuth(savedTwoFactorAuth === 'true');
          }
        }
      } else if (data) {
        // Apply settings from database, still prioritizing name from users table
        setDisplayName(data.display_name || userData?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
        setAnonymousDonation(data.anonymous_donation || false);
        setSavePaymentMethod(data.save_payment_method || true);
        setEmailNotifications(data.email_notifications || true);
        setCampaignUpdates(data.campaign_updates || true);
        setDonationReceipts(data.donation_receipts || true);
        setTwoFactorAuth(data.two_factor_auth || false);
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err);
      setError('Failed to load user settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save user settings to the database
  const saveUserSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First update the user's name in the users table
      const { error: nameError } = await supabase
        .from('users')
        .update({ name: displayName })
        .eq('id', user.id);
        
      if (nameError) {
        console.error('Error updating user name:', nameError);
        setError('Failed to update user name');
        return false;
      }
      
      // Then update user settings
      const settings = {
        user_id: user.id,
        display_name: displayName,
        anonymous_donation: anonymousDonation,
        save_payment_method: savePaymentMethod,
        email_notifications: emailNotifications, 
        campaign_updates: campaignUpdates,
        donation_receipts: donationReceipts,
        two_factor_auth: twoFactorAuth,
        updated_at: new Date()
      };
      
      // Upsert settings to Supabase (insert if not exists, update if exists)
      const { error } = await supabase
        .from('user_settings')
        .upsert(settings, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error saving settings:', error);
        setError('Failed to save settings');
        return false;
      }
      
      // Update local state with the new name
      setUserName(displayName);
      
      return true;
    } catch (err) {
      console.error('Error in saveUserSettings:', err);
      setError('Failed to save settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // For demo, continue to save anonymous setting to localStorage as well
  // so other components can still access it
  useEffect(() => {
    localStorage.setItem('anonymousDonation', anonymousDonation.toString());
  }, [anonymousDonation]);

  const handleToggleAnonymous = async () => {
    setAnonymousDonation(!anonymousDonation);
    // Save to database
    await saveUserSettings();
  };

  const handleToggleSavePaymentMethod = async () => {
    setSavePaymentMethod(!savePaymentMethod);
    await saveUserSettings();
  };

  const handleToggleEmailNotifications = async () => {
    setEmailNotifications(!emailNotifications);
    await saveUserSettings();
  };

  const handleToggleCampaignUpdates = async () => {
    setCampaignUpdates(!campaignUpdates);
    await saveUserSettings();
  };

  const handleToggleDonationReceipts = async () => {
    setDonationReceipts(!donationReceipts);
    await saveUserSettings();
  };

  const handleToggleTwoFactorAuth = async () => {
    setTwoFactorAuth(!twoFactorAuth);
    await saveUserSettings();
  };

  const handleSaveDisplayName = async () => {
    if (await saveUserSettings()) {
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (isLoading && !displayName) {
    return (
      <div className="settings-page loading">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>
        <div className="settings-content">
          <div className="settings-sidebar">
            <button 
              className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <FaUser className="settings-tab-icon" />
              <span>Account</span>
            </button>
            <button 
              className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FaLock className="settings-tab-icon" />
              <span>Security</span>
            </button>
            <button 
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell className="settings-tab-icon" />
              <span>Notifications</span>
            </button>
            {userRole === 'donor' && (
              <button 
                className={`settings-tab ${activeTab === 'donation' ? 'active' : ''}`}
                onClick={() => setActiveTab('donation')}
              >
                <FaHandHoldingHeart className="settings-tab-icon" />
                <span>Donation Preferences</span>
              </button>
            )}
          </div>
          
          <div className="settings-main">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {activeTab === 'account' && (
              <>
                <h2 className="settings-section-title">Account Settings</h2>
                {saveSuccess && (
                  <div className="success-message">
                    <FaCheck /> Settings saved successfully
                  </div>
                )}
                <div className="profile-section">
                  <div className="profile-picture">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" />
                    ) : (
                      <div className="default-avatar">
                        <FaUserCircle size={50} />
                        <div className="avatar-overlay">
                          <FaCamera size={20} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="profile-info">
                    <h3>{userName || displayName || user?.email}</h3>
                    <p>{user?.email}</p>
                    <p>Role: {userRole}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="displayName">Display Name</label>
                  {isEditing ? (
                    <div className="edit-field">
                      <input 
                        type="text" 
                        id="displayName" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="editable"
                      />
                      <button 
                        onClick={handleSaveDisplayName}
                        className="save-button"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <FaSpinner className="spinner" /> Saving...
                          </>
                        ) : (
                          <>
                            <FaSave /> Save
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="edit-field">
                      <input 
                        type="text" 
                        id="displayName" 
                        value={displayName}
                        readOnly 
                      />
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={user?.email || ''}
                    readOnly
                  />
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h2 className="settings-section-title">Security Settings</h2>
                <p className="settings-info-text">Manage your account security settings.</p>
                
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>Two-factor authentication</span>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={twoFactorAuth}
                        onChange={handleToggleTwoFactorAuth}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                  <p className="settings-help-text">Add an extra layer of security to your account</p>
                </div>
                
                <button className="btn btn-primary">Change Password</button>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h2 className="settings-section-title">Notification Settings</h2>
                <p className="settings-info-text">Control how you receive notifications.</p>
                
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>Email notifications</span>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={emailNotifications}
                        onChange={handleToggleEmailNotifications}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                </div>
                
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>Campaign updates</span>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={campaignUpdates}
                        onChange={handleToggleCampaignUpdates}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                </div>
                
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>Donation receipts</span>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={donationReceipts}
                        onChange={handleToggleDonationReceipts}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                </div>
              </>
            )}

            {activeTab === 'donation' && userRole === 'donor' && (
              <>
                <h2 className="settings-section-title">Donation Preferences</h2>
                <p className="settings-info-text">Customize your donation experience.</p>
                
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>Anonymous donations</span>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={anonymousDonation}
                        onChange={handleToggleAnonymous}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                  <p className="settings-help-text">
                    When enabled, your name will not be displayed publicly with your donations
                  </p>
                </div>
                
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>Save payment methods</span>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={savePaymentMethod}
                        onChange={handleToggleSavePaymentMethod}
                        disabled={isLoading}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 