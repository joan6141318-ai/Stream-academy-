import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserCog, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleConfigure = () => {
    navigate('/settings');
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black transition-colors duration-300 px-8 pt-safe pb-safe">
      
      <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in">
        
        {/* Icono Decorativo */}
        <div className="relative mb-10">
            <div className="absolute inset-0 bg-brand-purple/20 blur-2xl rounded-full"></div>
            <div className="relative w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center border-2 border-gray-100 dark:border-white/10 shadow-xl">
                <UserCog size={48} className="text-brand-black dark:text-white" strokeWidth={1.5} />
                <div className="absolute top-0 right-0 bg-brand-purple text-white p-2 rounded-full shadow-lg animate-bounce">
                    <Sparkles size={16} fill="currentColor" />
                </div>
            </div>
        </div>

        {/* Textos */}
        <h1 className="text-4xl font-black text-brand-black dark:text-white uppercase tracking-tighter mb-4 leading-none">
          Bienvenido
        </h1>
        
        <div className="h-1 w-12 bg-brand-purple rounded-full mb-6"></div>

        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xs mb-2">
          Hola, <span className="text-brand-black dark:text-white font-bold">{user?.name || 'Streamer'}</span>.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xs">
          Iniciemos configurando tu perfil para que tu experiencia sea completa.
        </p>
      </div>

      {/* Botones de Acción */}
      <div className="mb-12 space-y-6 w-full">
        
        {/* Botón Principal: Avancemos */}
        <button 
            onClick={handleConfigure}
            className="w-full h-14 bg-brand-black dark:bg-white text-white dark:text-black rounded-sm shadow-xl flex items-center justify-between px-6 group active:scale-[0.98] transition-all duration-200"
        >
            <span className="text-xs font-black uppercase tracking-widest">Avancemos</span>
            <div className="bg-white/20 dark:bg-black/10 p-2 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </button>

        {/* Botón Secundario: Saltar */}
        <button 
            onClick={handleSkip}
            className="w-full py-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:text-brand-purple transition-colors"
        >
            Saltar
        </button>

      </div>
    </div>
  );
};

export default Onboarding;