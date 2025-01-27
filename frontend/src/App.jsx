import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { SubjectSelection } from "./components/test/SubjectSelection";
import { PracticeMode } from "./components/test/PracticeMode";
import { PracticeSession } from "./components/test/PracticeSession";
import { TestContainer } from "./components/test/TestContainer";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManager from "./components/admin/UserManager";
import QuestionManager from "./components/admin/QuestionManager";
import TestStatistics from "./components/admin/TestStatistics";
import AdminRoute from "./components/auth/AdminRoute";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/subjects" />} />
        <Route path="subjects" element={<SubjectSelection />} />
        <Route path="practice/:subject" element={<PracticeMode />} />
        <Route path="practice/:subject/:mode" element={<PracticeSession />} />
        <Route path="test" element={<TestContainer />} />

        {/* Admin Routes */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/users" element={<UserManager />} />
        <Route path="admin/questions" element={<QuestionManager />} />
        <Route path="admin/tests" element={<TestStatistics />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
