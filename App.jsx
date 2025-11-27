import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import OnboardingSetup from './pages/OnboardingSetup.jsx';
import Profile from './pages/Profile.jsx';
import TrainingList from './pages/TrainingList.jsx';
import TrainingDetail from './pages/TrainingDetail.jsx';
import UserSettings from './pages/UserSettings.jsx';
import CalculatorTool from './pages/CalculatorTool.jsx';
import PaymentTableTool from './pages/PaymentTableTool.jsx';
import GamerTool from './pages/GamerTool.jsx';
import GameRunTool from './pages/GameRunTool.jsx';
import BloqueoMotivos from './pages/BloqueoMotivos.jsx';
import BloqueoTypes from './pages/BloqueoTypes.jsx';
import BloqueoVip from './pages/BloqueoVip.jsx';
import BloqueoAppeal from './pages/BloqueoAppeal.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { MainLayout } from './components/MainLayout.jsx';

const ProtectedRoute = ({ children }) => {
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

const AppContent = () => {
  return (
    <div className="w-full h-[100dvh] bg-white text-brand-black dark:bg-black dark:text-white overflow-hidden relative flex flex-col transition-colors duration-300">
      <Routes>
        <Route path="/" element={<Login />} />

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

        <Route path="/training/:topicId" element={
          <ProtectedRoute>
            <TrainingDetail />
          </ProtectedRoute>
        } />
        
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

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
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
              <div className="absolute inset-0 bg-brand-purple/30 rounded-full blur-2xl animate-pulse"></div>
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
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;