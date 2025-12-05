
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Smartphone, Gift, Radio, PenTool, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';

// --- COMPONENTS ---

interface MockupProps {
  title: string;
  desc: string;
  img: string;
  color?: string;
  index: number;
  total: number;
  textColor?: string;
}

const IphoneMockup: React.FC<MockupProps> = ({ title, desc, img, color = "border-gray-800", index, total, textColor = "text-brand-black" }) => (
  <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 py-4">
      
      {/* PHONE FRAME - CENTERED */}
      <div className={`relative w-[260px] aspect-[9/19.5] bg-black rounded-[3rem] border-[8px] ${color} shadow-2xl overflow-hidden ring-1 ring-black/5 z-10 flex-shrink-0`}>
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 flex justify-center items-center">
              <div className="w-12 h-3 bg-[#101010]/50 rounded-full"></div>
          </div>
          
          {/* Screen Content */}
          <img src={img} alt="Screen" className="w-full h-full object-cover" />
          
          {/* Glass Reflection & Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20"></div>
      </div>

      {/* INFO CARD */}
      <div className="w-full max-w-xs bg-white dark:bg-[#151515] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl flex flex-col relative overflow-hidden text-left">
          <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                      Paso {index + 1} / {total}
                  </span>
              </div>
              
              <h3 className="text-xl font-black text-brand-black dark:text-white uppercase leading-none mb-2 tracking-tight">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{desc}</p>
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

    const prev = () => {
        if (currentIndex > 0) setCurrentIndex(idx => idx - 1);
    };

    const next = () => {
        if (currentIndex < items.length - 1) setCurrentIndex(idx => idx + 1);
    };

    const arrowClass = controlColor === 'white' 
        ? "bg-white/20 hover:bg-white/30 text-white border-white/10" 
        : "bg-black/10 hover:bg-black/20 text-black border-black/10";

    const dotActive = controlColor === 'white' ? 'bg-white' : 'bg-black';
    const dotInactive = controlColor === 'white' ? 'bg-white/30' : 'bg-black/20';

    return (
        <div className="relative w-full overflow-hidden">
            
            {/* TRACK */}
            <div 
                className="flex transition-transform duration-500 ease-out will-change-transform"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {items.map((item, idx) => (
                    <div key={idx} className="w-full flex-shrink-0 flex justify-center px-2">
                        {renderItem(item, idx)}
                    </div>
                ))}
            </div>

            {/* CONTROLS */}
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-0 md:px-4 z-30">
                <div className="pointer-events-auto">
                    <button 
                        onClick={prev}
                        disabled={currentIndex === 0}
                        className={`w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center transition-all ${currentIndex === 0 ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} ${arrowClass}`}
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <div className="pointer-events-auto">
                    <button 
                        onClick={next}
                        disabled={currentIndex === items.length - 1}
                        className={`w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center transition-all ${currentIndex === items.length - 1 ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} ${arrowClass}`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* DOTS */}
            <div className="flex justify-center space-x-1.5 mt-4 pb-2">
                {items.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? `w-6 ${dotActive}` : `w-1.5 ${dotInactive}`}`}
                    />
                ))}
            </div>
        </div>
    );
};

// --- MODULE CARD CONTAINER ---
const ModuleCard: React.FC<{ title: string; bg: string; text: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, bg, text, icon, children }) => (
  <div className={`w-full ${bg} rounded-[2.5rem] border-[5px] border-white shadow-xl overflow-hidden mb-12 relative transform transition-transform duration-500`}>
      <div className="p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6">
              {icon && <div className={`p-2 rounded-xl bg-white/20 backdrop-blur-md`}>{icon}</div>}
              <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${text} text-left leading-none`}>{title}</h2>
          </div>
          {children}
      </div>
  </div>
);

const AppTour: React.FC = () => {
  const navigate = useNavigate();

  // --- MOCK DATA ---
  const functionsData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Función ${i + 1}`,
    desc: "Domina esta característica para destacar en tus transmisiones.",
    image: i === 0 
      ? 'https://i.postimg.cc/PfwdzYmw/IMG-20251204-200504.jpg' 
      : `https://picsum.photos/400/800?random=func${i}`
  }));

  const broadcastData = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    title: `Modo Live ${String.fromCharCode(65 + i)}`,
    desc: "Formato optimizado para interacción directa. Ideal para PKs.",
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
    desc: "Panel de control avanzado para moderar comentarios.",
    image: `https://picsum.photos/400/800?random=tool${i}`
  }));

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
                Explora los módulos a continuación para conocer cada detalle de la aplicación.
            </p>
        </div>

        <div className="px-4 md:px-6">
            
            {/* CARD 1: FUNCIONES (GRIS) */}
            <ModuleCard 
                title="Funciones Clave" 
                bg="bg-gray-200" 
                text="text-brand-black" 
                icon={<Smartphone size={24} className="text-brand-black" strokeWidth={2.5} />}
            >
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
            </ModuleCard>

            {/* CARD 2: MODOS DE TRANSMISIÓN (NARANJA) */}
            <ModuleCard 
                title="Modos de Transmisión" 
                bg="bg-orange-500" 
                text="text-white"
                icon={<Radio size={24} className="text-white" strokeWidth={2.5} />}
            >
                <SingleSlideCarousel 
                    items={broadcastData} 
                    controlColor="white"
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
            </ModuleCard>

            {/* CARD 3: REGALOS (NEGRO) */}
            <ModuleCard 
                title="Catálogo de Regalos" 
                bg="bg-black" 
                text="text-white"
                icon={<Gift size={24} className="text-white" strokeWidth={2.5} />}
            >
                <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                    {giftsData.map((gift) => (
                        <div key={gift.id} className="bg-[#151515] p-3 rounded-2xl border border-white/10 flex items-center gap-4 group active:scale-[0.99] transition-transform">
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Gift size={20} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-xs font-black text-white uppercase truncate">{gift.name}</h4>
                                    <div className="flex items-center space-x-1 bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white">
                                        <Star size={8} fill="currentColor" />
                                        <span>{gift.value}</span>
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-400 truncate">{gift.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ModuleCard>

            {/* CARD 4: HERRAMIENTAS (MORADO) */}
            <ModuleCard 
                title="Herramientas del Emisor" 
                bg="bg-brand-purple" 
                text="text-white"
                icon={<PenTool size={24} className="text-white" strokeWidth={2.5} />}
            >
                <SingleSlideCarousel 
                    items={toolsData} 
                    controlColor="white"
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
            </ModuleCard>

        </div>

        {/* Footer */}
        <div className="text-center pb-8 pt-4 border-t border-gray-100 dark:border-white/5 mx-6">
             <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                 StreamAgency Academy • 2025
             </p>
        </div>

      </div>
    </div>
  );
};

export default AppTour;
