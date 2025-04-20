import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import "./index.css";

// Detect if URL contains OAuth tokens from any provider
const hasOAuthTokens = window.location.hash.includes('access_token=') || 
                      window.location.search.includes('access_token=') ||
                      window.location.hash.includes('refresh_token=') ||
                      window.location.search.includes('refresh_token=');

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={hasOAuthTokens ? "" : "/Vhack-2025"}>
    <React.StrictMode>
      <AuthProvider>
        <RoleProvider>
          <App />
        </RoleProvider>
      </AuthProvider>
    </React.StrictMode>
  </BrowserRouter>
);
