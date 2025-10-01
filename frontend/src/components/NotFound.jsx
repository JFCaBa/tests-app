import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const NotFound = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Set document title for SEO
    document.title = "404 - Page Not Found | Test My Russian";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={isAuthenticated ? "/subjects" : "/"}
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {isAuthenticated ? "Go to Subjects" : "Go to Home"}
        </Link>
      </div>
    </div>
  );
};