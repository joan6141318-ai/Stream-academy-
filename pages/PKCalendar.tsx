
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Calendar, Swords, Shield, ArrowRight, ChevronDown, ChevronUp, CheckCircle2, Clock, Check, History, XCircle, Loader2, CalendarCheck, AlertCircle } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { PKEvent, PKSchedule, PKRequest } from '../types';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, query, collection } from 'firebase/firestore';

interface RequestData {
    date: string;
    bigoId: string;
}

const PKCalendar: React.FC = () => {
  const navigate = useNavigate();
  // Solo importamos la función de añadir, no los datos
  const { addPKRequest } = useContent();
  const { user } = useAuth();
  
  // Local Data State (Architecture Fix)
  const [pkSchedule, setPkSchedule] = useState<PKSchedule>({ potential: [], supersmash: [] });
  const [pkRequests, setPkRequests] = useState<PKRequest[]>([]);

  // UI States
  const [openPotential, setOpenPotential] = useState(false);
  const [openSupersmash, setOpenSupersmash] = useState(false);
  const [openRequest, setOpenRequest] = useState(false);
  const [requestDate, setRequestDate] = useState('');
  const [requestBigoId, setRequestBigoId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequest, setMyRequest] = useState<RequestData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();

  // --- DATA FETCHING (Local Listener) ---
  useEffect(() => {
      if (!db) return;

      // 1. Listen Schedule
      const unsubSchedule = onSnapshot(doc(db, "schedules", "main"), (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data() as PKSchedule;
              setPkSchedule({
                  potential: data.potential || [],
                  supersmash: data.supersmash || []
              });
          }
      });

      // 2. Listen Requests (Solo las mías o todas? En user view mejor todas para validar duplicados o solo mías)
      // Para optimizar, podríamos filtrar solo las del usuario, pero el requerimiento pedía quitar la carga global.
      const unsubRequests = onSnapshot(query(collection(db, "pk_requests")), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PKRequest));
          setPkRequests(list);
      });

      return () => {
          unsubSchedule();
          unsubRequests();
      };
  }, []);

  const myRequestsHistory = pkRequests.filter(req => req.userId === user?.id);
  const hasPendingRequest = myRequestsHistory.some(req => req.status === 'pending');

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleRequestPK = async (e: React.FormEvent) => {
      e.preventDefault();
      if (hasPendingRequest) {
          alert("Ya tienes una solicitud en revisión.");
          return;
      }
      if (!requestDate || !requestBigoId || !user) return;

      setIsSubmitting(true);
      try {
          await addPKRequest(requestDate, requestBigoId, user.id);
          setMyRequest({ date: requestDate, bigoId: requestBigoId });
          setRequestDate('');
          setRequestBigoId('');
          setOpenRequest(false);
          setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 500);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => { setMyRequest(null); timerRef.current = null; }, 5000);
      } catch (error) {
          alert("Error al enviar solicitud.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const renderEventRow = (item: PKEvent) => (
      <div key={item.id} className="py-5 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors px-3 -mx-3 rounded-xl mb-2">
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-300">
                  <Clock size={12} strokeWidth={2.5} />
                  <span className="text-[10px] font-black">{item.time}</span>
              </div>
              <button className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 cursor-default ${item.confirmed ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-100 dark:bg-white/10 text-gray-300'}`}>
                  <CheckCircle2 size={16} strokeWidth={2.5} />
              </button>
          </div>
          <div className="flex items-center justify-between gap-2 px-1">
               <div className="flex-1 text-right"><span className={`text-base font-black uppercase tracking-tight ${item.id1 ? 'text-brand-black dark:text-white' : 'text-gray-200 dark:text-white/10'}`}>{item.id1 || '_ _ _'}</span></div>
               <div className="flex flex-col items-center justify-center px-4"><div className="bg-brand-black dark:bg-white text-white dark:text-black text-[10px] font-black px-2 py-1 rounded skew-x-[-10deg] shadow-lg">VS</div></div>
               <div className="flex-1 text-left"><span className={`text-base font-black uppercase tracking-tight ${item.id2 ? 'text-brand-black dark:text-white' : 'text-gray-200 dark:text-white/10'}`}>{item.id2 || '_ _ _'}</span></div>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black transition-colors duration-300 font-sans">
      <Header title="Agenda PK" showBack onBack={() => navigate('/welcome')} />
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        <div className="mt-6 mb-8"><h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tighter">Programación<br/>Diaria</h1></div>

        {/* --- SECCIÓN: PK POTENCIAL --- */}
        <div className="mb-6 animate-fade-in">
            <button onClick={() => setOpenPotential(!openPotential)} className="w-full flex flex-col items-start bg-brand-black text-white p-6 rounded-2xl shadow-xl active:scale-[0.99] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10 w-full"><div className="flex justify-between items-center w-full"><h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-1">PK<br/>POTENCIAL</h2>{openPotential ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div><p className="text-sm font-bold text-white bg-white/10 inline-block px-3 py-1 rounded mt-2 uppercase tracking-widest">{today}</p></div>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openPotential ? 'max-h-[1200px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}><div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm">{pkSchedule.potential.map(item => renderEventRow(item))}</div></div>
        </div>

        {/* --- SECCIÓN: PK SUPERSMASH --- */}
        <div className="mb-6 animate-fade-in">
             <button onClick={() => setOpenSupersmash(!openSupersmash)} className="w-full flex flex-col items-start bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-[0.99] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10 w-full"><div className="flex justify-between items-center w-full"><h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">PK<br/>SUPERSMASH</h2>{openSupersmash ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div><p className="text-sm font-bold text-white bg-black/10 inline-block px-3 py-1 rounded mt-2 uppercase tracking-widest">{today}</p></div>
            </button>
             <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSupersmash ? 'max-h-[1200px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}><div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm">{pkSchedule.supersmash.map(item => renderEventRow(item))}</div></div>
        </div>

        {/* --- WIDGET: SOLICITAR PK --- */}
        <div className="mb-8 animate-fade-in mt-8">
            <button onClick={() => setOpenRequest(!openRequest)} className="w-full flex flex-col items-start bg-[#121212] text-white p-6 rounded-2xl shadow-xl active:scale-[0.99] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-purple/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-50"></div>
                <div className="relative z-10 w-full"><div className="flex justify-between items-center w-full"><h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">SOLICITA<br/>UN PK</h2>{openRequest ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Agenda tu batalla</p></div>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openRequest ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-[#121212] rounded-[2rem] p-6 shadow-2xl border border-white/5">
                    <div className="relative z-10">
                        {hasPendingRequest ? (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3"><AlertCircle className="text-yellow-500 flex-shrink-0" size={20} /><div><h4 className="text-xs font-black text-yellow-500 uppercase mb-1">Solicitud en Curso</h4><p className="text-[10px] text-yellow-200/80 leading-relaxed">Ya tienes una solicitud pendiente.</p></div></div>
                        ) : (
                            <form onSubmit={handleRequestPK} className="space-y-5">
                                <div className="group/input"><label className="text-[9px] font-bold uppercase text-gray-500 mb-2 block tracking-widest">Fecha Deseada</label><input type="date" required value={requestDate} onChange={(e) => setRequestDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white focus:bg-white/10 focus:border-brand-purple/50 outline-none transition-all uppercase" /></div>
                                <div className="group/input"><label className="text-[9px] font-bold uppercase text-gray-500 mb-2 block tracking-widest">Tu Bigo ID</label><input type="text" required value={requestBigoId} onChange={(e) => setRequestBigoId(e.target.value)} placeholder="ID EXACTO" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white focus:bg-white/10 focus:border-brand-purple/50 outline-none transition-all" /></div>
                                <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black h-16 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-gray-200 active:scale-[0.98] transition-all mt-4 flex items-center justify-center space-x-2">{isSubmitting ? <span className="animate-pulse">Procesando...</span> : <><span>Agendar</span><ArrowRight size={16} /></>}</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            {myRequest && (<div className="mt-6 animate-slide-up"><div className="bg-brand-purple text-white p-6 rounded-2xl shadow-xl shadow-purple-500/20 relative overflow-hidden border border-white/10"><div className="relative z-10 flex flex-col items-center text-center"><h3 className="text-xl font-black uppercase tracking-tight mb-1">Solicitud Recibida</h3><p className="text-xs font-medium text-white/80 mb-6">Tu batalla ha sido pre-agendada</p></div></div></div>)}
        </div>

        {/* --- SECCIÓN: HISTORIAL --- */}
        <div className="mb-12">
            <div className="flex items-center mb-4 px-2"><History className="mr-2 text-brand-purple" size={16}/> <h3 className="text-sm font-black uppercase tracking-widest text-brand-black dark:text-white">Mis Solicitudes</h3></div>
            {myRequestsHistory.length === 0 ? (<div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-8 text-center border border-gray-100 dark:border-white/5"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No has enviado solicitudes</p></div>) : (
                <div className="space-y-3">
                    {myRequestsHistory.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between animate-fade-in">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${req.status === 'approved' ? 'bg-green-100 text-green-600' : req.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{req.status === 'approved' ? <CalendarCheck size={20} strokeWidth={2.5} /> : req.status === 'rejected' ? <XCircle size={20} strokeWidth={2.5} /> : <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />}</div>
                                <div><div className="flex items-center space-x-2"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${req.status === 'approved' ? 'bg-green-100 text-green-600' : req.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{req.status === 'pending' ? 'PENDIENTE' : (req.status === 'approved' ? 'AGENDADA' : 'RECHAZADA')}</span></div><h4 className="text-sm font-black text-brand-black dark:text-white uppercase mt-1">{req.date}</h4></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default PKCalendar;
