
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Smartphone, Gift, Radio, PenTool, ChevronLeft, ChevronRight, Star, ArrowUpRight, CheckCircle2, Info, Clover, Flame, HelpCircle, Users, Bean } from 'lucide-react';
import { useContent } from '../context/ContentContext';

// --- COMPONENTS ---

interface MockupProps {
  title: string;
  desc: string;
  img: string;
  color?: string;
  index: number;
  total: number;
}

const IphoneMockup: React.FC<MockupProps> = ({ title, desc, img, color = "border-gray-800", index, total }) => (
  <div className="w-full flex flex-col items-center justify-center gap-6 py-4 animate-fade-in">
      
      {/* PHONE FRAME - CENTERED */}
      <div className={`relative w-[280px] aspect-[9/19.5] bg-black rounded-[3.5rem] border-[8px] ${color} shadow-2xl overflow-hidden ring-1 ring-black/5 z-10 flex-shrink-0 transition-all duration-500`}>
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20 flex justify-center items-center">
              <div className="w-12 h-3 bg-[#101010]/50 rounded-full"></div>
          </div>
          
          {/* Screen Content */}
          <img src={img} alt="Screen" className="w-full h-full object-cover" />
          
          {/* Glass Reflection & Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20"></div>
      </div>

      {/* INFO CARD */}
      <div className="w-full max-w-xs text-center">
          <h3 className="text-xl font-black text-brand-black dark:text-white uppercase leading-none mb-2 tracking-tight">{title}</h3>
          {/* Update: Normal case for description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed px-4">{desc}</p>
          <div className="mt-4 inline-flex items-center justify-center bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {index + 1} / {total}
              </span>
          </div>
      </div>
  </div>
);

// --- CAROUSEL CONTROLLED COMPONENT ---
interface CarouselProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    controlColor?: 'white' | 'black';
}

const SingleSlideCarousel: React.FC<CarouselProps> = ({ items, renderItem, controlColor = 'black' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // --- SWIPE LOGIC ---
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); 
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            next();
        }
        if (isRightSwipe) {
            prev();
        }
    };

    const prev = () => {
        if (currentIndex > 0) setCurrentIndex(idx => idx - 1);
    };

    const next = () => {
        if (currentIndex < items.length - 1) setCurrentIndex(idx => idx + 1);
    };

    const arrowClass = controlColor === 'white' 
        ? "bg-white/20 hover:bg-white/30 text-white border-white/10" 
        : "bg-black/5 hover:bg-black/10 text-brand-black dark:text-white border-black/5 dark:border-white/10";

    const dotActive = controlColor === 'white' ? 'bg-white' : 'bg-brand-black dark:bg-white';
    const dotInactive = controlColor === 'white' ? 'bg-white/30' : 'bg-gray-300 dark:bg-white/20';

    return (
        <div 
            className="relative w-full overflow-hidden flex flex-col items-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            
            {/* TRACK */}
            <div className="w-full relative min-h-[600px] flex items-center justify-center transition-opacity duration-300">
                 {/* Only render current item to enforce single view */}
                 <div className="w-full">
                     {renderItem(items[currentIndex], currentIndex)}
                 </div>
            </div>

            {/* CONTROLS (Floating on sides) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none flex items-center justify-between px-2 md:px-8 z-30 w-full max-w-md mx-auto">
                <div className="pointer-events-auto">
                    <button 
                        onClick={prev}
                        disabled={currentIndex === 0}
                        className={`w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-90 ${currentIndex === 0 ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} ${arrowClass}`}
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="pointer-events-auto">
                    <button 
                        onClick={next}
                        disabled={currentIndex === items.length - 1}
                        className={`w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-90 ${currentIndex === items.length - 1 ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} ${arrowClass}`}
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={24} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* DOTS */}
            <div className="flex justify-center space-x-2 mt-2 pb-8">
                {items.map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? `w-8 ${dotActive}` : `w-2 ${dotInactive}`}`}
                    />
                ))}
            </div>
        </div>
    );
};

const AppTour: React.FC = () => {
  const navigate = useNavigate();
  const { gifts } = useContent(); // Import Gifts from Context
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const handleBack = () => {
      if (activeModule) {
          setActiveModule(null);
      } else {
          navigate('/welcome');
      }
  };

  // --- MOCK DATA ---
  const functionsData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Función Clave ${i + 1}`,
    desc: "Domina esta característica para destacar en tus transmisiones y aumentar tu audiencia.",
    image: i === 0 
      ? 'https://i.postimg.cc/PfwdzYmw/IMG-20251204-200504.jpg' 
      : `https://picsum.photos/400/800?random=func${i}`
  }));

  const broadcastData = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    title: `Modo Live ${String.fromCharCode(65 + i)}`,
    desc: "Formato optimizado para interacción directa. Ideal para PKs y eventos especiales.",
    image: `https://picsum.photos/400/800?random=broad${i}`
  }));

  // --- DYNAMIC GIFTS ORGANIZATION ---
  // Filter by category property and sort by order property
  const variedadItems = gifts.filter(g => g.category === 'variedad').sort((a, b) => (a.order || 99) - (b.order || 99));
  const luckyItems = gifts.filter(g => g.category === 'lucky').sort((a, b) => (a.order || 99) - (b.order || 99));
  const hotItems = gifts.filter(g => g.category === 'hot').sort((a, b) => (a.order || 99) - (b.order || 99));

  const toolsData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Herramienta ${i + 1}`,
    desc: "Panel de control avanzado para moderar comentarios y gestionar usuarios.",
    image: `https://picsum.photos/400/800?random=tool${i}`
  }));

  // Render Helper for Gift Grid
  const renderGiftGrid = (items: any[]) => (
    <div className="grid grid-cols-3 gap-3 mb-8">
        <style>{`
          @keyframes gift-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-5px) scale(1.08); }
          }
        `}</style>
        {items.map((gift, idx) => (
            <div 
                key={gift.id || idx} 
                className="bg-[#050505] p-2 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center group active:scale-[0.98] transition-all relative overflow-hidden aspect-square shadow-lg"
            >
                {/* Value Tag */}
                <div className="absolute top-1.5 right-1.5 bg-black/60 border border-white/10 px-1.5 py-0.5 rounded backdrop-blur-sm z-10 flex items-center space-x-0.5">
                    <span className="text-[8px] font-black text-white">{gift.value}</span>
                    <Bean size={8} className="text-yellow-400 fill-yellow-400" />
                </div>

                {/* Image */}
                <div className="w-full h-full flex items-center justify-center p-2">
                    {gift.imageUrl ? (
                        <img 
                            src={gift.imageUrl} 
                            alt={gift.name} 
                            className="w-full h-full object-contain drop-shadow-lg"
                            style={{ 
                                animation: `gift-float ${3 + (idx % 3) * 0.7}s ease-in-out infinite` 
                            }} 
                        />
                    ) : (
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                            <Gift size={18} className="text-white/20" />
                        </div>
                    )}
                </div>
            </div>
        ))}
    </div>
  );

  // --- MODULE CONFIG ---
  const modules = [
      {
          id: 'functions',
          title: 'Funciones Clave',
          subtitle: 'Guía de uso',
          icon: Smartphone,
          bg: 'bg-gray-200',
          border: 'border-gray-300', // For Mockup
          text: 'text-brand-black',
          cardStyle: 'bg-gray-200 text-brand-black border-white',
          content: (
            <SingleSlideCarousel 
                items={functionsData} 
                controlColor="black"
                renderItem={(item, idx) => (
                    <IphoneMockup 
                        title={item.title} 
                        desc={item.desc} 
                        img={item.image} 
                        color="border-gray-300"
                        index={idx}
                        total={functionsData.length}
                    />
                )}
            />
          )
      },
      {
          id: 'modes',
          title: 'Modos de Transmisión',
          subtitle: 'Tipos de Live',
          icon: Radio,
          bg: 'bg-orange-500',
          border: 'border-orange-600',
          text: 'text-white',
          cardStyle: 'bg-orange-500 text-white border-white',
          content: (
            <SingleSlideCarousel 
                items={broadcastData} 
                controlColor="black"
                renderItem={(item, idx) => (
                    <IphoneMockup 
                        title={item.title} 
                        desc={item.desc} 
                        img={item.image} 
                        color="border-orange-500"
                        index={idx}
                        total={broadcastData.length}
                    />
                )}
            />
          )
      },
      {
          id: 'gifts',
          title: 'Catálogo de Regalos',
          subtitle: 'Precios y Efectos',
          icon: Gift,
          bg: 'bg-black',
          border: 'border-gray-800',
          text: 'text-white',
          cardStyle: 'bg-black text-white border-white',
          content: (
            <div className="w-full pb-12 px-6 flex flex-col gap-6">
                
                {/* --- SECCIÓN VARIEDAD --- */}
                <div>
                    {/* Info Card */}
                    <div className="bg-[#151515] p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group mb-4">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-white/10 p-2 rounded-xl">
                                    <Info size={20} className="text-white" />
                                </div>
                                <h3 className="text-lg font-black text-white uppercase">Variedad</h3>
                            </div>
                            <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                Existe una múltiple variedad de regalos, desde <span className="text-white font-bold">1 semilla</span> hasta increíbles efectos de <span className="text-white font-bold">40,000 semillas</span>.
                            </p>
                        </div>
                        <Gift className="absolute -bottom-4 -right-4 text-white/5 rotate-[-15deg] group-hover:scale-110 transition-transform duration-500" size={100} strokeWidth={1} />
                    </div>
                    
                    {/* Grid Variedad */}
                    {renderGiftGrid(variedadItems)}
                </div>

                {/* --- SECCIÓN LUCKY --- */}
                <div>
                    {/* Info Card */}
                    <div className="bg-brand-purple p-6 rounded-[2rem] border border-violet-500 relative overflow-hidden group shadow-lg shadow-purple-900/20 mb-4">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <Clover size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase leading-none">Súper Lucky</h3>
                                    <p className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Regalo de la Suerte</p>
                                </div>
                            </div>
                            <p className="text-xs text-purple-100 font-medium leading-relaxed mb-4 text-justify">
                                Identifícalos por la etiqueta <span className="font-black bg-white/20 px-1 rounded text-[10px]">SP</span>. Al ser lanzados pueden multiplicarse x50.
                            </p>
                        </div>
                        <Clover className="absolute -bottom-6 -right-6 text-white/10 rotate-[15deg] group-hover:rotate-0 transition-transform duration-500" size={120} strokeWidth={1.5} />
                    </div>

                    {/* Grid Lucky */}
                    {renderGiftGrid(luckyItems)}
                </div>

                {/* --- SECCIÓN HOT --- */}
                <div>
                    {/* Info Card */}
                    <div className="bg-orange-500 p-6 rounded-[2rem] border border-orange-400 relative overflow-hidden group shadow-lg shadow-orange-900/20 mb-4">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <Flame size={20} className="text-white" fill="currentColor" />
                                </div>
                                <h3 className="text-lg font-black text-white uppercase">Regalos HOT</h3>
                            </div>
                            <p className="text-xs text-orange-50 font-medium leading-relaxed text-justify">
                                Generan alta interacción y elevan la flama de popularidad rápidamente.
                            </p>
                        </div>
                        <Flame className="absolute -bottom-6 -right-6 text-white/10 rotate-[-15deg] group-hover:scale-110 transition-transform duration-500" size={120} strokeWidth={1.5} />
                    </div>

                    {/* Grid Hot (Standard Grid used for consistency) */}
                    {renderGiftGrid(hotItems)}
                </div>

            </div>
          )
      },
      {
          id: 'tools',
          title: 'Herramientas del Emisor',
          subtitle: 'Panel de Control',
          icon: PenTool,
          bg: 'bg-brand-purple',
          border: 'border-violet-600',
          text: 'text-white',
          cardStyle: 'bg-brand-purple text-white border-white',
          content: (
            <SingleSlideCarousel 
                items={toolsData} 
                controlColor="black"
                renderItem={(item, idx) => (
                    <IphoneMockup 
                        title={item.title} 
                        desc={item.desc} 
                        img={item.image} 
                        color="border-brand-purple"
                        index={idx}
                        total={toolsData.length}
                    />
                )}
            />
          )
      }
  ];

  const currentModule = modules.find(m => m.id === activeModule);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black transition-colors duration-300">
      <Header 
        title={activeModule ? currentModule?.title : "Guía Visual"} 
        showBack 
        onBack={handleBack} 
      />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))]">
        
        {/* --- MAIN MENU VIEW --- */}
        {!activeModule && (
            <div className="pb-24 px-6 animate-fade-in">
                {/* Intro */}
                <div className="mt-8 mb-8 text-left">
                    <h1 className="text-4xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-[0.9] mb-3">
                        GUÍA<br/>INTERACTIVA
                    </h1>
                    <p className="text-xs text-gray-500 font-medium max-w-xs leading-relaxed">
                        Selecciona un módulo para explorar sus características en detalle.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {modules.map((m) => {
                        const Icon = m.icon;
                        return (
                            <button 
                                key={m.id}
                                onClick={() => setActiveModule(m.id)}
                                className={`w-full p-8 rounded-[2.5rem] border-[5px] shadow-xl active:scale-[0.98] transition-transform duration-300 relative overflow-hidden group text-left h-48 flex flex-col justify-between ${m.cardStyle}`}
                            >
                                <div className="flex justify-between items-start w-full relative z-10">
                                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                                        <Icon size={24} className="text-current" />
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        <ArrowUpRight size={20} className="text-current" />
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black uppercase leading-none mb-1 tracking-tight">{m.title}</h3>
                                    {/* Update: Normal case instead of uppercase for description */}
                                    <p className="text-[10px] font-bold tracking-widest opacity-80">{m.subtitle}</p>
                                </div>
                                
                                {/* Decor Icon - Standardized */}
                                <Icon className="absolute -bottom-4 -right-4 opacity-10 rotate-[-15deg] group-hover:scale-110 group-hover:rotate-0 transition-all duration-500" size={140} strokeWidth={1.5} />
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center py-10">
                    <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                        StreamAgency Academy • 2025
                    </p>
                </div>
            </div>
        )}

        {/* --- DETAIL VIEW --- */}
        {activeModule && currentModule && (
            <div className="w-full h-full flex flex-col animate-slide-up">
                {/* Module Content */}
                <div className="flex-1 relative">
                    {/* Background decoration */}
                    <div className={`absolute top-0 inset-x-0 h-64 opacity-5 ${currentModule.bg.replace('bg-', 'bg-gradient-to-b from-')} to-transparent pointer-events-none`}></div>
                    
                    <div className="relative z-10 pt-4">
                        {currentModule.content}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AppTour;
