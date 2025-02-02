import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const SubscriptionRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await axios.get("/subscription/check");
        setHasAccess(response.data.hasAccess);
      } catch (error) {
        console.error("Subscription check error:", error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    if (isAuthenticated) {
      checkSubscription();
    }
  }, [isAuthenticated]);

  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasAccess) {
    return <Navigate to="/subscription" />;
  }

  return children;
};

export default SubscriptionRoute;
