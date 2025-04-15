import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRole } from '../../../contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const LoginButton: React.FC = () => {
  const { user, signOut } = useAuth();
  const { clearRole } = useRole();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Handle Logout and Role Clearing
  const handleLogout = async () => {
    setIsLoading(true);
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

  return (
    <div className="login-button-container">
      {user ? (
        <button 
          onClick={handleLogout} 
          className="auth-button logout-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging out...' : 'Sign Out'}
        </button>
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