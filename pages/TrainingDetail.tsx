
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronLeft, Table, Calculator, Wallet, CreditCard, ScrollText, Folder, PlayCircle, ExternalLink, X, ShieldAlert, Clock, Gavel, Crown, ArrowUpRight, Play, Pause, Share2, Info, CheckCircle2, Zap, LayoutGrid, Volume2, VolumeX, Maximize } from 'lucide-react';
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

  // VIDEO PLAYER STATES
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
      if (modules.length > 0) {
          const found = modules.find(m => m.id === topicId);
          setModule(found);
      }
  }, [modules, topicId]);

  // --- STATUS BAR EFFECT ---
  useEffect(() => {
      const metaThemeColor = document.querySelector("meta[name=theme-color]");
      // If Bigo module (Clean Light mode), set status bar to light gray, else black
      const color = topicId === 'bigo-live' ? '#F5F5F7' : '#000000';
      
      if (metaThemeColor) {
          metaThemeColor.setAttribute("content", color);
      }

      return () => {
          // Reset based on system pref
          const isDark = document.documentElement.classList.contains('dark');
          const resetColor = isDark ? '#000000' : '#ffffff';
          if (metaThemeColor) {
              metaThemeColor.setAttribute("content", resetColor);
          }
      };
  }, [topicId]);

  // Auto-scroll logic for Live Data
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

  // Video Player Logic
  const togglePlay = () => {
      if (!videoRef.current) return;
      if (isPlaying) {
          videoRef.current.pause();
      } else {
          videoRef.current.play();
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

  // ==========================================
  // DISEÑO ESPECIAL: BIGO LIVE (Clean Light)
  // ==========================================
  if (module.id === 'bigo-live') {
      // FORCE VIDEO URL TO BYPASS ANY DB CACHE ISSUES
      const forcedVideoUrl = 'https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Videos%2FUnleash%20Your%20Story%20and%20Embark%20on%20a%20Global%20Journey%20with%20Bigo%20Live!%20%F0%9F%8C%8E%F0%9F%8E%99%EF%B8%8F%F0%9F%93%BD%EF%B8%8FJoin%20the%20%23BigoFam%20toda.mp4?alt=media&token=e1107b22-5702-4f38-bc09-241c2b2fd691';

      return (
        <div className="flex flex-col h-full w-full bg-[#F5F5F7] text-brand-black relative font-sans overflow-hidden">
            
            {/* Header Clean */}
            <div className="px-6 pt-safe flex items-center justify-between py-4 bg-[#F5F5F7] z-20">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                        <LayoutGrid size={16} className="text-black" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Academy</span>
                </div>
                <button onClick={() => navigate('/training')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-black active:scale-95 transition-transform">
                    <X size={20} />
                </button>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-24">
                
                {/* Title Section */}
                <div className="mt-4 mb-6">
                    <h1 className="text-4xl font-black text-black uppercase leading-[0.9] tracking-tighter mb-2">
                        ¿Qué es<br/>Bigo Live?
                    </h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Introducción a la Plataforma
                    </p>
                </div>

                {/* 1. CUSTOM VIDEO PLAYER CARD */}
                <div 
                    className="w-full aspect-[4/3] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 border-[5px] border-white relative mb-6 group"
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => isPlaying && setShowControls(false)}
                >
                    {/* Always use forced video URL for this module to ensure update */}
                    <video
                        ref={videoRef}
                        src={forcedVideoUrl}
                        className="w-full h-full object-cover"
                        poster={module.imageUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        onClick={togglePlay}
                        playsInline
                    />
                    
                    {/* Center Play Button (Visible when paused) */}
                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 backdrop-blur-sm transition-opacity">
                            <button 
                                onClick={togglePlay}
                                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl text-white hover:scale-110 transition-transform"
                            >
                                <Play size={28} fill="currentColor" className="ml-1" />
                            </button>
                        </div>
                    )}

                    {/* Controls Overlay */}
                    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-6 pt-12 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                        
                        {/* Progress Bar */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleSeek}
                            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer mb-4 accent-white hover:accent-brand-purple"
                        />

                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <button onClick={togglePlay} className="hover:text-gray-300 transition-colors">
                                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                </button>
                                <button onClick={toggleMute} className="hover:text-gray-300 transition-colors">
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                            </div>
                            <button onClick={toggleFullscreen} className="hover:text-gray-300 transition-colors">
                                <Maximize size={20} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full z-20 shadow-lg pointer-events-none">
                        <span className="text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Video
                        </span>
                    </div>
                </div>

                {/* 2. FICHA INFORMATIVA (Gris con Marco Blanco) */}
                <div className="bg-gray-200 p-6 rounded-[2.5rem] border-[5px] border-white shadow-xl relative overflow-hidden group">
                    
                    {/* Header Info */}
                    <div className="relative z-10 flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-brand-black uppercase leading-none tracking-tight mb-1">
                                Conceptos Básicos
                            </h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide flex items-center gap-1">
                                <Clock size={12} /> Duración: 5 Min
                            </p>
                        </div>
                        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-white/50">
                            <Info size={20} className="text-brand-black" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Description Text */}
                    <div className="relative z-10 mb-6">
                        <p className="text-sm font-medium text-gray-600 leading-relaxed text-justify">
                            {module.textContent}
                        </p>
                    </div>

                    {/* Action Button */}
                    <button className="relative z-10 w-full bg-brand-black text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 active:scale-[0.98] transition-all shadow-lg hover:bg-gray-900">
                        <span>Descargar PDF</span>
                        <Download size={16} />
                    </button>

                    {/* Decor Icon */}
                    <PlayCircle className="absolute -bottom-6 -right-6 text-brand-black/5 rotate-[-15deg] group-hover:scale-110 transition-transform duration-500" size={140} strokeWidth={1.5} />
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-center space-x-2 opacity-50 py-8">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Contenido Verificado 2025</span>
                </div>

            </div>
        </div>
      );
  }

  // ==========================================
  // DISEÑO ESTÁNDAR: DARK MODE (Otros Módulos)
  // ==========================================
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
                      
                      {/* Subtitle updated: removed uppercase for better reading */}
                      <div className="flex items-start text-white/70 text-xs font-bold tracking-wide mb-6 leading-tight">
                          <Info size={14} className="mr-2 text-brand-purple flex-shrink-0 mt-0.5" />
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

                  {/* Body Text - UPDATED: text-left instead of text-justify */}
                  <div className="mb-12">
                      <div className="prose prose-sm prose-invert max-w-none">
                          <p className="text-sm text-gray-300 leading-7 font-medium text-left whitespace-pre-line">
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
                          <div className="space-y-4">
                              {[
                                  { title: 'Motivos', sub: 'Lo Prohibido', icon: ShieldAlert, path: '/training/bloqueos/motivos' },
                                  { title: 'Duración', sub: 'Tiempos', icon: Clock, path: '/training/bloqueos/types' },
                                  { title: 'Apelaciones', sub: 'Recuperación', icon: Gavel, path: '/training/bloqueos/appeal' },
                                  { title: 'Puntos VIP', sub: 'Desbloqueo', icon: Crown, path: '/training/bloqueos/vip' },
                              ].map((btn, idx) => {
                                  // Define variants style sequence: Orange, Black, Gray, Purple
                                  const variants = [
                                      { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-white', sub: 'text-orange-100', iconBg: 'bg-white/20', iconColor: 'text-white', decorColor: 'text-white' },
                                      { bg: 'bg-black', border: 'border-[#1A1A1A]', text: 'text-white', sub: 'text-gray-400', iconBg: 'bg-white/10', iconColor: 'text-white', decorColor: 'text-white' },
                                      { bg: 'bg-gray-200', border: 'border-white', text: 'text-brand-black', sub: 'text-gray-600', iconBg: 'bg-white', iconColor: 'text-brand-black', decorColor: 'text-brand-black' },
                                      { bg: 'bg-brand-purple', border: 'border-violet-500', text: 'text-white', sub: 'text-purple-200', iconBg: 'bg-white/20', iconColor: 'text-white', decorColor: 'text-white' }
                                  ];
                                  const variant = variants[idx % variants.length];
                                  const Icon = btn.icon;

                                  return (
                                      <button 
                                          key={idx} 
                                          onClick={() => navigate(btn.path)}
                                          // Update: border-4 instead of border-[5px] for these inner cards
                                          className={`w-full relative p-6 rounded-[2.5rem] border-4 overflow-hidden ${variant.bg} ${variant.border} shadow-xl active:scale-[0.98] transition-all group text-left h-32 flex flex-col justify-between`}
                                      >
                                          {/* Header */}
                                          <div className="relative z-10 flex justify-between items-start w-full">
                                              <div className={`p-2.5 rounded-2xl backdrop-blur-md border border-white/10 ${variant.iconBg}`}>
                                                  <Icon size={20} className={variant.iconColor} strokeWidth={2.5} />
                                              </div>
                                              <div className={`px-3 py-1 rounded-full border border-white/10 ${variant.iconBg}`}>
                                                  <ArrowUpRight size={14} className={variant.iconColor} />
                                              </div>
                                          </div>

                                          {/* Text */}
                                          <div className="relative z-10">
                                              <span className={`block text-xl font-black uppercase leading-none mb-1 tracking-tight ${variant.text}`}>{btn.title}</span>
                                              <span className={`text-[10px] font-bold uppercase tracking-widest ${variant.sub}`}>{btn.sub}</span>
                                          </div>

                                          {/* Decor Icon - Standardized Rotation */}
                                          <Icon 
                                              className={`absolute -bottom-6 -right-6 rotate-[-15deg] opacity-10 group-hover:scale-110 group-hover:rotate-0 transition-all duration-500 pointer-events-none ${variant.decorColor}`} 
                                              size={100} 
                                              strokeWidth={1.5} 
                                          />
                                      </button>
                                  );
                              })}
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
                                          // Update: border-4 instead of border-[5px]
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

                                          {/* Decorative Icon - Standardized */}
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
