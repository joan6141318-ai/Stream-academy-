
import React from 'react';
import { UserX, MessageCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AccessDenied: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-black items-center justify-center p-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-sm flex flex-col items-center">
          
          <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6 shadow-lg border border-red-100 dark:border-red-900/30">
              <UserX size={40} className="text-red-500" strokeWidth={1.5} />
          </div>

          <h1 className="text-2xl font-black text-brand-black dark:text-white uppercase tracking-tighter mb-4 leading-none">
              Acceso Restringido
          </h1>

          <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10 mb-8 shadow-sm">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                  Lo sentimos, necesitas ser un <span className="font-bold text-brand-black dark:text-white">Emisor Activo</span> para poder utilizar estos recursos.
              </p>
              <div className="w-10 h-1 bg-gray-200 dark:bg-white/10 mx-auto my-4 rounded-full"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Te invitamos a contactarnos para más información sobre el estado de tu cuenta.
              </p>
          </div>

          <div className="w-full space-y-3">
              <button 
                onClick={() => window.open('https://wa.me/MESSAGE_LINK', '_blank')}
                className="w-full h-14 bg-brand-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                  <MessageCircle size={18} />
                  <span>Contactar Soporte</span>
              </button>

              <button 
                onClick={handleLogout}
                className="w-full h-14 bg-transparent border border-gray-200 dark:border-white/20 text-gray-400 hover:text-brand-black dark:hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center space-x-2 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
              </button>
          </div>
      </div>

      <div className="absolute bottom-8 text-center opacity-30">
          <p className="text-[10px] font-mono">ACCOUNT_STATUS: INACTIVE</p>
      </div>
    </div>
  );
};

export default AccessDenied;
