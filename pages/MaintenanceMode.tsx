import React, { useEffect } from 'react';
import { ShieldAlert, Lock, RefreshCw, AlertTriangle, Bot, Wrench, Settings } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MaintenanceMode: React.FC = () => {
  const { homeConfig } = useContent();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const activeMode = homeConfig?.maintenanceMode || 'off';
  const isAdmin = !!user?.isAdmin;

  // AUTORECUPERACIÓN: Si ya no hay mantenimiento o soy Admin, ir al inicio.
  useEffect(() => {
    if (activeMode === 'off' || isAdmin) {
        navigate('/', { replace: true });
    }
  }, [activeMode, isAdmin, navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (activeMode === 'lockdown') {
      return (
        <div className="flex flex-col h-screen w-full bg-red-600 text-white items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-700 animate-pulse opacity-50 pointer-events-none"></div>
          <div className="relative z-10 mb-8">
              <div className="bg-white/10 p-6 rounded-full backdrop-blur-md border-4 border-white/20 shadow-2xl">
                  <ShieldAlert size={80} strokeWidth={1.5} className="animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
          </div>

          <div className="relative z-10 text-center max-w-sm space-y-6">
              <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2 text-white drop-shadow-md">Protocolo de<br/>Seguridad</h1>
                  <div className="inline-flex items-center bg-black/30 px-4 py-1 rounded-full border border-white/10">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-ping mr-2"></span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Lockdown Activo</span>
                  </div>
              </div>
              <button onClick={handleRefresh} className="w-full bg-white text-red-600 h-14 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2">
                  <RefreshCw size={16} /><span>Verificar</span>
              </button>
          </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-black text-brand-black dark:text-white items-center justify-center p-8 relative overflow-hidden transition-colors duration-300">
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-brand-black to-gray-800 dark:from-white dark:to-gray-200 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 animate-[bounce_3s_infinite] relative z-10">
                  <Bot size={64} className="text-white dark:text-black" strokeWidth={1.5} />
              </div>
          </div>
          <div className="space-y-4 mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">Estamos<br/>Trabajando</h1>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">Disculpa las molestias, estamos mejorando la plataforma. Intenta acceder en unos minutos.</p>
          </div>
          <button onClick={handleRefresh} className="w-full h-14 bg-brand-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2">
              <RefreshCw size={16} /><span>Actualizar Página</span>
          </button>
      </div>
    </div>
  );
};

export default MaintenanceMode;