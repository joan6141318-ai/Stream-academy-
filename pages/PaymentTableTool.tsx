import React from 'react';
import { Calendar, Clock, AlertTriangle, ShieldCheck, Table } from 'lucide-react';
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
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-24">
        
        {/* Descripción Superior */}
        <div className="mt-6 mb-4 px-1">
            <div className="w-10 h-10 bg-brand-purple rounded-sm flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
                <Table className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-none mb-2">
                Tabla de<br/>Remuneración
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Consulta los niveles de salario base y bonificaciones según tu rendimiento mensual.
            </p>
        </div>
        
        {/* Tabla Original (Diseño Compacto y Restaurado) */}
        <div className="mb-8 bg-white dark:bg-brand-dark-card rounded-sm shadow-lg overflow-hidden border border-gray-100 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-purple text-white">
                  <th className="p-2 text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Nivel</th>
                  <th className="p-2 text-[10px] font-black uppercase tracking-wider text-center">Meta en<br/>Semillas</th>
                  <th className="p-2 text-[10px] font-black uppercase tracking-wider text-center">Horas<br/>al día</th>
                  <th className="p-2 text-[10px] font-black uppercase tracking-wider text-center">Meta mensual<br/>en horas</th>
                  <th className="p-2 text-[10px] font-black uppercase tracking-wider text-center">Remu-<br/>neración</th>
                  <th className="p-2 text-[10px] font-black uppercase tracking-wider text-center">Cambio de<br/>semillas</th>
                  <th className="p-2 text-[10px] font-black uppercase tracking-wider text-right">Pago<br/>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {TABLE_DATA.map((row, index) => (
                  <tr key={index} className={`group hover:bg-purple-50 dark:hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50 dark:bg-white/[0.02]'}`}>
                    <td className="p-2 text-[10px] font-black text-brand-black dark:text-white">{row.level}</td>
                    <td className="p-2 text-[10px] font-bold text-gray-600 dark:text-gray-300 text-center">{row.seeds}</td>
                    <td className="p-2 text-[10px] font-medium text-center text-gray-500">{row.daily}</td>
                    <td className="p-2 text-[10px] font-medium text-center text-gray-500">{row.monthly}</td>
                    <td className="p-2 text-[10px] font-medium text-center text-gray-600 dark:text-gray-400">{row.base}</td>
                    <td className="p-2 text-[10px] font-medium text-center text-gray-600 dark:text-gray-400">{row.exchange}</td>
                    <td className="p-2 text-[10px] font-black text-right text-brand-purple">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de Información Importante (Fichas) */}
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Información Importante</h3>
            
            {/* 1. Calendario de Pagos */}
            <div className="bg-white dark:bg-brand-dark-card p-5 rounded-lg border-l-4 border-brand-purple shadow-sm">
                <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mr-3">
                        <Calendar className="text-brand-purple" size={16} />
                    </div>
                    <h4 className="text-sm font-black text-brand-black dark:text-white uppercase">Calendario de Pagos</h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-11">
                    Los pagos se procesan durante la <span className="font-bold text-brand-purple">primera semana de cada mes</span>. Es requisito indispensable cumplir ambas metas (Horas + Semillas).
                </p>
            </div>

            {/* 2. Reglas de Transmisión */}
            <div className="bg-white dark:bg-brand-dark-card p-5 rounded-lg border-l-4 border-amber-500 shadow-sm">
                <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mr-3">
                        <Clock className="text-amber-500" size={16} />
                    </div>
                    <h4 className="text-sm font-black text-brand-black dark:text-white uppercase">Reglas de Transmisión Diaria</h4>
                </div>
                <ul className="pl-11 space-y-2">
                    <li className="flex items-start text-xs text-gray-600 dark:text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2 flex-shrink-0"></span>
                        <span><span className="font-bold">Horas válidas por día:</span> Máximo 2 horas.</span>
                    </li>
                    <li className="flex items-start text-xs text-gray-600 dark:text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2 flex-shrink-0"></span>
                        <span>Transmisión mínima: <span className="font-bold">30 minutos</span> continuos.</span>
                    </li>
                </ul>
            </div>

            {/* 3. Condiciones de Meta */}
            <div className="bg-white dark:bg-brand-dark-card p-5 rounded-lg border-l-4 border-red-500 shadow-sm">
                <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mr-3">
                        <AlertTriangle className="text-red-500" size={16} />
                    </div>
                    <h4 className="text-sm font-black text-brand-black dark:text-white uppercase">Condiciones de Meta Mensual</h4>
                </div>
                <div className="pl-11 space-y-3">
                    <div>
                        <p className="text-xs font-bold text-red-500 mb-1">Menos de 20 horas:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                            No se recibe el pago de la meta (0%), solo el cambio de semillas.
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-orange-500 mb-1">Entre 20 y 43 horas:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                            Si logras la meta de semillas pero no la de horas, recibirás solo el <span className="font-bold">50%</span> del pago de la meta.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Política de Soporte Cruzado */}
            <div className="bg-white dark:bg-brand-dark-card p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-3">
                        <ShieldCheck className="text-blue-500" size={16} />
                    </div>
                    <h4 className="text-sm font-black text-brand-black dark:text-white uppercase">Política de Soporte Cruzado</h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-11 text-justify">
                    El emisor <span className="font-bold">no podrá recibir más del 50%</span> de las semillas de su meta por parte de otro emisor o de otra agencia. Esto se considera soporte cruzado y puede afectar el pago de la meta.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentTableTool;