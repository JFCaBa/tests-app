import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { TuitionPage } from "./components/tuition/TuitionPage";
import BookingPage from "./components/tuition/BookingPage";
const Progress = React.lazy(() => import("@/components/progress/Progress"));
const Settings = React.lazy(() => import("@/components/settings/Settings"));
const Statistics = React.lazy(() =>
  import("@/components/statistics/Statistics")
);
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
import FlashcardGame from "./components/flashcard/FlashcardGame";

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
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
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
            <Route
              path="tuition"
              element={
                <ErrorBoundary>
                  <TuitionPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="tuition/book/:tutorId"
              element={
                <ErrorBoundary>
                  <BookingPage />
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
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Settings />
                  </React.Suspense>
                </ErrorBoundary>
              }
            />
            {/* Progress and Statistic Routes */}
            <Route
              path="progress"
              element={
                <ErrorBoundary>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Progress />
                  </React.Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="statistics"
              element={
                <ErrorBoundary>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Statistics />
                  </React.Suspense>
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
            {/* Flashcard Routes */}
            <Route
              path="flashcards"
              element={
                <ErrorBoundary>
                  <FlashcardGame />
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
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;
