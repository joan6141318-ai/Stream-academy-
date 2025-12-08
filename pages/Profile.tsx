import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Shield, Zap, Star, BellRing, Trophy, TrendingUp, Video, ShieldCheck, HelpCircle, Gamepad2, FileText, ChevronRight, LayoutGrid, ArrowUpRight, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import * as LucideIcons from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { Banner } from '../types';

const CARD_VARIANTS = [
    {
      // NARANJA
      bg: 'bg-orange-500',
      border: 'border-orange-400',
      text: 'text-white',
      subText: 'text-white/90', // Increased contrast
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      arrowColor: 'text-white/80',
      decorColor: 'text-white/10'
    },
    {
      // NEGRO
      bg: 'bg-black',
      border: 'border-[#1A1A1A]',
      text: 'text-white',
      subText: 'text-gray-400',
      iconBg: 'bg-white/10',
      iconColor: 'text-white',
      arrowColor: 'text-gray-500',
      decorColor: 'text-white/5'
    },
    {
      // GRIS LIGERO
      bg: 'bg-gray-200',
      border: 'border-white',
      text: 'text-brand-black',
      subText: 'text-gray-600', // Darker for better read on gray
      iconBg: 'bg-white',
      iconColor: 'text-brand-black',
      arrowColor: 'text-gray-400',
      decorColor: 'text-brand-black/5' // Subtle dark decor
    },
    {
      // MORADO
      bg: 'bg-brand-purple',
      border: 'border-violet-500',
      text: 'text-white',
      subText: 'text-purple-100',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      arrowColor: 'text-white/60',
      decorColor: 'text-white/10'
    }
];

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
      // FIX: Verificar existencia del ref antes de acceder
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

  const handleBannerClick = (banner: Banner) => {
    // Lógica inteligente: Si el banner es de Top 10 (por título, tag o link), ir a la página correcta
    const title = banner.title?.toLowerCase() || '';
    const tag = banner.tag?.toLowerCase() || '';
    const link = banner.link || '';
    
    if (title.includes('top 10') || title.includes('ranking') || tag.includes('ranking') || link === '/top-streamers') {
        navigate('/top-streamers');
        return;
    }

    if (banner.link) {
      navigate(banner.link);
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
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300 font-sans relative">
      
      {/* Header Minimalista (Fixed on Top) */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-safe flex justify-between items-center bg-[#FAFAFA]/90 dark:bg-black/90 backdrop-blur-xl h-20 border-b border-gray-100/50 dark:border-white/5 shadow-sm">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-brand-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                <LayoutGrid size={16} className="text-white dark:text-black" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">Streamers Academy</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Admin Badge */}
            {user.isAdmin && (
                <div className="flex items-center space-x-1 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
                    <ShieldCheck size={10} className="text-brand-purple" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-brand-black dark:text-white">Admin</span>
                </div>
            )}
          </div>
      </div>
      
      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-24 pb-32">
          
          {/* === HERO SECTION === */}
          <div className="px-6 mb-10 animate-fade-in">
              <div className="flex flex-col mb-6">
                  <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 pl-1">
                      {homeConfig?.welcomeText || "Espacio de Trabajo"}
                  </p>
                  
                  <div className="flex items-start justify-between">
                      <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter max-w-[80%] text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">
                          Hola!<br/>
                          {user.name.split(' ')[0]}
                      </h1>
                      
                      {/* Mini Avatar */}
                      <div className="w-12 h-12 rounded-full p-0.5 bg-white shadow-lg border border-gray-100 dark:border-white/10 relative">
                          <img src={user.avatarUrl} alt="Me" className="w-full h-full rounded-full object-cover" />
                          <div className="absolute -bottom-1 -right-1 bg-brand-black text-white p-1 rounded-full border-2 border-white">
                              <Check size={8} strokeWidth={4} />
                          </div>
                      </div>
                  </div>
              </div>

              {/* BANNERS CAROUSEL */}
              <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 dark:shadow-none group transform transition-all border-[5px] border-white/20">
                  {loading ? (
                      <div className="w-full aspect-[16/10] bg-gray-100 dark:bg-white/5 animate-pulse"></div>
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
                                onClick={() => handleBannerClick(banner)} // Pass full object
                                className={`relative flex-shrink-0 w-full overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-300 snap-center`} 
                                style={{ aspectRatio: '16/10' }} 
                              >
                                  {/* Background Gradient */}
                                  <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`}></div>
                                  
                                  {/* Background Image */}
                                  <img 
                                    src={banner.image} 
                                    alt={banner.title} 
                                    className={`absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay ${banner.imagePosition || 'object-center'}`} 
                                  />
                                  
                                  {/* Content Overlay */}
                                  <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                      <div className="flex justify-between items-start">
                                          <div className={`backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 ${banner.tagColor || 'bg-white/20'}`}>
                                              <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                  <Star size={10} fill="currentColor" /> {banner.tag}
                                              </span>
                                          </div>
                                          <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                                              <ArrowUpRight size={18} className="text-white" />
                                          </div>
                                      </div>
                                      
                                      <div>
                                          <h2 className="text-2xl font-black text-white uppercase leading-[0.9] mb-2 drop-shadow-lg max-w-[90%] tracking-tight">{banner.title}</h2>
                                          <p className="text-white/90 text-[10px] font-bold max-w-[80%] leading-tight line-clamp-2">{banner.subtitle}</p>
                                      </div>
                                  </div>
                              </div>
                            );
                          })}
                      </div>
                      
                      {/* Dots Indicator */}
                      <div className="absolute bottom-6 right-8 flex space-x-1.5 z-20">
                          {banners.map((_, index) => (
                              <div key={index} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${activeIndex === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
                          ))}
                      </div>
                    </>
                  )}
              </div>
          </div>

          {/* === MODULES GRID === */}
          <div className="px-6 mb-12">
                <div className="mb-6 px-1 text-left">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-brand-purple mb-1">
                        Librería de Recursos
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-brand-black dark:text-white leading-none">
                        {homeConfig?.modulesTitle || "Capacitación"}
                    </h3>
                </div>
            
                <div className="grid grid-cols-2 gap-4">
                  {loading ? (
                      [1,2,3,4].map(i => <div key={i} className="h-48 w-full bg-gray-50 dark:bg-white/5 rounded-[2rem] animate-pulse"></div>)
                  ) : modules.map((module, index) => {
                      const style = module.style || { iconName: 'PlayCircle' };
                      const Icon = getIconComponent(style.iconName);
                      
                      // Sequence: Orange, Black, Gray, Purple
                      const variant = CARD_VARIANTS[index % CARD_VARIANTS.length];

                      // Alternate Large Card logic (Every 3rd item is full width)
                      const isLarge = (index + 1) % 3 === 0;

                      return (
                        <button 
                            key={module.id}
                            onClick={() => navigate(`/training/${module.id}`)}
                            className={`relative flex flex-col justify-between p-6 ${isLarge ? 'col-span-2 aspect-[2/1]' : 'aspect-square'} ${variant.bg} rounded-[2.5rem] shadow-xl border-[5px] ${variant.border} active:scale-[0.96] transition-all duration-300 group overflow-hidden`}
                        >
                            {/* Header: Icon Container */}
                            <div className="flex justify-between items-start w-full relative z-10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${variant.iconBg} backdrop-blur-sm border border-white/5`}>
                                    <Icon size={20} className={`${variant.iconColor}`} strokeWidth={2.5} />
                                </div>
                                <ArrowUpRight size={20} className={`${variant.arrowColor}`} />
                            </div>
                            
                            {/* Body: Title */}
                            <div className="relative z-10 mt-auto text-left">
                                <span className={`font-black uppercase leading-[0.9] block ${variant.text} tracking-tighter mb-1 group-hover:translate-x-1 transition-transform duration-300 ${isLarge ? 'text-2xl' : 'text-sm'}`}>
                                    {module.title}
                                </span>
                                <span className={`text-[9px] ${variant.subText} font-bold tracking-wide line-clamp-1`}>
                                    Explorar Módulo
                                </span>
                            </div>

                            {/* Decorative Big Icon (Watermark) */}
                            <Icon 
                                className={`absolute -bottom-6 -right-6 ${variant.decorColor} rotate-[-15deg] group-hover:scale-110 group-hover:rotate-0 transition-all duration-500 pointer-events-none`} 
                                size={isLarge ? 140 : 100} 
                                strokeWidth={1} 
                            />
                        </button>
                      );
                  })}
                </div>
          </div>

          {/* === UTILITY SECTION === */}
          <div className="px-6 mb-10">
              <div className="bg-brand-black dark:bg-[#111] rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-black/30">
                  <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="bg-white/10 p-3 rounded-full mb-4 backdrop-blur-md border border-white/10">
                          <HelpCircle className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                          ¿Necesitas Ayuda?
                      </h3>
                      <p className="text-xs text-white/60 font-medium max-w-[200px] mb-6">
                          Revisa nuestras normas o consulta las preguntas frecuentes.
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <button 
                            onClick={() => navigate('/training/seguridad')}
                            className="flex-1 bg-white text-brand-black h-12 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                              Normas
                          </button>
                          <button 
                            onClick={() => alert("Próximamente FAQ")}
                            className="flex-1 bg-white/10 text-white h-12 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
                          >
                              FAQ
                          </button>
                      </div>
                  </div>
                  
                  {/* Background Noise/Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-purple/20 to-transparent pointer-events-none"></div>
              </div>
          </div>

          {/* === FOOTER LINKS === */}
          <div className="flex justify-center pb-8">
                <button 
                    onClick={() => setShowPrivacy(true)}
                    className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest hover:text-brand-black dark:hover:text-white transition-colors flex items-center space-x-2"
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