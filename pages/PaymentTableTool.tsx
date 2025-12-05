
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
        
        {/* Descripción Superior - Compacta */}
        <div className="mt-4 mb-4 flex justify-between items-end px-1">
            <div>
                <h1 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-none mb-1 tracking-tighter">
                    Tabla Oficial
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                    Estructura 2025
                </p>
            </div>
            <div className="bg-brand-purple/10 px-3 py-1 rounded-full border border-brand-purple/20">
                <span className="text-[9px] font-black text-brand-purple uppercase tracking-widest">USD Currency</span>
            </div>
        </div>
        
        {/* Tabla Container - Rediseño Compacto y Profesional */}
        <div className="relative w-full bg-[#121212] rounded-[2rem] border-[4px] border-white overflow-hidden shadow-2xl mb-6">
            
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-purple/10 border-b border-white/10">
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-brand-purple whitespace-nowrap">Nivel</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-gray-400 text-center whitespace-nowrap">Semillas</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-gray-400 text-center whitespace-nowrap">Meta<br/>Horas</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-gray-400 text-center whitespace-nowrap">Salario<br/>Base</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-gray-400 text-center whitespace-nowrap">Cambio</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-brand-purple text-right whitespace-nowrap pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {TABLE_DATA.map((row, index) => (
                      <tr key={index} className="hover:bg-brand-purple/5 transition-colors even:bg-white/[0.02]">
                        <td className="py-2 px-3 text-[9px] font-black text-white">{row.level}</td>
                        <td className="py-2 px-3 text-[9px] font-medium text-gray-400 text-center tabular-nums">{row.seeds}</td>
                        <td className="py-2 px-3 text-[9px] font-medium text-gray-500 text-center">{row.monthly}</td>
                        <td className="py-2 px-3 text-[9px] font-medium text-gray-400 text-center tabular-nums">{row.base}</td>
                        <td className="py-2 px-3 text-[9px] font-medium text-gray-500 text-center tabular-nums">{row.exchange}</td>
                        <td className="py-2 px-3 pr-4 text-[9px] font-black text-right text-brand-purple tracking-wide tabular-nums">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
        </div>

        {/* Sección de Información - Grid 2x2 para Ahorro de Espacio */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            
            {/* 1. Calendario */}
            <div className="relative bg-[#151515] p-4 rounded-3xl border border-white/10 shadow-lg overflow-hidden group">
                <div className="relative z-10">
                    <div className="bg-brand-purple/20 w-fit p-1.5 rounded-lg mb-2">
                        <Calendar size={14} className="text-brand-purple" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase leading-none mb-1">Pagos</h4>
                    <p className="text-[9px] text-gray-500 leading-tight">Primera semana de cada mes.</p>
                </div>
            </div>

            {/* 2. Reglas */}
            <div className="relative bg-[#151515] p-4 rounded-3xl border border-white/10 shadow-lg overflow-hidden group">
                <div className="relative z-10">
                    <div className="bg-orange-500/20 w-fit p-1.5 rounded-lg mb-2">
                        <Clock size={14} className="text-orange-500" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase leading-none mb-1">Horas</h4>
                    <p className="text-[9px] text-gray-500 leading-tight">Max 2h diarias válidas.</p>
                </div>
            </div>

            {/* 3. Condiciones */}
            <div className="relative bg-[#151515] p-4 rounded-3xl border border-white/10 shadow-lg overflow-hidden group">
                <div className="relative z-10">
                    <div className="bg-red-500/20 w-fit p-1.5 rounded-lg mb-2">
                        <AlertTriangle size={14} className="text-red-500" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase leading-none mb-1">Meta</h4>
                    <p className="text-[9px] text-gray-500 leading-tight">{'<'}20h = 0% Bono.<br/>20-43h = 50%.</p>
                </div>
            </div>

            {/* 4. Soporte */}
            <div className="relative bg-[#151515] p-4 rounded-3xl border border-white/10 shadow-lg overflow-hidden group">
                <div className="relative z-10">
                    <div className="bg-blue-500/20 w-fit p-1.5 rounded-lg mb-2">
                        <ShieldCheck size={14} className="text-blue-500" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase leading-none mb-1">Fraude</h4>
                    <p className="text-[9px] text-gray-500 leading-tight">Max 50% soporte cruzado.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentTableTool;
