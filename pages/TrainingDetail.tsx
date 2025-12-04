
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronLeft, Table, Calculator, Wallet, CreditCard, ScrollText, Folder, PlayCircle, ExternalLink, X, ShieldAlert, Clock, Gavel, Crown, ArrowUpRight, Play, Share2, Info, CheckCircle2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { Button } from '../components/Button';
import * as LucideIcons from 'lucide-react';

const RESOURCE_VARIANTS = [
    {
      // NARANJA
      bg: 'bg-orange-500',
      border: 'border-orange-400',
      text: 'text-white',
      iconBg: 'bg-white/20',
      iconColor: 'text-white'
    },
    {
      // GRIS LIGERO
      bg: 'bg-gray-200',
      border: 'border-white',
      text: 'text-brand-black',
      iconBg: 'bg-white',
      iconColor: 'text-brand-black'
    },
    {
      // MORADO
      bg: 'bg-brand-purple',
      border: 'border-violet-500',
      text: 'text-white',
      iconBg: 'bg-white/20',
      iconColor: 'text-white'
    },
    {
      // NEGRO
      bg: 'bg-black',
      border: 'border-[#1A1A1A]',
      text: 'text-white',
      iconBg: 'bg-white/10',
      iconColor: 'text-white'
    },
    {
      // BLANCO
      bg: 'bg-white',
      border: 'border-gray-100',
      text: 'text-brand-black',
      iconBg: 'bg-gray-100',
      iconColor: 'text-brand-black'
    }
];

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

  // --- STATUS BAR EFFECT: FORCE BLACK ON THIS PAGE ---
  useEffect(() => {
      // 1. Force Black Status Bar for Immersive Image
      const metaThemeColor = document.querySelector("meta[name=theme-color]");
      if (metaThemeColor) {
          metaThemeColor.setAttribute("content", "#000000");
      }

      // 2. Cleanup: Restore dynamic behavior based on current theme when leaving
      return () => {
          const isDark = document.documentElement.classList.contains('dark');
          const color = isDark ? '#000000' : '#ffffff';
          if (metaThemeColor) {
              metaThemeColor.setAttribute("content", color);
          }
      };
  }, []);

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

  if (loading) return <div className="h-full w-full bg-black flex items-center justify-center text-xs font-black uppercase tracking-widest text-white animate-pulse">Cargando...</div>;
  if (!module) return <div className="h-full w-full bg-black flex items-center justify-center text-xs font-black uppercase tracking-widest text-white">Módulo no encontrado</div>;

  const liveDataSteps = [ "https://i.postimg.cc/gJkXHjq3/4_20251123_185808_0001.png", "https://i.postimg.cc/SsN2fR7W/5_20251123_185808_0002.png", "https://i.postimg.cc/ZRKBxnFN/6_20251123_185808_0003.png" ];
  const hasVideo = module.videoUrl && module.videoUrl !== '#';

  return (
    <div className="flex flex-col h-full w-full bg-black text-white relative transition-colors duration-300 font-sans">
      
      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-safe right-4 text-white/70 hover:text-white p-2"><X size={32} /></button>
            <img src={selectedImage} alt="Zoom" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Floating Header Actions */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
          <div className="pt-safe w-full px-6 h-24 flex items-center justify-between">
              <button 
                onClick={() => navigate('/training')} 
                className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform border border-white/10 shadow-2xl"
              >
                  <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
              
              <button 
                className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform border border-white/10 shadow-2xl"
                onClick={() => alert("Compartir módulo")}
              >
                  <Share2 size={20} strokeWidth={2.5} />
              </button>
          </div>
      </div>

      {/* === IMMERSIVE HERO BACKGROUND === */}
      <div className="fixed inset-0 w-full h-[65vh] z-0">
          <img src={module.imageUrl} alt={module.title} className="w-full h-full object-cover opacity-90" />
          {/* Heavy gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* === CONTENT SCROLLABLE AREA === */}
      <div className="flex-1 overflow-y-auto scrollbar-hide z-10 relative pb-safe">
          
          {/* Spacer to push content down */}
          <div className="h-[45vh] w-full"></div>

          {/* Main Content Card - Seamless Dark Theme */}
          <div className="bg-black min-h-[55vh] rounded-t-[2.5rem] relative shadow-[0_-20px_60px_-15px_rgba(124,58,237,0.1)] border-t border-white/10">
              
              {/* Handle Bar */}
              <div className="w-full flex justify-center pt-4 pb-2">
                  <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
              </div>

              <div className="px-8 pt-4 pb-12">
                  
                  {/* Header Info */}
                  <div className="mb-8">
                      <div className="flex items-center space-x-2 mb-4">
                          <span className="px-3 py-1 bg-brand-purple text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-purple-500/30">
                              Oficial
                          </span>
                          <span className="px-3 py-1 bg-white/10 text-white/80 text-[9px] font-black uppercase tracking-widest rounded-full border border-white/10">
                              2025
                          </span>
                      </div>
                      
                      <h1 className="text-4xl font-black text-white uppercase leading-[0.9] tracking-tighter mb-4 drop-shadow-xl">
                          {module.title}
                      </h1>
                      
                      <div className="flex items-center text-white/60 text-xs font-bold uppercase tracking-wide mb-6">
                          <Info size={14} className="mr-2 text-brand-purple" />
                          {module.description}
                      </div>

                      {/* ACTION BAR (Native App Style) */}
                      {hasVideo && (
                          <div className="flex gap-4 mb-8">
                              <button 
                                  onClick={handleOpenVideo}
                                  className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform group border border-white/10"
                              >
                                  <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm group-hover:bg-white transition-colors">
                                      <Play size={16} className="text-white group-hover:text-orange-600 ml-0.5" fill="currentColor" />
                                  </div>
                                  <span className="text-xs font-black text-white uppercase tracking-widest">Ver Video</span>
                              </button>
                              
                              <button 
                                  onClick={() => alert('Modo lectura activado')}
                                  className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 active:scale-95 transition-transform hover:bg-white/10"
                              >
                                  <FileText size={20} className="text-white/80" />
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Body Text */}
                  <div className="mb-12">
                      <div className="prose prose-sm prose-invert max-w-none">
                          <p className="text-sm text-gray-300 leading-7 font-medium text-justify whitespace-pre-line">
                              {module.textContent}
                          </p>
                      </div>
                  </div>

                  {/* --- SPECIAL MODULE: BLOQUEOS --- */}
                  {module.id === 'bloqueos' && (
                      <div className="mb-12 animate-fade-in">
                          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                              <h3 className="text-xs font-black uppercase tracking-widest text-white">Normativa</h3>
                              <ShieldAlert size={14} className="text-brand-purple" />
                          </div>
                          <div className="space-y-3">
                              {[
                                  { title: 'Motivos', sub: 'Lo Prohibido', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-950/30 border-rose-500/20', path: '/training/bloqueos/motivos' },
                                  { title: 'Duración', sub: 'Tiempos', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-950/30 border-orange-500/20', path: '/training/bloqueos/types' },
                                  { title: 'Apelaciones', sub: 'Recuperación', icon: Gavel, color: 'text-blue-500', bg: 'bg-blue-950/30 border-blue-500/20', path: '/training/bloqueos/appeal' },
                                  { title: 'Puntos VIP', sub: 'Desbloqueo', icon: Crown, color: 'text-brand-purple', bg: 'bg-purple-950/30 border-brand-purple/20', path: '/training/bloqueos/vip' },
                              ].map((btn, idx) => (
                                  <button 
                                      key={idx} 
                                      onClick={() => navigate(btn.path)}
                                      className={`w-full flex items-center justify-between p-4 rounded-2xl border ${btn.bg} active:scale-98 transition-all group`}
                                  >
                                      <div className="flex items-center space-x-4">
                                          <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                                              <btn.icon size={20} className={btn.color} strokeWidth={2} />
                                          </div>
                                          <div className="text-left">
                                              <span className="block text-sm font-black text-white uppercase leading-none mb-1">{btn.title}</span>
                                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{btn.sub}</span>
                                          </div>
                                      </div>
                                      <div className="bg-white/5 p-2 rounded-full text-gray-500 group-hover:text-white transition-colors">
                                          <ArrowUpRight size={16} />
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* --- SPECIAL MODULE: LIVE DATA --- */}
                  {module.id === 'live-data' && (
                      <div className="mb-12 animate-fade-in">
                          <div className="w-[calc(100%+4rem)] -ml-8 relative">
                               <div ref={scrollRef} className="overflow-x-auto scrollbar-hide flex space-x-4 py-4 px-8 cursor-grab active:cursor-grabbing" onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
                                  {[...liveDataSteps, ...liveDataSteps].map((imgUrl, index) => (
                                      <div key={index} className="relative group/card w-72 flex-shrink-0 select-none">
                                          <button onClick={() => setSelectedImage(imgUrl)} className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 active:scale-95 transition-transform">
                                              <img src={imgUrl} alt="Step" className="w-full h-auto block pointer-events-none" />
                                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Ampliar</span>
                                              </div>
                                          </button>
                                      </div>
                                  ))}
                               </div>
                          </div>
                      </div>
                  )}

                  {/* --- RESOURCES GRID (Colored Cards) --- */}
                  {module.resources && module.resources.length > 0 && (
                      <div className="mb-8">
                          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                              <h3 className="text-xs font-black uppercase tracking-widest text-white">Herramientas</h3>
                              <Folder size={14} className="text-brand-purple" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              {module.resources.map((resource: any, index: number) => {
                                  const Icon = getResourceIcon(resource.style?.iconName, resource.type);
                                  const variant = RESOURCE_VARIANTS[index % RESOURCE_VARIANTS.length];
                                  
                                  return (
                                      <button 
                                          key={index} 
                                          onClick={() => handleResourceClick(resource.type, resource.title)} 
                                          className={`relative p-5 h-32 w-full text-left rounded-[2rem] active:scale-[0.96] transition-transform shadow-lg overflow-hidden group flex flex-col justify-between border-[5px] ${variant.bg} ${variant.border}`}
                                      >
                                          <div className={`relative z-10 w-fit p-2 rounded-xl backdrop-blur-md ${variant.iconBg}`}>
                                              <Icon size={20} className={variant.iconColor} strokeWidth={2} />
                                          </div>
                                          
                                          <div className="relative z-10">
                                              <span className={`block text-xs font-black uppercase leading-tight tracking-wide pr-2 ${variant.text}`}>
                                                  {resource.title}
                                              </span>
                                          </div>

                                          {/* Decorative Icon */}
                                          <Icon 
                                              className={`absolute -bottom-4 -right-4 opacity-10 rotate-[-15deg] group-hover:scale-110 group-hover:rotate-0 transition-all duration-500 pointer-events-none ${variant.text === 'text-white' ? 'text-white' : 'text-black'}`} 
                                              size={80} 
                                              strokeWidth={1} 
                                          />
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {/* --- FOOTER --- */}
                  <div className="pt-8 border-t border-white/10 flex justify-center">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          StreamAgency Academy • 2025
                      </p>
                  </div>

              </div>
          </div>
      </div>
    </div>
  );
};

export default TrainingDetail;
