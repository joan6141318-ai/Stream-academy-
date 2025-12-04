
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronLeft, Table, Calculator, Wallet, CreditCard, ScrollText, Folder, PlayCircle, ExternalLink, X, ShieldAlert, Clock, Gavel, Crown, ArrowUpRight, Play, Share2, Info } from 'lucide-react';
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

  // Auto-scroll logic
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
    <div className="flex flex-col h-full w-full bg-black relative transition-colors duration-300">
      
      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-safe right-4 text-white/70 hover:text-white p-2"><X size={32} /></button>
            <img src={selectedImage} alt="Zoom" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Floating Header Actions (Glassmorphism) */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
          <div className="pt-safe w-full px-6 h-24 flex items-center justify-between">
              <button 
                onClick={() => navigate('/training')} 
                className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform border border-white/10 shadow-xl"
              >
                  <ChevronLeft size={20} strokeWidth={3} />
              </button>
              
              <button 
                className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform border border-white/10 shadow-xl"
                onClick={() => alert("Compartir módulo")}
              >
                  <Share2 size={18} strokeWidth={2.5} />
              </button>
          </div>
      </div>

      {/* === HERO IMAGE (Immersive Background) === */}
      <div className="fixed inset-0 w-full h-[60vh] z-0">
          <img src={module.imageUrl} alt={module.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90"></div>
      </div>

      {/* === CONTENT SHEET (Scrollable) === */}
      <div className="flex-1 overflow-y-auto scrollbar-hide z-10 mt-[45vh] relative pb-safe">
          
          {/* Main Card Container */}
          <div className="bg-white dark:bg-[#0a0a0a] min-h-[60vh] rounded-t-[2.5rem] relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              
              {/* --- FLOATING ACTION BUTTON (VIDEO) --- */}
              {hasVideo && (
                  <div className="absolute -top-8 right-8 z-20">
                      <button 
                          onClick={handleOpenVideo}
                          className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/40 border-[6px] border-white dark:border-[#0a0a0a] active:scale-90 transition-transform group"
                      >
                          <Play size={24} className="text-white ml-1 fill-white" />
                          <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20 -z-10"></div>
                      </button>
                  </div>
              )}

              {/* Handle Bar */}
              <div className="w-full flex justify-center pt-4 pb-2">
                  <div className="w-12 h-1 bg-gray-200 dark:bg-white/10 rounded-full"></div>
              </div>

              <div className="px-8 pt-4 pb-12">
                  
                  {/* Title Section */}
                  <div className="mb-8">
                      <div className="flex items-center space-x-2 mb-3">
                          <span className="px-2.5 py-1 bg-brand-purple/10 text-brand-purple dark:text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-brand-purple/20">
                              Módulo Oficial
                          </span>
                          {module.id === 'bigo-live' && (
                              <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-orange-500/20">
                                  Básico
                              </span>
                          )}
                      </div>
                      
                      <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-[0.95] tracking-tighter mb-4">
                          {module.title}
                      </h1>
                      
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-relaxed border-l-2 border-brand-purple pl-3">
                          {module.description}
                      </p>
                  </div>

                  {/* Main Content */}
                  <div className="mb-10">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-7 font-medium text-justify whitespace-pre-line">
                              {module.textContent}
                          </p>
                      </div>
                  </div>

                  {/* --- MENÚ DE BLOQUEOS (Si aplica) --- */}
                  {module.id === 'bloqueos' && (
                      <div className="mb-10 space-y-4 animate-fade-in">
                          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-white/5 pb-2">
                              <ShieldAlert size={16} className="text-brand-purple" />
                              <h3 className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white">Normativa</h3>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                              {/* Botones de navegación de bloqueos con diseño App-Like */}
                              {[
                                  { title: 'Motivos', sub: 'Prohibiciones', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', path: '/training/bloqueos/motivos' },
                                  { title: 'Duración', sub: 'Tiempos', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', path: '/training/bloqueos/types' },
                                  { title: 'Apelaciones', sub: 'Soporte', icon: Gavel, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/training/bloqueos/appeal' },
                                  { title: 'Puntos VIP', sub: 'Desbloqueo', icon: Crown, color: 'text-brand-black dark:text-white', bg: 'bg-gray-100 dark:bg-white/10', path: '/training/bloqueos/vip' },
                              ].map((btn, idx) => (
                                  <button 
                                      key={idx} 
                                      onClick={() => navigate(btn.path)}
                                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-brand-dark-card rounded-2xl border border-gray-100 dark:border-white/5 active:scale-95 transition-all group"
                                  >
                                      <div className="flex items-center space-x-4">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${btn.bg}`}>
                                              <btn.icon size={18} className={btn.color} strokeWidth={2.5} />
                                          </div>
                                          <div className="text-left">
                                              <span className="block text-sm font-black text-brand-black dark:text-white uppercase leading-none mb-1">{btn.title}</span>
                                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">{btn.sub}</span>
                                          </div>
                                      </div>
                                      <div className="bg-white dark:bg-black/20 p-1.5 rounded-full text-gray-300 group-hover:text-brand-purple transition-colors">
                                          <ArrowUpRight size={16} />
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* --- LIVE DATA STEPS (Si aplica) --- */}
                  {module.id === 'live-data' && (
                      <div className="mb-10 animate-fade-in">
                          <div className="w-[calc(100%+4rem)] -ml-8 relative">
                               <div ref={scrollRef} className="overflow-x-auto scrollbar-hide flex space-x-4 py-4 px-8 cursor-grab active:cursor-grabbing" onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
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

                  {/* --- RESOURCES GRID (Tools) --- */}
                  {module.resources && module.resources.length > 0 && (
                      <div className="mb-8">
                          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-white/5 pb-2 mb-4">
                              <Folder size={16} className="text-brand-purple" />
                              <h3 className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white">Herramientas</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              {module.resources.map((resource: any, index: number) => {
                                  const defaultStyle = getResourceConfig(resource.type);
                                  const style = resource.style || defaultStyle;
                                  const Icon = getResourceIcon(resource.style?.iconName, resource.type);
                                  return (
                                      <button 
                                          key={index} 
                                          onClick={() => handleResourceClick(resource.type, resource.title)} 
                                          className={`relative p-4 h-24 w-full text-left rounded-2xl active:scale-[0.96] transition-transform shadow-lg ${style.shadow} overflow-hidden group flex flex-col justify-between`}
                                      >
                                          <div className={`absolute inset-0 z-0 ${style.bg} opacity-100`}></div>
                                          <img src={resource.imageUrl || module.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover z-0 opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
                                          
                                          <div className="relative z-10 bg-white/20 w-fit p-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                                              <Icon size={16} className="text-white" strokeWidth={2.5} />
                                          </div>
                                          <span className="relative z-10 text-[10px] font-black uppercase leading-tight text-white tracking-wide pr-2">
                                              {resource.title}
                                          </span>
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {/* --- FOOTER ACTIONS --- */}
                  <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                      <div className="grid grid-cols-2 gap-3">
                          <Button fullWidth variant="outline" icon={<FileText size={16} />} className="dark:border-white/20 dark:text-white dark:hover:bg-white/10 rounded-xl h-12 text-[10px]" onClick={() => alert('Abriendo modo lectura...')}>Leer Guía</Button>
                          <Button fullWidth variant="secondary" icon={<Download size={16} />} className="bg-gray-100 text-brand-black dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded-xl h-12 text-[10px]" onClick={() => alert('Descargando PDF...')}>PDF</Button>
                      </div>
                  </div>

              </div>
          </div>
      </div>
    </div>
  );
};

export default TrainingDetail;
