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
      // Ensure all settings fields are properly typed
      const userSettings = {
        ...defaultSettings,
        notificationEnabled: Boolean(user.preferences.notificationEnabled),
        preferredSubjects: Array.isArray(user.preferences.preferredSubjects)
          ? user.preferences.preferredSubjects
          : defaultSettings.preferredSubjects,
        defaultDifficulty: ["easy", "medium", "hard"].includes(
          user.preferences.defaultDifficulty
        )
          ? user.preferences.defaultDifficulty
          : defaultSettings.defaultDifficulty,
        questionsPerTest: Number.isInteger(
          Number(user.preferences.questionsPerTest)
        )
          ? Number(user.preferences.questionsPerTest)
          : defaultSettings.questionsPerTest,
      };
      setSettings(userSettings);
    } else {
      setSettings(defaultSettings);
    }
    setLoading(false);
  }, [user]);

  const updateSettings = async (newSettings) => {
    try {
      // Validate and process new settings
      const processedSettings = {
        notificationEnabled: Boolean(newSettings.notificationEnabled),
        preferredSubjects: Array.isArray(newSettings.preferredSubjects)
          ? newSettings.preferredSubjects
          : settings.preferredSubjects,
        defaultDifficulty: ["easy", "medium", "hard"].includes(
          newSettings.defaultDifficulty
        )
          ? newSettings.defaultDifficulty
          : settings.defaultDifficulty,
        questionsPerTest: Number.isInteger(Number(newSettings.questionsPerTest))
          ? Number(newSettings.questionsPerTest)
          : settings.questionsPerTest,
      };

      // Update API
      const updatedUser = await updateProfile({
        preferences: processedSettings,
      });

      // Verify the update was successful
      if (!updatedUser?.preferences) {
        throw new Error("Failed to update settings");
      }

      // Update local state with the processed settings
      setSettings(processedSettings);

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
