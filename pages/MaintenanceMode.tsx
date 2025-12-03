
import React from 'react';
import { ShieldAlert, Lock, RefreshCw, AlertTriangle, Bot, Wrench, Settings, Unlock, ArrowRight, ShieldCheck, Power } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MaintenanceMode: React.FC = () => {
  const { homeConfig, updateHomeConfig } = useContent();
  const { user } = useAuth();
  const navigate = useNavigate();
  const activeMode = homeConfig?.maintenanceMode || 'lockdown'; // Default to red if undefined

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAdminBypass = () => {
      navigate('/admin/dashboard');
  };

  const handleTurnOff = async () => {
      if(window.confirm("¿Desactivar el Modo Mantenimiento para todos?")) {
          await updateHomeConfig({ maintenanceMode: 'off' });
          // Redirigir al home después de apagar
          setTimeout(() => navigate('/home'), 500);
      }
  };

  // --- MODO 1: RED LOCKDOWN (Seguridad/Peligro) ---
  if (activeMode === 'lockdown') {
      return (
        <div className="flex flex-col h-screen w-full bg-red-600 text-white items-center justify-center p-8 relative overflow-hidden">
          
          {/* Background Pulse */}
          <div className="absolute inset-0 bg-red-700 animate-pulse opacity-50 pointer-events-none"></div>
          
          {/* ADMIN CONTROL CENTER - CENTERED */}
          {user?.isAdmin && (
              <div className="w-full max-w-xs mb-8 z-50 animate-slide-up relative">
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-2xl">
                      <div className="flex items-center justify-center space-x-2 mb-4 border-b border-white/10 pb-3">
                          <ShieldCheck size={18} className="text-white" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Panel Admin</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                          <button 
                            onClick={handleTurnOff}
                            className="w-full bg-white text-red-600 h-10 rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center justify-center hover:bg-gray-100 shadow-md transition-transform active:scale-95"
                          >
                              <Power size={14} className="mr-2" />
                              Desactivar Bloqueo
                          </button>
                          <button 
                            onClick={handleAdminBypass}
                            className="w-full bg-black/40 text-white border border-white/20 h-10 rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center justify-center hover:bg-black/60 shadow-md transition-transform active:scale-95"
                          >
                              Entrar al Sistema <ArrowRight size={14} className="ml-2" />
                          </button>
                      </div>
                  </div>
              </div>
          )}
          
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

      {/* ADMIN CONTROL CENTER - CENTERED */}
      {user?.isAdmin && (
          <div className="w-full max-w-xs mb-10 z-50 animate-slide-up relative">
              <div className="bg-white dark:bg-brand-dark-card border border-gray-100 dark:border-white/10 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-center space-x-2 mb-4 border-b border-gray-100 dark:border-white/10 pb-3">
                      <ShieldCheck size={18} className="text-brand-purple" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">Panel Admin</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={handleTurnOff}
                        className="w-full bg-brand-purple text-white h-10 rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center justify-center hover:bg-purple-600 shadow-md transition-transform active:scale-95"
                      >
                          <Unlock size={14} className="mr-2" />
                          Abrir App (Online)
                      </button>
                      <button 
                        onClick={handleAdminBypass}
                        className="w-full bg-gray-100 dark:bg-white/10 text-brand-black dark:text-white border border-transparent h-10 rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 shadow-sm transition-transform active:scale-95"
                      >
                          Ir al Panel <ArrowRight size={14} className="ml-2" />
                      </button>
                  </div>
              </div>
          </div>
      )}

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
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-brand-black dark:text-white">
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
          <p className="text-[10px] font-mono dark:text-white text-black">STATUS: UPGRADING_SYSTEM</p>
      </div>
    </div>
  );
};

export default MaintenanceMode;
