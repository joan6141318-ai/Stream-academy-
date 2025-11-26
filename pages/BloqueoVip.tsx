import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, ShieldCheck, Crown, Info } from 'lucide-react';
import { Header } from '../components/Header';

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
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-24">
        
        {/* Intro Section */}
        <div className="mt-6 mb-6 px-2">
            <div className="flex items-center space-x-2 mb-2">
                <Crown className="text-amber-500" size={24} strokeWidth={2.5} />
                <h1 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-none">
                    Sistema VIP
                </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Alternativa de desbloqueo mediante intercambio de puntos.
            </p>
        </div>

        {/* Ficha Informativa Negra (Black Card) */}
        <div className="bg-brand-black text-white p-6 rounded-lg shadow-xl shadow-black/20 border border-gray-800 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={120} />
            </div>
            
            <div className="relative z-10 space-y-5">
                <div className="flex items-start">
                    <Info className="text-amber-400 mt-1 mr-3 flex-shrink-0" size={20} />
                    <p className="text-xs font-medium leading-relaxed text-gray-300 text-justify">
                        <span className="text-white font-bold block mb-1 uppercase tracking-wide text-[10px]">Apelación y Canje</span>
                        En caso de no poder apelar y el emisor requiera un desbloqueo urgente, tiene la opción de intercambiar <span className="text-amber-400 font-bold">Puntos VIP</span> por ser desbloqueado. Según el tipo de bloqueo será la cantidad de puntos requeridos.
                    </p>
                </div>

                <div className="h-px w-full bg-white/10"></div>

                <div className="flex items-start">
                    <AlertCircle className="text-amber-400 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div className="space-y-3">
                        <p className="text-xs font-medium leading-relaxed text-gray-300 text-justify">
                            <span className="text-white font-bold block mb-1 uppercase tracking-wide text-[10px]">Responsabilidad del Emisor</span>
                            Es responsabilidad total del emisor contactar a los usuarios que posean puntos VIP para solicitar su apoyo.
                        </p>
                        <p className="text-xs font-medium leading-relaxed text-gray-300 text-justify">
                            <span className="text-white font-bold block mb-1 uppercase tracking-wide text-[10px]">Limitaciones de Agencia</span>
                            Bigo Live ni la agencia pueden aplicar desbloqueos vía sistema manual.
                        </p>
                        <p className="text-xs font-medium leading-relaxed text-gray-300 text-justify">
                            <span className="text-white font-bold block mb-1 uppercase tracking-wide text-[10px]">Origen de los Puntos</span>
                            Los puntos VIP son beneficios otorgados a usuarios con un historial de recaudación mensual superior a <span className="text-amber-400 font-bold">20,000 semillas</span>. La cantidad de puntos dependerá del rango VIP del usuario. El Emisor deberá cubrir los costos o llegar a un acuerdo con el dueño de los puntos.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Grid de Tarjetas de Precios */}
        <div className="mb-4 px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Catálogo de Canje</h3>
            <div className="grid grid-cols-2 gap-3">
                {unlockOptions.map((opt, idx) => (
                    <div 
                        key={idx} 
                        className="bg-[#0f1115] border border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-lg relative group overflow-hidden min-h-[160px]"
                    >
                        {/* Circle Background */}
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 border border-white/5">
                            <Lock className="text-amber-200/80" size={32} strokeWidth={1.5} />
                            {/* Badge Letter Overlay */}
                            <div className="absolute bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm bottom-4 right-4 shadow-sm border border-black/20">
                                {opt.type}
                            </div>
                        </div>

                        <h4 className="text-xs font-bold text-gray-200 leading-tight mb-2 px-1">
                            {opt.title}
                        </h4>
                        
                        <div className="mt-auto">
                            <span className="text-amber-500 font-black text-sm block">
                                {opt.points}
                            </span>
                            <span className="text-[9px] text-gray-500 uppercase tracking-wide">
                                puntos por vez
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default BloqueoVip;