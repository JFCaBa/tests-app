import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SEOHead from "./SEOHead";

const SEOProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <SEOHead 
        title="Protected Content | Test My Russian" 
        description="This is a protected page. Please log in to access this content." 
        noIndex={true}
      />
      {children}
    </>
  );
};

export default SEOProtectedRoute;