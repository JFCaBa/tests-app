import React, { createContext, useContext, useState, useCallback } from "react";
import coachService from "../services/coach.service";
import { useAuth } from "./AuthContext";

const CoachContext = createContext(null);

export const CoachProvider = ({ children }) => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Initialize the coach service
  const initializeCoach = useCallback(async () => {
    try {
      await coachService.initialize();
      setIsInitialized(true);
      setLastError(null);
    } catch (error) {
      console.error("Failed to initialize coach:", error);
      setLastError(error);
    }
  }, []);

  // Get user's learning context
  const getLearningContext = useCallback(() => {
    if (!user?.statistics) return null;

    return {
      progress:
        (user.statistics.totalCorrect / user.statistics.totalAnswered) * 100 ||
        0,
      recentScores: user.testHistory
        ?.slice(-3)
        .map((test) => test.score)
        .join(", "),
      preferredSubjects: user.preferences?.preferredSubjects || [],
      totalTests: user.testHistory?.length || 0,
    };
  }, [user]);

  const value = {
    isInitialized,
    lastError,
    initializeCoach,
    getLearningContext,
  };

  return (
    <CoachContext.Provider value={value}>{children}</CoachContext.Provider>
  );
};

export const useCoach = () => {
  const context = useContext(CoachContext);
  if (!context) {
    throw new Error("useCoach must be used within a CoachProvider");
  }
  return context;
};
