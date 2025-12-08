import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserMinus, EyeOff, FlaskConical, TriangleAlert, Banknote, Clock } from 'lucide-react';
import { Header } from '../components/Header';

const CARD_VARIANTS = [
    {
      // NARANJA
      bg: 'bg-orange-500',
      border: 'border-orange-400',
      text: 'text-white',
      desc: 'text-orange-100',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      decorColor: 'text-white'
    },
    {
      // NEGRO
      bg: 'bg-black',
      border: 'border-[#1A1A1A]',
      text: 'text-white',
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
      desc: 'text-purple-200',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      decorColor: 'text-white'
    }
];

const BloqueoMotivos: React.FC = () => {
  const navigate = useNavigate();

  const reasons = [
    {
      title: "Menores de edad",
      desc: "Prohibido mostrar Menores de edad físicamente y visualmente. Está prohibido imágenes, videos o decoraciones alusivas a menores de edad.",
      icon: UserMinus
    },
    {
      title: "Pornografía",
      desc: "Prohibido contenido sexual, desnudos totales o parciales, mostrar zona genital, tocamientos, lenguaje o cualquier otro acto que incite al erotismo.",
      icon: EyeOff
    },
    {
      title: "Drogas",
      desc: "Prohibido mostrar cualquier tipo de sustancia. De ser detectado se aplicará suspensión inmediata de la transmisión.",
      icon: FlaskConical
    },
    {
      title: "Armas",
      desc: "Prohibido mostrar armas de fuego, cuchillos y cualquier otro objeto que promueva la violencia explícita.",
      icon: TriangleAlert
    },
    {
      title: "Juegos de azar",
      desc: "Prohibido mostrar y promover juegos de casino, apuestas ilegales o transacciones monetarias no autorizadas.",
      icon: Banknote
    },
    {
      title: "Inactividad",
      desc: "Dejar la transmisión sola (sin el anfitrión en cámara) por más de 1 minuto está penalizado por el sistema.",
      icon: Clock
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Volver" showBack onBack={() => navigate('/training/bloqueos')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* Intro */}
        <div className="mt-6 mb-8 px-1">
            <h1 className="text-3xl font-black uppercase leading-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">
                Motivos de<br/>Bloqueo
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Evita estas infracciones graves para mantener tu cuenta segura.
            </p>
        </div>

        {/* List */}
        <div className="space-y-5">
            {reasons.map((item, index) => {
                const Icon = item.icon;
                const variant = CARD_VARIANTS[index % CARD_VARIANTS.length];

                return (
                    <div 
                        key={index} 
                        className={`relative p-6 rounded-[2.5rem] border-[5px] overflow-hidden ${variant.bg} ${variant.border} shadow-xl transform transition-transform duration-300 hover:scale-[1.01]`}
                    >
                        {/* Icon Header */}
                        <div className="relative z-10 flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl backdrop-blur-md border border-white/10 ${variant.iconBg}`}>
                                <Icon size={24} className={variant.iconColor} strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <h3 className={`text-xl font-black uppercase leading-none mb-3 tracking-tight ${variant.text}`}>
                                {item.title}
                            </h3>
                            {/* Update: text-left instead of text-justify */}
                            <p className={`text-xs font-bold leading-relaxed text-left ${variant.desc} pr-4`}>
                                {item.desc}
                            </p>
                        </div>

                        {/* Decor Icon (Standardized) */}
                        <Icon 
                            className={`absolute -bottom-6 -right-6 rotate-[-15deg] opacity-10 pointer-events-none ${variant.decorColor}`} 
                            size={140} 
                            strokeWidth={1.5} 
                        />
                    </div>
                );
            })}
        </div>

      </div>
    </div>
  );
};

export default BloqueoMotivos;