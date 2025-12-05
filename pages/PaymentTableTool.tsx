
import React from 'react';
import { Calendar, Clock, AlertTriangle, ShieldCheck, Table, DollarSign, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';

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
        <div className="mt-6 mb-8 px-1">
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none mb-2 tracking-tighter">
                Estructura de<br/>Ingresos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Niveles oficiales de salario base y bonificaciones.
            </p>
        </div>
        
        {/* Tabla Container - Style: Black Card */}
        <div className="relative w-full bg-black rounded-[2.5rem] border-[5px] border-[#1A1A1A] overflow-hidden shadow-2xl mb-10 group">
            {/* Header Decor */}
            <div className="bg-[#111] p-5 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center space-x-2">
                    <div className="bg-brand-purple p-1.5 rounded-lg">
                        <Table size={16} className="text-white" />
                    </div>
                    <span className="text-xs font-black uppercase text-white tracking-widest">Tabla Oficial 2025</span>
                </div>
                <div className="bg-white/10 px-2 py-1 rounded text-[9px] font-bold text-white uppercase tracking-wider border border-white/5">
                    USD Currency
                </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black text-white border-b border-white/10">
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest whitespace-nowrap text-gray-400">Nivel</th>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Meta<br/>Semillas</th>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Horas<br/>Diarias</th>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Meta<br/>Horas</th>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Salario<br/>Base</th>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-center whitespace-nowrap text-gray-400">Cambio<br/>Semillas</th>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-right whitespace-nowrap text-brand-purple">Total<br/>Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#0a0a0a]">
                    {TABLE_DATA.map((row, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-[10px] font-black text-white">{row.level}</td>
                        <td className="p-4 text-[10px] font-bold text-gray-400 text-center">{row.seeds}</td>
                        <td className="p-4 text-[10px] font-medium text-center text-gray-500">{row.daily}</td>
                        <td className="p-4 text-[10px] font-medium text-center text-gray-500">{row.monthly}</td>
                        <td className="p-4 text-[10px] font-medium text-center text-gray-400">{row.base}</td>
                        <td className="p-4 text-[10px] font-medium text-center text-gray-400">{row.exchange}</td>
                        <td className="p-4 text-[10px] font-black text-right text-brand-purple">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
        </div>

        {/* Sección de Información Importante (Tarjetas Bento) */}
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white px-1">
                Notas Importantes
            </h3>
            
            {/* 1. Calendario de Pagos (MORADO) */}
            <div className="relative bg-brand-purple p-6 rounded-[2.5rem] border-[5px] border-violet-500 shadow-xl overflow-hidden active:scale-[0.98] transition-transform">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                            <Calendar size={20} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h4 className="text-xl font-black text-white uppercase leading-none mb-2">Calendario de<br/>Pagos</h4>
                    <p className="text-xs text-purple-100 font-medium leading-relaxed text-left">
                        Los pagos se procesan durante la <span className="font-bold text-white underline">primera semana de cada mes</span>. Es indispensable cumplir ambas metas.
                    </p>
                </div>
                <Calendar className="absolute -bottom-6 -right-6 text-white/10 rotate-[-15deg]" size={120} strokeWidth={1.5} />
            </div>

            {/* 2. Reglas de Transmisión (NARANJA) */}
            <div className="relative bg-orange-500 p-6 rounded-[2.5rem] border-[5px] border-orange-400 shadow-xl overflow-hidden active:scale-[0.98] transition-transform">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                            <Clock size={20} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h4 className="text-xl font-black text-white uppercase leading-none mb-2">Reglas de<br/>Transmisión</h4>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0"></div>
                            <p className="text-xs text-orange-50 font-medium leading-snug text-left">Máximo 2 horas válidas por día.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0"></div>
                            <p className="text-xs text-orange-50 font-medium leading-snug text-left">Mínimo 30 minutos continuos por sesión.</p>
                        </div>
                    </div>
                </div>
                <Clock className="absolute -bottom-6 -right-6 text-white/10 rotate-[-15deg]" size={120} strokeWidth={1.5} />
            </div>

            {/* 3. Condiciones de Meta (NEGRO) */}
            <div className="relative bg-black p-6 rounded-[2.5rem] border-[5px] border-[#1A1A1A] shadow-xl overflow-hidden active:scale-[0.98] transition-transform">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                            <AlertTriangle size={20} className="text-red-500" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h4 className="text-xl font-black text-white uppercase leading-none mb-2">Condiciones<br/>de Meta</h4>
                    <div className="space-y-3">
                        <div>
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-0.5">Menos de 20 horas</span>
                            <p className="text-xs text-gray-400 font-medium leading-snug text-left">No recibes bono de meta (0%), solo cambio de semillas.</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block mb-0.5">Entre 20 y 43 horas</span>
                            <p className="text-xs text-gray-400 font-medium leading-snug text-left">Pago parcial del bono al <span className="text-white font-bold">50%</span>.</p>
                        </div>
                    </div>
                </div>
                <AlertTriangle className="absolute -bottom-6 -right-6 text-white/5 rotate-[-15deg]" size={120} strokeWidth={1.5} />
            </div>

            {/* 4. Política de Soporte (GRIS) */}
            <div className="relative bg-gray-200 p-6 rounded-[2.5rem] border-[5px] border-white shadow-xl overflow-hidden active:scale-[0.98] transition-transform">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-white/50">
                            <ShieldCheck size={20} className="text-brand-black" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h4 className="text-xl font-black text-brand-black uppercase leading-none mb-2">Soporte<br/>Cruzado</h4>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed text-left">
                        El emisor <span className="font-black text-brand-black">no podrá recibir más del 50%</span> de su meta por parte de otro emisor o agencia. Esto afecta el pago del bono.
                    </p>
                </div>
                <ShieldCheck className="absolute -bottom-6 -right-6 text-brand-black/5 rotate-[-15deg]" size={120} strokeWidth={1.5} />
            </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentTableTool;
