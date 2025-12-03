
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider, useContent } from './context/ContentContext';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding'; 
import OnboardingSetup from './pages/OnboardingSetup'; 
import Profile from './pages/Profile';
import TrainingList from './pages/TrainingList';
import TrainingDetail from './pages/TrainingDetail';
import UserSettings from './pages/UserSettings';
import CalculatorTool from './pages/CalculatorTool';
import PaymentTableTool from './pages/PaymentTableTool';
import GamerTool from './pages/GamerTool';
import GameRunTool from './pages/GameRunTool';
import BloqueoMotivos from './pages/BloqueoMotivos';
import BloqueoTypes from './pages/BloqueoTypes';
import BloqueoVip from './pages/BloqueoVip';
import BloqueoAppeal from './pages/BloqueoAppeal';
import AdminDashboard from './pages/AdminDashboard';
import AdminSelection from './pages/AdminSelection'; 
import EditorDashboard from './pages/EditorDashboard'; 
import WelcomeIntermediate from './pages/WelcomeIntermediate';
import PKCalendar from './pages/PKCalendar'; 
import MaintenanceMode from './pages/MaintenanceMode';
import AccessDenied from './pages/AccessDenied';
import { MainLayout } from './components/MainLayout';
import { InstallPrompt } from './components/InstallPrompt';
import { useOneSignal } from './hooks/useOneSignal'; // Import Hook

// System Version: v16.1.0 - Admin Recovery Fix

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-white text-brand-black">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Protección para rutas admin BASADA EN BASE DE DATOS
const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
    const { user, loading } = useAuth();
    
    if (loading) return null;
    
    if (!user) return <Navigate to="/" />;

    // STRICT CHECK: Trust only the DB value
    if (!user.isAdmin) {
        // Redirect silently to home if not admin to prevent errors
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { homeConfig, loading: contentLoading } = useContent();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  // --- INIT PUSH NOTIFICATIONS ---
  useOneSignal();

  // --- 1. GLOBAL BLOCKED USER CHECK (KILL SWITCH) ---
  if (!authLoading && user?.isBlocked) {
      const isAccessDeniedPage = location.pathname === '/access-denied';
      const isLoginPage = location.pathname === '/';
      
      if (!isAccessDeniedPage && !isLoginPage) {
          return <Navigate to="/access-denied" replace />;
      }
  }

  // --- 2. GLOBAL MAINTENANCE GUARD (DUAL MODE) ---
  const activeMode = homeConfig?.maintenanceMode || 'off';
  
  if (!contentLoading && activeMode !== 'off') {
      const isMaintenancePage = location.pathname === '/maintenance';
      const isLoginPage = location.pathname === '/';
      const isBlockedPage = location.pathname === '/access-denied';
      
      // If user is not admin and trying to access anything but permitted pages
      if (!user?.isAdmin && !isMaintenancePage && !isLoginPage && !isBlockedPage) {
          return <Navigate to="/maintenance" replace />;
      }
  }

  return (
    <div className="w-full h-[100dvh] bg-white text-brand-black dark:bg-black dark:text-white overflow-hidden relative flex flex-col transition-colors duration-300">
      {/* PWA INSTALL PROMPT - Visible on all pages if installable */}
      <InstallPrompt />

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* GLOBAL LOCKDOWN PAGE (Handles both Red/Purple visual internally) */}
        <Route path="/maintenance" element={<MaintenanceMode />} />

        {/* BLOCKED USER PAGE */}
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* New Intermediate Page */}
        <Route path="/welcome" element={
          <ProtectedRoute>
            <WelcomeIntermediate />
          </ProtectedRoute>
        } />
        
        {/* New PK Calendar Page */}
        <Route path="/pk-calendar" element={
          <ProtectedRoute>
            <PKCalendar />
          </ProtectedRoute>
        } />

        {/* Onboarding Routes - Protected but standalone */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/setup" element={
          <ProtectedRoute>
            <OnboardingSetup />
          </ProtectedRoute>
        } />

        {/* Authenticated Routes with Bottom Nav */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/training" element={
            <ProtectedRoute>
              <TrainingList />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } />
        </Route>

        {/* Detail View - Protected */}
        <Route path="/training/:topicId" element={
          <ProtectedRoute>
            <TrainingDetail />
          </ProtectedRoute>
        } />
        
        {/* Sub-pages for Training - Protected */}
        <Route path="/training/bloqueos/motivos" element={
          <ProtectedRoute>
            <BloqueoMotivos />
          </ProtectedRoute>
        } />
        <Route path="/training/bloqueos/types" element={
          <ProtectedRoute>
            <BloqueoTypes />
          </ProtectedRoute>
        } />
        <Route path="/training/bloqueos/vip" element={
          <ProtectedRoute>
            <BloqueoVip />
          </ProtectedRoute>
        } />
        <Route path="/training/bloqueos/appeal" element={
          <ProtectedRoute>
            <BloqueoAppeal />
          </ProtectedRoute>
        } />

        {/* Tools Routes - Protected */}
        <Route path="/tools/calculator" element={
          <ProtectedRoute>
            <CalculatorTool />
          </ProtectedRoute>
        } />
        <Route path="/tools/payment-table" element={
          <ProtectedRoute>
            <PaymentTableTool />
          </ProtectedRoute>
        } />
        <Route path="/tools/gamer" element={
          <ProtectedRoute>
            <GamerTool />
          </ProtectedRoute>
        } />
        <Route path="/tools/gamer/setup" element={
          <ProtectedRoute>
            <GameRunTool />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
           <Navigate to="/admin/selection" replace />
        } />
        
        <Route path="/admin/selection" element={
          <AdminRoute>
            <AdminSelection />
          </AdminRoute>
        } />

        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        <Route path="/admin/editor" element={
          <AdminRoute>
            <EditorDashboard />
          </AdminRoute>
        } />
        
        {/* Redirect unknown routes to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
       <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col items-center justify-center animate-fade-in transition-colors duration-500">
          <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-brand-purple/30 rounded-full blur-2xl animate-pulse"></div>
              {/* Logo with breathing animation */}
              <img
                src="https://i.postimg.cc/65zvGzJL/IMG_20251102_060134.png"
                alt="StreamAgency Logo"
                className="relative w-full h-full object-contain drop-shadow-2xl animate-[pulse_2s_ease-in-out_infinite]"
              />
          </div>
          <h1 className="text-2xl font-black text-brand-black dark:text-white tracking-[0.3em] uppercase animate-pulse">
            StreamAgency
          </h1>
          <div className="mt-4 flex space-x-1">
             <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
             <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
       </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <ContentProvider>
           <AppContent />
        </ContentProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
