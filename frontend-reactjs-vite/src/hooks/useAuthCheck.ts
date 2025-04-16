import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../services/supabase/supabaseClient';

export const useAuthCheck = () => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [roleChecked, setRoleChecked] = useState<boolean>(false);
    const [roleFetched, setRoleFetched] = useState<boolean>(false);

    const { user } = useAuth();

    /**
     * 🔄 Ensures Supabase role fetching is attempted immediately once AND retries if needed.
     */
    const fetchRoleWithRetry = async (retryCount = 1) => {
        if (!user?.id) return;  // 🚨 Prevent fetching if no user ID

        console.log(`🟡 Attempting to fetch role... (Remaining Retries: ${retryCount})`);

        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (data?.role) {
            console.log("✅ Role refetched successfully:", data.role);
            setUserRole(data.role);
            localStorage.setItem('userRole', data.role);  // ✅ Store role in localStorage
            setRoleFetched(true);
        } else if (retryCount > 0) {
            console.warn("⚠️ Role fetch failed - Retrying...");
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            return fetchRoleWithRetry(retryCount - 1);  // 🔄 Retry logic
        } else {
            console.warn("❗ Final Attempt Failed - No Role Found");
            setUserRole(null);
            setRoleFetched(true);  // ✅ Mark as confirmed, even if no role
        }
    };

    const refetchRole = useCallback(async () => {
        if (!user?.id) {
            console.warn("❗ No authenticated user found — Clearing role.");
            setUserRole(null);
            setIsLoading(false);
            setRoleChecked(true);
            setRoleFetched(true);
            return;
        }

        // ✅ Immediately attempt one fetch first (before retry logic)
        const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (data?.role) {
            console.log("✅ Immediate Role Fetch Successful:", data.role);
            setUserRole(data.role);
            localStorage.setItem('userRole', data.role);
            setRoleFetched(true);
        } else {
            console.warn("❗ Immediate Role Fetch Failed — Switching to Retry");
            await fetchRoleWithRetry();  // 🔄 Retry if the first attempt fails
        }

        setIsLoading(false);
        setRoleChecked(true);
    }, [user]);

    useEffect(() => {
        refetchRole();
    }, [user, refetchRole]);

    return { userRole, isLoading, refetchRole, roleChecked, roleFetched };
};
