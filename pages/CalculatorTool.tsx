import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Clock, DollarSign, TrendingUp, AlertTriangle, XCircle, CheckCircle, PartyPopper } from 'lucide-react';
import { Header } from '../components/Header';
import { SALARY_TIERS } from '../constants';

const CalculatorTool: React.FC = () => {
  const navigate = useNavigate();
  const [seeds, setSeeds] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [status, setStatus] = useState<'neutral' | 'danger' | 'warning' | 'success'>('neutral');
  const [result, setResult] = useState<{
    basePay: number;
    excessPay: number;
    totalPay: number;
    tierReached: number | null;
    excessSeeds: number;
  }>({ basePay: 0, excessPay: 0, totalPay: 0, tierReached: null, excessSeeds: 0 });

  // Ref to track if audio context is initialized (optional safety)
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Function to generate the 4-second alert sound (Siren Style)
  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // ALARM SOUND: Siren / Alerta (Square wave for urgency)
      osc.type = 'square'; 
      
      const now = ctx.currentTime;
      const duration = 4; // Exactly 4 seconds

      // Frequency modulation for Siren effect (High-Low oscillation)
      // Starts at 600Hz, goes to 800Hz and back repeatedly
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(850, now + 0.5);
      osc.frequency.linearRampToValueAtTime(600, now + 1.0);
      osc.frequency.linearRampToValueAtTime(850, now + 1.5);
      osc.frequency.linearRampToValueAtTime(600, now + 2.0);
      osc.frequency.linearRampToValueAtTime(850, now + 2.5);
      osc.frequency.linearRampToValueAtTime(600, now + 3.0);
      osc.frequency.linearRampToValueAtTime(850, now + 3.5);
      osc.frequency.linearRampToValueAtTime(600, now + 4.0);

      // Volume Control
      gainNode.gain.setValueAtTime(0.08, now); // Not too loud
      gainNode.gain.linearRampToValueAtTime(0.08, now + 3.5);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.start(now);
      osc.stop(now + duration);

    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  // Calculation Logic
  useEffect(() => {
    const numSeeds = parseInt(seeds.replace(/,/g, ''), 10) || 0;
    const numHours = parseInt(hours, 10) || 0;
    
    // 1. Find the highest tier reached based on seeds
    const tier = SALARY_TIERS.find(t => numSeeds >= t.seeds);
    
    // Determine Logic based on Hours Rules
    if (numHours === 0) {
        setStatus('neutral');
        setResult({ basePay: 0, excessPay: 0, totalPay: 0, tierReached: 0, excessSeeds: 0 });
        return;
    }

    // SCENARIO A: Less than 20 hours
    if (numHours < 20) {
        setStatus('danger');
        // "No será acreedor a monetizar solo al cambio de semillas"
        // Todo se paga a tasa de cambio (Semillas / 210)
        const exchangeVal = numSeeds / 210;
        
        setResult({
            basePay: 0, // No base
            excessPay: exchangeVal, // All is treated as exchange
            totalPay: exchangeVal,
            tierReached: tier ? tier.seeds : 0,
            excessSeeds: numSeeds // All seeds are excess in this case
        });
        return;
    }

    // Logic for scenarios where hours >= 20 (Tier applies)
    if (tier) {
        const rawExcessSeeds = numSeeds - tier.seeds;
        const rawExcessPay = rawExcessSeeds > 0 ? rawExcessSeeds / 210 : 0;
        
        let finalBasePay = tier.pay;
        
        // SCENARIO B: Between 20 and 44 hours
        if (numHours >= 20 && numHours < 44) {
            setStatus('warning');
            finalBasePay = tier.pay * 0.5; // "Solo se le pagará el 50% de la meta"
        } 
        // SCENARIO C: 44 hours or more
        else {
            setStatus('success');
            finalBasePay = tier.pay; // 100% Payment
        }

        setResult({
            basePay: finalBasePay,
            excessPay: rawExcessPay,
            totalPay: finalBasePay + rawExcessPay,
            tierReached: tier.seeds,
            excessSeeds: rawExcessSeeds > 0 ? rawExcessSeeds : 0
        });

    } else {
        // Fallback if seeds < lowest tier (Exchange rate only)
        // Treated same as < 20 hours effectively but visual status depends on hours
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

  // Effect to trigger sound with DEBOUNCE (Delay)
  // Only plays if status settles on 'danger' after user stops typing for 1.5s
  useEffect(() => {
    // We only want to alert if there is actual input in both fields to avoid premature alerts
    if (seeds.length === 0 || hours.length === 0 || status !== 'danger') {
        return;
    }

    const timer = setTimeout(() => {
        playAlertSound();
    }, 1500); // 1.5 seconds delay

    return () => clearTimeout(timer);
  }, [seeds, hours, status]);

  const formatCurrency = (val: number) => {
    // Adds USD explicitly to the formatted string
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val) + ' USD';
  };

  const formatNumber = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(val))) {
      setSeeds(val);
    }
  };

  // Helper for Status UI
  const getStatusConfig = () => {
    switch (status) {
        case 'danger':
            return {
                borderColor: 'border-red-500',
                shadowColor: 'shadow-red-500/30',
                icon: XCircle,
                iconColor: 'text-red-500',
                message: 'Horas insuficientes (<20h). No aplicas a bono de meta. Solo cambio de Monedero.',
                textColor: 'text-red-400'
            };
        case 'warning':
            return {
                borderColor: 'border-yellow-500',
                shadowColor: 'shadow-yellow-500/30',
                icon: AlertTriangle,
                iconColor: 'text-yellow-500',
                message: 'Horas parciales (20h-43h). Pago de meta al 50%.',
                textColor: 'text-yellow-400'
            };
        case 'success':
            return {
                borderColor: 'border-emerald-500',
                shadowColor: 'shadow-emerald-500/40',
                icon: CheckCircle,
                iconColor: 'text-emerald-500',
                message: 'Felicidades por lograr tu meta sigue así ! En hora buena disfruta tu pago',
                textColor: 'text-emerald-400'
            };
        default:
            return {
                borderColor: 'border-gray-800',
                shadowColor: 'shadow-black/20',
                icon: Calculator,
                iconColor: 'text-gray-500',
                message: 'Ingresa tus datos para calcular.',
                textColor: 'text-gray-400'
            };
    }
  };

  const statusUI = getStatusConfig();
  const StatusIcon = statusUI.icon;

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header 
        title="Calculadora" 
        showBack 
        onBack={() => navigate('/training/pagos')} 
      />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-8">
        
        {/* Intro */}
        <div className="mt-6 mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-sm flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                <Calculator className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none mb-2">
                Simulador de<br/>Ingresos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Calcula tu salario estimado basándote en las metas oficiales de la agencia y el tipo de cambio actual.
            </p>
        </div>

        {/* Inputs */}
        <div className="space-y-6 mb-8">
            {/* Seeds Input */}
            <div className="bg-white dark:bg-brand-dark-card p-4 rounded-sm border-l-4 border-orange-500 shadow-sm">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    <TrendingUp size={12} className="mr-1" />
                    Semillas Totales (Mes)
                </label>
                <div className="flex items-center">
                    <input 
                        type="text" 
                        inputMode="numeric"
                        value={formatNumber(seeds)}
                        onChange={handleSeedChange}
                        placeholder="0"
                        className="w-full bg-transparent text-3xl font-black text-brand-black dark:text-white outline-none placeholder-gray-200"
                    />
                </div>
            </div>

            {/* Hours Input */}
            <div className="bg-white dark:bg-brand-dark-card p-4 rounded-sm border-l-4 border-brand-black dark:border-gray-600 shadow-sm">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    <Clock size={12} className="mr-1" />
                    Horas Transmitidas
                </label>
                <div className="flex items-center">
                    <input 
                        type="number" 
                        inputMode="numeric"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent text-3xl font-black text-brand-black dark:text-white outline-none placeholder-gray-200"
                    />
                    <span className="text-sm font-bold text-gray-400 uppercase">Hrs</span>
                </div>
            </div>
        </div>

        {/* Result Card - Dynamic Styling */}
        <div className={`
            relative overflow-hidden rounded-sm p-6 
            bg-brand-black text-white 
            border-2 ${statusUI.borderColor}
            shadow-xl ${statusUI.shadowColor}
            transition-all duration-500 ease-out
        `}>
            {/* Success Confetti Effect */}
            {status === 'success' && (
                <div className="absolute top-0 right-0 p-4 animate-bounce opacity-80">
                     <PartyPopper className="text-emerald-400" size={32} />
                </div>
            )}

            {/* Background Decor */}
            <DollarSign className="absolute -right-6 -bottom-6 text-white/5 rotate-12" size={180} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${statusUI.textColor}`}>Pago Estimado Total</p>
                        <h2 className="text-4xl font-black tracking-tighter">
                            {formatCurrency(result.totalPay)}
                        </h2>
                    </div>
                </div>

                {/* Status Message */}
                <div className="flex items-start space-x-2 mb-6 bg-white/5 p-3 rounded-sm backdrop-blur-sm">
                     <StatusIcon size={16} className={`mt-0.5 flex-shrink-0 ${statusUI.iconColor}`} />
                     <p className="text-xs font-bold leading-tight opacity-90">
                        {statusUI.message}
                     </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                            <span className="font-medium opacity-60">Salario Base (Meta)</span>
                            {result.tierReached && result.tierReached > 0 ? (
                                <span className="text-[10px] font-black uppercase tracking-wider text-white/90">
                                    Meta Lograda: {formatNumber(result.tierReached.toString())} Semillas
                                </span>
                            ) : null}
                        </div>
                        <span className={`font-bold ${status === 'danger' ? 'text-red-500 line-through decoration-2' : 'text-white'}`}>
                            {formatCurrency(result.basePay)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                           <span className="font-medium opacity-60">Excedente :</span>
                           <span className="text-[10px] font-black uppercase tracking-wider text-white/90">
                                {formatNumber(result.excessSeeds.toString())} Semillas
                           </span>
                           <span className="text-[9px] opacity-40 mt-0.5">Por cada 210 semillas = $1 dólar</span>
                        </div>
                        <span className="font-bold text-orange-400">+{formatCurrency(result.excessPay)}</span>
                    </div>
                </div>
            </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-6 px-4 leading-relaxed">
            *Nota Importante: Los montos mostrados son estimaciones brutas. El valor final recibido en tu cuenta puede variar debido a comisiones de retiro, tarifas de transferencia bancaria o costos de conversión de divisas aplicados por tu banco local.
        </p>

      </div>
    </div>
  );
};

export default CalculatorTool;