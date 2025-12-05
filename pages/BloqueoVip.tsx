
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, ShieldCheck, Crown, Info, Ticket } from 'lucide-react';
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

const BloqueoVip: React.FC = () => {
  const navigate = useNavigate();

  const unlockOptions = [
    { title: "Desbloqueo Urgente A", points: 100, type: "A" },
    { title: "Desbloqueo Urgente B", points: 50, type: "B" },
    { title: "Desbloqueo normal A", points: 50, type: "A" },
    { title: "Desbloqueo normal B", points: 25, type: "B" },
    { title: "Desbloqueo especial A", points: 100, type: "Ao" },
    { title: "Desbloqueo Super A", points: 200, type: "Ao" },
    { title: "Desbloqueo de Lista de popularidad", points: 25, type: "L" },
    { title: "Desbloqueo internacional A", points: 125, type: "A" },
    { title: "Desbloqueo internacional B", points: 75, type: "B" },
    { title: "Desbloqueo internacional A Especial", points: 150, type: "Ao" },
    { title: "Desbloqueo internacional urgente A", points: 175, type: "A>" },
    { title: "Desbloqueo internacional urgente B", points: 125, type: "B>" },
    { title: "Desbloqueo internacional urgente A Especial", points: 200, type: "A>" },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Desbloqueo VIP" showBack onBack={() => navigate('/training/bloqueos')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* Intro Section */}
        <div className="mt-6 mb-8 px-1">
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight mb-2">
                Sistema VIP
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Alternativa de desbloqueo mediante intercambio de puntos.
            </p>
        </div>

        {/* Ficha Informativa (Uses first variant - Orange) */}
        {(() => {
            const variant = CARD_VARIANTS[0]; // Orange
            return (
                <div className={`relative p-6 rounded-[2.5rem] border-[5px] overflow-hidden ${variant.bg} ${variant.border} shadow-xl mb-8`}>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`text-xl font-black uppercase tracking-tight leading-none ${variant.text}`}>
                                Información Importante
                            </h3>
                            <div className={`p-2.5 rounded-2xl backdrop-blur-md border border-white/10 ${variant.iconBg}`}>
                                <Info size={24} className={variant.iconColor} strokeWidth={2.5} />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <p className={`text-xs font-medium leading-relaxed text-justify ${variant.desc}`}>
                                <span className={`font-black block mb-1 uppercase tracking-wide opacity-80 ${variant.text}`}>Apelación y Canje</span>
                                En caso de no poder apelar y el emisor requiera un desbloqueo urgente, tiene la opción de intercambiar <span className="font-black underline">Puntos VIP</span>. Según el tipo de bloqueo será la cantidad requerida.
                            </p>
                            <div className={`h-px w-full ${variant.sub} opacity-30`}></div>
                            <p className={`text-xs font-medium leading-relaxed text-justify ${variant.desc}`}>
                                <span className={`font-black block mb-1 uppercase tracking-wide opacity-80 ${variant.text}`}>Origen de Puntos</span>
                                Los puntos VIP son beneficios otorgados a usuarios con un historial de recaudación mensual superior a <span className="font-black">20,000 semillas</span>.
                            </p>
                        </div>
                    </div>
                    <ShieldCheck className={`absolute -bottom-6 -right-6 rotate-[-15deg] opacity-10 pointer-events-none ${variant.decorColor}`} size={160} strokeWidth={1} />
                </div>
            );
        })()}

        {/* Catalog Grid */}
        <div className="mb-4 px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Catálogo de Canje</h3>
            <div className="space-y-4">
                {unlockOptions.map((opt, idx) => {
                    // Start cycling from index 1 (Black) since Orange was used for Info
                    const variant = CARD_VARIANTS[(idx + 1) % CARD_VARIANTS.length];
                    
                    return (
                        <div 
                            key={idx} 
                            className={`relative p-5 rounded-[2.5rem] border-[5px] overflow-hidden ${variant.bg} ${variant.border} shadow-lg flex items-center justify-between group`}
                        >
                            <div className="relative z-10 flex flex-col items-start pr-4 max-w-[70%]">
                                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 opacity-70 ${variant.sub}`}>
                                    Tipo {opt.type}
                                </span>
                                <h4 className={`text-sm font-black uppercase leading-tight ${variant.text}`}>
                                    {opt.title}
                                </h4>
                            </div>

                            <div className="relative z-10 flex flex-col items-end">
                                <div className={`px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10 ${variant.iconBg} mb-1`}>
                                    <span className={`text-lg font-black ${variant.text}`}>
                                        {opt.points}
                                    </span>
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-wide ${variant.sub}`}>Puntos</span>
                            </div>

                            {/* Decor Icon */}
                            <Ticket className={`absolute -bottom-4 -left-4 rotate-[15deg] opacity-10 pointer-events-none ${variant.decorColor}`} size={80} strokeWidth={1} />
                        </div>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default BloqueoVip;
