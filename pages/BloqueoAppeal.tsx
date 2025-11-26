import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, AlertTriangle, FileText, CheckCircle2, XCircle, Crown, ZoomIn, X, Info, Smartphone, Eye, Check, ListChecks, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';

const BloqueoAppeal: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    {
      src: "https://i.postimg.cc/fW9gz2my/IMG_20251125_192533.jpg",
      label: "Pantalla de Notificación",
      desc: "Así se ve la notificación oficial de bloqueo."
    },
    {
      src: "https://i.postimg.cc/kMbhJ1KD/IMG_20251125_192609.jpg",
      label: "Estado de Solicitud",
      desc: "Panel donde podrás revisar el estatus de tu caso."
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300 relative">
      <Header title="Centro de Apelaciones" showBack onBack={() => navigate('/training/bloqueos')} />

      {/* Lightbox for Images */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-safe right-4 text-white/70 hover:text-white p-2">
                <X size={32} />
            </button>
            <div className="relative w-full max-w-lg">
                <img 
                    src={selectedImage} 
                    alt="Zoom view" 
                    className="w-full h-auto object-contain rounded-xl shadow-2xl border border-white/10"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
             <p className="absolute bottom-10 text-white/50 text-xs font-bold uppercase tracking-widest">Toca fuera para cerrar</p>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-24">
        
        {/* Header Hero */}
        <div className="mt-6 mb-8 px-2">
            <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full mb-3">
                <Gavel size={14} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-wide">Soporte Técnico</span>
            </div>
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight mb-2">
                Gestión de<br/>Apelaciones
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xs">
                Proceso oficial para la revisión y levantamiento de sanciones injustificadas.
            </p>
        </div>

        {/* 1. Process Card (Premium Vibrant Purple) */}
        <div className="relative bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-2xl shadow-xl shadow-purple-900/30 overflow-hidden mb-6 group border border-purple-500/20">
            
            <div className="p-6 relative">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mb-1">Concepto</span>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">
                            Solicitud de Revisión
                        </h3>
                    </div>
                    <div className="bg-white/20 p-2.5 rounded-xl shadow-sm backdrop-blur-sm border border-white/10">
                        <FileText size={20} className="text-white" strokeWidth={2} />
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-xs text-white/90 leading-relaxed text-justify mb-5 font-medium">
                        El emisor bloqueado puede enviar una apelación. Si Soporte Técnico determina que el bloqueo no amerita sanción, <span className="text-white font-black underline decoration-purple-300 underline-offset-2">aprobará la solicitud</span> permitiendo reanudar actividades al instante.
                    </p>

                    <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 size={16} className="text-green-400" />
                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide">
                                Proceso Gratuito
                            </span>
                        </div>
                        <span className="text-[10px] font-black text-purple-600 bg-white px-2 py-1 rounded shadow-sm border border-white/20">
                            0 PUNTOS
                        </span>
                    </div>
                </div>
                
                {/* Background Decor */}
                <FileText className="absolute -right-4 -bottom-4 text-white/10 rotate-[-15deg]" size={100} />
            </div>
        </div>

        {/* 2. Warning Card (Premium Vibrant Rose/Pink) */}
        <div className="relative bg-gradient-to-br from-rose-600 to-pink-600 p-6 rounded-2xl shadow-xl shadow-rose-900/30 overflow-hidden mb-6 border border-rose-500/20">
             
             {/* Icon Header */}
             <div className="flex items-center space-x-3 mb-3 relative z-10">
                <div className="bg-white/20 p-2 rounded-full border border-white/10 backdrop-blur-sm">
                    <AlertTriangle className="text-white" size={18} strokeWidth={2.5} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">
                    Impacto en Horas
                </h4>
            </div>
            
            <div className="relative z-10">
                <p className="text-xs text-white/90 font-medium leading-relaxed text-justify pl-1">
                    Las horas transmitidas durante ese día <span className="font-black bg-black/20 px-1.5 py-0.5 rounded mx-0.5 border border-white/10 text-white">NO CONTARÁN</span> para las metas mensuales. Deberás reanudar el conteo de tus horas válidas desde cero una vez levantada la sanción.
                </p>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
             {/* Decor Icon */}
            <AlertTriangle className="absolute -right-4 -bottom-4 text-white/10 rotate-[-15deg]" size={100} />
        </div>

        {/* 3. Steps Card (New Vibrant Blue/Sky) */}
        <div className="relative bg-gradient-to-br from-sky-600 to-blue-600 p-6 rounded-2xl shadow-xl shadow-blue-900/30 overflow-hidden mb-8 border border-blue-500/20">
            <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Guía Rápida</span>
                     <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">
                         ¿Qué pasos debo seguir?
                     </h3>
                 </div>
                 <div className="bg-white/20 p-2.5 rounded-xl shadow-sm backdrop-blur-sm border border-white/10">
                     <ListChecks size={20} className="text-white" strokeWidth={2} />
                 </div>
            </div>

            <div className="relative z-10 space-y-3">
                <div className="flex items-start group">
                    <div className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white mr-3 mt-0.5 border border-white/10 shadow-sm flex-shrink-0">1</div>
                    <p className="text-xs text-white/90 font-medium leading-snug">
                        Ingresa a tu <span className="font-bold text-white">Perfil</span> y revisa tu bandeja de mensajes del sistema.
                    </p>
                </div>
                <div className="flex items-start group">
                    <div className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white mr-3 mt-0.5 border border-white/10 shadow-sm flex-shrink-0">2</div>
                    <p className="text-xs text-white/90 font-medium leading-snug">
                        Localiza la notificación de sanción y da clic en el enlace de <span className="font-bold text-white">Apelación</span>.
                    </p>
                </div>
                <div className="flex items-start group">
                    <div className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white mr-3 mt-0.5 border border-white/10 shadow-sm flex-shrink-0">3</div>
                    <p className="text-xs text-white/90 font-medium leading-snug">
                        Llena el formulario explicando tu caso y adjunta pruebas si es necesario.
                    </p>
                </div>
                <div className="flex items-start group">
                    <div className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white mr-3 mt-0.5 border border-white/10 shadow-sm flex-shrink-0">4</div>
                    <p className="text-xs text-white/90 font-medium leading-snug">
                        Espera la resolución del área de Soporte Técnico (aprox. 24hrs).
                    </p>
                </div>
            </div>

            {/* Decor Icon */}
            <ListChecks className="absolute -right-6 -bottom-6 text-white/10 rotate-[10deg]" size={120} />
        </div>

        {/* 4. Visual References (Device Mockup Style) */}
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Guía Visual</h3>
                <span className="text-[10px] font-bold text-brand-purple bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-sm">
                    Screenshots
                </span>
            </div>
            
            <div className="space-y-8">
                {images.map((img, idx) => (
                    <div 
                        key={idx} 
                        className="group relative cursor-zoom-in transform transition-all duration-300 active:scale-[0.98]" 
                        onClick={() => setSelectedImage(img.src)}
                    >
                        {/* Mockup Frame - PURPLE/INDIGO GRADIENT */}
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-3 pb-8 rounded-2xl shadow-2xl shadow-indigo-500/20 relative overflow-hidden border border-white/20">
                            
                            {/* Glass Shine Effect */}
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                            {/* Header Mockup */}
                            <div className="flex items-center justify-between mb-3 px-1 relative z-10">
                                <div className="flex items-center space-x-2">
                                    <Smartphone size={14} className="text-white/80" />
                                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider shadow-sm">{img.label}</span>
                                </div>
                                <div className="bg-black/20 p-1.5 rounded-full hover:bg-black/30 transition-colors backdrop-blur-sm">
                                    <Eye size={12} className="text-white" />
                                </div>
                            </div>

                            {/* Image Container */}
                            <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-inner bg-black">
                                <img 
                                    src={img.src} 
                                    alt={img.label} 
                                    className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                />
                                {/* Overlay Hint */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                     <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center shadow-xl border border-white/10">
                                        <ZoomIn size={14} className="mr-1.5" />
                                        <span className="text-[10px] font-bold uppercase">Ampliar</span>
                                     </div>
                                </div>
                            </div>

                            {/* Description Footer */}
                            <div className="mt-3 px-1 relative z-10">
                                <p className="text-[10px] text-white/80 font-medium leading-tight drop-shadow-sm">
                                    {img.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 5. Alternative / Footer VIP CTA */}
        <button 
            onClick={() => navigate('/training/bloqueos/vip')}
            className="w-full bg-gradient-to-r from-gray-900 to-black dark:from-[#111] dark:to-black text-white p-1 rounded-2xl shadow-lg group active:scale-[0.98] transition-all"
        >
             <div className="bg-[#0a0a0a] rounded-xl p-5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="bg-amber-500/20 p-2.5 rounded-lg border border-amber-500/20">
                            <Crown size={20} className="text-amber-500" fill="currentColor" fillOpacity={0.3} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-xs font-black uppercase tracking-wide text-white mb-0.5">
                                ¿Apelación rechazada?
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium">
                                Consulta el desbloqueo vía Puntos VIP
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/10 px-3 py-1.5 rounded-full">
                        <span className="text-[10px] font-bold uppercase text-white">Ver Opciones</span>
                    </div>
                </div>
             </div>
        </button>

      </div>
    </div>
  );
};

export default BloqueoAppeal;