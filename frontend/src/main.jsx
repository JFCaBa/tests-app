import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { CoachProvider } from "./contexts/CoachContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <CoachProvider>
          <App />
        </CoachProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
