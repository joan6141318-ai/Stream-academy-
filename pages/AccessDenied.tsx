
import React, { useEffect } from 'react';
import { UserX, MessageCircle, LogOut, Shield, Lock, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AccessDenied: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // AUTORECUPERACIÓN: Si el usuario NO está bloqueado, redirigir al inicio.
  useEffect(() => {
    if (!loading && user && user.isBlocked === false) {
        navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0a] items-center justify-center p-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Pulse Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="relative z-10 text-center max-w-sm flex flex-col items-center">
          
          {/* Animated Icon Container */}
          <div className="relative mb-10 group">
              <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-xl animate-[pulse_2s_infinite]"></div>
              <div className="relative w-32 h-32 bg-[#121212] rounded-full flex items-center justify-center shadow-2xl border-[3px] border-red-500/30 z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-900/40 to-transparent opacity-50"></div>
                  <UserX size={48} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] relative z-10 animate-[bounce_3s_infinite]" strokeWidth={2} />
                  
                  {/* Radar Scan Effect */}
                  <div className="absolute inset-0 border-t-2 border-red-500/50 rounded-full animate-[spin_4s_linear_infinite] shadow-[0_0_20px_rgba(239,68,68,0.2)]"></div>
              </div>
              <div className="absolute bottom-0 right-0 z-20 bg-red-600 p-2 rounded-full shadow-lg border-4 border-[#0a0a0a]">
                  <Lock size={14} strokeWidth={3} className="text-white" />
              </div>
          </div>

          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-[0.9]">
              Acceso<br/><span className="text-red-600">Restringido</span>
          </h1>

          <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 mb-8 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <p className="text-sm font-medium text-gray-300 leading-relaxed text-center relative z-10">
                  "Lo sentimos está herramienta solo está disponible para emisores activos te invitamos a unirte a nuestro equipo"
              </p>
          </div>

          <div className="w-full space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full h-14 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2 hover:bg-gray-200"
              >
                  <Activity size={18} />
                  <span>Verificar Estado</span>
              </button>

              <button 
                onClick={handleLogout}
                className="w-full h-14 bg-transparent border border-white/10 text-gray-500 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center space-x-2 hover:bg-white/5"
              >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
              </button>
          </div>
      </div>

      <div className="absolute bottom-8 text-center opacity-30">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">System Locked</p>
      </div>
    </div>
  );
};

export default AccessDenied;
