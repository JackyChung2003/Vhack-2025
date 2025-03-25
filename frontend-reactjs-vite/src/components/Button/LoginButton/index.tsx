import React, { useState, useEffect } from 'react';
import { ConnectButton, useActiveAccount, lightTheme } from "thirdweb/react";
import { client, chain } from "../../../utils/constants";
import { useRole } from '../../../contexts/RoleContext';
import logoPNGImage from "../../../assets/images/logo-png.png";

const customTheme = lightTheme({
    colors: {
        modalBg: "#f2f7f5",
        primaryButtonBg: "#faae2b",
        primaryButtonText: "#00473e",
        connectedButtonBg: "#00473e",
        connectedButtonBgHover: "#00332c",
        secondaryButtonBg: "#475d5b",
        secondaryButtonText: "#f2f7f5",
        accentButtonBg: "#fa5246",
        accentButtonText: "#f2f7f5",
        borderColor: "#00473e",
        tooltipBg: "#faae2b",
        tooltipText: "#00473e",
    },
    fontFamily: "Arial, sans-serif",
});

const LoginButton: React.FC = () => {
    const { userRole, clearRole, refetchRole, isLoading } = useRole();
    const account = useActiveAccount();

    // Auto-refetch role when userRole is null and Supabase finished checking
    useEffect(() => {
        if (account?.address && !userRole && !isLoading) {
            refetchRole();
        }
    }, [account, userRole, isLoading]);

    // Handle Role Assignment on Login
    const handleLogin = async (wallet: any) => {
        const walletAddress = wallet.address;

        try {
            console.log("This is my role", userRole);
            // if no role then navigate to register page
        } catch (error) {
            console.error("Error fetching role:", error);
        }
    };

    // Handle Logout and Role Clearing
    const handleLogout = () => {
        clearRole();      // Clear the role in context and localStorage
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        }}>
            {account ? (
                <div style={{ textAlign: "center"}}>
                    <ConnectButton 
                        client={client}
                        chain={chain}
                        connectModal={{
                            title: "Sign in to Your Account",
                            // titleIcon: ,
                            // size: "compact",
                            size: "wide",
                        }}
                        onDisconnect={handleLogout} // Role logic handled during disconnect
                    />
                </div>
            ) : (
                <div style={{ textAlign: "center"}}>
                    <ConnectButton 
                        client={client}
                        chain={chain}
                        theme={customTheme}
                         connectButton={{
                            label: "Sign in",
                            style: {
                                fontSize: "18px",     // Larger text for better readability
                            }
                        }}
                        connectModal={{
                            title: "Sign in to Your Account",
                            titleIcon: logoPNGImage,
                            // size: "compact",
                            size: "wide",
                          }}
                          onConnect={handleLogin} // Role logic handled during connect
                   />
                </div>
            )}
        </div>
    )
}

export default LoginButton;