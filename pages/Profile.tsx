

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Shield, DollarSign, BarChart2, Zap, Star, Lock, Smartphone, BellRing, Trophy, TrendingUp, Video, ShieldCheck, HelpCircle, Gamepad2 } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import * as LucideIcons from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { banners, modules, homeConfig, loading } = useContent();
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null); 
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentPadding, setContentPadding] = useState(0); 

  // Mapa de iconos estáticos para Banners (si se necesita)
  // Nota: Para banners dinámicos, idealmente guardaríamos el nombre del icono, pero por ahora usaremos lógica fallback
  const getBannerIcon = (tag: string) => {
      if (tag.includes('GAMING')) return Gamepad2;
      if (tag.includes('NUEVO')) return BellRing;
      if (tag.includes('RECOMPENSA')) return TrendingUp;
      if (tag.includes('MASTERCLASS')) return Video;
      if (tag.includes('RANKING')) return Trophy;
      return Star;
  };

  // Measure Hero Height to push content down
  useEffect(() => {
    const updatePadding = () => {
      if (heroRef.current) {
        setContentPadding(heroRef.current.offsetHeight);
      }
    };

    updatePadding();
    window.addEventListener('resize', updatePadding);
    setTimeout(updatePadding, 100);

    return () => window.removeEventListener('resize', updatePadding);
  }, [banners]); // Recalcular si cambian los banners

  // Auto-play Effect
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
    }, 4000); 

    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

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

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300 relative">
      <Header title="Inicio" />
      
      {/* === LAYER 1: FIXED HERO SECTION (Welcome + Carousel) === */}
      <div 
        ref={heroRef}
        className="absolute top-0 left-0 w-full z-30 bg-brand-gray dark:bg-black pt-[calc(3.5rem+env(safe-area-inset-top))] transition-colors duration-300"
      >
          {/* Welcome Text */}
          <div className="px-6 pt-6 pb-2">
              <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                  {homeConfig?.welcomeText || "Bienvenido de nuevo,"}
              </p>
              <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight">
                      {user.name}
                  </h1>
                  {user.isAdmin && (
                    <div className="bg-brand-purple text-white px-2 py-0.5 rounded-full flex items-center shadow-md animate-fade-in">
                        <Shield size={10} className="mr-1" fill="currentColor" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Admin</span>
                    </div>
                  )}
              </div>
          </div>

          {/* Carousel */}
          <div className="relative mt-4 mb-6 px-4">
              {loading ? (
                  <div className="w-full aspect-[1080/430] bg-gray-200 dark:bg-white/10 rounded-sm animate-pulse"></div>
              ) : (
                <>
                  <div 
                      ref={scrollRef}
                      onScroll={handleScroll}
                      className="overflow-x-auto scrollbar-hide flex gap-0 snap-x snap-mandatory rounded-sm shadow-xl"
                  >
                      {banners.map((banner) => {
                        const Icon = getBannerIcon(banner.tag);
                        return (
                          <div 
                            key={banner.id}
                            onClick={() => handleBannerClick(banner.link)}
                            className={`relative flex-shrink-0 w-full overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform duration-200 snap-center ${banner.shadow}`} 
                            style={{ aspectRatio: '1080/430' }}
                          >
                              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`}></div>
                              {/* Aplicamos la posición de la imagen aquí (object-top, object-center, etc) */}
                              <img 
                                src={banner.image} 
                                alt={banner.title} 
                                className={`absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay ${banner.imagePosition || 'object-center'}`} 
                              />
                              <div className="absolute inset-0 p-5 flex flex-col justify-center items-start z-10">
                                  <div className="flex items-center space-x-2 mb-2">
                                      <span className={`${banner.tagColor} text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-sm shadow-sm`}>{banner.tag}</span>
                                  </div>
                                  <h2 className="text-2xl font-black text-white uppercase leading-none mb-1 drop-shadow-md pr-10">{banner.title}</h2>
                                  <p className="text-white/90 text-xs font-bold mt-1 max-w-[85%] leading-tight">{banner.subtitle}</p>
                                  <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 rotate-12" size={80} strokeWidth={1} />
                              </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2 z-20">
                      {banners.map((_, index) => (
                          <div key={index} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${activeIndex === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
                      ))}
                  </div>
                </>
              )}
          </div>
      </div>

      {/* === LAYER 2: SCROLLABLE CONTENT (Modules + Utils) === */}
      <div 
        className="flex-1 overflow-y-auto scrollbar-hide pb-24"
        style={{ paddingTop: contentPadding > 0 ? contentPadding + 20 : '320px' }}
      >
        
        {/* Modules Grid */}
        <div className="mx-4 mb-5">
            <div className="mb-4 pl-1 border-l-4 border-brand-purple ml-1">
                <h3 className="text-lg font-black uppercase tracking-wide text-brand-black dark:text-white ml-2 leading-none">
                    {homeConfig?.modulesTitle || "Módulos de Capacitación"}
                </h3>
                <p className="text-xs text-gray-400 font-bold ml-2 mt-1">
                    {homeConfig?.modulesSubtitle || "Elige el módulo relacionado con tu duda"}
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {loading ? (
                  [1,2,3,4].map(i => <div key={i} className="h-32 w-full bg-gray-200 dark:bg-white/10 rounded-sm animate-pulse"></div>)
              ) : modules.map((module) => {
                  const style = module.style || { bg: 'bg-gray-800', shadow: 'shadow-gray-800/40', iconName: 'PlayCircle', cardOpacity: 1 };
                  const Icon = getIconComponent(style.iconName);
                  
                  return (
                    <button 
                        key={module.id}
                        onClick={() => navigate(`/training/${module.id}`)}
                        className={`relative flex flex-col justify-end p-4 h-32 w-full text-left rounded-sm active:scale-[0.98] transition-transform duration-200 shadow-lg ${style.shadow} overflow-hidden group`}
                    >
                        {/* CAPA 0: IMAGEN DE FONDO (Siempre atrás) */}
                        {module.imageUrl && (
                            <img 
                                src={module.imageUrl} 
                                alt="" 
                                className={`absolute inset-0 w-full h-full object-cover z-0 ${style.imagePosition || 'object-center'}`} 
                            />
                        )}

                        {/* CAPA 1: COLOR DE FONDO (Overlay con opacidad variable) */}
                        <div 
                            className={`absolute inset-0 z-10 ${style.bg} transition-opacity duration-300`}
                            style={{ opacity: style.cardOpacity !== undefined ? style.cardOpacity : 1 }}
                        ></div>
                        
                        {/* CAPA 2: CONTENIDO (Siempre visible 100%) */}
                        <div className="relative z-20">
                          <span className="text-sm font-black uppercase leading-tight block text-white tracking-wide drop-shadow-md">{module.title}</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-20 text-white rotate-[-10deg] z-20 group-hover:scale-110 transition-transform">
                           <Icon size={80} strokeWidth={1.5} />
                        </div>
                    </button>
                  );
              })}
            </div>
        </div>

        {/* Utility Cards */}
        <div className="mx-4 mb-8">
            <div className="grid grid-cols-2 gap-5">
              <button 
                onClick={() => navigate('/training/seguridad')}
                className="relative flex flex-col justify-end p-4 h-32 bg-red-600 rounded-sm shadow-lg shadow-red-600/30 overflow-hidden active:scale-[0.98] transition-transform duration-200"
              >
                  <span className="text-sm font-black uppercase leading-tight block text-white tracking-wide relative z-10">Seguridad</span>
                  <ShieldCheck className="absolute -right-3 -bottom-3 text-white/20 rotate-[-15deg]" size={80} strokeWidth={1.5} />
              </button>

              <button 
                  onClick={() => alert("Abriendo preguntas frecuentes...")}
                  className="relative flex flex-col justify-end p-4 h-32 bg-cyan-600 rounded-sm shadow-lg shadow-cyan-600/30 overflow-hidden active:scale-[0.98] transition-transform duration-200"
              >
                  <span className="text-sm font-black uppercase leading-tight block text-white tracking-wide relative z-10">Preguntas Frecuentes</span>
                  <HelpCircle className="absolute -right-3 -bottom-3 text-white/20 rotate-[15deg]" size={80} strokeWidth={1.5} />
              </button>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;