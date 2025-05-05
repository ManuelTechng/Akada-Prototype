import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppLayout from './components/layouts/AppLayout';
import ProgramSearchPage from './pages/ProgramSearchPage';
import LandingPage from './pages/LandingPage';
import AppDrawerButton from './components/AppDrawerButton';
import Dashboard from './components/Dashboard';
import AuthModal from './components/auth/AuthModal';
import Applications from './components/app/Applications';
import Documents from './components/app/Documents';
import Resources from './components/app/Resources';
import Community from './components/app/Community';
import Profile from './components/app/Profile';
import CostCalculator from './components/app/CostCalculator';
import { ErrorBoundary } from './components/ErrorBoundary';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import { useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { user, loading, initialized } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    console.log("AppRoutes: Auth state", { user: !!user, loading, initialized });
  }, [loading, initialized, user]);

  // Only show loading UI if auth is still initializing after the timeout
  if (loading && !initialized) {
    console.log("AppRoutes: Showing loading UI");
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("AppRoutes: Rendering routes", { isAuthenticated: !!user });
  
  // If auth is initialized but we're still loading, don't render anything
  if (loading && initialized) {
    return null;
  }
  
  return (
    <Router>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <Routes>
        <Route path="/" element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <>
              <LandingPage />
              <AppDrawerButton onAuthClick={() => setShowAuth(true)} />
            </>
          )
        } />
        
        {/* Auth Routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<Navigate to="/dashboard" />} />
        
        {/* Onboarding Routes */}
        <Route path="/onboarding" element={
          !user ? <Navigate to="/login" replace /> : <OnboardingPage />
        } />
        
        {/* App Routes */}
        <Route
          path="/dashboard"
          element={
            !user ? <Navigate to="/login" replace /> : <AppLayout />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="search" element={<ProgramSearchPage />} />
          <Route path="applications" element={<Applications />} />
          <Route path="documents" element={<Documents />} />
          <Route path="resources" element={<Resources />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<Profile />} />
          <Route path="calculator" element={<CostCalculator />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;