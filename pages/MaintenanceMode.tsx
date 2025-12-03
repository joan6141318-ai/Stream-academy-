
import React, { useEffect } from 'react';
import { ShieldAlert, Lock, RefreshCw, AlertTriangle, LogOut } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MaintenanceMode: React.FC = () => {
  const { homeConfig } = useContent();
  const { user, loading, logout } = useAuth(); 
  const navigate = useNavigate();
  const activeMode = homeConfig?.maintenanceMode || 'lockdown'; 

  // --- REDIRECCIÓN AUTOMÁTICA DE ADMIN ---
  // Si AuthContext detecta que es admin (por DB o por Lista en constants.ts), expulsa al home.
  useEffect(() => {
      if (!loading && user?.isAdmin) {
          navigate('/home', { replace: true });
      }
  }, [user, loading, navigate]);

  // Si ya es admin, no mostrar nada para evitar parpadeos
  if (user?.isAdmin) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  if (loading) {
      return (
          <div className="flex flex-col h-screen w-full bg-black items-center justify-center">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Verificando acceso...
              </p>
          </div>
      );
  }

  // --- MODO 1: RED LOCKDOWN (Seguridad/Peligro) ---
  if (activeMode === 'lockdown') {
      return (
        <div className="flex flex-col h-screen w-full bg-red-600 text-white items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-700 animate-pulse opacity-50 pointer-events-none"></div>
          
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

              <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={handleRefresh}
                    className="w-full bg-white text-red-600 h-14 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                      <RefreshCw size={16} />
                      <span>Verificar Estado</span>
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-red-800/50 text-white border border-red-400/30 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center hover:bg-red-800"
                  >
                      <LogOut size={14} className="mr-2" />
                      Cerrar Sesión
                  </button>
              </div>
          </div>
        </div>
      );
  }

  // --- MODO 2: MAINTENANCE (Mantenimiento Standard) ---
  return (
    <div className="flex flex-col h-screen w-full bg-brand-purple text-white items-center justify-center p-8 relative overflow-hidden">
      
      <div className="relative z-10 mb-8">
          <div className="bg-white/10 p-6 rounded-full backdrop-blur-md border-4 border-white/20 shadow-2xl">
              <RefreshCw size={80} strokeWidth={1.5} className="animate-spin-slow" />
          </div>
      </div>

      <div className="relative z-10 text-center max-w-sm space-y-6">
          <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
                  En<br/>Mantenimiento
              </h1>
              <p className="text-sm font-medium text-purple-200 uppercase tracking-widest">
                  Mejorando la experiencia
              </p>
          </div>

          <p className="text-sm font-medium leading-relaxed text-white/90">
              Estamos realizando actualizaciones importantes en la plataforma. Volveremos a estar en línea en breve.
          </p>

          <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={handleRefresh}
                className="w-full bg-white text-brand-purple h-14 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                  <RefreshCw size={16} />
                  <span>Recargar</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full bg-purple-900/50 text-white border border-purple-400/30 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center hover:bg-purple-900"
              >
                  <LogOut size={14} className="mr-2" />
                  Cerrar Sesión
              </button>
          </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
