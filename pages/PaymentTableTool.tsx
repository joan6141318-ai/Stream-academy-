
import React from 'react';
import { Calendar, Clock, AlertTriangle, ShieldCheck, Table, DollarSign, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';

const ROW_VARIANTS = [
    {
      // GRIS
      bg: 'bg-gray-200',
      text: 'text-brand-black',
      sub: 'text-gray-600',
      highlight: 'text-brand-black'
    },
    {
      // MORADO
      bg: 'bg-brand-purple',
      text: 'text-white',
      sub: 'text-purple-200',
      highlight: 'text-white'
    },
    {
      // NARANJA
      bg: 'bg-orange-500',
      text: 'text-white',
      sub: 'text-orange-100',
      highlight: 'text-white'
    },
    {
      // NEGRO
      bg: 'bg-black',
      text: 'text-white',
      sub: 'text-gray-400',
      highlight: 'text-white'
    }
];

const CARD_VARIANTS = [
    {
      // MORADO
      bg: 'bg-brand-purple',
      border: 'border-violet-500',
      text: 'text-white',
      desc: 'text-purple-100',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      decorColor: 'text-white'
    },
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
      // GRIS
      bg: 'bg-gray-200',
      border: 'border-white',
      text: 'text-brand-black',
      desc: 'text-gray-600',
      iconBg: 'bg-white',
      iconColor: 'text-brand-black',
      decorColor: 'text-brand-black'
    }
];

