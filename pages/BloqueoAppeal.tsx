import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, AlertTriangle, FileText, CheckCircle2, XCircle, Crown, ZoomIn, X, Info, Smartphone, Eye, Check, ListChecks, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';

const CARD_VARIANTS = [
    {
      // NARANJA
      bg: 'bg-orange-500',
      border: 'border-orange-400',
      text: 'text-white',
      sub: 'text-orange-100',
      desc: 'text-orange-50',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      decorColor: 'text-white'
    },
    {
      // NEGRO
      bg: 'bg-black',
      border: 'border-[#1A1A1A]',
      text: 'text-white',
      sub: 'text-gray-400',
      desc: 'text-gray-400',
      iconBg: 'bg-white/10',
      iconColor: 'text-white',
      decorColor: 'text-white'
    },
    {
      // GRIS LIGERO
      bg: 'bg-gray-200',
      border: 'border-white',
      text: 'text-brand-black',
      sub: 'text-gray-600',
      desc: 'text-gray-600',
      iconBg: 'bg-white',
      iconColor: 'text-brand-black',
      decorColor: 'text-brand-black'
    },
    {
      // MORADO
      bg: 'bg-brand-purple',
      border: 'border-violet-500',
      text: 'text-white',
      sub: 'text-purple-200',
      desc: 'text-purple-100',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      decorColor: 'text-white'
    }
];

const BloqueoAppeal: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const sections = [
      {
          id: 'concept',
          title: 'Solicitud de Revisión',
          label: 'Concepto',
          icon: FileText,
          content: (
              <>
                {/* Update: text-left */}
                <p className="text-xs font-medium leading-relaxed text-left mb-5 opacity-90">
                    El emisor bloqueado puede enviar una apelación. Si Soporte Técnico determina que el bloqueo no amerita sanción, <span className="font-black underline underline-offset-2">aprobará la solicitud</span> permitiendo reanudar actividades al instante.
                </p>
                <div className="flex items-center justify-between bg-black/10 rounded-xl p-3 border border-black/5 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                        <CheckCircle2 size={16} className="text-current opacity-80" />
                        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                            Proceso Gratuito
                        </span>
                    </div>
                    <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded shadow-sm">
                        0 PUNTOS
                    </span>
                </div>
              </>
          )
      },
      {
          id: 'warning',
          title: 'Impacto en Horas',
          label: 'Advertencia',
          icon: AlertTriangle,
          content: (
              /* Update: text-left */
              <p className="text-xs font-medium leading-relaxed text-left opacity-90">
                  Las horas transmitidas durante ese día <span className="font-black bg-black/20 px-1.5 py-0.5 rounded mx-0.5 border border-white/10">NO CONTARÁN</span> para las metas mensuales. Deberás reanudar el conteo de tus horas válidas desde cero una vez levantada la sanción.
              </p>
          )
      },
      {
          id: 'steps',
          title: '¿Qué pasos seguir?',
          label: 'Guía Rápida',
          icon: ListChecks,
          content: (
              <div className="space-y-3">
                {[
                    "Ingresa a tu Perfil y revisa tu bandeja de mensajes del sistema.",
                    "Localiza la notificación de sanción y da clic en el enlace de Apelación.",
                    "Llena el formulario explicando tu caso y adjunta pruebas si es necesario.",
                    "Espera la resolución del área de Soporte Técnico (aprox. 24hrs)."
                ].map((step, i) => (
                    <div key={i} className="flex items-start group">
                        <div className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mr-3 mt-0.5 border border-white/10 shadow-sm flex-shrink-0">{i + 1}</div>
                        <p className="text-xs font-medium leading-snug opacity-90">
                            {step}
                        </p>
                    </div>
                ))}
              </div>
          )
      }
  ];

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
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300 relative">
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
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* Header Hero */}
        <div className="mt-6 mb-8 px-1">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">
                Gestión de<br/>Apelaciones
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xs">
                Proceso oficial para la revisión y levantamiento de sanciones injustificadas.
            </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 mb-10">
            {sections.map((section, index) => {
                const Icon = section.icon;
                const variant = CARD_VARIANTS[index % CARD_VARIANTS.length];

                return (
                    <div 
                        key={section.id} 
                        className={`relative p-6 rounded-[2.5rem] border-[5px] overflow-hidden ${variant.bg} ${variant.border} shadow-xl`}
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${variant.sub}`}>
                                        {section.label}
                                    </span>
                                    <h3 className={`text-xl font-black uppercase tracking-tight leading-none ${variant.text}`}>
                                        {section.title}
                                    </h3>
                                </div>
                                <div className={`p-2.5 rounded-2xl shadow-sm backdrop-blur-sm border border-white/10 ${variant.iconBg}`}>
                                    <Icon size={20} className={variant.iconColor} strokeWidth={2} />
                                </div>
                            </div>

                            <div className={variant.text}>
                                {section.content}
                            </div>
                        </div>
                        
                        {/* Decor Icon - Standardized */}
                        <Icon className={`absolute -right-6 -bottom-6 rotate-[-15deg] opacity-10 pointer-events-none ${variant.decorColor}`} size={120} strokeWidth={1.5} />
                    </div>
                );
            })}
        </div>

        {/* Visual References */}
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Guía Visual</h3>
            </div>
            
            <div className="space-y-6">
                {images.map((img, idx) => (
                    // Use index + 3 (after the 3 main sections) to continue color sequence
                    // Or reuse cycle. Let's use cycle starting from 3 (Purple).
                    (() => {
                        const variant = CARD_VARIANTS[(idx + 3) % CARD_VARIANTS.length];
                        return (
                            <div 
                                key={idx} 
                                className={`group relative p-6 rounded-[2.5rem] border-[5px] overflow-hidden cursor-zoom-in active:scale-[0.98] transition-all shadow-xl ${variant.bg} ${variant.border}`}
                                onClick={() => setSelectedImage(img.src)}
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Smartphone size={16} className={variant.text} />
                                            <span className={`text-xs font-black uppercase tracking-wider ${variant.text}`}>{img.label}</span>
                                        </div>
                                        <div className={`p-1.5 rounded-full backdrop-blur-sm ${variant.iconBg}`}>
                                            <Eye size={12} className={variant.iconColor} />
                                        </div>
                                    </div>

                                    <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-inner bg-black/20 mb-3">
                                        <img 
                                            src={img.src} 
                                            alt={img.label} 
                                            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                        />
                                    </div>

                                    <p className={`text-[10px] font-medium leading-tight ${variant.sub}`}>
                                        {img.desc}
                                    </p>
                                </div>
                            </div>
                        )
                    })()
                ))}
            </div>
        </div>

        {/* Footer CTA */}
        <button 
            onClick={() => navigate('/training/bloqueos/vip')}
            className="w-full p-1 rounded-[2.5rem] active:scale-[0.98] transition-all"
        >
             {/* Uses next color in sequence (Gray or Orange depending on count) */}
             <div className="bg-black border-[5px] border-[#1A1A1A] rounded-[2.5rem] p-6 relative overflow-hidden shadow-xl text-left">
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/20">
                            <Crown size={24} className="text-amber-500" fill="currentColor" fillOpacity={0.3} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-wide text-white mb-0.5">
                                ¿Apelación rechazada?
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium">
                                Consulta el desbloqueo vía Puntos VIP
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="text-white opacity-50" />
                </div>
             </div>
        </button>

      </div>
    </div>
  );
};

export default BloqueoAppeal;