import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRole } from '../../../contexts/RoleContext';
import './styles.css';

interface LoginButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick, isLoading }) => {
  const { user, signOut } = useAuth();
  const { clearRole } = useRole();

  // Handle Logout and Role Clearing
  const handleLogout = async () => {
    await signOut();
    clearRole(); // Clear the role in context and localStorage
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
          onClick={onClick} 
          className="auth-button login-button"
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Sign In'}
        </button>
      )}
    </div>
  );
};

export default LoginButton;