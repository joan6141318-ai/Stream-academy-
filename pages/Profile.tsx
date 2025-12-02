
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Shield, Zap, Star, BellRing, Trophy, TrendingUp, Video, ShieldCheck, HelpCircle, Gamepad2, FileText, ChevronRight, LayoutGrid, ArrowUpRight, Check, Sparkles, Moon, Sun, Sunset } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import * as LucideIcons from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { banners, modules, homeConfig, loading } = useContent();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [greeting, setGreeting] = useState('');

  // Lógica de Saludo Dinámico
  useEffect(() => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Buenos días');
      else if (hour < 19) setGreeting('Buenas tardes');
      else setGreeting('Buenas noches');
  }, []);

  const getGreetingIcon = () => {
      const hour = new Date().getHours();
      if (hour < 12) return <Sun className="text-amber-500" size={24} />;
      if (hour < 19) return <Sunset className="text-orange-500" size={24} />;
      return <Moon className="text-indigo-400" size={24} />;
  };

  // Mapa de iconos estáticos para Banners
  const getBannerIcon = (tag: string) => {
      if (tag.includes('GAMING')) return Gamepad2;
      if (tag.includes('NUEVO')) return BellRing;
      if (tag.includes('RECOMPENSA')) return TrendingUp;
      if (tag.includes('MASTERCLASS')) return Video;
      if (tag.includes('RANKING')) return Trophy;
      return Star;
  };

  // Auto-play Effect for Banner
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
        
        if (isAtEnd) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          setActiveIndex(0);
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 6000); // Un poco más lento para leer mejor

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
      setActiveIndex(index);
    }
  };

  const handleBannerClick = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };

  // Dynamic Icon Resolver
  const getIconComponent = (iconName: string) => {
      // @ts-ignore
      const Icon = LucideIcons[iconName];
      return Icon || PlayCircle;
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300 relative font-sans">
      
      {/* Header Minimalista (Glassmorphism) */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-safe flex justify-between items-center bg-[#FAFAFA]/80 dark:bg-black/80 backdrop-blur-xl h-20 border-b border-gray-100/50 dark:border-white/5 transition-all">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-brand-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5 dark:shadow-white/10">
                <LayoutGrid size={16} className="text-white dark:text-black" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">StreamAgency</span>
          </div>
          {/* Admin Badge */}
          {user.isAdmin && (
            <div className="flex items-center space-x-1 bg-brand-purple/10 dark:bg-brand-purple/20 px-3 py-1.5 rounded-full border border-brand-purple/20">
                <ShieldCheck size={10} className="text-brand-purple" />
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-purple">Admin</span>
            </div>
          )}
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-28 pb-32 px-6">
          
          {/* === HERO SECTION (Premium Greeting) === */}
          <div className="mb-8 animate-fade-in relative">
              <div className="flex justify-between items-end mb-6">
                  <div className="flex flex-col">
                      <div className="flex items-center space-x-2 mb-1 opacity-60">
                          {getGreetingIcon()}
                          <span className="text-xs font-bold uppercase tracking-widest text-brand-black dark:text-white">{greeting}</span>
                      </div>
                      
                      <h1 className="text-4xl font-black text-brand-black dark:text-white uppercase leading-[0.9] tracking-tighter">
                          {user.name.split(' ')[0]}
                          <span className="text-brand-purple">.</span>
                      </h1>
                  </div>
                  
                  {/* Mini Avatar with Glow */}
                  <div className="relative group cursor-pointer" onClick={() => navigate('/settings')}>
                      <div className="absolute -inset-1 bg-gradient-to-br from-brand-purple to-pink-500 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                      <div className="w-14 h-14 rounded-full p-0.5 bg-white dark:bg-black relative z-10">
                          <img src={user.avatarUrl} alt="Me" className="w-full h-full rounded-full object-cover" />
                      </div>
                  </div>
              </div>

              {/* BANNERS CAROUSEL (Premium Glass Style) */}
              <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/50 group transform transition-all hover:scale-[1.01]">
                  {loading ? (
                      <div className="w-full aspect-[16/9] bg-gray-100 dark:bg-white/5 animate-pulse"></div>
                  ) : (
                    <>
                      <div 
                          ref={scrollRef}
                          onScroll={handleScroll}
                          className="overflow-x-auto scrollbar-hide flex gap-0 snap-x snap-mandatory"
                      >
                          {banners.map((banner) => {
                            const Icon = getBannerIcon(banner.tag);
                            return (
                              <div 
                                key={banner.id}
                                onClick={() => handleBannerClick(banner.link)}
                                className={`relative flex-shrink-0 w-full overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-300 snap-center`} 
                                style={{ aspectRatio: '16/9' }}
                              >
                                  {/* Background Image (Full Color) */}
                                  <img 
                                    src={banner.image} 
                                    alt={banner.title} 
                                    className={`absolute inset-0 w-full h-full object-cover ${banner.imagePosition || 'object-center'} transition-transform duration-700 hover:scale-105`} 
                                  />
                                  
                                  {/* Smart Gradient Overlay (Solo oscurece abajo para leer texto) */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                  
                                  {/* Content Layer */}
                                  <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                                      {/* Top Badge (Glass) */}
                                      <div className="flex justify-between items-start">
                                          <div className={`backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg ${banner.tagColor.includes('bg-white') ? 'bg-white/90 text-black' : 'bg-black/30 text-white'}`}>
                                              <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                  <Icon size={10} strokeWidth={3} /> {banner.tag}
                                              </span>
                                          </div>
                                      </div>
                                      
                                      {/* Bottom Text */}
                                      <div className="space-y-2">
                                          <h2 className="text-2xl font-black text-white uppercase leading-[0.9] drop-shadow-xl max-w-[95%] tracking-tight">
                                              {banner.title}
                                          </h2>
                                          <div className="flex items-center space-x-2">
                                              <div className="h-0.5 w-6 bg-brand-purple rounded-full"></div>
                                              <p className="text-white/90 text-[10px] font-bold line-clamp-1">
                                                  {banner.subtitle}
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                            );
                          })}
                      </div>
                      
                      {/* Dots Indicator */}
                      <div className="absolute bottom-6 right-6 flex space-x-1.5 z-20">
                          {banners.map((_, index) => (
                              <div key={index} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm backdrop-blur-md ${activeIndex === index ? 'w-6 bg-brand-purple' : 'w-1.5 bg-white/50'}`} />
                          ))}
                      </div>
                    </>
                  )}
              </div>
          </div>

          {/* === MODULES GRID (Clean & Interactive) === */}
          <div className="mb-12">
                <div className="flex items-center justify-between mb-6 px-1">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple block mb-1">
                            Librería de Recursos
                        </span>
                        <h3 className="text-xl font-black uppercase tracking-tight text-brand-black dark:text-white leading-none">
                            {homeConfig?.modulesTitle || "Capacitación"}
                        </h3>
                    </div>
                    {/* Decorative Line */}
                    <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 ml-4 rounded-full"></div>
                </div>
            
                <div className="grid grid-cols-2 gap-4">
                  {loading ? (
                      [1,2,3,4].map(i => <div key={i} className="h-44 w-full bg-gray-100 dark:bg-white/5 rounded-[2rem] animate-pulse"></div>)
                  ) : modules.map((module, index) => {
                      const style = module.style || { bg: 'bg-gray-800', shadow: 'shadow-gray-800/40', iconName: 'PlayCircle', cardOpacity: 1 };
                      const Icon = getIconComponent(style.iconName);
                      const isLarge = (index + 1) % 3 === 0;

                      return (
                        <button 
                            key={module.id}
                            onClick={() => navigate(`/training/${module.id}`)}
                            className={`relative flex flex-col justify-between p-6 ${isLarge ? 'col-span-2 aspect-[2.2/1]' : 'aspect-square'} bg-white dark:bg-[#111] rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-white/5 active:scale-[0.96] transition-all duration-300 group overflow-hidden hover:shadow-xl hover:border-brand-purple/20`}
                        >
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            {/* Header: Icon Container (Squircle) */}
                            <div className="flex justify-between items-start w-full relative z-10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gray-50 dark:bg-white/5 group-hover:bg-brand-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black group-hover:shadow-lg group-hover:shadow-brand-purple/20`}>
                                    <Icon size={22} className="text-brand-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={2} />
                                </div>
                                
                                {/* Arrow fades in on hover */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                                    <ArrowUpRight size={20} className="text-brand-purple" />
                                </div>
                            </div>
                            
                            {/* Body: Title */}
                            <div className="relative z-10 mt-auto text-left">
                                <span className={`font-black uppercase leading-[0.9] block text-brand-black dark:text-white tracking-tight mb-1 group-hover:translate-x-1 transition-transform duration-300 ${isLarge ? 'text-2xl' : 'text-sm'}`}>
                                    {module.title}
                                </span>
                                {isLarge && (
                                    <p className="text-[10px] text-gray-400 font-medium line-clamp-1 group-hover:text-brand-purple transition-colors">
                                        {module.description}
                                    </p>
                                )}
                            </div>

                            {/* Decorative Watermark (Subtle) */}
                            <Icon 
                                className={`absolute -bottom-4 -right-4 text-brand-black/[0.03] dark:text-white/[0.03] rotate-[-10deg] group-hover:scale-110 group-hover:rotate-0 transition-all duration-500 pointer-events-none`} 
                                size={isLarge ? 160 : 100} 
                                strokeWidth={1} 
                            />
                        </button>
                      );
                  })}
                </div>
          </div>

          {/* === UTILITY SECTION (Redesigned) === */}
          <div className="mb-10">
              <div className="bg-gradient-to-br from-brand-black to-gray-900 dark:from-[#151515] dark:to-black rounded-[2rem] p-1 relative overflow-hidden shadow-2xl shadow-black/20">
                  <div className="bg-black/20 backdrop-blur-sm rounded-[1.8rem] p-7 flex flex-col items-center text-center relative z-10 border border-white/5">
                      
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/10 animate-pulse">
                          <HelpCircle className="text-white" size={24} />
                      </div>
                      
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">
                          Centro de Ayuda
                      </h3>
                      <p className="text-[11px] text-white/60 font-medium max-w-[200px] mb-6 leading-relaxed">
                          ¿Tienes dudas sobre la plataforma o las reglas? Estamos para ayudarte.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 w-full">
                          <button 
                            onClick={() => navigate('/training/seguridad')}
                            className="bg-white text-brand-black h-12 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-colors shadow-lg active:scale-95"
                          >
                              Normas
                          </button>
                          <button 
                            onClick={() => alert("Próximamente FAQ")}
                            className="bg-white/5 text-white h-12 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors border border-white/10 active:scale-95"
                          >
                              FAQ
                          </button>
                      </div>
                  </div>
                  
                  {/* Background Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
              </div>
          </div>

          {/* === FOOTER LINKS === */}
          <div className="pb-8 flex justify-center">
                <button 
                    onClick={() => setShowPrivacy(true)}
                    className="group flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                    <FileText size={12} className="text-gray-400 group-hover:text-brand-purple transition-colors" />
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-brand-black dark:group-hover:text-white uppercase tracking-widest transition-colors">
                        Legal & Privacidad
                    </span>
                </button>
          </div>

      </div>

      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
};

export default Profile;
