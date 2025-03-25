import { ConnectButton, useActiveAccount, lightTheme } from "thirdweb/react"
import { client,chain } from "../../../utils/constants"

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
    const account = useActiveAccount();
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            // height: "100vh",
        }}>
            {account ? (
                <div style={{ textAlign: "center"}}>
                    <ConnectButton 
                        client={client}
                        chain={chain}
                        connectModal={{
                            title: "Sign in to MyApp",
                            // titleIcon: ,
                            size: "compact",
                            // size: "wide",
                        }}
                    />
                </div>
            ) : (
                <div style={{ textAlign: "center"}}>
                    <ConnectButton 
                        client={client}
                        chain={chain}
                        theme={customTheme}
                        connectModal={{
                            title: "Sign in to MyApp",
                            // titleIcon: ,
                            size: "compact",
                            // size: "wide",
                          }}
                   />
                </div>
            )}
        </div>
    )
}

export default LoginButton;