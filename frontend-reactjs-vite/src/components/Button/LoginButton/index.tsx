import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRole } from '../../../contexts/RoleContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa'; // Import icons
import './styles.css';

const LoginButton: React.FC = () => {
  const { user, signOut } = useAuth();
  const { clearRole } = useRole();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown

  // Handle Logout and Role Clearing
  const handleLogout = async () => {
    setIsLoading(true);
    setIsDropdownOpen(false); // Close dropdown on logout
    try {
        await signOut();
        clearRole(); // Clear the role in context and localStorage
        navigate('/login'); // Redirect to login after logout
    } catch (error) {
        console.error("Logout failed:", error);
        // Optionally show an error message to the user
    } finally {
        setIsLoading(false);
    }
  };

  const handleSignInClick = () => {
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Attempt to get profile picture URL
  const profilePicUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="login-button-container">
      {user ? (
        <div className="profile-container" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="profile-button">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="profile-pic" />
            ) : (
              <FaUserCircle size={40} className="profile-icon" />
            )}
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {/* Display user info if needed */}
              <div className="dropdown-user-info">
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt="Profile" className="dropdown-profile-pic" />
                 ) : (
                  <FaUserCircle size={36} />
                 )}
                <span>{user.user_metadata?.name || user.email}</span>
              </div>
              <hr className="dropdown-divider"/>
              <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <FaCog className="dropdown-icon"/> Settings
              </Link>
              <button onClick={handleLogout} className="dropdown-item dropdown-logout" disabled={isLoading}>
                <FaSignOutAlt className="dropdown-icon"/>
                {isLoading ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={handleSignInClick} 
          className="auth-button login-button"
          disabled={isLoading}
        >
          Sign In
        </button>
      )}
    </div>
  );
};

export default LoginButton;