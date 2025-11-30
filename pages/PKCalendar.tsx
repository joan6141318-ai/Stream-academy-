
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Calendar, Swords, Shield, ArrowRight, ChevronDown, ChevronUp, CheckCircle2, Clock, Check, History, XCircle, AlertCircle, CalendarCheck, Loader2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { PKEvent } from '../types';

interface RequestData {
    date: string;
    bigoId: string;
}

const PKCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { pkSchedule, addPKRequest, pkRequests } = useContent();
  const { user } = useAuth();
  
  // Estado para desplegar listas (Acordeones) - Initial state set to false for all
  const [openPotential, setOpenPotential] = useState(false);
  const [openSupersmash, setOpenSupersmash] = useState(false);
  const [openRequest, setOpenRequest] = useState(false);

  // Estado para formulario
  const [requestDate, setRequestDate] = useState('');
  const [requestBigoId, setRequestBigoId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequest, setMyRequest] = useState<RequestData | null>(null);

  // Ref para el temporizador de notificación
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fecha Actual Formateada
  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();

  // Filtrar solicitudes del usuario actual
  const myRequestsHistory = pkRequests.filter(req => req.userId === user?.id);

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleRequestPK = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!requestDate || !requestBigoId || !user) return;

      setIsSubmitting(true);
      
      try {
          // Enviar a la base de datos a través del contexto
          await addPKRequest(requestDate, requestBigoId, user.id);
          
          setMyRequest({
              date: requestDate,
              bigoId: requestBigoId
          });
          setRequestDate('');
          setRequestBigoId('');
          setOpenRequest(false); // Cerrar acordeón para mostrar resultado abajo
          
          // Scroll suave hacia abajo para ver el historial
          setTimeout(() => {
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }, 500);

          // Limpiar timer anterior si existe
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }

          // Ocultar confirmación después de 5 segundos
          timerRef.current = setTimeout(() => {
              setMyRequest(null);
              timerRef.current = null;
          }, 5000);

      } catch (error) {
          alert("Error al enviar la solicitud. Intenta de nuevo.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const renderEventRow = (item: PKEvent) => (
      <div key={item.id} className="py-5 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors px-3 -mx-3 rounded-xl mb-2">
          
          {/* Header Fila: Hora + Acción */}
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-300">
                  <Clock size={12} strokeWidth={2.5} />
                  <span className="text-[10px] font-black">{item.time}</span>
              </div>
              
              <button 
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 cursor-default ${item.confirmed ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-100 dark:bg-white/10 text-gray-300'}`}
              >
                  <CheckCircle2 size={16} strokeWidth={2.5} />
              </button>
          </div>

          {/* Versus Center - CLEAN ID ONLY */}
          <div className="flex items-center justify-between gap-2 px-1">
               {/* Emisor ID */}
               <div className="flex-1 text-right">
                   <span className={`text-base font-black uppercase tracking-tight ${item.id1 ? 'text-brand-black dark:text-white' : 'text-gray-200 dark:text-white/10'}`}>
                       {item.id1 || '_ _ _'}
                   </span>
                   {item.id1 && <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Emisor</p>}
               </div>

               {/* VS Badge */}
               <div className="flex flex-col items-center justify-center px-4">
                   <div className="bg-brand-black dark:bg-white text-white dark:text-black text-[10px] font-black px-2 py-1 rounded skew-x-[-10deg] shadow-lg">
                       VS
                   </div>
               </div>

               {/* Oponente ID */}
               <div className="flex-1 text-left">
                   <span className={`text-base font-black uppercase tracking-tight ${item.id2 ? 'text-brand-black dark:text-white' : 'text-gray-200 dark:text-white/10'}`}>
                       {item.id2 || '_ _ _'}
                   </span>
                   {item.id2 && <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Rival</p>}
               </div>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black transition-colors duration-300 font-sans">
      <Header title="Agenda PK" showBack onBack={() => navigate('/welcome')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* Header Página */}
        <div className="mt-6 mb-8">
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tighter">
                Programación<br/>Diaria
            </h1>
        </div>

        {/* --- SECCIÓN: PK POTENCIAL --- */}
        <div className="mb-6 animate-fade-in">
            <button 
                onClick={() => setOpenPotential(!openPotential)}
                className="w-full flex flex-col items-start bg-brand-black text-white p-6 rounded-2xl shadow-xl active:scale-[0.99] transition-all group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="relative z-10 w-full">
                    <div className="flex justify-between items-center w-full">
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-1">
                            PK<br/>POTENCIAL
                        </h2>
                        {openPotential ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                    {/* Fecha en Blanco */}
                    <p className="text-sm font-bold text-white bg-white/10 inline-block px-3 py-1 rounded mt-2 uppercase tracking-widest">
                        {today}
                    </p>
                </div>
            </button>

            {/* Lista Desplegable */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openPotential ? 'max-h-[1200px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm">
                    {pkSchedule.potential.map(item => renderEventRow(item))}
                </div>
            </div>
        </div>

        {/* --- SECCIÓN: PK SUPERSMASH --- */}
        <div className="mb-6 animate-fade-in">
             <button 
                onClick={() => setOpenSupersmash(!openSupersmash)}
                className="w-full flex flex-col items-start bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-[0.99] transition-all group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="relative z-10 w-full">
                    <div className="flex justify-between items-center w-full">
                         <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">
                            PK<br/>SUPERSMASH
                        </h2>
                        {openSupersmash ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                    {/* Fecha en Blanco */}
                    <p className="text-sm font-bold text-white bg-black/10 inline-block px-3 py-1 rounded mt-2 uppercase tracking-widest">
                        {today}
                    </p>
                </div>
            </button>

             {/* Lista Desplegable */}
             <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSupersmash ? 'max-h-[1200px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm">
                    {pkSchedule.supersmash.map(item => renderEventRow(item))}
                </div>
            </div>
        </div>

        {/* --- WIDGET: SOLICITAR PK --- */}
        <div className="mb-8 animate-fade-in mt-8">
            <button 
                onClick={() => setOpenRequest(!openRequest)}
                className="w-full flex flex-col items-start bg-[#121212] text-white p-6 rounded-2xl shadow-xl active:scale-[0.99] transition-all group relative overflow-hidden"
            >
                {/* Fondo Decorativo */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-purple/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-50"></div>
                
                <div className="relative z-10 w-full">
                    <div className="flex justify-between items-center w-full">
                         <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">
                            SOLICITA<br/>UN PK
                        </h2>
                        {openRequest ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                        Agenda tu batalla
                    </p>
                </div>
            </button>

            {/* Formulario Desplegable */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openRequest ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-[#121212] rounded-[2rem] p-6 shadow-2xl border border-white/5">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/5 backdrop-blur-md">
                                    <Swords className="text-white" size={20} />
                                </div>
                                <h3 className="text-lg font-black text-white uppercase leading-none tracking-tight">
                                    Formulario de<br/>Solicitud
                                </h3>
                            </div>
                        </div>

                        <form onSubmit={handleRequestPK} className="space-y-5">
                            <div className="group/input">
                                <label className="text-[9px] font-bold uppercase text-gray-500 mb-2 block tracking-widest">Fecha Deseada</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        required
                                        value={requestDate}
                                        onChange={(e) => setRequestDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white focus:bg-white/10 focus:border-brand-purple/50 outline-none transition-all uppercase placeholder-gray-600"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                        <Calendar size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="group/input">
                                <label className="text-[9px] font-bold uppercase text-gray-500 mb-2 block tracking-widest">Tu Bigo ID</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required
                                        value={requestBigoId}
                                        onChange={(e) => setRequestBigoId(e.target.value)}
                                        placeholder="ID EXACTO"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white focus:bg-white/10 focus:border-brand-purple/50 outline-none transition-all placeholder-gray-700"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                        <Shield size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Horario Fijo</span>
                                    <span className="text-sm font-black text-white">08:00 - 08:15 PM</span>
                                </div>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Colombia</span>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-white text-black h-16 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-gray-200 active:scale-[0.98] transition-all mt-4 flex items-center justify-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <span className="animate-pulse">Procesando...</span>
                                ) : (
                                    <>
                                        <span>Agendar</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* --- TARJETA DE CONFIRMACIÓN (RESULTADO INMEDIATO) --- */}
            {myRequest && (
                <div className="mt-6 animate-slide-up">
                    <div className="bg-brand-purple text-white p-6 rounded-2xl shadow-xl shadow-purple-500/20 relative overflow-hidden border border-white/10">
                        {/* Ticket Perforation Effect */}
                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#fafafa] dark:bg-black rounded-full"></div>
                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#fafafa] dark:bg-black rounded-full"></div>
                        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-white/20"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                                <Check size={24} strokeWidth={4} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-1">Solicitud Recibida</h3>
                            <p className="text-xs font-medium text-white/80 mb-6">Tu batalla ha sido pre-agendada</p>
                            
                            <div className="w-full grid grid-cols-2 gap-4">
                                <div className="bg-black/20 rounded-lg p-2">
                                    <span className="text-[8px] uppercase tracking-widest text-white/60 block mb-1">Fecha</span>
                                    <span className="text-sm font-bold uppercase">{myRequest.date}</span>
                                </div>
                                <div className="bg-black/20 rounded-lg p-2">
                                    <span className="text-[8px] uppercase tracking-widest text-white/60 block mb-1">ID Solicitante</span>
                                    <span className="text-sm font-bold uppercase">{myRequest.bigoId}</span>
                                </div>
                            </div>
                            
                            <p className="text-[9px] mt-4 opacity-70">
                                * Revisa el estatus abajo en "Mis Solicitudes".
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- SECCIÓN: HISTORIAL DE SOLICITUDES (MEJORADO) --- */}
        <div className="mb-12">
            <div className="flex items-center mb-4 px-2">
                <History className="mr-2 text-brand-purple" size={16}/> 
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-black dark:text-white">Mis Solicitudes</h3>
            </div>
            
            {myRequestsHistory.length === 0 ? (
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-8 text-center border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center">
                    <Swords size={32} className="text-gray-300 mb-2" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No has enviado solicitudes</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {myRequestsHistory.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between animate-fade-in hover:scale-[1.01] transition-transform duration-200">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
                                    req.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                    req.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                                    'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                }`}>
                                    {req.status === 'approved' ? <CalendarCheck size={20} strokeWidth={2.5} /> :
                                     req.status === 'rejected' ? <XCircle size={20} strokeWidth={2.5} /> :
                                     <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                            req.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                            req.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                                            'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {req.status === 'pending' ? 'EN ESPERA DE RESPUESTA' : (req.status === 'approved' ? 'AGENDADA' : 'RECHAZADA')}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black text-brand-black dark:text-white uppercase mt-1">{req.date}</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">ID: {req.bigoId}</p>
                                </div>
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
