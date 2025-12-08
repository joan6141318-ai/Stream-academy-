import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TriangleAlert, Clock, Ban, CalendarX, ShieldAlert } from 'lucide-react';
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

const BloqueoTypes: React.FC = () => {
  const navigate = useNavigate();

  const sanctions = [
    {
      step: "01",
      duration: "RIESGO",
      title: "ADVERTENCIA",
      subtitle: "Ajuste Inmediato",
      desc: "El sistema detecta un riesgo. Se notifica al emisor para corregir el contenido inmediatamente.",
      icon: TriangleAlert,
    },
    {
      step: "02",
      duration: "10 MIN",
      title: "REVISIÓN",
      subtitle: "Suspensión Temporal",
      desc: "Cierre automático. El sistema detiene el live brevemente para evaluar el contenido.",
      icon: Clock,
    },
    {
      step: "03",
      duration: "1 HORA",
      title: "REINCIDENCIA",
      subtitle: "Bloqueo Efectivo",
      desc: "Si el emisor reincide tras la advertencia, se aplica un bloqueo total por 1 hora.",
      icon: Ban,
    },
    {
      step: "04",
      duration: "1 MES",
      title: "GRAVE",
      subtitle: "Suspensión Severa",
      desc: "Acumulación de faltas o infracciones críticas. Penalización de hasta 30 días.",
      icon: CalendarX,
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Volver" showBack onBack={() => navigate('/training/bloqueos')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* Intro */}
        <div className="mt-8 mb-10 px-1">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">
                Escala de<br/>Sanciones
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">
                Sistema de moderación por niveles
            </p>
        </div>

        {/* Cards Stack */}
        <div className="space-y-6">
            {sanctions.map((item, index) => {
                const Icon = item.icon;
                const variant = CARD_VARIANTS[index % CARD_VARIANTS.length];

                return (
                    <div 
                        key={index} 
                        className={`relative p-6 rounded-[2.5rem] border-[5px] overflow-hidden ${variant.bg} ${variant.border} shadow-xl transform transition-transform duration-300 hover:scale-[1.01]`}
                    >
                        
                        <div className="relative z-10">
                            {/* Top Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${variant.sub}`}>
                                        NIVEL {item.step}
                                    </span>
                                    <h3 className={`text-2xl font-black uppercase leading-none tracking-tight ${variant.text}`}>
                                        {item.title}
                                    </h3>
                                </div>
                                
                                <div className={`p-3 rounded-2xl backdrop-blur-md border border-white/10 ${variant.iconBg}`}>
                                    <Icon size={24} className={variant.iconColor} strokeWidth={2.5} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <p className={`text-xs font-black uppercase tracking-wide mb-2 ${variant.sub}`}>
                                    {item.subtitle}
                                </p>
                                <p className={`text-xs font-medium leading-relaxed text-justify ${variant.desc}`}>
                                    {item.desc}
                                </p>
                            </div>

                            {/* Footer Badge */}
                            <div className="flex justify-end">
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                                    <span className={`text-xs font-black uppercase tracking-widest ${variant.text}`}>
                                        {item.duration}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Decor Icon */}
                        <Icon 
                            className={`absolute -bottom-6 -right-6 rotate-[-15deg] opacity-10 pointer-events-none ${variant.decorColor}`} 
                            size={140} 
                            strokeWidth={1.5} 
                        />
                    </div>
                );
            })}
        </div>
        
        <div className="mt-8 text-center px-8">
            <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                La reincidencia agrava la sanción automáticamente.
            </p>
        </div>

      </div>
    </div>
  );
};

export default BloqueoTypes;