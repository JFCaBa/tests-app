import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { MainLayout } from "./components/layout/MainLayout";
import { LandingPage } from "./components/landing/LandingPage";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { SubjectSelection } from "./components/test/SubjectSelection";
import { PracticeMode } from "./components/test/PracticeMode";
import { PracticeSession } from "./components/test/PracticeSession";
import { Profile } from "./components/profile/Profile";
import { Settings } from "./components/settings/Settings";
import { Statistics } from "./components/statistics/Statistics";
import { Progress } from "./components/progress/Progress";
import { TestSummary } from "./components/test/TestSummary";
import { DemoTest } from "./components/demo/DemoTest";
import CoachChat from "./components/coach/CoachChat";
import SubscriptionNotice from "./components/subscription/SubscriptionNotice";
import SubscriptionRoute from "./components/subscription/SubscriptionRoute";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManager from "./components/admin/UserManager";
import QuestionManager from "./components/admin/QuestionManager";
import TestStatistics from "./components/admin/TestStatistics";
import ErrorBoundary from "./components/ErrorBoundary";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <SettingsProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/subjects" />
            ) : (
              <ErrorBoundary>
                <LandingPage />
              </ErrorBoundary>
            )
          }
        />
        <Route
          path="/demo"
          element={
            <ErrorBoundary>
              <DemoTest />
            </ErrorBoundary>
          }
        />
        <Route
          path="/login"
          element={
            <ErrorBoundary>
              <LoginForm />
            </ErrorBoundary>
          }
        />
        <Route
          path="/register"
          element={
            <ErrorBoundary>
              <RegisterForm />
            </ErrorBoundary>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="subjects"
            element={
              <ErrorBoundary>
                <SubjectSelection />
              </ErrorBoundary>
            }
          />
          <Route
            path="practice/summary"
            element={
              <ErrorBoundary>
                <TestSummary />
              </ErrorBoundary>
            }
          />
          <Route
            path="practice/:subject"
            element={
              <ErrorBoundary>
                <PracticeMode />
              </ErrorBoundary>
            }
          />
          <Route
            path="practice/:subject/:mode"
            element={
              <ErrorBoundary>
                <PracticeSession />
              </ErrorBoundary>
            }
          />

          {/* User Settings and Profile Routes */}
          <Route
            path="profile"
            element={
              <ErrorBoundary>
                <Profile />
              </ErrorBoundary>
            }
          />
          <Route
            path="settings"
            element={
              <ErrorBoundary>
                <Settings />
              </ErrorBoundary>
            }
          />
          {/* Progress and Statistic Routes */}
          <Route
            path="progress"
            element={
              <ErrorBoundary>
                <Progress />
              </ErrorBoundary>
            }
          />
          <Route
            path="statistics"
            element={
              <ErrorBoundary>
                <Statistics />
              </ErrorBoundary>
            }
          />

          {/* Subscription and Coach Routes */}
          <Route
            path="subscription"
            element={
              <ErrorBoundary>
                <SubscriptionNotice />
              </ErrorBoundary>
            }
          />
          <Route
            path="coach"
            element={
              <ErrorBoundary>
                <SubscriptionRoute>
                  <CoachChat />
                </SubscriptionRoute>
              </ErrorBoundary>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <ErrorBoundary>
                <AdminDashboard />
              </ErrorBoundary>
            }
          />
          <Route
            path="admin/users"
            element={
              <ErrorBoundary>
                <UserManager />
              </ErrorBoundary>
            }
          />
          <Route
            path="admin/questions"
            element={
              <ErrorBoundary>
                <QuestionManager />
              </ErrorBoundary>
            }
          />
          <Route
            path="admin/tests"
            element={
              <ErrorBoundary>
                <TestStatistics />
              </ErrorBoundary>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </SettingsProvider>
  );
};

export default App;
