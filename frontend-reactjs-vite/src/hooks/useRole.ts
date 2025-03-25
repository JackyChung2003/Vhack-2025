import supabase from '../services/supabase/supabaseClient';

export const useRole = () => {
    const getRole = async (walletAddress: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('wallet_address', walletAddress)
            .single();

        if (error) {
            console.error('Error fetching role:', error.message);
            return null; // Return null for better error handling
        }

        return data?.role;
    };

    const assignRole = async (walletAddress: string, role: 'donor' | 'charity' | 'vendor') => {
        const { error } = await supabase
            .from('users')
            .insert({ wallet_address: walletAddress, role });

        if (error) {
            console.error('Error assigning role:', error.message);
            throw new Error(error.message); // Handle errors properly
        }

        return { success: true, message: `Role '${role}' assigned successfully.` };
    };

    return { getRole, assignRole };
};
