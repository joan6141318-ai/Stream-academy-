
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Smartphone, Gift, Radio, PenTool, ChevronLeft, ChevronRight, Star, ArrowUpRight } from 'lucide-react';

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

  const giftsData = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    name: `Regalo Nivel ${i + 1}`,
    value: `${(i + 1) * 500}`,
    desc: "Efecto especial en pantalla completa"
  }));

  const toolsData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Herramienta ${i + 1}`,
    desc: "Panel de control avanzado para moderar comentarios y gestionar usuarios.",
    image: `https://picsum.photos/400/800?random=tool${i}`
  }));

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
            <div className="px-4 pb-12">
                <div className="grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto scrollbar-hide pb-20">
                    {giftsData.map((gift) => (
                        <div key={gift.id} className="bg-white dark:bg-[#151515] p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center gap-4 group active:scale-[0.99] transition-transform shadow-sm">
                            <div className="w-12 h-12 bg-black text-white dark:bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Gift size={20} />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-black text-brand-black dark:text-white uppercase truncate">{gift.name}</h4>
                                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-brand-black dark:text-white">
                                        <Star size={8} fill="currentColor" />
                                        <span>{gift.value}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 truncate">{gift.desc}</p>
                            </div>
                        </div>
                    ))}
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
