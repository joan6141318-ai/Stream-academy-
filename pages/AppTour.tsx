
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Smartphone, Gift, Radio, PenTool, Info, ArrowRight } from 'lucide-react';

// --- COMPONENTS MOVED OUTSIDE ---

const IphoneMockup = ({ title, desc, img, color = "border-gray-800" }: { title: string, desc: string, img: string, color?: string }) => (
  <div className="flex-shrink-0 flex flex-col md:flex-row items-center gap-4 p-4 snap-center">
      {/* PHONE FRAME */}
      <div className={`relative w-[280px] h-[580px] bg-black rounded-[3rem] border-8 ${color} shadow-2xl overflow-hidden flex-shrink-0 ring-1 ring-white/20`}>
          {/* Dynamic Island */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-20 flex justify-center items-center">
              <div className="w-16 h-4 bg-[#1a1a1a] rounded-full"></div>
          </div>
          
          {/* Screen Content */}
          <img src={img} alt="Screen" className="w-full h-full object-cover opacity-80" />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>

          <div className="absolute bottom-6 left-6 right-6 z-20">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 block">Vista Previa</span>
          </div>
      </div>

      {/* INFO CARD (Al lado en desktop, abajo en mobile si no cabe, pero aquí forzamos row en scroll container) */}
      <div className="w-[240px] bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg flex flex-col justify-between h-[200px] md:h-auto">
          <div>
              <div className="w-10 h-10 bg-brand-purple/10 rounded-full flex items-center justify-center mb-3 text-brand-purple">
                  <Info size={20} />
              </div>
              <h3 className="text-xl font-black text-brand-black dark:text-white uppercase leading-none mb-2">{title}</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
               <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Detalles</span>
               <ArrowRight size={14} className="text-brand-purple" />
          </div>
      </div>
  </div>
);

const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center space-x-3 mb-6 px-6 pt-8">
        <div className="bg-brand-black dark:bg-white text-white dark:text-black p-2.5 rounded-xl shadow-lg">
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
    title: `Función ${i + 1}`,
    desc: "Descripción de la función y su uso principal en la app.",
    image: `https://picsum.photos/300/650?random=func${i}`
  }));

  const broadcastData = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    title: `Transmisión Tipo ${String.fromCharCode(65 + i)}`,
    desc: "Detalles sobre este formato de live y cómo aprovecharlo.",
    image: `https://picsum.photos/300/650?random=broad${i}`
  }));

  const giftsData = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    name: `Regalo Exclusivo ${i + 1}`,
    value: `${(i + 1) * 100} Beans`,
    desc: "Efecto especial en pantalla completa."
  }));

  const toolsData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Herramienta ${i + 1}`,
    desc: "Utilidad para moderación o interacción en tiempo real.",
    image: `https://picsum.photos/300/650?random=tool${i}`
  }));

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
      <Header title="Tour de la App" showBack onBack={() => navigate('/welcome')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
        
        {/* Intro */}
        <div className="px-6 mt-6 mb-2">
            <h1 className="text-4xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-[0.9] mb-3">
                Conoce<br/>Tu Herramienta
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-xs">
                Explora cada rincón de la aplicación con nuestras guías interactivas.
            </p>
        </div>

        {/* SECTION 1: FUNCIONES (8 Mockups) */}
        <SectionTitle title="Funciones Principales" icon={Smartphone} />
        <div className="w-full overflow-x-auto scrollbar-hide pb-8 px-2 flex space-x-4 snap-x snap-mandatory">
            {functionsData.map((item) => (
                <IphoneMockup 
                    key={item.id} 
                    title={item.title} 
                    desc={item.desc} 
                    img={item.image} 
                    color="border-gray-800 dark:border-gray-700" 
                />
            ))}
            <div className="w-2 flex-shrink-0"></div> {/* Spacer */}
        </div>

        <div className="h-px w-full bg-gray-200 dark:bg-white/5 my-4"></div>

        {/* SECTION 2: TIPOS DE TRANSMISIONES (5 Mockups) */}
        <SectionTitle title="Tipos de Transmisión" icon={Radio} />
        <div className="w-full overflow-x-auto scrollbar-hide pb-8 px-2 flex space-x-4 snap-x snap-mandatory">
            {broadcastData.map((item) => (
                <IphoneMockup 
                    key={item.id} 
                    title={item.title} 
                    desc={item.desc} 
                    img={item.image} 
                    color="border-brand-purple" 
                />
            ))}
            <div className="w-2 flex-shrink-0"></div>
        </div>

        <div className="h-px w-full bg-gray-200 dark:bg-white/5 my-4"></div>

        {/* SECTION 3: TIPOS DE REGALOS (Listado Vertical) */}
        <SectionTitle title="Catálogo de Regalos" icon={Gift} />
        <div className="px-6 space-y-3 mb-10">
            {giftsData.map((gift) => (
                <div key={gift.id} className="bg-white dark:bg-[#121212] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.99] transition-transform">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center text-pink-500">
                            <Gift size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-brand-black dark:text-white uppercase leading-none mb-1">{gift.name}</h4>
                            <p className="text-[10px] text-gray-400 font-medium">{gift.desc}</p>
                        </div>
                    </div>
                    <div className="bg-brand-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg shadow-lg">
                        <span className="text-[10px] font-black uppercase tracking-widest">{gift.value}</span>
                    </div>
                </div>
            ))}
        </div>

        <div className="h-px w-full bg-gray-200 dark:bg-white/5 my-4"></div>

        {/* SECTION 4: HERRAMIENTAS DEL EMISOR (8 Mockups) */}
        <SectionTitle title="Herramientas de Emisor" icon={PenTool} />
        <div className="w-full overflow-x-auto scrollbar-hide pb-8 px-2 flex space-x-4 snap-x snap-mandatory">
            {toolsData.map((item) => (
                <IphoneMockup 
                    key={item.id} 
                    title={item.title} 
                    desc={item.desc} 
                    img={item.image} 
                    color="border-orange-500" 
                />
            ))}
            <div className="w-2 flex-shrink-0"></div>
        </div>

      </div>
    </div>
  );
};

export default AppTour;