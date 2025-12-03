import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { LoadingGate, AuthGate, BlockedGate, MaintenanceGate, AdminGate } from './components/RouteGuards';

// Pages
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
import { useOneSignal } from './hooks/useOneSignal';

const AppContent: React.FC = () => {
  // Inicializar notificaciones una sola vez
  useOneSignal();

  return (
    <div className="w-full h-[100dvh] bg-white text-brand-black dark:bg-black dark:text-white overflow-hidden relative flex flex-col transition-colors duration-300">
      <InstallPrompt />
      
      <Routes>
        {/* === RUTAS PÚBLICAS Y DE SISTEMA (Fuera de Guards principales) === */}
        <Route path="/" element={<Login />} />
        <Route path="/maintenance" element={<MaintenanceMode />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* === RUTAS PROTEGIDAS (Requieren Autenticación) === */}
        <Route element={<AuthGate />}>
            
            {/* 1. Validación de Bloqueo Global (Prioridad Alta) */}
            <Route element={<BlockedGate />}>
                
                {/* 2. Validación de Mantenimiento (Puede ser bypasseada por Admins) */}
                <Route element={<MaintenanceGate />}>
                    
                    {/* --- Rutas de Onboarding (Sin Layout) --- */}
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/onboarding/setup" element={<OnboardingSetup />} />
                    
                    {/* --- Rutas Intermedias --- */}
                    <Route path="/welcome" element={<WelcomeIntermediate />} />
                    <Route path="/pk-calendar" element={<PKCalendar />} />

                    {/* --- Layout Principal con Navegación Inferior --- */}
                    <Route element={<MainLayout />}>
                        <Route path="/home" element={<Profile />} />
                        <Route path="/training" element={<TrainingList />} />
                        <Route path="/settings" element={<UserSettings />} />
                    </Route>

                    {/* --- Rutas de Detalle (Sin BottomNav) --- */}
                    <Route path="/training/:topicId" element={<TrainingDetail />} />
                    
                    {/* Sub-secciones de Entrenamiento */}
                    <Route path="/training/bloqueos/motivos" element={<BloqueoMotivos />} />
                    <Route path="/training/bloqueos/types" element={<BloqueoTypes />} />
                    <Route path="/training/bloqueos/vip" element={<BloqueoVip />} />
                    <Route path="/training/bloqueos/appeal" element={<BloqueoAppeal />} />

                    {/* Herramientas */}
                    <Route path="/tools/calculator" element={<CalculatorTool />} />
                    <Route path="/tools/payment-table" element={<PaymentTableTool />} />
                    <Route path="/tools/gamer" element={<GamerTool />} />
                    <Route path="/tools/gamer/setup" element={<GameRunTool />} />

                    {/* --- RUTAS DE ADMINISTRADOR --- */}
                    <Route element={<AdminGate />}>
                        <Route path="/admin" element={<Navigate to="/admin/selection" replace />} />
                        <Route path="/admin/selection" element={<AdminSelection />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/editor" element={<EditorDashboard />} />
                    </Route>

                </Route> {/* Fin MaintenanceGate */}
            </Route> {/* Fin BlockedGate */}
        </Route> {/* Fin AuthGate */}

        {/* Catch all: Redirigir a login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  // Splash Screen Inicial (Branding)
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
       <div className="fixed inset-0 z-[300] bg-white dark:bg-black flex flex-col items-center justify-center animate-fade-in transition-colors duration-500">
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

  // --- RECONSTRUCCIÓN: Usando BrowserRouter y LoadingGate ---
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
           <LoadingGate>
              <AppContent />
           </LoadingGate>
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
