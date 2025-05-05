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

// Protected route component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  // Only show loading state if we've been loading for more than 500ms
  const [showLoading, setShowLoading] = useState(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => setShowLoading(true), 500);
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && showLoading) {
    console.log("PrivateRoute: Loading...");
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  console.log("PrivateRoute: User:", user ? "authenticated" : "not authenticated");
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  
  // Simplified loading state - only use a single loading indicator with delay
  const [showLoadingUI, setShowLoadingUI] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    console.log("AppRoutes: Auth loading state changed:", loading);
    
    // Only show loading UI if auth loading takes more than 500ms
    if (loading) {
      timeout = setTimeout(() => setShowLoadingUI(true), 500);
    } else {
      setShowLoadingUI(false);
    }
    
    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && showLoadingUI) {
    console.log("AppRoutes: Loading UI...");
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("AppRoutes: User:", user ? "authenticated" : "not authenticated");

  return (
    <Router>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <Routes>
        <Route path="/" element={
          <>
            <LandingPage />
            <AppDrawerButton onAuthClick={() => setShowAuth(true)} />
          </>
        } />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<Navigate to="/dashboard" />} />
        
        {/* Onboarding Routes */}
        <Route path="/onboarding" element={
          <PrivateRoute>
            <OnboardingPage />
          </PrivateRoute>
        } />
        
        {/* App Routes - FIXED: using nested routes properly */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
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
  console.log("App: Initializing...");
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          {console.log("App: Providers mounted")}
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;