import React from 'react';
import { Navigate, Outlet, useLocation  } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';

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
    const location = useLocation();

    if (!roleChecked || isLoading) {
        return <div>Loading...</div>;
        // return <div>Loading...</div>;
    }

    // Redirect **New Users** to Register Page (Only if NOT already on `/register`)
    if (!userRole && location.pathname !== '/register') {
    // if (!userRole && location.pathname !== '/register') {
    // if (roleChecked && !userRole && location.pathname !== '/register') {
        console.log("Redirecting new user to /register");
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
