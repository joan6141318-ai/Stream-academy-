
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Trophy, Medal, Crown, TrendingUp, Zap, Flame, Minus, Sparkles } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const TopStreamers: React.FC = () => {
  const navigate = useNavigate();
  const { topStreamers } = useContent();

  const { month, list } = topStreamers;

  // Asegurar orden
  const sortedList = [...list].sort((a, b) => a.rank - b.rank).slice(0, 3);

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300 font-sans relative overflow-hidden">
      <Header title="Ranking Oficial" showBack onBack={() => navigate('/home')} />
      
      {/* Fondo Decorativo Sutil */}
      <div className="absolute top-0 inset-x-0 h-[50vh] bg-gradient-to-b from-gray-100 to-transparent dark:from-white/5 pointer-events-none"></div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="mt-6 mb-10 text-center">
            <div className="inline-flex items-center space-x-2 bg-brand-purple/10 text-brand-purple px-4 py-1.5 rounded-full mb-3 border border-brand-purple/20">
                <Trophy size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">{month}</span>
            </div>
            <h1 className="text-4xl font-black uppercase leading-[0.85] tracking-tighter text-brand-black dark:text-white mb-2">
                Top 3<br/>Agency
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Los mejores del mes
            </p>
        </div>

        {/* --- LISTA TOP 3 --- */}
        <div className="space-y-6">
            {sortedList.map((streamer) => {
                const isTop1 = streamer.rank === 1;
                const isTop2 = streamer.rank === 2;
                const isTop3 = streamer.rank === 3;
                
                // --- ESTILOS PREMIUM ---
                let containerClass = "bg-white dark:bg-[#111] border-gray-100 dark:border-white/5";
                let rankBadge = "";
                let accentColor = "";
                let glow = "";
                
                // TOP 1: ORO PREMIUM
                if (isTop1) {
                    containerClass = "bg-gradient-to-b from-[#1a1a1a] to-black border-[#FFD700] border-2 shadow-2xl relative overflow-hidden";
                    rankBadge = "bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37] text-black shadow-[0_0_20px_rgba(255,215,0,0.5)]";
                    accentColor = "text-[#FFD700]";
                    glow = "shadow-[0_10px_40px_-10px_rgba(255,215,0,0.3)]";
                } 
                // TOP 2: PLATA ELEGANTE
                else if (isTop2) {
                    containerClass = "bg-white dark:bg-[#151515] border-gray-300 dark:border-gray-600 border shadow-xl relative overflow-hidden";
                    rankBadge = "bg-gradient-to-br from-[#E0E0E0] via-[#F5F5F5] to-[#BDBDBD] text-gray-800 shadow-[0_0_15px_rgba(255,255,255,0.3)]";
                    accentColor = "text-gray-400 dark:text-gray-300";
                    glow = "shadow-[0_10px_30px_-10px_rgba(200,200,200,0.2)]";
                } 
                // TOP 3: BRONCE CÁLIDO
                else if (isTop3) {
                    containerClass = "bg-white dark:bg-[#151515] border-orange-200 dark:border-orange-900 border shadow-lg relative overflow-hidden";
                    rankBadge = "bg-gradient-to-br from-[#CD7F32] via-[#E29D67] to-[#8B4513] text-white shadow-[0_0_15px_rgba(205,127,50,0.3)]";
                    accentColor = "text-orange-400 dark:text-orange-600";
                    glow = "shadow-[0_10px_30px_-10px_rgba(205,127,50,0.2)]";
                }

                return (
                    <div 
                        key={streamer.rank}
                        className={`relative rounded-[2.5rem] p-6 transition-transform duration-300 ${containerClass} ${glow} ${isTop1 ? 'scale-105 z-10 my-8' : ''}`}
                    >
                        {/* Fondo Top 1 Brillo */}
                        {isTop1 && <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700]/10 via-transparent to-transparent pointer-events-none"></div>}

                        <div className="relative z-10 flex items-center gap-5">
                            
                            {/* Ranking Badge & Avatar */}
                            <div className="relative">
                                <div className={`w-12 h-12 absolute -top-4 -left-3 rounded-full flex items-center justify-center z-20 ${rankBadge}`}>
                                    {isTop1 ? <Crown size={20} fill="currentColor" /> : <span className="text-xl font-black italic">#{streamer.rank}</span>}
                                </div>
                                <div className={`w-20 h-20 rounded-full p-1 ${isTop1 ? 'bg-gradient-to-tr from-[#FFD700] to-[#FDB931]' : isTop2 ? 'bg-gray-300' : 'bg-orange-300'}`}>
                                    <img src={streamer.avatar} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-black" alt={streamer.name} />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-2xl font-black uppercase truncate leading-none mb-1 ${isTop1 ? 'text-white' : 'text-brand-black dark:text-white'}`}>
                                    {streamer.name}
                                </h3>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isTop1 ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                                    {streamer.id}
                                </p>

                                {/* Stats Grid */}
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-gray-500 mb-0.5">Recaudación</span>
                                        <div className="flex items-center gap-1 text-sm font-black text-brand-black dark:text-white">
                                            <Zap size={12} className={isTop1 ? 'text-[#FFD700]' : 'text-brand-purple'} fill="currentColor" />
                                            {streamer.meta}
                                        </div>
                                    </div>
                                    <div className="w-px h-6 bg-gray-200 dark:bg-white/10"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-gray-500 mb-0.5">Récord</span>
                                        <div className="flex items-center gap-1 text-sm font-black text-brand-black dark:text-white">
                                            <Flame size={12} className={isTop1 ? 'text-[#FFD700]' : 'text-orange-500'} fill="currentColor" />
                                            {streamer.record}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trend */}
                            <div className="flex flex-col items-center justify-center opacity-50">
                                {streamer.trend === 'up' && <TrendingUp size={20} className="text-green-500" />}
                                {streamer.trend === 'down' && <TrendingUp size={20} className="text-red-500 transform rotate-180" />}
                                {streamer.trend === 'stable' && <Minus size={20} className="text-gray-400" />}
                            </div>
                        </div>

                        {/* Top 1 Decor */}
                        {isTop1 && <Sparkles className="absolute top-4 right-4 text-[#FFD700] animate-pulse" size={24} />}
                    </div>
                );
            })}
        </div>

      </div>
    </div>
  );
};

export default TopStreamers;
