import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthCheck } from '../hooks/useAuthCheck';

interface RoleContextType {
    userRole: string | null;
    isLoading: boolean;
    roleChecked: boolean;  // ✅ New state added
    clearRole: () => void;
    refetchRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userRole, isLoading, refetchRole, roleChecked } = useAuthCheck();
    const [role, setRole] = useState<string | null>(null);  // Changed from `userRole` to `null` for better sync

    const clearRole = () => {
        setRole(null);
        localStorage.removeItem('userRole');
    };

    // Improved logic to handle role updates correctly
    useEffect(() => {
        if (roleChecked) {
            if (userRole) {
                setRole(userRole);
                localStorage.setItem('userRole', userRole);
                console.log("Role set in context:", userRole);
            } else {
                console.log("No role found — New User assumed.");
                setRole(null);
            }
        }
    }, [userRole, roleChecked]);

    return (
        <RoleContext.Provider value={{ userRole: role, isLoading, roleChecked, clearRole, refetchRole }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error("useRole must be used within a RoleProvider");
    }
    return context;
};
