
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Clock, DollarSign, TrendingUp, AlertTriangle, XCircle, CheckCircle, PartyPopper, Target, Layers, Coins } from 'lucide-react';
import { Header } from '../components/Header';
import { SALARY_TIERS } from '../constants';

const CalculatorTool: React.FC = () => {
  const navigate = useNavigate();
  const [seeds, setSeeds] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [status, setStatus] = useState<'neutral' | 'danger' | 'warning' | 'success'>('neutral');
  const [result, setResult] = useState<any>({ basePay: 0, excessPay: 0, totalPay: 0, tierReached: 0, excessSeeds: 0 });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playAlertSound = () => {
    try {
      // @ts-ignore
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      
      const ctx = audioCtxRef.current;
      
      if (ctx.state === 'suspended') {
          ctx.resume().catch((e) => console.warn("Audio resume failed (no interaction)", e));
      }
      
      if (ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'square'; 
      const now = ctx.currentTime;
      const duration = 2;

      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(850, now + 0.5);
      osc.frequency.linearRampToValueAtTime(600, now + 1.0);
      osc.frequency.linearRampToValueAtTime(850, now + 1.5);
      osc.frequency.linearRampToValueAtTime(600, now + 2.0);

      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.start(now);
      osc.stop(now + duration);

    } catch (e) {
      console.warn("Audio error ignored:", e);
    }
  };

  useEffect(() => {
    const numSeeds = parseInt(seeds.replace(/,/g, ''), 10) || 0;
    const numHours = parseInt(hours, 10) || 0;
    
    const tier = SALARY_TIERS.find(t => numSeeds >= t.seeds);
    
    if (numHours === 0 && numSeeds === 0) {
        setStatus('neutral');
        setResult({ basePay: 0, excessPay: 0, totalPay: 0, tierReached: 0, excessSeeds: 0 });
        return;
    }

    if (numHours < 20) {
        setStatus('danger');
        const exchangeVal = numSeeds / 210;
        setResult({ 
            basePay: 0, 
            excessPay: exchangeVal, 
            totalPay: exchangeVal, 
            tierReached: tier ? tier.seeds : 0, 
            excessSeeds: numSeeds 
        });
        return;
    }

    if (tier) {
        const rawExcessSeeds = numSeeds - tier.seeds;
        const rawExcessPay = rawExcessSeeds > 0 ? rawExcessSeeds / 210 : 0;
        let finalBasePay = tier.pay;
        
        if (numHours >= 20 && numHours < 44) {
            setStatus('warning');
            finalBasePay = tier.pay * 0.5;
        } else {
            setStatus('success');
            finalBasePay = tier.pay;
        }

        setResult({ 
            basePay: finalBasePay, 
            excessPay: rawExcessPay, 
            totalPay: finalBasePay + rawExcessPay, 
            tierReached: tier.seeds, 
            excessSeeds: rawExcessSeeds > 0 ? rawExcessSeeds : 0 
        });
    } else {
        setStatus(numHours < 44 ? 'warning' : 'neutral');
        const pay = numSeeds / 210;
        setResult({ 
            basePay: 0, 
            excessPay: pay, 
            totalPay: pay, 
            tierReached: 0, 
            excessSeeds: numSeeds 
        });
    }
  }, [seeds, hours]);

  useEffect(() => {
    if (status === 'danger' && seeds.length > 0 && hours.length > 0) {
        const timer = setTimeout(() => { playAlertSound(); }, 500); 
        return () => clearTimeout(timer);
    }
  }, [status]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatNumber = (val: string | number) => val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value.replace(/,/g, ''); if (!isNaN(Number(val))) setSeeds(val); };

  const getStatusConfig = () => {
    switch (status) {
        case 'danger': return { borderColor: 'border-red-500', shadowColor: 'shadow-red-500/30', icon: XCircle, iconColor: 'text-red-500', message: 'Horas insuficientes (<20h). No aplicas a bono.', textColor: 'text-red-400' };
        case 'warning': return { borderColor: 'border-yellow-500', shadowColor: 'shadow-yellow-500/30', icon: AlertTriangle, iconColor: 'text-yellow-500', message: 'Horas parciales. Pago de meta al 50%.', textColor: 'text-yellow-400' };
        case 'success': return { borderColor: 'border-emerald-500', shadowColor: 'shadow-emerald-500/40', icon: CheckCircle, iconColor: 'text-emerald-500', message: 'Felicidades por lograr tu meta sigue así ! En hora buena disfruta tu pago', textColor: 'text-emerald-500' };
        default: return { borderColor: 'border-gray-800', shadowColor: 'shadow-black/20', icon: Calculator, iconColor: 'text-gray-500', message: 'Ingresa tus datos.', textColor: 'text-gray-400' };
    }
  };

  const statusUI = getStatusConfig();
  const StatusIcon = statusUI.icon;

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Calculadora" showBack onBack={() => navigate('/training/pagos')} />
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-8">
        
        {/* Header Title */}
        <div className="mt-6 mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                <Calculator className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none mb-2">Simulador de<br/>Ingresos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Calcula tu salario estimado.</p>
        </div>

        {/* Inputs */}
        <div className="space-y-6 mb-8">
            <div className="bg-white dark:bg-brand-dark-card p-4 rounded-xl border-l-4 border-orange-500 shadow-sm">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    <TrendingUp size={12} className="mr-1" /> Semillas Totales
                </label>
                <div className="flex items-center">
                    <input type="text" inputMode="numeric" value={formatNumber(seeds)} onChange={handleSeedChange} placeholder="0" className="w-full bg-transparent text-3xl font-black text-brand-black dark:text-white outline-none placeholder-gray-200" />
                </div>
            </div>
            <div className="bg-white dark:bg-brand-dark-card p-4 rounded-xl border-l-4 border-brand-black dark:border-gray-600 shadow-sm">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    <Clock size={12} className="mr-1" /> Horas
                </label>
                <div className="flex items-center">
                    <input type="number" inputMode="numeric" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" className="w-full bg-transparent text-3xl font-black text-brand-black dark:text-white outline-none placeholder-gray-200" />
                    <span className="text-sm font-bold text-gray-400 uppercase">Hrs</span>
                </div>
            </div>
        </div>
        
        {/* RESULT CARD (REDISEÑADA) */}
        <div className="w-full max-w-md mx-auto">
            <div className={`relative overflow-hidden rounded-3xl bg-[#09090b] text-white shadow-2xl transition-all duration-500 ease-out ${status === 'success' ? 'shadow-emerald-500/10' : ''}`}>
                
                {/* Top Border Accent */}
                <div className={`h-1.5 w-full ${status === 'success' ? 'bg-emerald-500' : status === 'warning' ? 'bg-yellow-500' : status === 'danger' ? 'bg-red-500' : 'bg-gray-700'}`}></div>

                <div className="p-8 relative z-10">
                    {/* Floating Icon */}
                    {status === 'success' && <PartyPopper className="absolute top-6 right-6 text-emerald-500 animate-bounce" size={28} />}
                    
                    {/* Header Total */}
                    <div className="mb-8">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${status === 'success' ? 'text-emerald-500' : 'text-gray-400'}`}>
                            PAGO ESTIMADO TOTAL
                        </p>
                        <h2 className="text-5xl font-black tracking-tighter text-white">
                            {formatCurrency(result.totalPay)} <span className="text-2xl text-gray-500 font-bold ml-1">USD</span>
                        </h2>
                    </div>

                    {/* Status Message Box */}
                    <div className="bg-[#151517] rounded-xl p-4 mb-8 flex items-start gap-3 border border-white/5">
                        <StatusIcon size={20} className={`mt-0.5 flex-shrink-0 ${statusUI.iconColor}`} />
                        <p className="text-xs font-bold leading-relaxed text-gray-200">
                            {statusUI.message}
                        </p>
                    </div>

                    <div className="space-y-6 border-t border-white/5 pt-6">
                        
                        {/* Row 1: Base */}
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm font-bold text-gray-400 mb-1">Salario Base (Meta)</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">
                                    META LOGRADA: {formatNumber(result.tierReached)} SEMILLAS
                                </p>
                            </div>
                            <span className="text-xl font-black text-white">
                                {formatCurrency(result.basePay)} <span className="text-xs font-bold text-gray-500">USD</span>
                            </span>
                        </div>

                        {/* Row 2: Excess */}
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm font-bold text-gray-400 mb-1">Excedente :</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">
                                    {formatNumber(result.excessSeeds)} SEMILLAS
                                </p>
                                <p className="text-[9px] font-medium text-gray-600 font-mono">
                                    Por cada 210 semillas = $1 dólar
                                </p>
                            </div>
                            <span className="text-xl font-black text-orange-500">
                                +{formatCurrency(result.excessPay)} <span className="text-xs font-bold text-orange-500/50">USD</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Background Watermark */}
                <DollarSign className="absolute -bottom-10 -right-6 text-white/[0.02] rotate-12 pointer-events-none" size={250} />
            </div>

            {/* Footer Disclaimer */}
            <p className="mt-6 text-[10px] text-gray-400 text-center leading-relaxed font-medium px-4 opacity-70">
                *Nota Importante: Los montos mostrados son estimaciones brutas. El valor final recibido en tu cuenta puede variar debido a comisiones de retiro, tarifas de transferencia bancaria o costos de conversión de divisas aplicados por tu banco local.
            </p>
        </div>

      </div>
    </div>
  );
};

export default CalculatorTool;
