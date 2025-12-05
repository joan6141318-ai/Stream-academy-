
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Smartphone, Gift, Radio, PenTool, Info, ChevronLeft, ChevronRight, Star, ArrowDown } from 'lucide-react';

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
  <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 px-4 py-8 min-h-[600px]">
      
      {/* PHONE FRAME - CENTERED */}
      <div className={`relative w-[280px] aspect-[9/19.5] bg-black rounded-[3.5rem] border-[8px] ${color} shadow-2xl overflow-hidden ring-1 ring-black/5 z-10 flex-shrink-0 transition-transform duration-500`}>
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex justify-center items-center">
              <div className="w-16 h-4 bg-[#101010]/50 rounded-full"></div>
          </div>
          
          {/* Screen Content */}
          <img src={img} alt="Screen" className="w-full h-full object-cover" />
          
          {/* Glass Reflection & Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20"></div>
          <div className="absolute inset-0 ring-4 ring-black/10 rounded-[3rem] pointer-events-none z-20"></div>
      </div>

      {/* INFO CARD - Beside on Desktop, Below on Mobile */}
      <div className="w-full max-w-xs bg-white dark:bg-[#151515] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl flex flex-col relative overflow-hidden group text-left md:h-[300px] justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                      Paso {index + 1} / {total}
                  </span>
                  <Info size={16} className="text-gray-300" />
              </div>
              
              <h3 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-none mb-3 tracking-tight">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{desc}</p>
          </div>
      </div>
  </div>
);

const SectionTitle = ({ title, icon: Icon, bgColor = "bg-brand-black" }: { title: string, icon: any, bgColor?: string }) => (
    <div className="flex items-center justify-center space-x-3 mb-4 px-6 pt-12 border-t border-gray-100 dark:border-white/5 first:border-0 first:pt-0">
        <div className={`${bgColor} text-white p-2.5 rounded-xl shadow-md`}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-none">
            {title}
        </h2>
    </div>
);

// --- CAROUSEL CONTROLLED COMPONENT ---
interface CarouselProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
}

const SingleSlideCarousel: React.FC<CarouselProps> = ({ items, renderItem }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prev = () => {
        if (currentIndex > 0) setCurrentIndex(idx => idx - 1);
    };

    const next = () => {
        if (currentIndex < items.length - 1) setCurrentIndex(idx => idx + 1);
    };

    return (
        <div className="relative w-full overflow-hidden pb-4">
            
            {/* TRACK - Moves 100% width at a time */}
            <div 
                className="flex transition-transform duration-500 ease-out will-change-transform"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {items.map((item, idx) => (
                    <div key={idx} className="w-full flex-shrink-0 flex justify-center">
                        {renderItem(item, idx)}
                    </div>
                ))}
            </div>

            {/* CONTROLS - Floating beside content */}
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-2 md:px-8 z-30">
                <div className="pointer-events-auto">
                    <button 
                        onClick={prev}
                        disabled={currentIndex === 0}
                        className={`w-10 h-10 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-lg flex items-center justify-center transition-all ${currentIndex === 0 ? 'opacity-0 scale-50' : 'opacity-100 scale-100 hover:scale-110'}`}
                    >
                        <ChevronLeft size={20} className="text-black dark:text-white" />
                    </button>
                </div>

                <div className="pointer-events-auto">
                    <button 
                        onClick={next}
                        disabled={currentIndex === items.length - 1}
                        className={`w-10 h-10 rounded-full bg-brand-black dark:bg-white shadow-lg flex items-center justify-center transition-all ${currentIndex === items.length - 1 ? 'opacity-0 scale-50' : 'opacity-100 scale-100 hover:scale-110'}`}
                    >
                        <ChevronRight size={20} className="text-white dark:text-black" />
                    </button>
                </div>
            </div>

            {/* DOTS */}
            <div className="flex justify-center space-x-1.5 mt-2">
                {items.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-brand-black dark:bg-white' : 'w-1.5 bg-gray-200 dark:bg-white/10'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const AppTour: React.FC = () => {
  const navigate = useNavigate();
  
  const functionsRef = useRef<HTMLDivElement>(null);
  const broadcastRef = useRef<HTMLDivElement>(null);
  const giftsRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
      if(ref.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  // --- MOCK DATA ---
  const functionsData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Función ${i + 1}`,
    desc: "Domina esta característica para destacar en tus transmisiones. La configuración correcta puede aumentar tu tráfico un 20%.",
    image: i === 0 
      ? 'https://i.postimg.cc/PfwdzYmw/IMG-20251204-200504.jpg' 
      : `https://picsum.photos/400/800?random=func${i}`
  }));

  const broadcastData = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    title: `Modo Live ${String.fromCharCode(65 + i)}`,
    desc: "Formato optimizado para interacción directa. Ideal para PKs y charlas con invitados múltiples.",
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
    desc: "Panel de control avanzado para moderar comentarios y gestionar la música de fondo.",
    image: `https://picsum.photos/400/800?random=tool${i}`
  }));

  const navCards = [
      { title: "Funciones\nClave", icon: Smartphone, bg: "bg-gray-200", text: "text-brand-black", ref: functionsRef },
      { title: "Modos de\nTransmisión", icon: Radio, bg: "bg-orange-500", text: "text-white", ref: broadcastRef },
      { title: "Regalos", icon: Gift, bg: "bg-black", text: "text-white", ref: giftsRef },
      { title: "Herramientas\ndel Emisor", icon: PenTool, bg: "bg-brand-purple", text: "text-white", ref: toolsRef },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black transition-colors duration-300">
      <Header title="Guía Visual" showBack onBack={() => navigate('/welcome')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
        
        {/* Intro */}
        <div className="px-6 mt-8 mb-8 text-left">
            <h1 className="text-4xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-[0.9] mb-3">
                GUÍA<br/>INTERACTIVA
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-xs leading-relaxed">
                Navega por los módulos para conocer cada detalle de la aplicación.
            </p>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-2 gap-4 px-6 mb-12">
            {navCards.map((card, idx) => (
                <button 
                    key={idx}
                    onClick={() => scrollToSection(card.ref)}
                    className={`${card.bg} ${card.text} p-5 rounded-[2rem] flex flex-col justify-between aspect-square shadow-xl active:scale-[0.96] transition-all group relative overflow-hidden border-[5px] border-white`}
                >
                    <div className="relative z-10 w-full flex justify-between items-start">
                         <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <card.icon size={20} strokeWidth={2.5} />
                         </div>
                    </div>
                    <div className="relative z-10 text-left mt-auto">
                        <span className="text-xs font-black uppercase leading-tight whitespace-pre-line">{card.title}</span>
                    </div>
                    {/* Decor Icon */}
                    <card.icon className="absolute -right-4 -bottom-4 opacity-10 rotate-[-15deg] group-hover:scale-110 transition-transform duration-500" size={80} strokeWidth={1.5} />
                </button>
            ))}
        </div>

        {/* SECTION 1: FUNCIONES (GRIS) */}
        <div ref={functionsRef} className="scroll-mt-24">
            <SectionTitle title="Funciones Clave" icon={Smartphone} bgColor="bg-gray-400" />
            <SingleSlideCarousel 
                items={functionsData} 
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
        </div>

        {/* SECTION 2: TIPOS DE TRANSMISIONES (NARANJA) */}
        <div ref={broadcastRef} className="scroll-mt-24">
            <SectionTitle title="Modos de Transmisión" icon={Radio} bgColor="bg-orange-500" />
            <SingleSlideCarousel 
                items={broadcastData} 
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
        </div>

        {/* SECTION 3: CATÁLOGO DE REGALOS (NEGRO) */}
        <div ref={giftsRef} className="scroll-mt-24">
            <SectionTitle title="Catálogo de Regalos" icon={Gift} bgColor="bg-black" />
            <div className="px-6 space-y-3 mb-10 mt-6">
                {giftsData.map((gift) => (
                    <div key={gift.id} className="bg-gray-50 dark:bg-[#151515] p-2 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-4 group active:scale-[0.99] transition-transform">
                        <div className="w-16 h-16 bg-white dark:bg-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Gift size={24} className="text-black dark:text-white" />
                        </div>
                        <div className="flex-1 pr-2">
                            <div className="flex justify-between items-start">
                                <h4 className="text-xs font-black text-brand-black dark:text-white uppercase">{gift.name}</h4>
                                <div className="flex items-center space-x-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-brand-black dark:text-white">
                                    <Star size={8} fill="currentColor" />
                                    <span>{gift.value}</span>
                                </div>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-1 truncate">{gift.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* SECTION 4: HERRAMIENTAS DEL EMISOR (MORADO) */}
        <div ref={toolsRef} className="scroll-mt-24">
            <SectionTitle title="Herramientas Pro" icon={PenTool} bgColor="bg-brand-purple" />
            <SingleSlideCarousel 
                items={toolsData} 
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
        </div>

        {/* Footer */}
        <div className="text-center pb-8 pt-6 border-t border-gray-100 dark:border-white/5 mx-6 mt-8">
             <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                 StreamAgency Academy • 2025
             </p>
        </div>

      </div>
    </div>
  );
};

export default AppTour;
