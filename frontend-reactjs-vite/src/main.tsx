import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ThirdwebProvider } from "thirdweb/react";
import { RoleProvider } from "./contexts/RoleContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename="/Vhack-2025">
    <React.StrictMode>
      <ThirdwebProvider>
        <RoleProvider>
          <App />
        </RoleProvider>
      </ThirdwebProvider>
    </React.StrictMode>
  </BrowserRouter>
);
