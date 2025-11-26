import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserMinus, EyeOff, FlaskConical, TriangleAlert, Banknote, Clock } from 'lucide-react';
import { Header } from '../components/Header';

const BloqueoMotivos: React.FC = () => {
  const navigate = useNavigate();

  const reasons = [
    {
      title: "Menores de edad",
      desc: "Prohibido mostrar Menores de edad físicamente y visualmente. Está prohibido imágenes, videos o decoraciones alusivas a menores de edad.",
      icon: UserMinus,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20"
    },
    {
      title: "Pornografía",
      desc: "Prohibido contenido sexual, desnudos totales o parciales, mostrar zona genital, tocamientos, lenguaje o cualquier otro acto que incite al erotismo.",
      icon: EyeOff,
      color: "text-pink-500",
      bg: "bg-pink-50 dark:bg-pink-900/20"
    },
    {
      title: "Drogas",
      desc: "Prohibido mostrar cualquier tipo de sustancia. De ser detectado se aplicará suspensión inmediata de la transmisión.",
      icon: FlaskConical,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800"
    },
    {
      title: "Armas",
      desc: "Prohibido mostrar armas de fuego, cuchillos y cualquier otro objeto que promueva la violencia explícita.",
      icon: TriangleAlert,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "Juegos de azar",
      desc: "Prohibido mostrar y promover juegos de casino, apuestas ilegales o transacciones monetarias no autorizadas.",
      icon: Banknote,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      title: "Inactividad",
      desc: "Dejar la transmisión sola (sin el anfitrión en cámara) por más de 1 minuto está penalizado por el sistema.",
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Volver" showBack onBack={() => navigate('/training/bloqueos')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* Intro */}
        <div className="mt-6 mb-8">
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-tight mb-2">
                Motivos de<br/>Bloqueo
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Evita estas infracciones graves para mantener tu cuenta segura.
            </p>
        </div>

        {/* List */}
        <div className="space-y-4">
            {reasons.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div key={index} className="bg-white dark:bg-brand-dark-card p-5 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 flex items-start space-x-4 hover:scale-[1.01] transition-transform duration-200">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                            <Icon size={24} className={item.color} strokeWidth={2} />
                        </div>
                        <div className="flex-1 pt-0.5">
                            <h3 className="text-sm font-black text-brand-black dark:text-white uppercase mb-2">
                                {item.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-justify">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>

      </div>
    </div>
  );
};

export default BloqueoMotivos;