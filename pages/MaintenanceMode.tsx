import React from 'react';
import { ShieldAlert, Lock, RefreshCw, AlertTriangle } from 'lucide-react';

const MaintenanceMode: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

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
                      La plataforma se encuentra en modo de <strong>mantenimiento de emergencia</strong> o revisión de seguridad. El acceso ha sido restringido temporalmente.
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
};

export default MaintenanceMode;