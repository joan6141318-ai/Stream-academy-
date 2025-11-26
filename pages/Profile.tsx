import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Shield, DollarSign, BarChart2, Zap, Star, Lock, Smartphone, BellRing, Trophy, TrendingUp, Video, ShieldCheck, HelpCircle, Gamepad2 } from 'lucide-react';
import { Header } from '../components/Header';
import { TRAINING_MODULES } from '../constants';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Usamos el usuario real del contexto
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null); 
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentPadding, setContentPadding] = useState(0); 

  // Datos para el Carrusel de Banners
  const BANNERS = [
    {
      id: 5,
      tag: "GAMING",
      tagColor: "bg-green-400 text-black",
      title: "JUEGA DIVIÉRTETE Y APRENDE",
      subtitle: "Juega y diviértete mientras mejoras tus habilidades.",
      gradient: "from-indigo-600 via-purple-600 to-fuchsia-600",
      image: "https://picsum.photos/1080/430?random=banner5",
      icon: Gamepad2,
      shadow: "shadow-purple-500/20"
    },
    {
      id: 1,
      tag: "NUEVO",
      tagColor: "bg-white text-brand-black",
      title: "TORNEO PK INTER-AGENCIAS",
      subtitle: "Participa este fin de semana y gana bonos dobles.",
      gradient: "from-pink-600 via-purple-600 to-indigo-600",
      image: "https://picsum.photos/1080/430?random=banner1",
      icon: BellRing,
      shadow: "shadow-pink-500/20"
    },
    {
      id: 2,
      tag: "RECOMPENSA",
      tagColor: "bg-yellow-400 text-black",
      title: "BONO CRECIENTE ACTIVADO",
      subtitle: "Completa 40 horas y recibe +$50 USD extra.",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      image: "https://picsum.photos/1080/430?random=banner2",
      icon: TrendingUp,
      shadow: "shadow-emerald-500/20"
    },
    {
      id: 3,
      tag: "MASTERCLASS",
      tagColor: "bg-brand-black text-white",
      title: "TALLER DE ILUMINACIÓN",
      subtitle: "Mejora la calidad de tu stream hoy mismo.",
      gradient: "from-orange-500 via-red-500 to-pink-600",
      image: "https://picsum.photos/1080/430?random=banner3",
      icon: Video,
      shadow: "shadow-orange-500/20"
    },
    {
      id: 4,
      tag: "RANKING",
      tagColor: "bg-blue-500 text-white",
      title: "TOP 10 EMISORES DEL MES",
      subtitle: "Consulta la tabla de posiciones actualizada.",
      gradient: "from-blue-600 via-indigo-600 to-violet-600",
      image: "https://picsum.photos/1080/430?random=banner4",
      icon: Trophy,
      shadow: "shadow-blue-500/20"
    }
  ];

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
  }, []);

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

  // Safety check: If user is null (should be handled by ProtectedRoute, but double check)
  if (!user) return null;

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
      setActiveIndex(index);
    }
  };

  const handleBannerClick = (id: number) => {
    if (id === 5) {
      navigate('/tools/gamer');
    }
  };

  const getModuleStyle = (id: string) => {
    switch (id) {
      case 'bigo-live': return { icon: PlayCircle, bg: 'bg-blue-600', shadow: 'shadow-blue-600/40' };
      case 'pagos': return { icon: DollarSign, bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' };
      case 'bloqueos': return { icon: Shield, bg: 'bg-rose-600', shadow: 'shadow-rose-600/40' };
      case 'pk': return { icon: Zap, bg: 'bg-orange-500', shadow: 'shadow-orange-500/40' };
      case 'bonos': return { icon: Star, bg: 'bg-amber-500', shadow: 'shadow-amber-500/40' };
      case 'seguridad': return { icon: Lock, bg: 'bg-slate-800', shadow: 'shadow-slate-800/40' };
      case 'funciones': return { icon: Smartphone, bg: 'bg-indigo-600', shadow: 'shadow-indigo-600/40' };
      case 'live-data': return { icon: BarChart2, bg: 'bg-purple-600', shadow: 'shadow-purple-600/40' };
      default: return { icon: PlayCircle, bg: 'bg-gray-800', shadow: 'shadow-gray-800/40' };
    }
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
              <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Bienvenido de nuevo,</p>
              <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight">
                  {user.name}
              </h1>
          </div>

          {/* Carousel */}
          <div className="relative mt-4 mb-6 px-4">
              <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="overflow-x-auto scrollbar-hide flex gap-0 snap-x snap-mandatory rounded-sm shadow-xl"
              >
                  {BANNERS.map((banner) => {
                    const Icon = banner.icon;
                    return (
                      <div 
                        key={banner.id}
                        onClick={() => handleBannerClick(banner.id)}
                        className={`relative flex-shrink-0 w-full overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform duration-200 snap-center ${banner.shadow}`} 
                        style={{ aspectRatio: '1080/430' }}
                      >
                          <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`}></div>
                          <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
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
                  {BANNERS.map((_, index) => (
                      <div key={index} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${activeIndex === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
                  ))}
              </div>
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
                <h3 className="text-lg font-black uppercase tracking-wide text-brand-black dark:text-white ml-2 leading-none">Módulos de Capacitación</h3>
                <p className="text-xs text-gray-400 font-bold ml-2 mt-1">Elige el módulo relacionado con tu duda</p>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {TRAINING_MODULES.map((module) => {
                  const style = getModuleStyle(module.id);
                  const Icon = style.icon;
                  return (
                    <button 
                        key={module.id}
                        onClick={() => navigate(`/training/${module.id}`)}
                        className={`relative flex flex-col justify-end p-4 h-32 w-full text-left ${style.bg} rounded-sm active:scale-[0.98] transition-transform duration-200 shadow-lg ${style.shadow} overflow-hidden`}
                    >
                        <div className="relative z-10">
                          <span className="text-sm font-black uppercase leading-tight block text-white tracking-wide">{module.title}</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-20 text-white rotate-[-10deg]">
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