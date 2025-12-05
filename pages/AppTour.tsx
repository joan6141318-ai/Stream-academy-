
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Smartphone, Gift, Radio, PenTool, Info, ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';

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
  <div className="w-full flex-shrink-0 flex flex-col items-center justify-center px-4 py-4 transition-opacity duration-300">
      
      {/* PHONE FRAME - CENTERED */}
      <div className={`relative w-[280px] xs:w-[300px] aspect-[9/19] bg-black rounded-[3rem] border-[8px] ${color} shadow-2xl overflow-hidden ring-1 ring-white/20 z-10`}>
          {/* Dynamic Island */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-7 bg-black rounded-b-2xl z-20 flex justify-center items-center">
              <div className="w-14 h-4 bg-[#1a1a1a] rounded-full"></div>
          </div>
          
          {/* Screen Content */}
          <img src={img} alt="Screen" className="w-full h-full object-cover opacity-90" />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10 pointer-events-none"></div>

          {/* Label Bottom Screen */}
          <div className="absolute bottom-8 left-0 right-0 z-20 text-center px-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1 block">
                  Vista {index + 1} / {total}
              </span>
          </div>
      </div>

      {/* INFO CARD - BELOW PHONE */}
      <div className="w-full max-w-[320px] bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xl flex flex-col relative overflow-hidden group mt-8 z-20">
          <div className="relative z-10">
              <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center mb-3 text-brand-purple">
                  <Info size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-brand-black dark:text-white uppercase leading-none mb-3">{title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed text-justify">{desc}</p>
          </div>
          {/* Decor */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 rounded-bl-[5rem] -mr-6 -mt-6"></div>
      </div>
  </div>
);

const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center justify-center space-x-3 mb-8 px-6 pt-12 border-t border-gray-100 dark:border-white/5">
        <div className="bg-brand-black dark:bg-white text-white dark:text-black p-2.5 rounded-xl shadow-md">
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-none">
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
            
            {/* TRACK */}
            <div 
                className="flex transition-transform duration-500 ease-out will-change-transform"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {items.map((item, idx) => (
                    <div key={idx} className="w-full flex-shrink-0">
                        {renderItem(item, idx)}
                    </div>
                ))}
            </div>

            {/* CONTROLS OVERLAY */}
            <div className="absolute top-1/3 left-0 right-0 flex justify-between px-2 pointer-events-none z-30">
                {/* PREV BUTTON */}
                <div className="pointer-events-auto">
                    {currentIndex > 0 && (
                        <button 
                            onClick={prev}
                            className="w-12 h-12 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-brand-black dark:text-white hover:scale-110 transition-transform"
                        >
                            <ChevronLeft size={24} strokeWidth={3} />
                        </button>
                    )}
                </div>

                {/* NEXT BUTTON */}
                <div className="pointer-events-auto">
                    {currentIndex < items.length - 1 && (
                        <button 
                            onClick={next}
                            className="w-12 h-12 rounded-full bg-brand-black dark:bg-white shadow-xl shadow-black/20 flex items-center justify-center text-white dark:text-black hover:scale-110 transition-transform border border-transparent"
                        >
                            <ChevronRight size={24} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>

            {/* DOTS INDICATOR */}
            <div className="flex justify-center space-x-2 mt-4">
                {items.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-brand-purple' : 'w-2 bg-gray-300 dark:bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const AppTour: React.FC = () => {
  const navigate = useNavigate();

  // --- MOCK DATA ---
  const functionsData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Función Clave ${i + 1}`,
    desc: "Descubre cómo esta funcionalidad mejora tu interacción y alcance en la plataforma. Utiliza esta herramienta para maximizar tus resultados.",
    image: `https://picsum.photos/400/800?random=func${i}`
  }));

  const broadcastData = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    title: `Modo de Live ${String.fromCharCode(65 + i)}`,
    desc: "Este formato de transmisión es ideal para conectar con audiencias específicas y generar mayor retención de usuarios.",
    image: `https://picsum.photos/400/800?random=broad${i}`
  }));

  const giftsData = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    name: `Regalo Nivel ${i + 1}`,
    value: `${(i + 1) * 500}`,
    desc: "Animación en pantalla completa con efectos de sonido."
  }));

  const toolsData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Herramienta Pro ${i + 1}`,
    desc: "Utilidad avanzada para moderación y gestión de chat en tiempo real. Mantén tu sala segura y divertida.",
    image: `https://picsum.photos/400/800?random=tool${i}`
  }));

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
      <Header title="Guía Visual" showBack onBack={() => navigate('/welcome')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
        
        {/* Intro */}
        <div className="px-6 mt-6 mb-4 text-center">
            <h1 className="text-4xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-[0.9] mb-3">
                GUÍA<br/>VISUAL
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                Navega paso a paso por las características de la aplicación. Usa las flechas para avanzar entre las pantallas.
            </p>
        </div>

        {/* SECTION 1: FUNCIONES */}
        <SectionTitle title="Funciones Principales" icon={Smartphone} />
        <SingleSlideCarousel 
            items={functionsData} 
            renderItem={(item, idx) => (
                <IphoneMockup 
                    title={item.title} 
                    desc={item.desc} 
                    img={item.image} 
                    color="border-[#1a1a1a] dark:border-[#2a2a2a]"
                    index={idx}
                    total={functionsData.length}
                />
            )}
        />

        {/* SECTION 2: TIPOS DE TRANSMISIONES */}
        <SectionTitle title="Tipos de Transmisiones" icon={Radio} />
        <SingleSlideCarousel 
            items={broadcastData} 
            renderItem={(item, idx) => (
                <IphoneMockup 
                    title={item.title} 
                    desc={item.desc} 
                    img={item.image} 
                    color="border-brand-purple" 
                    index={idx}
                    total={broadcastData.length}
                />
            )}
        />

        {/* SECTION 3: CATÁLOGO DE REGALOS (LISTADO) */}
        <SectionTitle title="Catálogo de Regalos" icon={Gift} />
        <div className="px-6 space-y-3 mb-10">
            {giftsData.map((gift) => (
                <div key={gift.id} className="bg-white dark:bg-[#121212] p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex group active:scale-[0.99] transition-transform overflow-hidden">
                    {/* Visual Regalo */}
                    <div className="w-20 bg-pink-50 dark:bg-pink-900/10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        <Gift size={24} className="text-pink-500 relative z-10" />
                        <div className="absolute inset-0 bg-pink-500/10 blur-xl"></div>
                    </div>
                    
                    {/* Ficha Informativa Alado */}
                    <div className="flex-1 p-3 flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                            <h4 className="text-xs font-black text-brand-black dark:text-white uppercase leading-none mb-1 truncate">{gift.name}</h4>
                            <p className="text-[9px] text-gray-400 font-medium truncate">{gift.desc}</p>
                        </div>
                        
                        {/* Ficha de Valor */}
                        <div className="flex flex-col items-end border-l border-gray-100 dark:border-white/10 pl-3">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Valor</span>
                            <div className="flex items-center space-x-1">
                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-black text-brand-black dark:text-white">{gift.value}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* SECTION 4: HERRAMIENTAS DEL EMISOR */}
        <SectionTitle title="Herramientas de Emisor" icon={PenTool} />
        <SingleSlideCarousel 
            items={toolsData} 
            renderItem={(item, idx) => (
                <IphoneMockup 
                    title={item.title} 
                    desc={item.desc} 
                    img={item.image} 
                    color="border-orange-500" 
                    index={idx}
                    total={toolsData.length}
                />
            )}
        />

        {/* Footer */}
        <div className="text-center pb-8 pt-10 border-t border-gray-100 dark:border-white/5 mx-6 mt-10">
             <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                 StreamAgency Academy • Guía Interactiva
             </p>
        </div>

      </div>
    </div>
  );
};

export default AppTour;
