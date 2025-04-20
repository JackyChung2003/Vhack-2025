import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename="/Vhack-2025">
    <React.StrictMode>
      <AuthProvider>
        <RoleProvider>
          <App />
        </RoleProvider>
      </AuthProvider>
    </React.StrictMode>
  </BrowserRouter>
);