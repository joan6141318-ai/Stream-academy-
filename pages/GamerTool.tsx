import React from 'react';
import { Header } from '../components/Header';
import { Gamepad2, Monitor, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GamerTool: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      {/* Header Transparent with only Back button (No Title) */}
      <Header showBack transparent onBack={() => navigate('/home')} />

      {/* Removed top padding so image goes behind header */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col pb-6">
        
        {/* Hero Section */}
        <div className="relative h-72 w-full bg-black mb-6 flex-shrink-0">
             <img 
                src="https://i.postimg.cc/GphQkHMd/peakpx.jpg" 
                alt="Gamer Header" 
                className="w-full h-full object-cover opacity-80"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-gray dark:from-black via-transparent to-transparent"></div>
             
             {/* Overlay Content */}
             <div className="absolute bottom-4 left-6 right-6 z-10">
                 <div className="w-12 h-12 bg-green-400 rounded-sm flex items-center justify-center mb-3 shadow-lg shadow-green-400/30">
                    <Gamepad2 className="text-black" size={24} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-black text-brand-black dark:text-white uppercase leading-[0.9] mb-2 tracking-tighter">
                    Juega,<br/>Diviértete<br/>y Aprende
                </h1>
             </div>
        </div>

        {/* Introduction Text */}
        <div className="px-6 mb-8">
            <div className="h-1 w-10 bg-green-400 mb-4 rounded-full"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-justify">
                El streaming de videojuegos es una de las categorías más populares y rentables. En esta sección aprenderás a configurar tu entorno y descubrirás las mejores estrategias para entretener a tu audiencia mientras disfrutas de tus juegos favoritos.
            </p>
        </div>

        {/* 2 Cards Grid */}
        <div className="px-6 grid grid-cols-1 gap-5">
            {/* Card 1: Setup & Config -> LINKS TO GAME */}
            <button 
                onClick={() => navigate('/tools/gamer/setup')}
                className="relative w-full h-36 bg-violet-600 rounded-sm overflow-hidden shadow-xl shadow-violet-600/20 group active:scale-[0.98] transition-all text-left p-6 flex flex-col justify-between"
            >
                <div className="relative z-10">
                    <div className="bg-white/20 w-fit p-1.5 rounded-sm mb-3 backdrop-blur-md border border-white/10">
                        <Monitor className="text-white" size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase leading-none tracking-wide">Setup &<br/>Configuración</h3>
                    <p className="text-[10px] text-white/80 mt-1.5 font-bold uppercase tracking-widest">OBS • Overlays • Audio</p>
                </div>
                
                {/* Decorative Icon */}
                <Monitor className="absolute -right-6 -bottom-6 text-white/10 rotate-[-15deg] transition-transform group-hover:scale-110" size={140} strokeWidth={1} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Card 2: Games & Content */}
            <button 
                onClick={() => alert("Abriendo tendencias de juegos...")}
                className="relative w-full h-36 bg-pink-600 rounded-sm overflow-hidden shadow-xl shadow-pink-600/20 group active:scale-[0.98] transition-all text-left p-6 flex flex-col justify-between"
            >
                <div className="relative z-10">
                    <div className="bg-white/20 w-fit p-1.5 rounded-sm mb-3 backdrop-blur-md border border-white/10">
                        <Zap className="text-white" size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase leading-none tracking-wide">Juegos en<br/>Tendencia</h3>
                    <p className="text-[10px] text-white/80 mt-1.5 font-bold uppercase tracking-widest">Qué jugar para crecer</p>
                </div>

                {/* Decorative Icon */}
                <Zap className="absolute -right-6 -bottom-6 text-white/10 rotate-[15deg] transition-transform group-hover:scale-110" size={140} strokeWidth={1} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
        </div>

      </div>
    </div>
  );
};

export default GamerTool;