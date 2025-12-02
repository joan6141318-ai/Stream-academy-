
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Shield, Zap, Star, BellRing, Trophy, TrendingUp, Video, ShieldCheck, HelpCircle, Gamepad2, FileText, ChevronRight, LayoutGrid } from 'lucide-react';
import { Header } from '../components/Header';
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
    }, 5000); 

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
      {/* Header Minimalista Transparente */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-safe flex justify-between items-center bg-[#FAFAFA]/90 dark:bg-black/90 backdrop-blur-md h-16">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-brand-black dark:bg-white rounded-lg flex items-center justify-center shadow-md">
                <LayoutGrid size={16} className="text-white dark:text-black" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-black dark:text-white">StreamAgency</span>
          </div>
          {/* Admin Badge discreto */}
          {user.isAdmin && (
            <span className="bg-brand-purple/10 text-brand-purple px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-brand-purple/20">
                Admin Mode
            </span>
          )}
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-20 pb-24 px-6">
          
          {/* === HERO SECTION === */}
          <div className="mb-8 animate-fade-in">
              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 pl-1">
                  {homeConfig?.welcomeText || "Bienvenido de nuevo,"}
              </p>
              <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight mb-6 pl-1">
                  {user.name}
              </h1>

              {/* BANNERS CAROUSEL (Rounded & Floating) */}
              <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 dark:shadow-none border border-white dark:border-white/10 group">
                  {loading ? (
                      <div className="w-full aspect-[16/9] bg-gray-200 dark:bg-white/10 animate-pulse"></div>
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
                                  {/* Background Gradient */}
                                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`}></div>
                                  
                                  {/* Background Image (Subtle) */}
                                  <img 
                                    src={banner.image} 
                                    alt={banner.title} 
                                    className={`absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay ${banner.imagePosition || 'object-center'}`} 
                                  />
                                  
                                  {/* Content Overlay */}
                                  <div className="absolute inset-0 p-6 flex flex-col justify-end items-start z-10">
                                      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-3">
                                          <span className="text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                              <Star size={8} fill="currentColor" /> {banner.tag}
                                          </span>
                                      </div>
                                      <h2 className="text-xl font-black text-white uppercase leading-none mb-1 drop-shadow-lg max-w-[90%]">{banner.title}</h2>
                                      <p className="text-white/80 text-[10px] font-bold max-w-[80%] leading-tight">{banner.subtitle}</p>
                                  </div>

                                  {/* Decorative Icon */}
                                  <Icon className="absolute top-4 right-4 text-white/20 rotate-12" size={60} strokeWidth={1} />
                              </div>
                            );
                          })}
                      </div>
                      
                      {/* Dots Indicator */}
                      <div className="absolute bottom-4 right-6 flex space-x-1.5 z-20">
                          {banners.map((_, index) => (
                              <div key={index} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${activeIndex === index ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
                          ))}
                      </div>
                    </>
                  )}
              </div>
          </div>

          {/* === MODULES GRID (BENTO STYLE) === */}
          <div className="mb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-black uppercase tracking-tight text-brand-black dark:text-white leading-none">
                        {homeConfig?.modulesTitle || "Capacitación"}
                    </h3>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 ml-4"></div>
                </div>
            
                <div className="grid grid-cols-2 gap-4">
                  {loading ? (
                      [1,2,3,4].map(i => <div key={i} className="h-40 w-full bg-gray-100 dark:bg-white/5 rounded-[2rem] animate-pulse"></div>)
                  ) : modules.map((module) => {
                      const style = module.style || { bg: 'bg-gray-800', shadow: 'shadow-gray-800/40', iconName: 'PlayCircle', cardOpacity: 1 };
                      const Icon = getIconComponent(style.iconName);
                      
                      // Extraemos el color base para usarlo en el icono (ej: 'bg-blue-600' -> 'text-blue-600')
                      // Esto es un truco visual para mantener la personalización del CMS pero con el diseño blanco
                      const colorClass = style.bg.replace('bg-', 'text-'); 
                      const bgClass = style.bg.replace('bg-', 'bg-');

                      return (
                        <button 
                            key={module.id}
                            onClick={() => navigate(`/training/${module.id}`)}
                            className="relative flex flex-col justify-between p-5 h-44 w-full text-left bg-white dark:bg-[#111] rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-white/5 active:scale-[0.96] transition-all duration-300 group overflow-hidden"
                        >
                            {/* Header: Icon Container */}
                            <div className="flex justify-between items-start w-full relative z-10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${bgClass} bg-opacity-10 dark:bg-opacity-20 group-hover:bg-opacity-20`}>
                                    <Icon size={24} className={`${colorClass} dark:text-white`} strokeWidth={2} />
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={14} className="text-brand-black dark:text-white" />
                                </div>
                            </div>
                            
                            {/* Body: Title */}
                            <div className="relative z-10 mt-auto">
                                <span className="text-sm font-black uppercase leading-tight block text-brand-black dark:text-white tracking-tight mb-1 group-hover:translate-x-1 transition-transform duration-300">
                                    {module.title}
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider line-clamp-1">
                                    Ver Módulo
                                </span>
                            </div>

                            {/* Background Image (If exists, subtle fade) */}
                            {module.imageUrl && (
                                <img 
                                    src={module.imageUrl} 
                                    alt="" 
                                    className="absolute top-0 right-0 w-32 h-32 object-cover opacity-5 dark:opacity-10 rounded-bl-[4rem] pointer-events-none transition-transform duration-500 group-hover:scale-110" 
                                />
                            )}
                        </button>
                      );
                  })}
                </div>
          </div>

          {/* === UTILITY CARDS (Clean Style) === */}
          <div className="mb-10">
              <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Herramientas & Ayuda
                    </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  {/* Seguridad */}
                  <button 
                    onClick={() => navigate('/training/seguridad')}
                    className="bg-white dark:bg-[#111] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-center items-center text-center gap-3 active:scale-[0.96] transition-all group"
                  >
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                          <ShieldCheck className="text-red-500" size={24} strokeWidth={2} />
                      </div>
                      <div>
                          <span className="text-xs font-black text-brand-black dark:text-white uppercase block">Seguridad</span>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Normas</span>
                      </div>
                  </button>

                  {/* FAQ */}
                  <button 
                      onClick={() => alert("Abriendo preguntas frecuentes...")}
                      className="bg-white dark:bg-[#111] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-center items-center text-center gap-3 active:scale-[0.96] transition-all group"
                  >
                      <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                          <HelpCircle className="text-cyan-600 dark:text-cyan-400" size={24} strokeWidth={2} />
                      </div>
                      <div>
                          <span className="text-xs font-black text-brand-black dark:text-white uppercase block">Ayuda</span>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">FAQ</span>
                      </div>
                  </button>
              </div>
          </div>

          {/* === FOOTER LINKS === */}
          <div className="pb-8 flex justify-center">
                <button 
                    onClick={() => setShowPrivacy(true)}
                    className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest hover:text-brand-purple dark:hover:text-white transition-colors flex items-center space-x-1.5 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full"
                >
                    <FileText size={12} />
                    <span>Legal & Privacidad</span>
                </button>
          </div>

      </div>

      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
};

export default Profile;
