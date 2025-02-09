// src/main.jsx
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { CoachProvider } from "./contexts/CoachContext";
import "./i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback="Loading...">
      <AuthProvider>
        <SettingsProvider>
          <CoachProvider>
            <App />
          </CoachProvider>
        </SettingsProvider>
      </AuthProvider>
    </Suspense>
  </React.StrictMode>
);
