
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronLeft, Table, Calculator, Wallet, CreditCard, ScrollText, Folder, PlayCircle, ExternalLink, X, ShieldAlert, Clock, Gavel, Crown, ArrowUpRight, Play } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { Button } from '../components/Button';
import * as LucideIcons from 'lucide-react';

const TrainingDetail: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { modules, loading } = useContent();
  const [module, setModule] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
      if (modules.length > 0) {
          const found = modules.find(m => m.id === topicId);
          setModule(found);
      }
  }, [modules, topicId]);

  // Auto-scroll logic for live-data
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;
    let animationFrameId: number;
    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 1;
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
            scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const getResourceIcon = (iconName?: string, type?: string) => {
    if (iconName && (LucideIcons as any)[iconName]) {
        return (LucideIcons as any)[iconName];
    }
    switch(type) {
      case 'table': return Table;
      case 'calc': return Calculator;
      case 'wallet': return Wallet;
      case 'card': return CreditCard;
      case 'doc': return ScrollText;
      default: return Folder;
    }
  };

  const getResourceConfig = (type: string) => {
    switch(type) {
      case 'table': return { bg: 'bg-blue-600', shadow: 'shadow-blue-600/30' };
      case 'calc': return { bg: 'bg-orange-500', shadow: 'shadow-orange-500/30' };
      case 'wallet': return { bg: 'bg-emerald-600', shadow: 'shadow-emerald-600/30' };
      case 'card': return { bg: 'bg-violet-600', shadow: 'shadow-violet-600/30' };
      case 'doc': return { bg: 'bg-rose-600', shadow: 'shadow-rose-600/30' };
      default: return { bg: 'bg-brand-black dark:bg-white/10', shadow: 'shadow-black/20' };
    }
  };

  const handleResourceClick = (type: string, title: string) => {
    if (type === 'calc') navigate('/tools/calculator');
    else if (type === 'table') navigate('/tools/payment-table');
    else alert(`Abriendo recurso: ${title}`);
  };

  const handleOpenVideo = () => {
      if (module?.videoUrl && module.videoUrl !== '#' && module.videoUrl.trim() !== '') {
          window.open(module.videoUrl, '_blank', 'noopener,noreferrer');
      } else {
          alert("Video no disponible por el momento.");
      }
  };

  if (loading) return <div className="h-full w-full bg-white dark:bg-black flex items-center justify-center text-xs font-bold uppercase tracking-widest animate-pulse">Cargando contenido...</div>;
  if (!module) return <div className="h-full w-full bg-white dark:bg-black flex items-center justify-center text-xs font-bold uppercase tracking-widest">Módulo no encontrado</div>;

  const liveDataSteps = [ "https://i.postimg.cc/gJkXHjq3/4_20251123_185808_0001.png", "https://i.postimg.cc/SsN2fR7W/5_20251123_185808_0002.png", "https://i.postimg.cc/ZRKBxnFN/6_20251123_185808_0003.png" ];
  const hasVideo = module.videoUrl && module.videoUrl !== '#';

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black transition-colors duration-300">
      
      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-safe right-4 text-white/70 hover:text-white p-2"><X size={32} /></button>
            <img src={selectedImage} alt="Zoom" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Floating Header Actions */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
          <div className="pt-safe w-full">
            <div className="flex items-center justify-between px-6 h-20">
                <button onClick={() => navigate('/training')} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 pointer-events-auto cursor-pointer transition-all active:scale-95 border border-white/10 shadow-lg">
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
            </div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-safe">
        
        {/* === SEMI-CIRCULAR BANNER (HERO) === */}
        <div className="relative w-full h-[55vh] z-0">
            {/* The Curve Container */}
            <div className="absolute inset-0 w-full h-full rounded-b-[3.5rem] overflow-hidden shadow-2xl shadow-brand-purple/20 bg-brand-black">
                <img src={module.imageUrl} alt={module.title} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                {/* Banner Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 pb-16 text-center">
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-full mb-4 shadow-lg">
                        Módulo Oficial
                    </span>
                    <h1 className="text-4xl font-black text-white uppercase leading-[0.9] drop-shadow-xl tracking-tighter mb-2">
                        {module.title}
                    </h1>
                    <p className="text-xs text-white/70 font-bold uppercase tracking-wide max-w-xs mx-auto line-clamp-2">
                        {module.description}
                    </p>
                </div>
            </div>

            {/* FLOATING PLAY ACTION (On the curve edge) */}
            {hasVideo && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                    <button 
                        onClick={handleOpenVideo}
                        className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/40 border-4 border-white dark:border-black active:scale-95 transition-transform group"
                    >
                        <Play size={24} className="text-white ml-1 fill-white" />
                        {/* Ping Effect */}
                        <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20 -z-10"></div>
                    </button>
                </div>
            )}
        </div>

        {/* === CONTENT SECTION === */}
        <div className="px-6 pt-16 pb-12">
            
            {/* Main Text */}
            <div className="mb-10 animate-slide-up">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-7 font-medium text-justify whitespace-pre-line first-letter:text-3xl first-letter:font-black first-letter:text-brand-purple first-letter:mr-1 first-letter:float-left">
                        {module.textContent}
                    </p>
                </div>
            </div>

            {/* --- MENÚ DE BLOQUEOS (Special Module) --- */}
            {module.id === 'bloqueos' && (
                <div className="mb-12 space-y-4">
                    <div className="flex items-center space-x-2 border-b-2 border-gray-100 dark:border-white/5 pb-2">
                        <ShieldAlert size={18} className="text-brand-purple" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white">
                            Centro de Normas
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => navigate('/training/bloqueos/motivos')} className="bg-white dark:bg-brand-dark-card p-5 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-white/5 shadow-lg shadow-gray-200/50 dark:shadow-none active:scale-[0.98] transition-all group">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/20 text-rose-500 rounded-xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                    <ShieldAlert size={20} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-black text-brand-black dark:text-white uppercase leading-none mb-1">Motivos</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Qué está prohibido</span>
                                </div>
                            </div>
                            <ChevronLeft size={16} className="text-gray-300 rotate-180" />
                        </button>

                        <button onClick={() => navigate('/training/bloqueos/types')} className="bg-white dark:bg-brand-dark-card p-5 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-white/5 shadow-lg shadow-gray-200/50 dark:shadow-none active:scale-[0.98] transition-all group">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 text-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                    <Clock size={20} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-black text-brand-black dark:text-white uppercase leading-none mb-1">Duración</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Tiempos de sanción</span>
                                </div>
                            </div>
                            <ChevronLeft size={16} className="text-gray-300 rotate-180" />
                        </button>

                        <button onClick={() => navigate('/training/bloqueos/appeal')} className="bg-white dark:bg-brand-dark-card p-5 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-white/5 shadow-lg shadow-gray-200/50 dark:shadow-none active:scale-[0.98] transition-all group">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <Gavel size={20} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-black text-brand-black dark:text-white uppercase leading-none mb-1">Apelaciones</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Recuperar cuenta</span>
                                </div>
                            </div>
                            <ChevronLeft size={16} className="text-gray-300 rotate-180" />
                        </button>

                        <button onClick={() => navigate('/training/bloqueos/vip')} className="bg-brand-black dark:bg-white p-5 rounded-2xl flex items-center justify-between shadow-xl active:scale-[0.98] transition-all group border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-brand-purple/10 dark:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center space-x-4 relative z-10">
                                <div className="w-10 h-10 bg-white/20 dark:bg-black/10 text-white dark:text-black rounded-xl flex items-center justify-center">
                                    <Crown size={20} strokeWidth={2.5} fill="currentColor" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-black text-white dark:text-black uppercase leading-none mb-1">Puntos VIP</span>
                                    <span className="text-[9px] text-white/60 dark:text-black/60 font-bold uppercase tracking-wide">Desbloqueo Especial</span>
                                </div>
                            </div>
                            <ChevronLeft size={16} className="text-white/50 dark:text-black/50 rotate-180 relative z-10" />
                        </button>
                    </div>
                </div>
            )}

            {/* --- LIVE DATA STEPS (Special Module) --- */}
            {module.id === 'live-data' && (
                <div className="mb-10 space-y-8 animate-fade-in">
                    <div className="w-[calc(100%+3rem)] -ml-6 relative group">
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-black to-transparent z-20 pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-black to-transparent z-20 pointer-events-none"></div>
                            <div ref={scrollRef} className="overflow-x-auto scrollbar-hide flex space-x-4 py-4 px-6 cursor-grab active:cursor-grabbing" onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onMouseLeave={() => setIsPaused(false)}>
                            {[...liveDataSteps, ...liveDataSteps].map((imgUrl, index) => (
                                <div key={index} className="relative group/card w-64 flex-shrink-0 select-none">
                                    <button onClick={() => setSelectedImage(imgUrl)} className="w-full relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/10 active:scale-95 transition-transform">
                                        <img src={imgUrl} alt="Step" className="w-full h-auto block pointer-events-none" />
                                    </button>
                                </div>
                            ))}
                            </div>
                    </div>
                </div>
            )}

            {/* --- RESOURCES GRID --- */}
            {module.resources && module.resources.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center space-x-2 border-b-2 border-gray-100 dark:border-white/5 pb-2 mb-4">
                        <Folder size={18} className="text-brand-purple" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white">Herramientas</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {module.resources.map((resource: any, index: number) => {
                        const defaultStyle = getResourceConfig(resource.type);
                        const style = resource.style || defaultStyle;
                        const Icon = getResourceIcon(resource.style?.iconName, resource.type);
                        return (
                            <button 
                                key={index} 
                                onClick={() => handleResourceClick(resource.type, resource.title)} 
                                className={`relative flex flex-col justify-between p-4 h-28 w-full text-left rounded-3xl active:scale-[0.96] transition-transform duration-200 shadow-lg ${style.shadow} overflow-hidden group`}
                            >
                                <img src={resource.imageUrl || module.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 group-hover:opacity-20 transition-opacity" />
                                <div className={`absolute inset-0 z-10 ${style.bg}`} style={{ opacity: style.cardOpacity !== undefined ? style.cardOpacity : 1 }}></div>
                                <div className="relative z-20 flex flex-col h-full justify-between">
                                    <div className="bg-white/20 w-fit p-2 rounded-xl backdrop-blur-sm border border-white/10">
                                        <Icon size={18} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase leading-tight text-white tracking-wide pr-2">
                                        {resource.title}
                                    </span>
                                </div>
                                {/* Decor */}
                                <Icon className="absolute -bottom-4 -right-4 text-white/10 rotate-[-15deg] group-hover:scale-110 transition-transform" size={60} />
                            </button>
                        );
                        })}
                    </div>
                </div>
            )}

            {/* --- DOWNLOAD ACTIONS --- */}
            <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="grid grid-cols-2 gap-3">
                    <Button fullWidth variant="outline" icon={<FileText size={16} />} className="dark:border-white/20 dark:text-white dark:hover:bg-white/10 rounded-xl h-12 text-[10px]" onClick={() => alert('Abriendo modo lectura...')}>Leer Guía</Button>
                    <Button fullWidth variant="secondary" icon={<Download size={16} />} className="bg-gray-100 text-brand-black dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded-xl h-12 text-[10px]" onClick={() => alert('Descargando PDF...')}>PDF</Button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default TrainingDetail;
