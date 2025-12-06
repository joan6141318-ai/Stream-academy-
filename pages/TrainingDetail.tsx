
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronLeft, Table, Calculator, Wallet, CreditCard, ScrollText, Folder, PlayCircle, ExternalLink, X, ShieldAlert, Clock, Gavel, Crown, ArrowUpRight, Play, Pause, Share2, Info, CheckCircle2, Zap, LayoutGrid, Volume2, VolumeX, Maximize, Check, BookOpen, Layers, MonitorPlay } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import * as LucideIcons from 'lucide-react';

const RESOURCE_VARIANTS = [
    {
      bg: 'bg-orange-500',
      border: 'border-orange-400',
      text: 'text-white',
      iconBg: 'bg-white/20',
      iconColor: 'text-white'
    },
    {
      bg: 'bg-gray-200 dark:bg-[#1A1A1A]',
      border: 'border-white dark:border-white/10',
      text: 'text-brand-black dark:text-white',
      iconBg: 'bg-white dark:bg-white/10',
      iconColor: 'text-brand-black dark:text-white'
    },
    {
      bg: 'bg-brand-purple',
      border: 'border-violet-500',
      text: 'text-white',
      iconBg: 'bg-white/20',
      iconColor: 'text-white'
    },
    {
      bg: 'bg-brand-black dark:bg-white',
      border: 'border-[#1A1A1A] dark:border-gray-200',
      text: 'text-white dark:text-black',
      iconBg: 'bg-white/10 dark:bg-black/10',
      iconColor: 'text-white dark:text-black'
    }
];

const TrainingDetail: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { modules, loading } = useContent();
  const { logAction } = useAuth();
  const [module, setModule] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // VIDEO PLAYER STATES
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Initial Fetch & Logging
  useEffect(() => {
      if (modules.length > 0 && topicId) {
          const found = modules.find(m => m.id === topicId);
          setModule(found);
          if (found) {
              logAction(`Visitó módulo: ${found.title}`, 'module_view');
          }
      }
  }, [modules, topicId]);

  // Video Player Logic
  const togglePlay = () => {
      if (!videoRef.current) return;
      if (isPlaying) {
          videoRef.current.pause();
          setShowControls(true);
      } else {
          videoRef.current.play();
          setShowControls(false);
      }
      setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
      if (!videoRef.current) return;
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!videoRef.current) return;
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
  };

  const toggleMute = () => {
      if (!videoRef.current) return;
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
      if (!videoRef.current) return;
      if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
      }
  };

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

  if (loading) return <div className="h-full w-full bg-white dark:bg-black flex items-center justify-center text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">Cargando...</div>;
  if (!module) return <div className="h-full w-full bg-white dark:bg-black flex items-center justify-center text-xs font-black uppercase tracking-widest text-gray-400">Módulo no encontrado</div>;

  const liveDataSteps = [ "https://i.postimg.cc/gJkXHjq3/4_20251123_185808_0001.png", "https://i.postimg.cc/SsN2fR7W/5_20251123_185808_0002.png", "https://i.postimg.cc/ZRKBxnFN/6_20251123_185808_0003.png" ];
  
  // VERIFICACIÓN DE VIDEO UNIVERSAL: Si tiene videoUrl y no es '#', muestra el reproductor
  const hasVideo = module.videoUrl && module.videoUrl !== '#' && module.videoUrl.trim() !== '';
  const videoSource = module.videoUrl;

  return (
    <div className="flex flex-col h-full w-full bg-[#F5F5F7] dark:bg-black text-brand-black dark:text-white relative font-sans overflow-hidden transition-colors duration-300">
      
      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-safe right-4 text-white/70 hover:text-white p-2"><X size={32} /></button>
            <img src={selectedImage} alt="Zoom" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Header Clean (Floating) */}
      <div className="px-6 pt-safe flex items-center justify-between py-4 z-20 bg-[#F5F5F7]/90 dark:bg-black/90 backdrop-blur-md sticky top-0">
          <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white dark:bg-[#1A1A1A] rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10">
                  <LayoutGrid size={16} className="text-black dark:text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Academy</span>
          </div>
          <button onClick={() => navigate('/training')} className="w-10 h-10 bg-white dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 text-black dark:text-white active:scale-95 transition-transform">
              <X size={20} />
          </button>
      </div>

      {/* Content Scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-24">
          
          {/* Title Section */}
          <div className="mt-4 mb-6">
              <h1 className="text-4xl font-black text-brand-black dark:text-white uppercase leading-[0.9] tracking-tighter mb-2">
                  {module.title}
              </h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest line-clamp-1">
                  {module.description}
              </p>
          </div>

          {/* === HERO AREA: VIDEO OR IMAGE === */}
          {hasVideo ? (
            <div 
                className="w-full aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 dark:shadow-purple-900/10 border-[5px] border-white dark:border-[#1A1A1A] relative mb-6 group"
                onClick={() => { if(isPlaying) setShowControls(!showControls); }}
            >
                <video
                    ref={videoRef}
                    src={videoSource}
                    className="w-full h-full object-cover"
                    poster={module.imageUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                />
                
                {/* Center Play Button */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 backdrop-blur-sm transition-opacity" onClick={togglePlay}>
                        <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl text-white hover:scale-110 transition-transform">
                            <Play size={28} fill="currentColor" className="ml-1" />
                        </button>
                    </div>
                )}

                {/* Controls */}
                <div 
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-6 pt-12 transition-opacity duration-300 ${!isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${showControls ? 'opacity-100' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="range" min="0" max="100" value={progress} onChange={handleSeek}
                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer mb-4 accent-white hover:accent-brand-purple"
                    />
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="hover:text-gray-300 transition-colors">{isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
                            <button onClick={toggleMute} className="hover:text-gray-300 transition-colors">{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                        </div>
                        <button onClick={toggleFullscreen} className="hover:text-gray-300 transition-colors"><Maximize size={20} /></button>
                    </div>
                </div>
                
                {/* Badge Overlay */}
                <div className={`absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full z-20 shadow-lg pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Video
                    </span>
                </div>
            </div>
          ) : (
            <div className="w-full h-64 rounded-[2.5rem] overflow-hidden shadow-xl border-[5px] border-white dark:border-[#1A1A1A] relative mb-6">
                <img src={module.imageUrl} alt={module.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                        Conceptos
                    </span>
                </div>
            </div>
          )}

          {/* === CONTENT CARD === */}
          <div className="bg-gray-200 dark:bg-[#111] p-6 rounded-[2.5rem] border-[5px] border-white dark:border-[#1A1A1A] shadow-xl relative overflow-hidden group">
              
              {/* Header Info */}
              <div className="relative z-10 flex justify-between items-start mb-6">
                  <div>
                      <h2 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight mb-1">
                          Información
                      </h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wide flex items-center gap-1">
                          <Clock size={12} /> Lectura: 3 Min
                      </p>
                  </div>
                  <div className="bg-white dark:bg-white/10 p-2.5 rounded-2xl shadow-sm border border-white/50 dark:border-white/5">
                      <Info size={20} className="text-brand-black dark:text-white" strokeWidth={2.5} />
                  </div>
              </div>

              {/* Description Text */}
              <div className="relative z-10 mb-6">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed text-justify whitespace-pre-line">
                      {module.textContent}
                  </p>
              </div>

              {/* Action Button (Optional) */}
              {!module.resources && (
                  <button className="relative z-10 w-full bg-brand-black dark:bg-white text-white dark:text-black h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 active:scale-[0.98] transition-all shadow-lg mb-2">
                      <span>Marcar como Leído</span>
                      <CheckCircle2 size={16} />
                  </button>
              )}

              {/* Decor Icon */}
              <PlayCircle className="absolute -top-10 -right-10 text-brand-black/5 dark:text-white/5 rotate-[15deg] pointer-events-none" size={180} strokeWidth={1.5} />
          </div>

          {/* === DYNAMIC SECTIONS === */}

          {/* 1. Resources Grid */}
          {module.resources && module.resources.length > 0 && (
              <div className="mt-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Recursos</h3>
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
                                  className={`relative p-5 h-32 w-full text-left rounded-[2rem] active:scale-[0.96] transition-transform shadow-lg overflow-hidden group flex flex-col justify-between border-4 ${variant.bg} ${variant.border}`}
                              >
                                  <div className={`relative z-10 w-fit p-2 rounded-xl backdrop-blur-md ${variant.iconBg}`}>
                                      <Icon size={20} className={variant.iconColor} strokeWidth={2} />
                                  </div>
                                  
                                  <div className="relative z-10">
                                      <span className={`block text-xs font-black uppercase leading-tight tracking-wide pr-2 ${variant.text}`}>
                                          {resource.title}
                                      </span>
                                  </div>

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

          {/* 2. Special Section: Bloqueos Navigation */}
          {module.id === 'bloqueos' && (
              <div className="mt-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Normativa</h3>
                      <ShieldAlert size={14} className="text-brand-purple" />
                  </div>
                  <div className="space-y-4">
                      {[
                          { title: 'Motivos', sub: 'Lo Prohibido', icon: ShieldAlert, path: '/training/bloqueos/motivos' },
                          { title: 'Duración', sub: 'Tiempos', icon: Clock, path: '/training/bloqueos/types' },
                          { title: 'Apelaciones', sub: 'Recuperación', icon: Gavel, path: '/training/bloqueos/appeal' },
                          { title: 'Puntos VIP', sub: 'Desbloqueo', icon: Crown, path: '/training/bloqueos/vip' },
                      ].map((btn, idx) => {
                          const variants = RESOURCE_VARIANTS;
                          const variant = variants[idx % variants.length];
                          const Icon = btn.icon;

                          return (
                              <button 
                                  key={idx} 
                                  onClick={() => navigate(btn.path)}
                                  className={`w-full relative p-6 rounded-[2.5rem] border-4 overflow-hidden ${variant.bg} ${variant.border} shadow-xl active:scale-[0.98] transition-all group text-left h-32 flex flex-col justify-between`}
                              >
                                  <div className="relative z-10 flex justify-between items-start w-full">
                                      <div className={`p-2.5 rounded-2xl backdrop-blur-md border border-white/10 ${variant.iconBg}`}>
                                          <Icon size={20} className={variant.iconColor} strokeWidth={2.5} />
                                      </div>
                                      <div className={`px-3 py-1 rounded-full border border-white/10 ${variant.iconBg}`}>
                                          <ArrowUpRight size={14} className={variant.iconColor} />
                                      </div>
                                  </div>

                                  <div className="relative z-10">
                                      <span className={`block text-xl font-black uppercase leading-none mb-1 tracking-tight ${variant.text}`}>{btn.title}</span>
                                      <span className={`text-[10px] font-bold uppercase tracking-widest opacity-80 ${variant.text}`}>{btn.sub}</span>
                                  </div>

                                  <Icon className={`absolute -bottom-6 -right-6 rotate-[-15deg] opacity-10 group-hover:scale-110 group-hover:rotate-0 transition-all duration-500 pointer-events-none text-current`} size={100} strokeWidth={1.5} />
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}

          {/* 3. Special Section: Live Data Gallery */}
          {module.id === 'live-data' && (
              <div className="mt-6 animate-fade-in">
                  <div className="w-[calc(100%+3rem)] -ml-6 relative">
                       <div ref={scrollRef} className="overflow-x-auto scrollbar-hide flex space-x-4 py-4 px-6 cursor-grab active:cursor-grabbing" onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
                          {[...liveDataSteps, ...liveDataSteps].map((imgUrl, index) => (
                              <div key={index} className="relative group/card w-72 flex-shrink-0 select-none">
                                  <button onClick={() => setSelectedImage(imgUrl)} className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 active:scale-95 transition-transform">
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

          {/* Footer Info */}
          <div className="flex items-center justify-center space-x-2 opacity-50 py-8">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Contenido Verificado 2025</span>
          </div>

      </div>
    </div>
  );
};

export default TrainingDetail;
