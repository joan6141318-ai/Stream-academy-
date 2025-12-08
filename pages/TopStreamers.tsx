
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Trophy, TrendingUp, Zap, Flame, Sparkles, PartyPopper } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const TopStreamers: React.FC = () => {
  const navigate = useNavigate();
  const { topStreamers } = useContent();

  const { month, list, congratsTitle, congratsMessage } = topStreamers;

  // Asegurar orden
  const sortedList = [...list].sort((a, b) => a.rank - b.rank).slice(0, 3);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black transition-colors duration-300 font-sans relative overflow-hidden">
      <Header title="Ranking Oficial" showBack onBack={() => navigate('/home')} />
      
      {/* Fondo Decorativo Fluido */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute top-40 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl -ml-20 pointer-events-none"></div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24 relative z-10">
        
        {/* --- TARJETA DE FELICITACIÓN (HERO) --- */}
        <div className="mt-6 mb-8">
            <div className="relative w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 rounded-[2.5rem] p-8 border-[6px] border-white dark:border-[#1A1A1A] shadow-2xl overflow-hidden group">
                
                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 bg-white opacity-5 pointer-events-none mix-blend-overlay"></div>
                
                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-4 shadow-sm">
                        <Trophy size={14} className="text-white mr-2" fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{month}</span>
                    </div>
                    
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-3 drop-shadow-lg">
                        {congratsTitle || "¡Felicidades!"}
                    </h1>
                    
                    <p className="text-xs font-bold text-white/90 leading-relaxed max-w-[260px] mx-auto">
                        {congratsMessage || "A nuestros emisores destacados por su increíble desempeño."}
                    </p>
                </div>

                {/* Floating Elements */}
                <PartyPopper className="absolute top-6 left-6 text-white/20 -rotate-12" size={40} />
                <Sparkles className="absolute bottom-6 right-6 text-yellow-300 animate-pulse" size={32} />
            </div>
        </div>

        {/* --- LISTA TOP 3 (MINIMALISTA) --- */}
        <div className="space-y-5">
            {sortedList.map((streamer) => {
                const isTop1 = streamer.rank === 1;
                
                // Colores "Joviales" y Modernos (Flat Colors)
                let rankColor = "";
                let rankBg = "";
                let shadowColor = "";

                if (streamer.rank === 1) {
                    rankColor = "text-yellow-400"; // Neon Yellow
                    rankBg = "bg-yellow-400";
                    shadowColor = "shadow-yellow-400/30";
                } else if (streamer.rank === 2) {
                    rankColor = "text-slate-400"; // Cool Gray
                    rankBg = "bg-slate-300";
                    shadowColor = "shadow-slate-300/30";
                } else {
                    rankColor = "text-orange-400"; // Bright Orange
                    rankBg = "bg-orange-400";
                    shadowColor = "shadow-orange-400/30";
                }

                return (
                    <div 
                        key={streamer.rank}
                        className={`relative rounded-[2.5rem] p-5 transition-transform duration-300 bg-white dark:bg-[#111] border-[3px] border-gray-100 dark:border-white/5 shadow-xl ${isTop1 ? 'scale-105 z-10 mb-8 border-yellow-400/30 dark:border-yellow-400/20' : ''}`}
                    >
                        <div className="flex items-center gap-5">
                            
                            {/* Avatar & Rank */}
                            <div className="relative">
                                {/* Rank Pill */}
                                <div className={`absolute -top-3 -left-2 px-3 py-1 rounded-full ${rankBg} text-white dark:text-black shadow-lg z-20`}>
                                    <span className="text-xs font-black italic">#{streamer.rank}</span>
                                </div>
                                
                                <div className={`w-20 h-20 rounded-[1.5rem] p-1 bg-white dark:bg-[#222] shadow-md overflow-hidden relative`}>
                                    <img src={streamer.avatar} className="w-full h-full rounded-[1.2rem] object-cover" alt={streamer.name} />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-xl font-black uppercase truncate leading-none mb-1 text-brand-black dark:text-white`}>
                                    {streamer.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                        ID: {streamer.id}
                                    </span>
                                </div>

                                {/* Stats Modernas */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1.5 rounded-lg border border-purple-100 dark:border-purple-500/20">
                                        <Zap size={10} className="text-brand-purple" fill="currentColor" />
                                        <span className="text-[10px] font-black text-brand-purple">{streamer.meta}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1.5 rounded-lg border border-orange-100 dark:border-orange-500/20">
                                        <Flame size={10} className="text-orange-500" fill="currentColor" />
                                        <span className="text-[10px] font-black text-orange-500">{streamer.record}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trend Indicator Simple */}
                            <div className="flex flex-col items-center justify-center pr-2">
                                {streamer.trend === 'up' && <div className="bg-green-100 dark:bg-green-900/20 p-1.5 rounded-full"><TrendingUp size={16} className="text-green-500" /></div>}
                                {streamer.trend === 'down' && <div className="bg-red-100 dark:bg-red-900/20 p-1.5 rounded-full"><TrendingUp size={16} className="text-red-500 transform rotate-180" /></div>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

      </div>
    </div>
  );
};

export default TopStreamers;
