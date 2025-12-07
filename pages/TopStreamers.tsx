import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Trophy, Medal, Crown, TrendingUp, Star, Award, Zap } from 'lucide-react';

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

  const getRankStyle = (rank: number) => {
      switch(rank) {
          case 1: return { color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', icon: Crown };
          case 2: return { color: 'text-gray-300', border: 'border-gray-300', bg: 'bg-gray-300/10', icon: Medal };
          case 3: return { color: 'text-amber-600', border: 'border-amber-600', bg: 'bg-amber-600/10', icon: Medal };
          default: return { color: 'text-brand-black dark:text-white', border: 'border-gray-100 dark:border-white/10', bg: 'bg-white dark:bg-brand-dark-card', icon: Star };
      }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300 font-sans">
      <Header title="Top 10 Mensual" showBack onBack={() => navigate('/home')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* --- TARJETA JOVIAL DE FELICITACIÓN --- */}
        <div className="mt-6 mb-8 relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-[2.8rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative w-full bg-gradient-to-br from-orange-400 to-pink-600 p-6 rounded-[2.5rem] border-[5px] border-white dark:border-[#2C2C2E] shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="relative z-10 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-sm">
                            <Trophy size={28} className="text-white" fill="currentColor" />
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase tracking-widest">Octubre 2025</span>
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-black uppercase leading-[0.9] tracking-tighter mb-2 drop-shadow-md">
                        Salón de la<br/>Fama
                    </h1>
                    <p className="text-xs font-bold text-white/90 leading-relaxed max-w-[200px]">
                        Reconocimiento a la excelencia, constancia y dedicación de nuestros mejores talentos.
                    </p>
                </div>

                {/* Decoración de fondo */}
                <Award className="absolute -right-6 -bottom-6 text-white/10 rotate-[-15deg]" size={160} strokeWidth={1.5} />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>
        </div>

        {/* --- LISTA TOP 10 --- */}
        <div className="space-y-4">
            {topStreamers.map((streamer, index) => {
                const style = getRankStyle(streamer.rank);
                const RankIcon = style.icon;
                const isTop3 = streamer.rank <= 3;

                return (
                    <div 
                        key={streamer.id}
                        className={`relative flex items-center p-4 rounded-3xl border-[3px] transition-all duration-300 group ${isTop3 ? `${style.bg} ${style.border}` : 'bg-white dark:bg-[#111] border-gray-100 dark:border-white/5'} ${isTop3 ? 'shadow-lg' : 'shadow-sm'}`}
                    >
                        {/* Rank Badge */}
                        <div className="flex-shrink-0 mr-4 relative">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black italic ${isTop3 ? 'bg-white dark:bg-black shadow-md' : 'bg-gray-100 dark:bg-white/10 text-gray-400'} ${style.color}`}>
                                #{streamer.rank}
                            </div>
                            {isTop3 && (
                                <div className="absolute -top-2 -right-2">
                                    <RankIcon size={20} className={style.color} fill="currentColor" />
                                </div>
                            )}
                        </div>

                        {/* Avatar & Info */}
                        <div className="flex-1 flex items-center mr-4 overflow-hidden">
                            <div className="relative mr-3">
                                <img src={streamer.avatar} alt={streamer.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-white/10 shadow-sm" />
                                {streamer.trend === 'up' && <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-black flex items-center justify-center"><TrendingUp size={8} className="text-white" /></div>}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-black uppercase text-brand-black dark:text-white truncate">
                                    {streamer.name}
                                </h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                    ID: {streamer.id}
                                </p>
                            </div>
                        </div>

                        {/* Stats - Horizontal Stack for better space */}
                        <div className="flex flex-col items-end justify-center pl-4 border-l border-gray-100 dark:border-white/10">
                            <div className="flex flex-col items-end mb-1">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Meta</span>
                                <div className="flex items-center gap-1">
                                    <Zap size={10} className="text-brand-purple" fill="currentColor" />
                                    <span className="text-xs font-black text-brand-black dark:text-white">{streamer.meta}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Récord</span>
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{streamer.record}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Footer info */}
        <div className="mt-10 text-center opacity-50 mb-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Actualizado: Cada Lunes</p>
        </div>

      </div>
    </div>
  );
};

export default TopStreamers;
