import React, { useEffect } from 'react';
import { UserX, LogOut, Activity, Lock } from 'lucide-react';
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
    <div className="flex flex-col h-screen w-full bg-white text-brand-black items-center justify-center p-8 relative overflow-hidden font-sans">
      
      {/* Background Decor - Subtle Gray Circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gray-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-50 rounded-full blur-2xl opacity-50 -ml-10 -mb-10"></div>

      <div className="relative z-10 text-center max-w-sm flex flex-col items-center animate-fade-in">
          
          {/* Minimalist Icon */}
          <div className="relative mb-8">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center shadow-lg border border-gray-100 relative z-10">
                  <UserX size={40} className="text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="absolute top-0 right-0 bg-brand-black text-white p-2 rounded-full shadow-md animate-bounce">
                  <Lock size={12} strokeWidth={2.5} />
              </div>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">
              Acceso<br/>Restringido
          </h1>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8 shadow-sm">
              <p className="text-sm font-medium text-gray-500 leading-relaxed text-center">
                  "Lo sentimos está herramienta solo está disponible para emisores activos te invitamos a unirte a nuestro equipo"
              </p>
          </div>

          <div className="w-full space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full h-14 bg-brand-black text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2 hover:bg-gray-900"
              >
                  <Activity size={16} />
                  <span>Verificar Estado</span>
              </button>

              <button 
                onClick={handleLogout}
                className="w-full h-14 bg-white border border-gray-200 text-gray-400 hover:text-brand-black hover:border-gray-300 rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
              </button>
          </div>
      </div>

      <div className="absolute bottom-8 text-center opacity-30">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">System Locked</p>
      </div>
    </div>
  );
};

export default AccessDenied;