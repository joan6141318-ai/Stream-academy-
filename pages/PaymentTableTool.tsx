
import React from 'react';
import { Calendar, Clock, AlertTriangle, ShieldCheck, DollarSign, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';

const PaymentTableTool: React.FC = () => {
  const navigate = useNavigate();
  
  // Datos oficiales de la estructura de pagos
  const TABLE_DATA = [
    { level: 'A', seeds: '2,000', daily: '2 Hrs', monthly: 44, base: '$14', exchange: '$9', total: '$23' },
    { level: 'B', seeds: '5,000', daily: '2 Hrs', monthly: 44, base: '$35', exchange: '$23', total: '$58' },
    { level: 'C', seeds: '10,000', daily: '2 Hrs', monthly: 44, base: '$74', exchange: '$48', total: '$122' },
    { level: 'CE', seeds: '20,000', daily: '2 Hrs', monthly: 44, base: '$141', exchange: '$95', total: '$236' },
    { level: 'D', seeds: '30,000', daily: '2 Hrs', monthly: 44, base: '$211', exchange: '$143', total: '$354' },
    { level: 'E', seeds: '60,000', daily: '2 Hrs', monthly: 44, base: '$422', exchange: '$286', total: '$708' },
    { level: 'S1', seeds: '100,000', daily: '2 Hrs', monthly: 44, base: '$660', exchange: '$476', total: '$1,136' },
    { level: 'S2', seeds: '150,000', daily: '2 Hrs', monthly: 44, base: '$990', exchange: '$714', total: '$1,704' },
    { level: 'S3', seeds: '200,000', daily: '2 Hrs', monthly: 44, base: '$1,320', exchange: '$952', total: '$2,272' },
    { level: 'S4', seeds: '250,000', daily: '2 Hrs', monthly: 44, base: '$1,650', exchange: '$1,190', total: '$2,840' },
    { level: 'S5', seeds: '300,000', daily: '2 Hrs', monthly: 44, base: '$1,980', exchange: '$1,429', total: '$3,409' },
    { level: 'S6', seeds: '400,000', daily: '2 Hrs', monthly: 44, base: '$2,700', exchange: '$1,904', total: '$4,604' },
    { level: 'S7', seeds: '500,000', daily: '2 Hrs', monthly: 44, base: '$3,550', exchange: '$2,381', total: '$5,931' },
    { level: 'S8', seeds: '750,000', daily: '2 Hrs', monthly: 44, base: '$5,500', exchange: '$3,572', total: '$9,072' },
    { level: 'S9', seeds: '1,000,000', daily: '2 Hrs', monthly: 44, base: '$6,800', exchange: '$4,762', total: '$11,562' },
    { level: 'S10', seeds: '1,500,000', daily: '2 Hrs', monthly: 44, base: '$10,400', exchange: '$7,143', total: '$17,543' },
    { level: 'S11', seeds: '2,000,000', daily: '2 Hrs', monthly: 44, base: '$14,500', exchange: '$9,524', total: '$24,024' },
    { level: 'S12', seeds: '3,000,000', daily: '2 Hrs', monthly: 44, base: '$22,500', exchange: '$14,286', total: '$36,786' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
      <Header title="Tabla de Pagos" showBack onBack={() => navigate('/training/pagos')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* Descripción Superior */}
        <div className="mt-4 mb-6 flex justify-between items-end px-1">
            <div>
                <h1 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-none mb-1 tracking-tighter">
                    Tabla Oficial
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                    Estructura 2025
                </p>
            </div>
            <div className="bg-brand-purple text-white px-3 py-1 rounded-full shadow-lg shadow-purple-500/30">
                <span className="text-[9px] font-black uppercase tracking-widest">USD Currency</span>
            </div>
        </div>
        
        {/* Tabla Container - TEMA CLARO */}
        <div className="relative w-full bg-white rounded-[2rem] border-[4px] border-gray-100 overflow-hidden shadow-xl mb-8">
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-brand-black whitespace-nowrap text-center">Nivel</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-gray-500 text-center whitespace-nowrap">Semillas</th>
                      {/* NUEVA COLUMNA */}
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-gray-500 text-center whitespace-nowrap">Horas<br/>Día</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-gray-500 text-center whitespace-nowrap">Meta<br/>Mes</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-gray-500 text-center whitespace-nowrap">Salario<br/>Base</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-gray-500 text-center whitespace-nowrap">Cambio</th>
                      <th className="py-3 px-3 text-[8px] font-black uppercase tracking-widest text-brand-purple text-right whitespace-nowrap pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {TABLE_DATA.map((row, index) => (
                      <tr key={index} className="hover:bg-purple-50 transition-colors even:bg-gray-50">
                        <td className="py-2.5 px-3 text-[9px] font-black text-brand-black text-center">{row.level}</td>
                        <td className="py-2.5 px-3 text-[9px] font-medium text-gray-600 text-center tabular-nums">{row.seeds}</td>
                        {/* DATO NUEVA COLUMNA */}
                        <td className="py-2.5 px-3 text-[9px] font-bold text-gray-800 text-center whitespace-nowrap">{row.daily}</td>
                        <td className="py-2.5 px-3 text-[9px] font-medium text-gray-600 text-center">{row.monthly}</td>
                        <td className="py-2.5 px-3 text-[9px] font-medium text-gray-600 text-center tabular-nums">{row.base}</td>
                        <td className="py-2.5 px-3 text-[9px] font-medium text-gray-600 text-center tabular-nums">{row.exchange}</td>
                        <td className="py-2.5 px-3 pr-4 text-[10px] font-black text-right text-brand-purple tracking-wide tabular-nums bg-purple-50/50">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
        </div>

        {/* Tarjeta Unificada - NEGRA */}
        <div className="bg-black text-white p-8 rounded-[2.5rem] border-[5px] border-[#1A1A1A] shadow-2xl relative overflow-hidden group">
            
            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <Info size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none">
                        Información General
                    </h3>
                </div>

                <div className="space-y-5">
                    {/* Item 1 */}
                    <div className="flex items-start space-x-4">
                        <div className="bg-brand-purple/20 p-2 rounded-lg mt-0.5">
                            <Calendar size={16} className="text-brand-purple" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wide mb-0.5 text-white">Pagos</h4>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Los pagos se procesan durante la primera semana de cada mes calendario.</p>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start space-x-4">
                        <div className="bg-orange-500/20 p-2 rounded-lg mt-0.5">
                            <Clock size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wide mb-0.5 text-white">Horas Válidas</h4>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Máximo 2 horas diarias cuentan para la meta mensual. Transmitir más no suma al bono.</p>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-start space-x-4">
                        <div className="bg-red-500/20 p-2 rounded-lg mt-0.5">
                            <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wide mb-0.5 text-white">Penalización</h4>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Menos de 20 horas mensuales = 0% Bono. Entre 20 y 43 horas = 50% del salario base.</p>
                        </div>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-start space-x-4">
                        <div className="bg-blue-500/20 p-2 rounded-lg mt-0.5">
                            <ShieldCheck size={16} className="text-blue-500" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wide mb-0.5 text-white">Anti-Fraude</h4>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Máximo permitido del 50% de soporte cruzado (intercambio de regalos) para evitar deducciones.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decor */}
            <DollarSign className="absolute -bottom-6 -right-6 text-white/5 rotate-[-15deg]" size={180} />
        </div>

      </div>
    </div>
  );
};

export default PaymentTableTool;