const PaymentTableTool: React.FC = () => {
  const navigate = useNavigate();
  
  // Datos oficiales de la estructura de pagos
  const TABLE_DATA = [
    { level: 'A', seeds: '2,000', daily: 2, monthly: 44, base: '$14', exchange: '$9', total: '$23' },
    { level: 'B', seeds: '5,000', daily: 2, monthly: 44, base: '$35', exchange: '$23', total: '$58' },
    { level: 'C', seeds: '10,000', daily: 2, monthly: 44, base: '$74', exchange: '$48', total: '$122' },
    { level: 'CE', seeds: '20,000', daily: 2, monthly: 44, base: '$141', exchange: '$95', total: '$236' },
    { level: 'D', seeds: '30,000', daily: 2, monthly: 44, base: '$211', exchange: '$143', total: '$354' },
    { level: 'E', seeds: '60,000', daily: 2, monthly: 44, base: '$422', exchange: '$286', total: '$708' },
    { level: 'S1', seeds: '100,000', daily: 2, monthly: 44, base: '$660', exchange: '$476', total: '$1,136' },
    { level: 'S2', seeds: '150,000', daily: 2, monthly: 44, base: '$990', exchange: '$714', total: '$1,704' },
    { level: 'S3', seeds: '200,000', daily: 2, monthly: 44, base: '$1,320', exchange: '$952', total: '$2,272' },
    { level: 'S4', seeds: '250,000', daily: 2, monthly: 44, base: '$1,650', exchange: '$1,190', total: '$2,840' },
    { level: 'S5', seeds: '300,000', daily: 2, monthly: 44, base: '$1,980', exchange: '$1,429', total: '$3,409' },
    { level: 'S6', seeds: '400,000', daily: 2, monthly: 44, base: '$2,700', exchange: '$1,904', total: '$4,604' },
    { level: 'S7', seeds: '500,000', daily: 2, monthly: 44, base: '$3,550', exchange: '$2,381', total: '$5,931' },
    { level: 'S8', seeds: '750,000', daily: 2, monthly: 44, base: '$5,500', exchange: '$3,572', total: '$9,072' },
    { level: 'S9', seeds: '1,000,000', daily: 2, monthly: 44, base: '$6,800', exchange: '$4,762', total: '$11,562' },
    { level: 'S10', seeds: '1,500,000', daily: 2, monthly: 44, base: '$10,400', exchange: '$7,143', total: '$17,543' },
    { level: 'S11', seeds: '2,000,000', daily: 2, monthly: 44, base: '$14,500', exchange: '$9,524', total: '$24,024' },
    { level: 'S12', seeds: '3,000,000', daily: 2, monthly: 44, base: '$22,500', exchange: '$14,286', total: '$36,786' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Tabla de Pagos" showBack onBack={() => navigate('/training/pagos')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* Descripción Superior */}
        <div className="mt-6 mb-6 px-1">
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none mb-2 tracking-tighter">
                Estructura de<br/>Ingresos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Niveles oficiales de salario base y bonificaciones.
            </p>
        </div>
        
        {/* Tabla Container - REDISEÑADO: Compacto, Coloreado, Marco Blanco */}
        <div className="relative w-full bg-white dark:bg-[#111] rounded-[2.5rem] border-[5px] border-white shadow-2xl mb-8 overflow-hidden">
            
            {/* Header de la Tabla */}
            <div className="bg-brand-black p-4 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center space-x-2">
                    <div className="bg-white p-1 rounded-lg">
                        <Table size={14} className="text-black" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Tabla 2025</span>
                </div>
                <div className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                    USD
                </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
                      <th className="p-3 text-[8px] font-black uppercase tracking-widest whitespace-nowrap text-gray-400">Nivel</th>
                      <th className="p-3 text-[8px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Meta<br/>Semillas</th>
                      <th className="p-3 text-[8px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Horas<br/>Diarias</th>
                      <th className="p-3 text-[8px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Meta<br/>Horas</th>
                      <th className="p-3 text-[8px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Salario<br/>Base</th>
                      <th className="p-3 text-[8px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Cambio<br/>Semillas</th>
                      <th className="p-3 text-[8px] font-black uppercase tracking-widest text-right whitespace-nowrap text-brand-black dark:text-white">Total<br/>Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TABLE_DATA.map((row, index) => {
                        // Secuencia: Gris -> Morado -> Naranja -> Negro
                        const variant = ROW_VARIANTS[index % ROW_VARIANTS.length];
                        return (
                          <tr key={index} className={`${variant.bg} border-b border-white/5 last:border-0 transition-colors`}>
                            <td className={`p-2.5 text-[9px] font-black ${variant.text}`}>{row.level}</td>
                            <td className={`p-2.5 text-[9px] font-bold text-center ${variant.sub}`}>{row.seeds}</td>
                            <td className={`p-2.5 text-[9px] font-medium text-center ${variant.sub}`}>{row.daily}</td>
                            <td className={`p-2.5 text-[9px] font-medium text-center ${variant.sub}`}>{row.monthly}</td>
                            <td className={`p-2.5 text-[9px] font-medium text-center ${variant.sub}`}>{row.base}</td>
                            <td className={`p-2.5 text-[9px] font-medium text-center ${variant.sub}`}>{row.exchange}</td>
                            <td className={`p-2.5 text-[10px] font-black text-right ${variant.highlight}`}>{row.total}</td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
            </div>
        </div>

        {/* Sección de Información (Tarjetas) */}
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 px-1 mb-2">
                Notas del Sistema
            </h3>
            
            {/* 1. Calendario (Morado) */}
            {(() => { const v = CARD_VARIANTS[0]; const Icon = Calendar; return (
            <div className={`relative p-5 rounded-[2rem] border-[5px] overflow-hidden ${v.bg} ${v.border} shadow-lg`}>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h4 className={`text-lg font-black uppercase leading-none mb-1 ${v.text}`}>Calendario</h4>
                        <p className={`text-[10px] font-medium leading-tight max-w-[80%] ${v.desc}`}>Pagos procesados la primera semana del mes.</p>
                    </div>
                    <div className={`p-2 rounded-xl ${v.iconBg}`}><Icon size={18} className={v.iconColor} /></div>
                </div>
                <Icon className={`absolute -bottom-4 -right-4 rotate-[-15deg] opacity-10 pointer-events-none ${v.decorColor}`} size={80} strokeWidth={1.5} />
            </div>
            )})()}

            {/* 2. Reglas (Naranja) */}
            {(() => { const v = CARD_VARIANTS[1]; const Icon = Clock; return (
            <div className={`relative p-5 rounded-[2rem] border-[5px] overflow-hidden ${v.bg} ${v.border} shadow-lg`}>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h4 className={`text-lg font-black uppercase leading-none mb-1 ${v.text}`}>Reglas</h4>
                        <p className={`text-[10px] font-medium leading-tight max-w-[80%] ${v.desc}`}>Máximo 2 horas válidas por día. Mínimo 30 min/sesión.</p>
                    </div>
                    <div className={`p-2 rounded-xl ${v.iconBg}`}><Icon size={18} className={v.iconColor} /></div>
                </div>
                <Icon className={`absolute -bottom-4 -right-4 rotate-[-15deg] opacity-10 pointer-events-none ${v.decorColor}`} size={80} strokeWidth={1.5} />
            </div>
            )})()}

            {/* 3. Condiciones (Negro) */}
            {(() => { const v = CARD_VARIANTS[2]; const Icon = AlertTriangle; return (
            <div className={`relative p-5 rounded-[2rem] border-[5px] overflow-hidden ${v.bg} ${v.border} shadow-lg`}>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h4 className={`text-lg font-black uppercase leading-none mb-1 ${v.text}`}>Condiciones</h4>
                        <p className={`text-[10px] font-medium leading-tight max-w-[80%] ${v.desc}`}>&lt; 20 horas = 0% Bono.<br/>20-43 horas = 50% Bono.</p>
                    </div>
                    <div className={`p-2 rounded-xl ${v.iconBg}`}><Icon size={18} className={v.iconColor} /></div>
                </div>
                <Icon className={`absolute -bottom-4 -right-4 rotate-[-15deg] opacity-10 pointer-events-none ${v.decorColor}`} size={80} strokeWidth={1.5} />
            </div>
            )})()}

            {/* 4. Política (Gris) */}
            {(() => { const v = CARD_VARIANTS[3]; const Icon = ShieldCheck; return (
            <div className={`relative p-5 rounded-[2rem] border-[5px] overflow-hidden ${v.bg} ${v.border} shadow-lg`}>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h4 className={`text-lg font-black uppercase leading-none mb-1 ${v.text}`}>Política</h4>
                        <p className={`text-[10px] font-medium leading-tight max-w-[90%] ${v.desc}`}>Prohibido recibir +50% de la meta mediante soporte cruzado.</p>
                    </div>
                    <div className={`p-2 rounded-xl ${v.iconBg}`}><Icon size={18} className={v.iconColor} /></div>
                </div>
                <Icon className={`absolute -bottom-4 -right-4 rotate-[-15deg] opacity-10 pointer-events-none ${v.decorColor}`} size={80} strokeWidth={1.5} />
            </div>
            )})()}
        </div>

      </div>
    </div>
  );
};

export default PaymentTableTool;
