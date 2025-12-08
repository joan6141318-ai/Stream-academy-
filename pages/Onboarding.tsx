import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserCog, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleConfigure = () => {
    navigate('/onboarding/setup');
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
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">
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

      {/* Botones de Acción - Posicionado más arriba (mb-32) */}
      <div className="mb-32 w-full flex flex-col items-center">
        
        {/* Botón Principal: Avancemos */}
        <div className="flex flex-col items-center space-y-4 mb-8 group cursor-pointer" onClick={handleConfigure}>
            <button 
                className="w-16 h-16 bg-brand-purple text-white rounded-full shadow-xl shadow-purple-500/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            >
                <ArrowRight size={28} className="transition-transform duration-300" strokeWidth={2.5} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 group-hover:text-brand-purple transition-colors">
                Avancemos
            </span>
        </div>

        {/* Botón Secundario: Saltar */}
        <button 
            onClick={handleSkip}
            className="py-2 text-[9px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest hover:text-brand-black dark:hover:text-white transition-colors"
        >
            Saltar
        </button>

      </div>
    </div>
  );
};

export default Onboarding;