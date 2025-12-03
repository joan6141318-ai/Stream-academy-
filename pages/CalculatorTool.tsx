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
  const [result, setResult] = useState<any>({ basePay: 0, excessPay: 0, totalPay: 0, tierReached: null, excessSeeds: 0 });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playAlertSound = () => {
    // Robustez: Envolver en try/catch para evitar crash en browsers restrictivos
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      
      const ctx = audioCtxRef.current;
      
      // Si está suspendido, intentar resumir (podría fallar sin gesto de usuario, pero no crashea la app)
      if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {}); 
      }
      
      if (ctx.state !== 'running') return; // Si no corre, salimos silenciosamente

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'square'; 
      const now = ctx.currentTime;
      const duration = 2; // Reducido a 2s para ser menos intrusivo

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
    
    if (numHours === 0) {
        setStatus('neutral');
        setResult({ basePay: 0, excessPay: 0, totalPay: 0, tierReached: 0, excessSeeds: 0 });
        return;
    }

    if (numHours < 20) {
        setStatus('danger');
        const exchangeVal = numSeeds / 210;
        setResult({ basePay: 0, excessPay: exchangeVal, totalPay: exchangeVal, tierReached: tier ? tier.seeds : 0, excessSeeds: numSeeds });
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

        setResult({ basePay: finalBasePay, excessPay: rawExcessPay, totalPay: finalBasePay + rawExcessPay, tierReached: tier.seeds, excessSeeds: rawExcessSeeds > 0 ? rawExcessSeeds : 0 });
    } else {
        setStatus(numHours < 44 ? 'warning' : 'neutral');
        const pay = numSeeds / 210;
        setResult({ basePay: 0, excessPay: pay, totalPay: pay, tierReached: 0, excessSeeds: numSeeds });
    }
  }, [seeds, hours]);

  useEffect(() => {
    if (status === 'danger' && seeds.length > 0 && hours.length > 0) {
        const timer = setTimeout(() => { playAlertSound(); }, 1000); 
        return () => clearTimeout(timer);
    }
  }, [status]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val) + ' USD';
  const formatNumber = (val: string) => val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value.replace(/,/g, ''); if (!isNaN(Number(val))) setSeeds(val); };

  const getStatusConfig = () => {
    switch (status) {
        case 'danger': return { borderColor: 'border-red-500', shadowColor: 'shadow-red-500/30', icon: XCircle, iconColor: 'text-red-500', message: 'Horas insuficientes (<20h). No aplicas a bono.', textColor: 'text-red-400' };
        case 'warning': return { borderColor: 'border-yellow-500', shadowColor: 'shadow-yellow-500/30', icon: AlertTriangle, iconColor: 'text-yellow-500', message: 'Horas parciales. Pago al 50%.', textColor: 'text-yellow-400' };
        case 'success': return { borderColor: 'border-emerald-500', shadowColor: 'shadow-emerald-500/40', icon: CheckCircle, iconColor: 'text-emerald-500', message: '¡Meta Lograda!', textColor: 'text-emerald-400' };
        default: return { borderColor: 'border-gray-800', shadowColor: 'shadow-black/20', icon: Calculator, iconColor: 'text-gray-500', message: 'Ingresa tus datos.', textColor: 'text-gray-400' };
    }
  };

  const statusUI = getStatusConfig();
  const StatusIcon = statusUI.icon;

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Calculadora" showBack onBack={() => navigate('/training/pagos')} />
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-8">
        <div className="mt-6 mb-8"><div className="w-12 h-12 bg-orange-500 rounded-sm flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30"><Calculator className="text-white" size={24} strokeWidth={2.5} /></div><h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none mb-2">Simulador de<br/>Ingresos</h1><p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Calcula tu salario estimado.</p></div>
        <div className="space-y-6 mb-8">
            <div className="bg-white dark:bg-brand-dark-card p-4 rounded-sm border-l-4 border-orange-500 shadow-sm"><label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"><TrendingUp size={12} className="mr-1" /> Semillas Totales</label><div className="flex items-center"><input type="text" inputMode="numeric" value={formatNumber(seeds)} onChange={handleSeedChange} placeholder="0" className="w-full bg-transparent text-3xl font-black text-brand-black dark:text-white outline-none placeholder-gray-200" /></div></div>
            <div className="bg-white dark:bg-brand-dark-card p-4 rounded-sm border-l-4 border-brand-black dark:border-gray-600 shadow-sm"><label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"><Clock size={12} className="mr-1" /> Horas</label><div className="flex items-center"><input type="number" inputMode="numeric" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" className="w-full bg-transparent text-3xl font-black text-brand-black dark:text-white outline-none placeholder-gray-200" /><span className="text-sm font-bold text-gray-400 uppercase">Hrs</span></div></div>
        </div>
        <div className={`relative overflow-hidden rounded-sm p-6 bg-brand-black text-white border-2 ${statusUI.borderColor} shadow-xl ${statusUI.shadowColor} transition-all duration-500 ease-out`}>
            {status === 'success' && <div className="absolute top-0 right-0 p-4 animate-bounce opacity-80"><PartyPopper className="text-emerald-400" size={32} /></div>}
            <DollarSign className="absolute -right-6 -bottom-6 text-white/5 rotate-12" size={180} />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6"><div><p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${statusUI.textColor}`}>Pago Estimado Total</p><h2 className="text-4xl font-black tracking-tighter">{formatCurrency(result.totalPay)}</h2></div></div>
                <div className="flex items-start space-x-2 mb-6 bg-white/5 p-3 rounded-sm backdrop-blur-sm"><StatusIcon size={16} className={`mt-0.5 flex-shrink-0 ${statusUI.iconColor}`} /><p className="text-xs font-bold leading-tight opacity-90">{statusUI.message}</p></div>
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center text-sm"><span className="font-medium opacity-60">Salario Base</span><span className={`font-bold ${status === 'danger' ? 'text-red-500 line-through' : 'text-white'}`}>{formatCurrency(result.basePay)}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="font-medium opacity-60">Excedente</span><span className="font-bold text-orange-400">+{formatCurrency(result.excessPay)}</span></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorTool;
