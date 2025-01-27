import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to access this page. Please contact an
            administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
