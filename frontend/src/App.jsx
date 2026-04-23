import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
import TuitionPage from "./components/tuition/TuitionPage";
import BookingPage from "./components/tuition/BookingPage";
import TutorManager from "./components/admin/TutorManager";
import TutorForm from "./components/admin/TutorForm";
import TutorDetails from "./components/admin/TutorDetails";
import SessionManager from "./components/admin/sessions/SessionManager";
import SessionForm from "./components/admin/sessions/SessionForm";
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
import SEOProtectedRoute from "./components/SEOProtectedRoute";

import { NotFound } from "./components/NotFound";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Contact } from "./components/contact/Contact";
import { PrivacyPolicy } from "./components/legal/PrivacyPolicy";
import { TermsConditions } from "./components/legal/TermsConditions";
import BlogPage from "./components/blog/BlogPage";



// Error Boundary Wrapper
const withErrorBoundary = (Component) => (
  <ErrorBoundary>
    <Component />
  </ErrorBoundary>
);

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <SettingsProvider>
      <PayPalScriptProvider
        options={{
          clientId: "sb",
          currency: "USD",
          intent: "capture",
        }}
      >
        <HelmetProvider>
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  withErrorBoundary(LandingPage)
                }
              />
              <Route path="/login" element={withErrorBoundary(LoginForm)} />
              <Route path="/register" element={withErrorBoundary(RegisterForm)} />
              <Route path="/contact" element={withErrorBoundary(Contact)} />
              <Route path="/privacy" element={withErrorBoundary(PrivacyPolicy)} />
              <Route path="/terms" element={withErrorBoundary(TermsConditions)} />
              <Route path="/blog" element={withErrorBoundary(BlogPage)} />
              <Route path="/blog/*" element={withErrorBoundary(BlogPage)} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <SEOProtectedRoute>
                    <MainLayout />
                  </SEOProtectedRoute>
                }
              >
                <Route
                  path="subjects"
                  element={withErrorBoundary(SubjectSelection)}
                />
              <Route path="practice" element={<Navigate to="/subjects" replace />} />
                <Route
                  path="practice/summary"
                  element={withErrorBoundary(TestSummary)}
                />
                <Route
                  path="practice/:subject"
                  element={withErrorBoundary(PracticeMode)}
                />
                <Route
                  path="practice/:subject/:mode"
                  element={withErrorBoundary(PracticeSession)}
                />
                <Route path="tuition" element={withErrorBoundary(TuitionPage)} />

                <Route
                  path="tuition/book/:tutorId"
                  element={withErrorBoundary(BookingPage)}
                />
                <Route
                  path="admin/tutors"
                  element={withErrorBoundary(TutorManager)}
                />
                <Route
                  path="/admin/tutors/new"
                  element={withErrorBoundary(TutorForm)}
                />
                <Route
                  path="/admin/tutors/:id/edit"
                  element={withErrorBoundary(TutorForm)}
                />
                <Route
                  path="/admin/tutors/:id"
                  element={withErrorBoundary(TutorDetails)}
                />

                {/* User Settings and Profile Routes */}
                <Route path="profile" element={withErrorBoundary(Profile)} />
                <Route
                  path="settings"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      {withErrorBoundary(Settings)}
                    </React.Suspense>
                  }
                />
                {/* Progress and Statistic Routes */}
                <Route
                  path="progress"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      {withErrorBoundary(Progress)}
                    </React.Suspense>
                  }
                />
                <Route
                  path="statistics"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      {withErrorBoundary(Statistics)}
                    </React.Suspense>
                  }
                />
                {/* Subscription and Coach Routes */}
                <Route
                  path="subscription"
                  element={withErrorBoundary(SubscriptionNotice)}
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
                  element={withErrorBoundary(FlashcardGame)}
                />
                {/* Admin Routes */}
                <Route path="admin" element={withErrorBoundary(AdminDashboard)} />
                <Route
                  path="admin/users"
                  element={withErrorBoundary(UserManager)}
                />
                <Route
                  path="admin/questions"
                  element={withErrorBoundary(QuestionManager)}
                />
                <Route
                  path="admin/tests"
                  element={withErrorBoundary(TestStatistics)}
                />
                <Route
                  path="admin/sessions"
                  element={withErrorBoundary(SessionManager)}
                />
                <Route
                  path="admin/sessions/new"
                  element={withErrorBoundary(SessionForm)}
                />
                <Route
                  path="admin/sessions/:id"
                  element={withErrorBoundary(SessionForm)}
                />
              </Route>

              {/* Catch all - 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </HelmetProvider>
      </PayPalScriptProvider>
    </SettingsProvider>
  );
};

export default App;
