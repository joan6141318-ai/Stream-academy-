import React from 'react';
import { ShieldAlert, Lock, RefreshCw, AlertTriangle, Bot, Wrench, Settings } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const MaintenanceMode: React.FC = () => {
  const { homeConfig } = useContent();
  const activeMode = homeConfig?.maintenanceMode || 'lockdown'; // Default to red if undefined

  const handleRefresh = () => {
    window.location.reload();
  };

  // --- MODO 1: RED LOCKDOWN (Seguridad/Peligro) ---
  if (activeMode === 'lockdown') {
      return (
        <div className="flex flex-col h-screen w-full bg-red-600 text-white items-center justify-center p-8 relative overflow-hidden">
          
          {/* Background Pulse */}
          <div className="absolute inset-0 bg-red-700 animate-pulse opacity-50 pointer-events-none"></div>
          
          {/* Huge Icon */}
          <div className="relative z-10 mb-8">
              <div className="bg-white/10 p-6 rounded-full backdrop-blur-md border-4 border-white/20 shadow-2xl">
                  <ShieldAlert size={80} strokeWidth={1.5} className="animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
              <div className="absolute -top-2 -right-2 bg-white text-red-600 p-2 rounded-full shadow-lg">
                  <Lock size={20} strokeWidth={3} />
              </div>
          </div>

          <div className="relative z-10 text-center max-w-sm space-y-6">
              <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
                      Protocolo de<br/>Seguridad
                  </h1>
                  <div className="inline-flex items-center bg-black/30 px-4 py-1 rounded-full border border-white/10">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-ping mr-2"></span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Lockdown Activo</span>
                  </div>
              </div>

              <div className="bg-black/20 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-start space-x-3 text-left">
                      <AlertTriangle className="flex-shrink-0 mt-1 text-white/80" size={20} />
                      <p className="text-sm font-medium leading-relaxed text-white/90">
                          La plataforma se encuentra en modo de <strong>bloqueo de emergencia</strong>. El acceso ha sido restringido por seguridad.
                      </p>
                  </div>
              </div>

              <p className="text-xs font-bold text-white/60 uppercase tracking-wide">
                  Por favor intenta acceder más tarde
              </p>

              <button 
                onClick={handleRefresh}
                className="w-full bg-white text-red-600 h-14 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                  <RefreshCw size={16} />
                  <span>Verificar Estado</span>
              </button>
          </div>

          <div className="absolute bottom-8 text-center opacity-40">
              <p className="text-[10px] font-mono">ERR_SECURITY_LOCKDOWN</p>
              <p className="text-[10px] font-bold">STREAM AGENCY SECURE CORE</p>
          </div>
        </div>
      );
  }

  // --- MODO 2: PURPLE MAINTENANCE (Amable/Actualización) ---
  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-black text-brand-black dark:text-white items-center justify-center p-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          
          {/* Animated Bot Character */}
          <div className="relative mb-8">
              {/* Main Body */}
              <div className="w-32 h-32 bg-gradient-to-br from-brand-black to-gray-800 dark:from-white dark:to-gray-200 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 animate-[bounce_3s_infinite] relative z-10">
                  <Bot size={64} className="text-white dark:text-black" strokeWidth={1.5} />
                  {/* Face/Screen Glow */}
                  <div className="absolute inset-0 bg-brand-purple/20 rounded-3xl blur-xl -z-10"></div>
              </div>

              {/* Floating Gear */}
              <div className="absolute -top-4 -right-4 bg-brand-purple text-white p-3 rounded-full shadow-lg animate-[spin_4s_linear_infinite] z-20 border-4 border-white dark:border-black">
                  <Settings size={20} />
              </div>

              {/* Floating Wrench */}
              <div className="absolute -bottom-2 -left-4 bg-white dark:bg-brand-dark-card text-brand-black dark:text-white p-3 rounded-full shadow-lg animate-pulse z-20 border border-gray-100 dark:border-white/10">
                  <Wrench size={20} />
              </div>
          </div>

          <div className="space-y-4 mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                  Estamos<br/>Trabajando
              </h1>
              <div className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-brand-purple animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300">
                      Mantenimiento Programado
                  </span>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  Disculpa las molestias, estamos mejorando la plataforma para ti. Pronto todo volverá a la normalidad.
              </p>
          </div>

          <button 
            onClick={handleRefresh}
            className="w-full h-14 bg-brand-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
              <RefreshCw size={16} />
              <span>Actualizar Página</span>
          </button>
      </div>

      <div className="absolute bottom-8 text-center opacity-30">
          <p className="text-[10px] font-mono">STATUS: UPGRADING_SYSTEM</p>
      </div>
    </div>
  );
};

export default MaintenanceMode;