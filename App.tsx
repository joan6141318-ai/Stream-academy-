
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { LoadingGate, AuthGate, BlockedGate, MaintenanceGate, AdminGate } from './components/RouteGuards';
import { ErrorBoundary } from './components/ErrorBoundary';

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
import AppTour from './pages/AppTour';
import TopStreamers from './pages/TopStreamers';
import EvaluationQuiz from './pages/EvaluationQuiz'; // NUEVA IMPORTACIÓN
import MaintenanceMode from './pages/MaintenanceMode';
import AccessDenied from './pages/AccessDenied';
import { MainLayout } from './components/MainLayout';
import { InstallPrompt } from './components/InstallPrompt';
import { useOneSignal } from './hooks/useOneSignal';

const AppContent: React.FC = () => {
  // Inicializar notificaciones
  useOneSignal();

  return (
    <div className="w-full h-[100dvh] bg-white text-brand-black dark:bg-black dark:text-white overflow-hidden relative flex flex-col transition-colors duration-300">
      <InstallPrompt />
      
      <Routes>
        {/* === RUTA PÚBLICA (LOGIN) === */}
        {/* Si el usuario ya está logueado, el componente Login internamente redirige a /welcome */}
        <Route path="/" element={<Login />} />
        
        {/* === PÁGINAS DE ESTADO CRÍTICO (Fuera de Guards normales para evitar bucles) === */}
        <Route path="/maintenance" element={<MaintenanceMode />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* === ZONA PROTEGIDA (Requiere Autenticación) === */}
        <Route element={<AuthGate />}>
            
            {/* CAPA 1: BLOQUEO DE CUENTA */}
            <Route element={<BlockedGate />}>
                
                {/* CAPA 2: MODO MANTENIMIENTO */}
                <Route element={<MaintenanceGate />}>
                    
                    {/* --- ONBOARDING (Sin Layout) --- */}
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/onboarding/setup" element={<OnboardingSetup />} />
                    
                    {/* --- PANTALLA INTERMEDIA --- */}
                    <Route path="/welcome" element={<WelcomeIntermediate />} />
                    
                    {/* --- APLICACIÓN PRINCIPAL (Con Navegación Inferior) --- */}
                    <Route element={<MainLayout />}>
                        <Route path="/home" element={<Profile />} />
                        <Route path="/training" element={<TrainingList />} />
                        <Route path="/settings" element={<UserSettings />} />
                    </Route>

                    {/* --- PÁGINAS INDIVIDUALES (Pantalla completa sin Nav) --- */}
                    <Route path="/training/:topicId" element={<TrainingDetail />} />
                    <Route path="/training/evaluation" element={<EvaluationQuiz />} /> {/* NUEVA RUTA */}
                    <Route path="/pk-calendar" element={<PKCalendar />} />
                    <Route path="/app-tour" element={<AppTour />} />
                    <Route path="/top-streamers" element={<TopStreamers />} />
                    
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

                    {/* --- ZONA ADMINISTRATIVA (Requiere isAdmin) --- */}
                    <Route element={<AdminGate />}>
                        <Route path="/admin" element={<Navigate to="/admin/selection" replace />} />
                        <Route path="/admin/selection" element={<AdminSelection />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/editor" element={<EditorDashboard />} />
                    </Route>

                </Route> {/* Fin MaintenanceGate */}
            </Route> {/* Fin BlockedGate */}
        </Route> {/* Fin AuthGate */}

        {/* CATCH-ALL: Cualquier ruta desconocida va al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
        {/* HashRouter es CRÍTICO para entornos con URLs dinámicas o previsualizaciones */}
        <HashRouter>
            <AuthProvider>
                <ContentProvider>
                    {/* LoadingGate espera a que Firebase responda o haga timeout antes de pintar rutas */}
                    <LoadingGate>
                        <AppContent />
                    </LoadingGate>
                </ContentProvider>
            </AuthProvider>
        </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
