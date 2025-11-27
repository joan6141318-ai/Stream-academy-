import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronLeft, Table, Calculator, Wallet, CreditCard, ScrollText, Folder, ShieldAlert, CheckCircle2, MessageSquareWarning, Gift, AlertTriangle, UserX, ShieldCheck, BadgeCheck, Clock, BarChart3, ChevronDown, X, ZoomIn, AlertOctagon, Gavel, Sparkles, Check } from 'lucide-react';
import { TRAINING_MODULES } from '../constants';
import { Button } from '../components/Button';

const TrainingDetail: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const module = TRAINING_MODULES.find(m => m.id === topicId);
  
  // State for Image Lightbox (Zoom)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // State for Auto-Scroll Carousel
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationFrameId: number;

    const scroll = () => {
      if (scrollContainer) {
        // Velocidad del carrusel (1px por frame para suavidad)
        scrollContainer.scrollLeft += 1;

        // Lógica de bucle infinito:
        // Si hemos desplazado la mitad del contenido (llegando al set duplicado),
        // reseteamos al inicio (0) que es visualmente idéntico.
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
            scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const getResourceConfig = (type: string) => {
    switch(type) {
      case 'table': return { icon: Table, bg: 'bg-blue-500 dark:bg-blue-600', shadow: 'shadow-blue-500/30' };
      case 'calc': return { icon: Calculator, bg: 'bg-orange-500 dark:bg-orange-600', shadow: 'shadow-orange-500/30' };
      case 'wallet': return { icon: Wallet, bg: 'bg-emerald-500 dark:bg-emerald-600', shadow: 'shadow-emerald-500/30' };
      case 'card': return { icon: CreditCard, bg: 'bg-violet-500 dark:bg-violet-600', shadow: 'shadow-violet-500/30' };
      case 'doc': return { icon: ScrollText, bg: 'bg-rose-500 dark:bg-rose-600', shadow: 'shadow-rose-500/30' };
      default: return { icon: Folder, bg: 'bg-gray-500', shadow: 'shadow-gray-500/30' };
    }
  };

  const handleResourceClick = (type: string, title: string) => {
    if (type === 'calc') navigate('/tools/calculator');
    else if (type === 'table') navigate('/tools/payment-table');
    else alert(`Abriendo recurso: ${title}`);
  };

  if (!module) return null;

  // Security Points Data Structure for cleaner mapping
  const securityPoints = [
    {
        icon: MessageSquareWarning,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/10",
        text: "Bigo Live ni la agencia solicitarán códigos de verificación por medio de mensajería interna o aplicaciones de comunicación como WhatsApp, Telegram, Instagram o vía SMS."
    },
    {
        icon: Gift,
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-900/10",
        text: "Bigo Live y la agencia nunca solicitarán por mensajería interna la entrega de regalos a cambio de códigos de verificación."
    },
    {
        icon: Wallet,
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
        text: "Las recompensas obtenidas por alguna dinámica o evento de Bigo Live se verán reflejadas directamente en su monedero y se le enviará un mensaje desde los canales oficiales."
    },
    {
        icon: AlertTriangle,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-900/10",
        text: "En caso de presentar alguna sospecha de intento de estafa es importante que te comuniques con tu líder de agencia para informarle tu situación y escalarlo a las áreas correspondientes."
    },
    {
        icon: UserX,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/10",
        text: "Es importante que el emisor nunca comparta información personal ni información que pueda vulnerar la seguridad de su cuenta."
    },
    {
        icon: ShieldCheck,
        color: "text-brand-purple",
        bg: "bg-purple-50 dark:bg-purple-900/10",
        text: "Es responsabilidad única y total del emisor la seguridad de su cuenta."
    }
  ];

  // Live Data Step Images
  const liveDataSteps = [
    "https://i.postimg.cc/gJkXHjq3/4_20251123_185808_0001.png",
    "https://i.postimg.cc/SsN2fR7W/5_20251123_185808_0002.png",
    "https://i.postimg.cc/ZRKBxnFN/6_20251123_185808_0003.png"
  ];
  
  // Bloqueos Folders Data
  const bloqueoFolders = [
    {
        title: "Motivo de bloqueos",
        desc: "Causas comunes y cómo evitarlas.",
        icon: AlertOctagon,
        theme: "rose",
        path: "/training/bloqueos/motivos"
    },
    {
        title: "Tipos de bloqueos",
        desc: "Conoce las diferentes sanciones.",
        icon: ShieldAlert,
        theme: "amber",
        path: "/training/bloqueos/types"
    },
    {
        title: "Apelación",
        desc: "Proceso para apelar un bloqueo.",
        icon: Gavel,
        theme: "blue",
        path: "/training/bloqueos/appeal"
    },
    {
        title: "Desbloqueos con puntos VIP",
        desc: "Qué son y cómo se aplican.",
        icon: Sparkles,
        theme: "purple",
        path: "/training/bloqueos/vip"
    }
  ];

  const getFolderStyles = (theme: string) => {
    switch(theme) {
        case 'rose': return { 
            bg: 'bg-rose-600', 
            shadow: 'shadow-rose-600/40' 
        };
        case 'amber': return { 
            bg: 'bg-amber-500', 
            shadow: 'shadow-amber-500/40' 
        };
        case 'blue': return { 
            bg: 'bg-blue-600', 
            shadow: 'shadow-blue-600/40' 
        };
        case 'purple': return { 
            bg: 'bg-purple-600', 
            shadow: 'shadow-purple-600/40' 
        };
        default: return { bg: 'bg-gray-600', shadow: 'shadow-gray-600/40' };
    }
  };

  const handleFolderClick = (path: string | null) => {
    if (path) {
        navigate(path);
    } else {
        alert("Próximamente");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black relative transition-colors duration-300">
      
      {/* --- IMAGE LIGHTBOX MODAL --- */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-safe right-4 text-white/70 hover:text-white p-2"
            >
                <X size={32} />
            </button>
            <img 
                src={selectedImage} 
                alt="Zoom view" 
                className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            />
            <p className="absolute bottom-10 text-white/50 text-xs font-bold uppercase tracking-widest">Toca fuera para cerrar</p>
        </div>
      )}

      {/* Nav */}
      <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
          <div className="pt-safe w-full">
            <div className="flex items-center justify-between px-4 h-16">
                <button onClick={() => navigate('/training')} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-black/60 pointer-events-auto cursor-pointer transition-transform active:scale-95 shadow-lg border border-white/10">
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
            </div>
          </div>
      </div>

      {/* Hero Image */}
      <div className="h-[40vh] w-full relative flex-shrink-0 bg-brand-black">
        <img src={module.imageUrl} alt={module.title} className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-black/40 transition-colors duration-300"></div>
        <div className="absolute bottom-0 left-0 w-full px-6 pb-6">
            <span className="text-[10px] font-black text-white bg-brand-purple px-2 py-1 uppercase tracking-widest mb-3 inline-block shadow-sm">Módulo</span>
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-[0.9] drop-shadow-sm mb-1">{module.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-black flex flex-col px-6 pt-4 pb-safe transition-colors duration-300 -mt-1 relative z-10">
        
        <div className="mb-8">
            <div className="h-1 w-10 bg-brand-purple mb-4"></div>
            <h2 className="text-lg font-bold text-brand-black dark:text-white leading-tight mb-4">{module.description}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-justify mb-8">{module.textContent}</p>

            {/* LIVE DATA SPECIAL MODULE */}
            {module.id === 'live-data' && (
                <div className="mt-2 mb-10 space-y-8 animate-fade-in">
                    
                    {/* 1. Horizontal Carousel (Interactive Auto-Scroll) */}
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <BarChart3 className="text-brand-purple" size={20} />
                            <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-widest">
                                Guía Visual Paso a Paso
                            </h3>
                        </div>

                        {/* Carousel Wrapper */}
                        <div className="w-[calc(100%+3rem)] -ml-6 relative group">
                            
                            {/* Fade Edges for seamless look */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-black to-transparent z-20 pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-black to-transparent z-20 pointer-events-none"></div>

                            {/* Scrollable Container */}
                            <div 
                                ref={scrollRef}
                                className="overflow-x-auto scrollbar-hide flex space-x-4 py-4 px-6 cursor-grab active:cursor-grabbing"
                                onTouchStart={() => setIsPaused(true)}
                                onTouchEnd={() => setIsPaused(false)}
                                onMouseDown={() => setIsPaused(true)}
                                onMouseUp={() => setIsPaused(false)}
                                onMouseLeave={() => setIsPaused(false)}
                            >
                                {/* Set 1 */}
                                {liveDataSteps.map((imgUrl, index) => {
                                    const stepNum = index + 1;
                                    return (
                                        <div key={`set1-${index}`} className="relative group/card w-64 flex-shrink-0 select-none">
                                            <button 
                                                onClick={() => setSelectedImage(imgUrl)}
                                                className="w-full relative rounded-lg overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-brand-dark-card group-hover/card:scale-[1.02] transition-transform duration-300 cursor-zoom-in"
                                            >
                                                <img src={imgUrl} alt={`Paso ${stepNum}`} className="w-full h-auto block pointer-events-none" />
                                                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors flex items-center justify-center">
                                                    <div className="bg-black/60 text-white p-2 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity backdrop-blur-sm">
                                                        <ZoomIn size={20} />
                                                    </div>
                                                </div>
                                            </button>
                                            <div className="absolute -top-2 -left-2 z-20">
                                                <div className="flex items-center bg-brand-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full shadow-lg border-2 border-white dark:border-black">
                                                    <span className="text-xs font-black uppercase tracking-widest">Paso {stepNum}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Set 2 (Duplicate for infinite loop) */}
                                {liveDataSteps.map((imgUrl, index) => {
                                    const stepNum = index + 1;
                                    return (
                                        <div key={`set2-${index}`} className="relative group/card w-64 flex-shrink-0 select-none">
                                            <button 
                                                onClick={() => setSelectedImage(imgUrl)}
                                                className="w-full relative rounded-lg overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-brand-dark-card group-hover/card:scale-[1.02] transition-transform duration-300 cursor-zoom-in"
                                            >
                                                <img src={imgUrl} alt={`Paso ${stepNum}`} className="w-full h-auto block pointer-events-none" />
                                                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors flex items-center justify-center">
                                                    <div className="bg-black/60 text-white p-2 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity backdrop-blur-sm">
                                                        <ZoomIn size={20} />
                                                    </div>
                                                </div>
                                            </button>
                                            <div className="absolute -top-2 -left-2 z-20">
                                                <div className="flex items-center bg-brand-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full shadow-lg border-2 border-white dark:border-black">
                                                    <span className="text-xs font-black uppercase tracking-widest">Paso {stepNum}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 2. Info Alert Box */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-lg border-l-4 border-indigo-500 dark:border-indigo-400 flex gap-4 shadow-sm">
                        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-full h-fit flex-shrink-0">
                             <Clock className="text-indigo-600 dark:text-indigo-300" size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">
                                Tiempo de Actualización
                            </h3>
                            <p className="text-xs text-indigo-900/80 dark:text-indigo-100/80 leading-relaxed font-medium text-justify">
                                Es importante que el Emisor lleve un control y monitoreo de su live data. Ten en cuenta que el tiempo de actualización de las estadísticas puede variar en lapsos de <span className="font-bold">12 a 24 horas</span>.
                            </p>
                        </div>
                    </div>

                </div>
            )}

            {/* BLOQUEOS SPECIAL MODULE */}
            {module.id === 'bloqueos' && (
                <div className="mt-2 mb-10 space-y-4 animate-fade-in">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Guía de Sanciones</h3>
                     {bloqueoFolders.map((folder, idx) => {
                         const style = getFolderStyles(folder.theme);
                         const Icon = folder.icon;
                         return (
                             <div 
                                key={idx} 
                                onClick={() => handleFolderClick(folder.path)}
                                className={`relative p-5 rounded-lg overflow-hidden shadow-lg ${style.shadow} ${style.bg} group active:scale-[0.98] transition-all cursor-pointer`}
                             >
                                 
                                 {/* Content */}
                                 <div className="flex items-center justify-between relative z-10">
                                     <div>
                                         <h4 className="text-sm font-black uppercase tracking-wide mb-1 text-white">{folder.title}</h4>
                                         <p className="text-xs font-bold text-white/90">{folder.desc}</p>
                                     </div>
                                     <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md shadow-inner border border-white/10">
                                         <Icon size={20} strokeWidth={2} className="text-white" />
                                     </div>
                                 </div>
                                 
                                 {/* Deco Icon Background */}
                                 <Icon className="absolute -right-6 -bottom-6 text-white opacity-20 rotate-[-15deg] group-active:scale-110 transition-transform duration-300" size={100} strokeWidth={1.5} />
                             </div>
                         )
                     })}
                </div>
            )}

            {/* SECURITY NOTICE CARD (Specific to 'seguridad' module) */}
            {module.id === 'seguridad' && (
              <div className="mt-2 mb-10 space-y-8 animate-fade-in">
                
                {/* 1. Official Alerts List */}
                <div className="bg-white dark:bg-brand-dark-card border border-gray-100 dark:border-white/5 rounded-lg overflow-hidden shadow-lg shadow-black/5">
                    <div className="bg-red-50 dark:bg-red-900/20 px-5 py-4 border-b border-red-100 dark:border-red-900/30 flex items-center">
                        <ShieldAlert className="text-red-500 mr-3" size={20} strokeWidth={2.5} />
                        <h3 className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                            Normas de Seguridad
                        </h3>
                    </div>
                    
                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {securityPoints.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className="p-5 flex items-start group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-0.5 ${item.bg}`}>
                                        <Icon size={14} className={item.color} strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                                        {item.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Official Channels Verification */}
                <div className="relative">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                             <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="text-xs font-black text-brand-black dark:text-white uppercase tracking-widest">
                            Canales Oficiales Verificados
                        </span>
                    </div>

                    <div className="bg-gray-100 dark:bg-brand-dark-card p-2 rounded-lg border border-gray-200 dark:border-white/10 shadow-inner">
                        <div className="bg-white dark:bg-black rounded overflow-hidden border border-gray-100 dark:border-white/5 relative">
                             <img 
                                src="https://i.postimg.cc/sftKn4k0/IMG-20251125-051138.jpg" 
                                alt="Canales Oficiales Verificados" 
                                className="w-full h-auto block hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                                onClick={() => setSelectedImage("https://i.postimg.cc/sftKn4k0/IMG-20251125-051138.jpg")}
                            />
                            {/* Overlay Badge */}
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center pointer-events-none">
                                <CheckCircle2 size={10} className="mr-1" />
                                OFICIAL
                            </div>
                        </div>
                    </div>
                    <p className="text-[9px] text-center text-gray-400 mt-2 font-medium">
                        * Solo interactúa con cuentas que posean la insignia de verificación "V".
                    </p>
                </div>
              </div>
            )}

            {/* Resources */}
            {module.resources && module.resources.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 dark:border-white/10 pb-2">Herramientas del Módulo</h3>
                <div className="grid grid-cols-2 gap-3">
                  {module.resources.map((resource, index) => {
                    const style = getResourceConfig(resource.type);
                    const Icon = style.icon;
                    return (
                      <button key={index} onClick={() => handleResourceClick(resource.type, resource.title)} className={`relative flex flex-col justify-between p-3 h-20 w-full text-left ${style.bg} rounded-sm active:scale-[0.97] transition-transform duration-200 shadow-md ${style.shadow} overflow-hidden group`}>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                           <div className="bg-white/20 w-fit p-1 rounded-[2px] backdrop-blur-sm"><Icon size={14} className="text-white" strokeWidth={3} /></div>
                           <span className="text-[11px] font-black uppercase leading-tight text-white tracking-wide pr-4">{resource.title}</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 opacity-20 text-white rotate-[-15deg] transition-transform group-active:scale-110"><Icon size={50} strokeWidth={1.5} /></div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        <div className="space-y-3 mt-auto pb-8">
            <div className="grid grid-cols-2 gap-3">
                <Button fullWidth variant="outline" icon={<FileText size={18} />} className="dark:border-white/20 dark:text-white dark:hover:bg-white/10" onClick={() => alert('Abriendo modo lectura...')}>Leer Guía</Button>
                <Button fullWidth variant="secondary" icon={<Download size={18} />} className="bg-gray-100 text-brand-black dark:bg-white/10 dark:text-white dark:hover:bg-white/20" onClick={() => alert('Descargando PDF...')}>PDF</Button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TrainingDetail;