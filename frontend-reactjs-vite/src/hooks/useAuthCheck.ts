import { useEffect, useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import supabase from '../services/supabase/supabaseClient';

export const useAuthCheck = () => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [roleChecked, setRoleChecked] = useState<boolean>(false);
    const [roleFetched, setRoleFetched] = useState<boolean>(false);

    const activeAccount = useActiveAccount();

    /**
     * 🔄 Ensures Supabase role fetching is attempted immediately once AND retries if needed.
     */
    const fetchRoleWithRetry = async (retryCount = 3) => {
        if (!activeAccount?.address) return;  // 🚨 Prevent fetching if no address

        console.log(`🟡 Attempting to fetch role... (Remaining Retries: ${retryCount})`);

        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('wallet_address', activeAccount.address)
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
        if (!activeAccount?.address) {
            console.warn("❗ No active account found — Clearing role.");
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
            .eq('wallet_address', activeAccount.address)
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
    }, [activeAccount]);

    useEffect(() => {
        refetchRole();
    }, [activeAccount]);

    return { userRole, isLoading, refetchRole, roleChecked, roleFetched };
};
