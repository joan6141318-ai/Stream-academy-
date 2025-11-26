import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TriangleAlert, Clock, Ban, CalendarX, ShieldAlert } from 'lucide-react';
import { Header } from '../components/Header';

const BloqueoTypes: React.FC = () => {
  const navigate = useNavigate();

  const sanctions = [
    {
      step: "01",
      duration: "RIESGO",
      title: "ADVERTENCIA",
      subtitle: "Ajuste Inmediato",
      desc: "El sistema detecta un riesgo. Se notifica al emisor para corregir el contenido inmediatamente.",
      theme: "yellow",
      icon: TriangleAlert,
    },
    {
      step: "02",
      duration: "10 MIN",
      title: "REVISIÓN",
      subtitle: "Suspensión Temporal",
      desc: "Cierre automático. El sistema detiene el live brevemente para evaluar el contenido.",
      theme: "orange",
      icon: Clock,
    },
    {
      step: "03",
      duration: "1 HORA",
      title: "REINCIDENCIA",
      subtitle: "Bloqueo Efectivo",
      desc: "Si el emisor reincide tras la advertencia, se aplica un bloqueo total por 1 hora.",
      theme: "red",
      icon: Ban,
    },
    {
      step: "04",
      duration: "1 MES",
      title: "GRAVE",
      subtitle: "Suspensión Severa",
      desc: "Acumulación de faltas o infracciones críticas. Penalización de hasta 30 días.",
      theme: "rose",
      icon: CalendarX,
    }
  ];

  const getThemeStyles = (theme: string) => {
    switch (theme) {
        case 'yellow': return { 
            accent: 'bg-yellow-400', 
            text: 'text-yellow-600 dark:text-yellow-400',
            border: 'border-yellow-400'
        };
        case 'orange': return { 
            accent: 'bg-orange-500', 
            text: 'text-orange-600 dark:text-orange-400',
            border: 'border-orange-500'
        };
        case 'red': return { 
            accent: 'bg-red-600', 
            text: 'text-red-600 dark:text-red-500',
            border: 'border-red-600'
        };
        case 'rose': return { 
            accent: 'bg-rose-700', 
            text: 'text-rose-700 dark:text-rose-500',
            border: 'border-rose-700'
        };
        default: return { accent: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500' };
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black transition-colors duration-300">
      <Header title="Volver" showBack onBack={() => navigate('/training/bloqueos')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* Intro */}
        <div className="mt-8 mb-10">
            <div className="flex items-center space-x-3 mb-2">
                <div className="bg-brand-black dark:bg-white text-white dark:text-black p-2 rounded-sm">
                    <ShieldAlert size={20} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tighter">
                    Escala de<br/>Sanciones
                </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide pl-1">
                Sistema de moderación por niveles
            </p>
        </div>

        {/* Cards Stack */}
        <div className="space-y-6">
            {sanctions.map((item, index) => {
                const Icon = item.icon;
                const styles = getThemeStyles(item.theme);

                return (
                    <div key={index} className={`relative bg-white dark:bg-[#0a0a0a] rounded-sm overflow-hidden shadow-xl shadow-gray-200 dark:shadow-none border-l-8 ${styles.border} group`}>
                        
                        <div className="p-6 relative z-10">
                            {/* Top Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-1">
                                        NIVEL {item.step}
                                    </span>
                                    <h3 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight">
                                        {item.title}
                                    </h3>
                                </div>
                                
                                {/* High Contrast Icon */}
                                <div className={`${styles.text} opacity-100 transform group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon size={32} strokeWidth={2} />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px w-10 bg-gray-200 dark:bg-white/10 mb-4"></div>

                            {/* Content */}
                            <div className="mb-6">
                                <p className={`text-xs font-black uppercase tracking-wide mb-2 ${styles.text}`}>
                                    {item.subtitle}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed text-justify">
                                    {item.desc}
                                </p>
                            </div>

                            {/* Footer Badge */}
                            <div className="flex justify-end">
                                <div className="bg-brand-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-sm shadow-lg">
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {item.duration}
                                    </span>
                                </div>
                            </div>
                        </div>
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