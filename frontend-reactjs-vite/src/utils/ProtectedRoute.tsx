import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[];  
    isAllowed?: boolean;        
    redirectPath: string;       
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    isAllowed = true,
    redirectPath
}) => {
    const { userRole, isLoading, roleChecked } = useRole();
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();

    // Show loading state while authentication or role checks are in progress
    if (!roleChecked || isLoading || authLoading) {
        return <div>Loading...</div>;
    }

    // Redirect non-authenticated users to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect authenticated but unregistered users to register page (Only if NOT already on `/register`)
    if (user && !userRole && location.pathname !== '/register') {
        console.log("Redirecting authenticated user without role to /register");
        return <Navigate to="/register" replace />;
    }

    // Role-Based Access Control
    if (allowedRoles && !allowedRoles.includes(userRole || '')) {
        console.log("Unauthorized access - Redirecting to", redirectPath);
        return <Navigate to={redirectPath} replace />;
    }

    if (!isAllowed) {
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
