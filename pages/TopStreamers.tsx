
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Trophy, Medal, Crown, TrendingUp, Star, Award, Zap, Flame, Minus, ChevronUp, ChevronDown } from 'lucide-react';

const TopStreamers: React.FC = () => {
  const navigate = useNavigate();

  // Mock Data - En producción esto vendría de Firebase
  const topStreamers = [
    { rank: 1, name: 'Sofi Star', id: 'SOFI-01', avatar: 'https://avatar.iran.liara.run/public/girl?username=Sofi', meta: '3M', record: '5.2M', trend: 'up' },
    { rank: 2, name: 'Max Power', id: 'MAX-88', avatar: 'https://avatar.iran.liara.run/public/boy?username=Max', meta: '2M', record: '2.1M', trend: 'stable' },
    { rank: 3, name: 'Luna Moon', id: 'LUNA-X', avatar: 'https://avatar.iran.liara.run/public/girl?username=Luna', meta: '1.5M', record: '1.8M', trend: 'up' },
    { rank: 4, name: 'Draco', id: 'DRA-09', avatar: 'https://avatar.iran.liara.run/public/boy?username=Draco', meta: '1M', record: '1.2M', trend: 'stable' },
    { rank: 5, name: 'Velvet', id: 'VEL-22', avatar: 'https://avatar.iran.liara.run/public/girl?username=Velvet', meta: '800k', record: '950k', trend: 'up' },
    { rank: 6, name: 'Rocker', id: 'RCK-66', avatar: 'https://avatar.iran.liara.run/public/boy?username=Rocker', meta: '600k', record: '700k', trend: 'down' },
    { rank: 7, name: 'Sunny', id: 'SUN-11', avatar: 'https://avatar.iran.liara.run/public/girl?username=Sunny', meta: '500k', record: '550k', trend: 'stable' },
    { rank: 8, name: 'Toxic', id: 'TOX-99', avatar: 'https://avatar.iran.liara.run/public/boy?username=Toxic', meta: '400k', record: '420k', trend: 'up' },
    { rank: 9, name: 'Misty', id: 'MIS-77', avatar: 'https://avatar.iran.liara.run/public/girl?username=Misty', meta: '300k', record: '310k', trend: 'stable' },
    { rank: 10, name: 'Neon', id: 'NEO-00', avatar: 'https://avatar.iran.liara.run/public/boy?username=Neon', meta: '250k', record: '280k', trend: 'up' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300 font-sans">
      <Header title="Top 10 Mensual" showBack onBack={() => navigate('/home')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* --- HERO CARD (JOVIAL & MARCO BLANCO) --- */}
        <div className="mt-6 mb-8 relative group">
            {/* Soft Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 rounded-[2.8rem] opacity-30 blur-lg group-hover:opacity-50 transition duration-1000"></div>
            
            {/* Card Body - Gradient Jovial */}
            <div className="relative w-full bg-gradient-to-bl from-[#FF0080] via-[#FF8C00] to-[#40E0D0] p-6 rounded-[2.5rem] border-[6px] border-white dark:border-[#2C2C2E] shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
                            <Trophy size={32} className="text-white" fill="currentColor" />
                        </div>
                        <div className="bg-white/20 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase tracking-widest">Octubre 2025</span>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-black uppercase leading-[0.85] tracking-tighter mb-3 drop-shadow-lg">
                        Salón de la<br/>Fama
                    </h1>
                    <div className="h-1 w-12 bg-white rounded-full mb-3 opacity-50"></div>
                    <p className="text-xs font-bold text-white/90 leading-relaxed max-w-[220px]">
                        Celebrando la excelencia, pasión y récord de nuestros talentos.
                    </p>
                </div>

                {/* Decor */}
                <Award className="absolute -right-8 -bottom-8 text-white/10 rotate-[-15deg]" size={200} strokeWidth={1} />
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>
        </div>

        {/* --- LIST --- */}
        <div className="space-y-4">
            {topStreamers.map((streamer, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;
                
                // --- ESTILOS DINÁMICOS POR RANGO ---
                let containerClass = "bg-white dark:bg-[#111] border-gray-100 dark:border-white/5";
                let rankText = "text-gray-300 font-black";
                let nameColor = "text-brand-black dark:text-white";
                let statColor = "text-brand-black dark:text-white";
                let metaLabel = "text-brand-purple";
                
                // TOP 1: GOLD (ORO)
                if (isTop1) {
                    containerClass = "bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600 border-yellow-100 dark:border-yellow-400/50 shadow-xl shadow-yellow-500/20 transform scale-[1.02] z-10";
                    rankText = "text-yellow-800 dark:text-yellow-100 drop-shadow-sm";
                    nameColor = "text-yellow-900 dark:text-white";
                    statColor = "text-yellow-900 dark:text-white";
                    metaLabel = "text-yellow-800 dark:text-yellow-200";
                } 
                // TOP 2: SILVER (PLATA)
                else if (isTop2) {
                    containerClass = "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 border-gray-300 dark:border-gray-500 shadow-lg shadow-gray-500/20";
                    rankText = "text-gray-600 dark:text-gray-200";
                    nameColor = "text-gray-800 dark:text-white";
                    statColor = "text-gray-800 dark:text-white";
                    metaLabel = "text-gray-600 dark:text-gray-300";
                } 
                // TOP 3: BRONZE (BRONCE)
                else if (isTop3) {
                    containerClass = "bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 dark:from-[#4a2c1d] dark:via-[#633a26] dark:to-[#4a2c1d] border-orange-200 dark:border-orange-800/50 shadow-lg shadow-orange-500/10";
                    rankText = "text-orange-800 dark:text-orange-200";
                    nameColor = "text-orange-900 dark:text-white";
                    statColor = "text-orange-900 dark:text-white";
                    metaLabel = "text-orange-800 dark:text-orange-300";
                }

                return (
                    <div 
                        key={streamer.id}
                        className={`relative flex items-center p-4 rounded-3xl border-[3px] transition-all duration-300 group ${containerClass}`}
                    >
                        {/* Rank Number */}
                        <div className="flex-shrink-0 mr-4 w-8 text-center relative">
                            {isTop1 && <Crown size={24} className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-600 dark:text-yellow-300 fill-current animate-bounce" />}
                            <span className={`text-3xl italic ${rankText}`}>#{streamer.rank}</span>
                        </div>

                        {/* Avatar */}
                        <div className="relative mr-4">
                            <div className={`w-14 h-14 rounded-full p-0.5 ${isTop1 ? 'bg-yellow-600' : isTop2 ? 'bg-gray-400' : isTop3 ? 'bg-orange-400' : 'bg-transparent'}`}>
                                <img src={streamer.avatar} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#111]" />
                            </div>
                            {/* Medal Badge for 2 and 3 */}
                            {isTop2 && <div className="absolute -top-2 -right-1 bg-gray-200 text-gray-600 p-1 rounded-full border border-gray-400"><Medal size={10} fill="currentColor" /></div>}
                            {isTop3 && <div className="absolute -top-2 -right-1 bg-orange-200 text-orange-700 p-1 rounded-full border border-orange-400"><Medal size={10} fill="currentColor" /></div>}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-black uppercase truncate ${nameColor}`}>
                                {streamer.name}
                            </h3>
                            <p className="text-[9px] font-bold opacity-60 uppercase tracking-wider truncate">
                                {streamer.id}
                            </p>
                        </div>

                        {/* Stats - Right Side */}
                        <div className={`flex flex-col items-end gap-1 pl-3 border-l ${isTop1 || isTop2 || isTop3 ? 'border-black/10 dark:border-white/10' : 'border-gray-100 dark:border-white/10'}`}>
                            
                            {/* Meta */}
                            <div className="flex items-center gap-1.5">
                                <Zap size={10} className={metaLabel} fill="currentColor" />
                                <span className={`text-xs font-black ${statColor}`}>{streamer.meta}</span>
                            </div>
                            
                            {/* Record */}
                            <div className="flex items-center gap-1.5 opacity-70">
                                <Flame size={10} className={isTop1 ? 'text-yellow-700 dark:text-yellow-300' : 'text-orange-500'} />
                                <span className={`text-[9px] font-bold ${statColor}`}>{streamer.record}</span>
                            </div>

                            {/* Trend Indicator */}
                            <div className="mt-0.5">
                                {streamer.trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
                                {streamer.trend === 'down' && <TrendingUp size={12} className="text-red-500 transform rotate-180" />}
                                {streamer.trend === 'stable' && <Minus size={12} className="text-gray-400" />}
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
