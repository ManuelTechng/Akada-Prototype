import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SavedProgramsProvider } from './contexts/SavedProgramsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import { checkEnvironmentVariables } from './utils/envCheck';

// Lazy load components for better performance
const AppLayout = lazy(() => import('./components/layouts/AppLayout'));
const DarkSidebar = lazy(() => import('./components/layouts/DarkSidebar').then(m => ({ default: m.DarkSidebar })));
const DarkHeader = lazy(() => import('./components/layouts/DarkHeader').then(m => ({ default: m.DarkHeader })));
const ProgramSearchPage = lazy(() => import('./pages/ProgramSearchPageFixed'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AppDrawerButton = lazy(() => import('./components/AppDrawerButton'));
const FigmaDashboard = lazy(() => import('./components/dashboard/FigmaDashboard'));
const AuthModal = lazy(() => import('./components/auth/AuthModal'));
const Applications = lazy(() => import('./components/app/Applications'));
const Documents = lazy(() => import('./components/app/Documents'));
const Resources = lazy(() => import('./components/app/Resources'));
const Community = lazy(() => import('./components/app/Community'));
const ProfileSettings = lazy(() => import('./components/app/ProfileSettings'));
const Settings = lazy(() => import('./components/app/Settings'));
const CostCalculator = lazy(() => import('./components/app/CostCalculator'));
const SavedPrograms = lazy(() => import('./components/app/SavedPrograms'));
const RecommendedPrograms = lazy(() => import('./components/app/RecommendedPrograms'));
const AIAssistant = lazy(() => import('./components/app/AIAssistant'));
const ProgramSearchPageNew = lazy(() => import('./pages/ProgramSearchPageNew'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage'));

// Demo pages for development
const ApplicationTimelineDemo = lazy(() => import('./pages/ApplicationTimelineDemo'));
const ApplicationTrackerDemo = lazy(() => import('./pages/ApplicationTrackerDemo'));
const ProfileCompletionDemo = lazy(() => import('./pages/ProfileCompletionDemo'));
const DesignSystemDemo = lazy(() => import('./pages/DesignSystemDemo'));

// Development tools
const CacheControls = lazy(() => import('./components/dev/CacheControls'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

// Environment warning component
export function EnvironmentWarning() {
  const envCheck = checkEnvironmentVariables();
  
  if (envCheck.allValid) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded shadow-lg max-w-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">Environment Configuration Warning</h3>
          <div className="mt-2 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              {envCheck.supabase.issues.map((issue, index) => (
                <li key={`supabase-${index}`}>{issue}</li>
              ))}
              {envCheck.openai.issues.map((issue, index) => (
                <li key={`openai-${index}`}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Protected Route wrapper with DarkSidebar layout
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading && !initialized) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.08),transparent_50%)]" />
      
      <Suspense fallback={null}>
        <DarkSidebar 
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
      </Suspense>
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Public Route (redirect to app if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

function AppWithProviders() {
  const { user } = useAuth();
  
  return (
    <SavedProgramsProvider userId={user?.id}>
      <NotificationProvider>
        <AppRoutes />
        <EnvironmentWarning />
        <Suspense fallback={null}>
          <CacheControls />
        </Suspense>
      </NotificationProvider>
    </SavedProgramsProvider>
  );
}

function AppRoutes() {
  const { user, loading, initialized, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    console.log("AppRoutes: Auth state", { user: !!user, loading, initialized });
  }, [loading, initialized, user]);

  // Only show loading UI if auth is still initializing after the timeout
  if (loading && !initialized) {
    console.log("AppRoutes: Showing loading UI");
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
      <Suspense fallback={<LoadingSpinner />}>
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
        
        {/* Demo Routes - for development and testing */}
        <Route path="/demo/timeline" element={<ApplicationTimelineDemo />} />
        <Route path="/demo/tracker" element={<ApplicationTrackerDemo />} />
        <Route path="/demo/profile" element={<ProfileCompletionDemo />} />
        <Route path="/demo/design-system" element={<DesignSystemDemo />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<Navigate to="/dashboard" />} />
        
        {/* Onboarding Routes */}
        <Route path="/onboarding" element={
          !user ? (
            <Navigate to="/login" replace />
          ) : profile?.profile_completed ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <OnboardingPage />
          )
        } />
        
        {/* Dashboard Route with Figma Design */}
        <Route
          path="/dashboard"
          element={
            !user ? <Navigate to="/login" replace /> : <FigmaDashboard />
          }
        />
        
        {/* App Routes */}
        <Route
          path="/app"
          element={
            !user ? <Navigate to="/login" replace /> : <AppLayout />
          }
        >
          <Route path="search" element={<ProgramSearchPage />} />
          <Route path="search-new" element={<ProgramSearchPageNew />} />
          <Route path="saved" element={<SavedPrograms />} />
          <Route path="recommended" element={<RecommendedPrograms />} />
          <Route path="assistant" element={<AIAssistant />} />
          <Route path="applications" element={<Applications />} />
          <Route path="documents" element={<Documents />} />
          <Route path="resources" element={<Resources />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="calculator" element={<CostCalculator />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppWithProviders />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
