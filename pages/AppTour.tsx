
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Smartphone, Gift, Radio, PenTool, Info, ArrowRight, Star } from 'lucide-react';

interface MockupProps {
  title: string;
  desc: string;
  img: string;
  color?: string;
  index: number;
}

const IphoneMockup: React.FC<MockupProps> = ({ title, desc, img, color = "border-gray-800", index }) => (
  <div className="flex-shrink-0 flex flex-col items-center gap-6 py-4 snap-center w-[85vw] max-w-[400px]">
      {/* PHONE FRAME */}
      <div className={`relative w-full aspect-[9/19.5] max-h-[600px] bg-black rounded-[3rem] border-[8px] ${color} shadow-2xl overflow-hidden flex-shrink-0 ring-1 ring-white/20 transition-transform duration-300`}>
          {/* Dynamic Island */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-7 bg-black rounded-b-2xl z-20 flex justify-center items-center">
              <div className="w-14 h-4 bg-[#1a1a1a] rounded-full"></div>
          </div>
          
          {/* Screen Content */}
          <img src={img} alt="Screen" className="w-full h-full object-cover opacity-90" />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>

          <div className="absolute bottom-6 left-0 right-0 z-20 text-center px-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1 block">Vista {index + 1}</span>
          </div>
      </div>

      {/* INFO CARD (Al lado/Abajo) */}
      <div className="w-full bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg flex flex-col relative overflow-hidden group">
          <div className="relative z-10">
              <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center mb-3 text-brand-purple">
                  <Info size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-brand-black dark:text-white uppercase leading-none mb-2">{title}</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed text-justify">{desc}</p>
          </div>
          {/* Decor */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-purple/5 rounded-bl-[4rem] -mr-4 -mt-4 transition-all group-hover:bg-brand-purple/10"></div>
      </div>
  </div>
);

const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center space-x-3 mb-6 px-6 pt-10 border-t border-gray-100 dark:border-white/5">
        <div className="bg-brand-black dark:bg-white text-white dark:text-black p-2.5 rounded-xl shadow-md">
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-none">
            {title}
        </h2>
    </div>
);

const AppTour: React.FC = () => {
  const navigate = useNavigate();

  // --- MOCK DATA ---
  const functionsData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Función Clave ${i + 1}`,
    desc: "Descubre cómo esta funcionalidad mejora tu interacción y alcance en la plataforma.",
    image: `https://picsum.photos/400/800?random=func${i}`
  }));

  const broadcastData = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    title: `Modo de Live ${String.fromCharCode(65 + i)}`,
    desc: "Este formato de transmisión es ideal para conectar con audiencias específicas.",
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
    desc: "Utilidad avanzada para moderación y gestión de chat en tiempo real.",
    image: `https://picsum.photos/400/800?random=tool${i}`
  }));

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
      <Header title="Guía Visual" showBack onBack={() => navigate('/welcome')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
        
        {/* Intro */}
        <div className="px-6 mt-6 mb-4">
            <h1 className="text-4xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-[0.9] mb-3">
                GUÍA<br/>VISUAL
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-[280px] leading-relaxed text-justify">
                Hemos preparado una serie de guías visuales para que conozcas la aplicación antes de tu primera transmisión. Desliza lateralmente para explorar.
            </p>
        </div>

        {/* SECTION 1: FUNCIONES (8 Mockups) */}
        <SectionTitle title="Funciones Principales" icon={Smartphone} />
        <div className="w-full overflow-x-auto scrollbar-hide pb-8 px-6 flex gap-6 snap-x snap-mandatory">
            {functionsData.map((item, idx) => (
                <IphoneMockup 
                    key={item.id} 
                    title={item.title} 
                    desc={item.desc} 
                    img={item.image} 
                    color="border-[#1a1a1a] dark:border-[#2a2a2a]"
                    index={idx}
                />
            ))}
            <div className="w-1 flex-shrink-0"></div> {/* Spacer for right padding */}
        </div>

        {/* SECTION 2: TIPOS DE TRANSMISIONES (5 Mockups) */}
        <SectionTitle title="Tipos de Transmisiones" icon={Radio} />
        <div className="w-full overflow-x-auto scrollbar-hide pb-8 px-6 flex gap-6 snap-x snap-mandatory">
            {broadcastData.map((item, idx) => (
                <IphoneMockup 
                    key={item.id} 
                    title={item.title} 
                    desc={item.desc} 
                    img={item.image} 
                    color="border-brand-purple" 
                    index={idx}
                />
            ))}
            <div className="w-1 flex-shrink-0"></div>
        </div>

        {/* SECTION 3: TIPOS DE REGALOS (Listado 10 Tarjetas con Ficha) */}
        <SectionTitle title="Catálogo de Regalos" icon={Gift} />
        <div className="px-6 space-y-3 mb-10 pt-4">
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

        {/* SECTION 4: HERRAMIENTAS DEL EMISOR (8 Mockups) */}
        <SectionTitle title="Herramientas de Emisor" icon={PenTool} />
        <div className="w-full overflow-x-auto scrollbar-hide pb-8 px-6 flex gap-6 snap-x snap-mandatory">
            {toolsData.map((item, idx) => (
                <IphoneMockup 
                    key={item.id} 
                    title={item.title} 
                    desc={item.desc} 
                    img={item.image} 
                    color="border-orange-500" 
                    index={idx}
                />
            ))}
            <div className="w-1 flex-shrink-0"></div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8 pt-4 border-t border-gray-100 dark:border-white/5 mx-6">
             <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                 StreamAgency Academy • Guía Interactiva
             </p>
        </div>

      </div>
    </div>
  );
};

export default AppTour;
