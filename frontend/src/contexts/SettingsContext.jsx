import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext(null);

export const defaultSettings = {
  notificationEnabled: true,
  preferredSubjects: [],
  defaultDifficulty: "medium",
  questionsPerTest: 10,
};

export const SettingsProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from user profile on mount and when user changes
  useEffect(() => {
    if (user?.preferences) {
      setSettings({
        ...defaultSettings,
        ...user.preferences,
      });
    }
    setLoading(false);
  }, [user]);

  const updateSettings = async (newSettings) => {
    try {
      // Update API
      await updateProfile({ preferences: newSettings });
      // Update local state
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  };

  const value = {
    settings,
    updateSettings,
    loading,
    defaultSettings,
  };

  if (loading) {
    return null;
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
