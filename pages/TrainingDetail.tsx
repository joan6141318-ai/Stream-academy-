import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronLeft, Table, Calculator, Wallet, CreditCard, ScrollText, Folder, ShieldAlert, MessageSquareWarning, Gift, AlertTriangle, UserX, ShieldCheck, Clock, BarChart3, ZoomIn, AlertOctagon, Gavel, Sparkles, Check, PlayCircle, ExternalLink, X } from 'lucide-react';
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
      case 'table': return { bg: 'bg-blue-500 dark:bg-blue-600', shadow: 'shadow-blue-500/30' };
      case 'calc': return { bg: 'bg-orange-500 dark:bg-orange-600', shadow: 'shadow-orange-500/30' };
      case 'wallet': return { bg: 'bg-emerald-500 dark:bg-emerald-600', shadow: 'shadow-emerald-500/30' };
      case 'card': return { bg: 'bg-violet-500 dark:bg-violet-600', shadow: 'shadow-violet-500/30' };
      case 'doc': return { bg: 'bg-rose-500 dark:bg-rose-600', shadow: 'shadow-rose-500/30' };
      default: return { bg: 'bg-gray-500', shadow: 'shadow-gray-500/30' };
    }
  };

  const handleResourceClick = (type: string, title: string) => {
    if (type === 'calc') navigate('/tools/calculator');
    else if (type === 'table') navigate('/tools/payment-table');
    else alert(`Abriendo recurso: ${title}`);
  };

  const handleOpenVideo = () => {
      if (module?.videoUrl && module.videoUrl !== '#') {
          window.open(module.videoUrl, '_blank', 'noopener,noreferrer');
      } else {
          alert("Video no disponible por el momento.");
      }
  };

  if (loading) return <div className="h-full w-full bg-white dark:bg-black flex items-center justify-center text-xs">Cargando...</div>;
  if (!module) return <div className="h-full w-full bg-white dark:bg-black flex items-center justify-center text-xs">Módulo no encontrado</div>;

  const liveDataSteps = [ "https://i.postimg.cc/gJkXHjq3/4_20251123_185808_0001.png", "https://i.postimg.cc/SsN2fR7W/5_20251123_185808_0002.png", "https://i.postimg.cc/ZRKBxnFN/6_20251123_185808_0003.png" ];

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black relative transition-colors duration-300">
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-safe right-4 text-white/70 hover:text-white p-2"><X size={32} /></button>
            <img src={selectedImage} alt="Zoom" className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
          <div className="pt-safe w-full">
            <div className="flex items-center justify-between px-4 h-16">
                <button onClick={() => navigate('/training')} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-black/60 pointer-events-auto cursor-pointer transition-transform active:scale-95 shadow-lg border border-white/10">
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
            </div>
          </div>
      </div>

      <div className="h-[40vh] w-full relative flex-shrink-0 bg-brand-black">
        <img src={module.imageUrl} alt={module.title} className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-black/40 transition-colors duration-300"></div>
        <div className="absolute bottom-0 left-0 w-full px-6 pb-6">
            <span className="text-[10px] font-black text-white bg-brand-purple px-2 py-1 uppercase tracking-widest mb-3 inline-block shadow-sm">Módulo</span>
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-[0.9] drop-shadow-sm mb-1">{module.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-black flex flex-col px-6 pt-4 pb-safe transition-colors duration-300 -mt-1 relative z-10">
        <div className="mb-8">
            <div className="h-1 w-10 bg-brand-purple mb-4"></div>
            <h2 className="text-lg font-bold text-brand-black dark:text-white leading-tight mb-4">{module.description}</h2>
            
            {/* VIDEO BUTTON IMPLEMENTED */}
            {module.videoUrl && module.videoUrl !== '#' && (
                <button 
                    onClick={handleOpenVideo}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-4 px-4 rounded-xl flex items-center justify-center space-x-3 mb-6 shadow-xl active:scale-98 transition-transform group"
                >
                    <div className="bg-white/20 dark:bg-black/10 p-1 rounded-full group-hover:bg-brand-purple group-hover:text-white transition-colors">
                        <PlayCircle size={20} fill="currentColor" className="text-white dark:text-black group-hover:text-white" />
                    </div>
                    <div className="text-left">
                        <span className="text-xs font-black uppercase tracking-widest block">Ver Video Tutorial</span>
                    </div>
                    <ExternalLink size={14} className="opacity-50" />
                </button>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-justify mb-8 whitespace-pre-line">{module.textContent}</p>

            {module.id === 'live-data' && (
                <div className="mt-2 mb-10 space-y-8 animate-fade-in">
                    <div className="w-[calc(100%+3rem)] -ml-6 relative group">
                         <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-black to-transparent z-20 pointer-events-none"></div>
                         <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-black to-transparent z-20 pointer-events-none"></div>
                         <div ref={scrollRef} className="overflow-x-auto scrollbar-hide flex space-x-4 py-4 px-6 cursor-grab active:cursor-grabbing" onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onMouseLeave={() => setIsPaused(false)}>
                            {[...liveDataSteps, ...liveDataSteps].map((imgUrl, index) => (
                                <div key={index} className="relative group/card w-64 flex-shrink-0 select-none">
                                    <button onClick={() => setSelectedImage(imgUrl)} className="w-full relative rounded-lg overflow-hidden shadow-lg border border-gray-100 dark:border-white/10">
                                        <img src={imgUrl} alt="Step" className="w-full h-auto block pointer-events-none" />
                                    </button>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            )}

            {module.resources && module.resources.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 dark:border-white/10 pb-2">Herramientas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {module.resources.map((resource: any, index: number) => {
                    const defaultStyle = getResourceConfig(resource.type);
                    const style = resource.style || defaultStyle;
                    const Icon = getResourceIcon(resource.style?.iconName, resource.type);
                    return (
                      <button key={index} onClick={() => handleResourceClick(resource.type, resource.title)} className={`relative flex flex-col justify-between p-3 h-20 w-full text-left rounded-sm active:scale-[0.97] transition-transform duration-200 shadow-md ${style.shadow} overflow-hidden group`}>
                         <img src={resource.imageUrl || module.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover z-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                         <div className={`absolute inset-0 z-10 ${style.bg}`} style={{ opacity: style.cardOpacity !== undefined ? style.cardOpacity : 1 }}></div>
                        <div className="relative z-20 flex flex-col h-full justify-between">
                           <div className="bg-white/20 w-fit p-1 rounded-[2px] backdrop-blur-sm"><Icon size={14} className="text-white" strokeWidth={3} /></div>
                           <span className="text-[11px] font-black uppercase leading-tight text-white tracking-wide pr-4">{resource.title}</span>
                        </div>
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
