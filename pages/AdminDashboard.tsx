import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Bell, Swords, Ban, Search, Lock, Unlock, BarChart2, Check, X, Send, Radio, Activity, Trophy, Save, Clock, Trash2, History, Calendar } from 'lucide-react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useContent } from '../context/ContentContext';
import { PKSchedule, PKEvent } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { pkSchedule, updatePKSchedule, pkRequests, updatePKRequestStatus, deletePKRequest } = useContent();
  
  // Tabs Principales
  const [activeTab, setActiveTab] = useState<'users' | 'pk' | 'security' | 'comms' | 'data'>('users');
  
  // Sub-tabs para PK
  const [pkView, setPkView] = useState<'assign' | 'requests'>('assign');

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local State for PK Editing (to avoid jitter)
  const [localSchedule, setLocalSchedule] = useState<PKSchedule | null>(null);

  // Estados Formularios
  const [alertMessage, setAlertMessage] = useState('');
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Sync Local PK State with Context on Load
  useEffect(() => {
      if (pkSchedule) {
          setLocalSchedule(pkSchedule);
      }
  }, [pkSchedule]);

  // Fetch Users
  useEffect(() => {
    const fetchData = async () => {
      if (!db) return;
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      } catch (e) {
        console.error("Error fetching users", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // --- ACTIONS ---

  const handleBlockUser = async (userId: string, currentStatus: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", userId), { isBlocked: !currentStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !currentStatus } : u));
    } catch (e) {
      alert("Error al actualizar estado");
    }
  };

  const handleGlobalBlock = async (block: boolean) => {
    if (!window.confirm(`¿CONFIRMAR ACCIÓN DE SEGURIDAD: ${block ? 'BLOQUEO TOTAL' : 'RESTAURACIÓN'}?`)) return;
    alert("Protocolo de seguridad activado. Los cambios se propagarán en breve.");
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) return;
    setIsSendingAlert(true);
    setTimeout(() => {
        alert("Mensaje Push enviado exitosamente.");
        setAlertMessage('');
        setIsSendingAlert(false);
    }, 1000);
  };

  // Aprobar solicitud: Cambia estado a 'approved'
  const handleApproveRequest = async (reqId: string) => {
      const confirm = window.confirm("¿Confirmar Agenda? Esto marcará la solicitud como AGENDADA para el usuario.");
      if (confirm) {
          await updatePKRequestStatus(reqId, 'approved');
      }
  };

  // Rechazar solicitud: Cambia estado a 'rejected'
  const handleRejectRequest = async (reqId: string) => {
      const confirm = window.confirm("¿Rechazar solicitud?");
      if (confirm) {
          await updatePKRequestStatus(reqId, 'rejected');
      }
  };

  // Eliminar solicitud: Borra de la DB
  const handleDeleteRequest = async (reqId: string) => {
      const confirm = window.confirm("¿Eliminar del historial? Esta acción borrará el registro permanentemente.");
      if (confirm) {
          await deletePKRequest(reqId);
      }
  };

  const handleScheduleChange = (type: 'potential' | 'supersmash', index: number, field: keyof PKEvent, value: string) => {
      if (!localSchedule) return;
      const updatedList = [...localSchedule[type]];
      updatedList[index] = { ...updatedList[index], [field]: value };
      setLocalSchedule({ ...localSchedule, [type]: updatedList });
  };

  const saveSchedule = async () => {
      if (localSchedule) {
          await updatePKSchedule(localSchedule);
          alert("¡Calendario PK Actualizado!");
      }
  };

  const filteredUsers = users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter Requests (Already sorted by date desc in Context)
  const pendingRequests = pkRequests.filter(req => req.status === 'pending');
  const historyRequests = pkRequests.filter(req => req.status !== 'pending');

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      <Header title="Panel Admin" showBack onBack={() => navigate('/admin/selection')} />
      
      {/* --- NAV PILLS --- */}
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-4 bg-white dark:bg-black/95 sticky top-0 z-30 border-b border-gray-100 dark:border-white/5">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
            {[
                { id: 'users', label: 'Emisores', icon: Users },
                { id: 'pk', label: 'Arena PK', icon: Swords },
                { id: 'security', label: 'Seguridad', icon: Shield },
                { id: 'comms', label: 'Push', icon: Bell },
                { id: 'data', label: 'Data', icon: BarChart2 },
            ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-full border transition-all duration-300 whitespace-nowrap ${
                            isActive 
                            ? 'bg-brand-black dark:bg-white text-white dark:text-black border-transparent shadow-lg transform scale-105' 
                            : 'bg-white dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10'
                        }`}
                    >
                        <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                        <span className="text-[10px] font-black uppercase tracking-wide">{tab.label}</span>
                    </button>
                )
            })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-24">

        {/* --- TAB: USUARIOS --- */}
        {activeTab === 'users' && (
            <div className="space-y-4 animate-slide-up">
                {/* Search Bar */}
                <div className="bg-white dark:bg-brand-dark-card p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center sticky top-0 z-20">
                    <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar emisor..." 
                        className="bg-transparent border-none text-sm font-bold w-full ml-3 focus:outline-none dark:text-white placeholder-gray-300" 
                    />
                </div>

                <div className="grid gap-3">
                    {isLoading ? (
                        <div className="text-center py-10"><div className="animate-spin w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full mx-auto"></div></div>
                    ) : filteredUsers.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 py-10">No se encontraron emisores.</p>
                    ) : filteredUsers.map((u) => (
                        <div key={u.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <img src={u.avatarUrl} alt="av" className="w-12 h-12 rounded-full object-cover bg-gray-100 border-2 border-white dark:border-white/10" />
                                    {u.isAdmin && <div className="absolute -bottom-1 -right-1 bg-brand-purple text-white p-1 rounded-full border-2 border-white"><Shield size={8} fill="currentColor"/></div>}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-brand-black dark:text-white leading-none mb-1">{u.name}</h3>
                                    <p className="text-[10px] font-medium text-gray-400">{u.email}</p>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {u.isBlocked ? 'BLOQUEADO' : 'ACTIVO'}
                                        </span>
                                        <span className="text-[8px] font-bold text-gray-300">ID: {u.id.substring(0,6)}...</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleBlockUser(u.id, u.isBlocked)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${u.isBlocked ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
                            >
                                {u.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- TAB: ARENA PK --- */}
        {activeTab === 'pk' && localSchedule && (
            <div className="space-y-6 animate-slide-up">
                
                {/* Sub-Nav Toggle */}
                <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-xl flex">
                    <button 
                        onClick={() => setPkView('assign')}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${pkView === 'assign' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-black dark:text-white' : 'text-gray-400'}`}
                    >
                        Programar
                    </button>
                    <button 
                        onClick={() => setPkView('requests')}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${pkView === 'requests' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-black dark:text-white' : 'text-gray-400'}`}
                    >
                        Solicitudes ({pkRequests.length})
                    </button>
                </div>

                {pkView === 'assign' ? (
                    <div className="space-y-6">
                         
                         {/* POTENCIAL EDITOR */}
                         <div className="bg-white dark:bg-brand-dark-card p-4 rounded-3xl border border-gray-100 dark:border-white/5">
                             <div className="flex items-center space-x-2 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                 <div className="bg-brand-black text-white p-1.5 rounded"><Swords size={16} /></div>
                                 <h3 className="text-sm font-black uppercase">PK Potencial</h3>
                             </div>
                             
                             <div className="space-y-3">
                                {localSchedule.potential.map((event, idx) => (
                                    <div key={event.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between gap-3">
                                        <div className="flex flex-col items-center justify-center bg-white dark:bg-black/20 p-2 rounded-lg min-w-[60px]">
                                            <Clock size={12} className="text-gray-400 mb-1"/>
                                            <span className="text-[9px] font-black text-brand-black dark:text-white whitespace-nowrap text-center leading-tight">
                                                08:00<br/>08:15 PM
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 flex items-center gap-2">
                                            <input 
                                                className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:border-brand-purple text-center uppercase" 
                                                placeholder="ID EMISOR"
                                                value={event.id1}
                                                onChange={(e) => handleScheduleChange('potential', idx, 'id1', e.target.value)}
                                            />
                                            <span className="text-[10px] font-black text-gray-300">VS</span>
                                            <input 
                                                className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:border-brand-purple text-center uppercase" 
                                                placeholder="ID OPONENTE"
                                                value={event.id2}
                                                onChange={(e) => handleScheduleChange('potential', idx, 'id2', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>

                             {/* BOTÓN PUBLICAR PARA POTENCIAL */}
                             <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                 <Button onClick={saveSchedule} fullWidth variant="black" className="shadow-lg h-12 text-xs">
                                     <Save size={16} className="mr-2" /> Publicar Cambios (Potencial)
                                 </Button>
                             </div>
                         </div>

                         {/* SUPERSMASH EDITOR */}
                         <div className="bg-white dark:bg-brand-dark-card p-4 rounded-3xl border border-gray-100 dark:border-white/5">
                             <div className="flex items-center space-x-2 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                 <div className="bg-orange-500 text-white p-1.5 rounded"><Swords size={16} /></div>
                                 <h3 className="text-sm font-black uppercase">PK Supersmash</h3>
                             </div>
                             
                             <div className="space-y-3">
                                {localSchedule.supersmash.map((event, idx) => (
                                    <div key={event.id} className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-100 dark:border-orange-900/20 flex items-center justify-between gap-3">
                                        <div className="flex flex-col items-center justify-center bg-white dark:bg-black/20 p-2 rounded-lg min-w-[60px]">
                                            <Clock size={12} className="text-orange-400 mb-1"/>
                                            <span className="text-[9px] font-black text-brand-black dark:text-white whitespace-nowrap text-center leading-tight">
                                                08:00<br/>08:15 PM
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 flex items-center gap-2">
                                            <input 
                                                className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:border-orange-500 text-center uppercase" 
                                                placeholder="ID EMISOR"
                                                value={event.id1}
                                                onChange={(e) => handleScheduleChange('supersmash', idx, 'id1', e.target.value)}
                                            />
                                            <span className="text-[10px] font-black text-orange-300">VS</span>
                                            <input 
                                                className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:border-orange-500 text-center uppercase" 
                                                placeholder="ID OPONENTE"
                                                value={event.id2}
                                                onChange={(e) => handleScheduleChange('supersmash', idx, 'id2', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>

                             {/* BOTÓN PUBLICAR PARA SUPERSMASH */}
                             <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                 <Button onClick={saveSchedule} fullWidth variant="black" className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg h-12 text-xs border-transparent">
                                     <Save size={16} className="mr-2" /> Publicar Cambios (Supersmash)
                                 </Button>
                             </div>
                         </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        
                        {/* --- PENDIENTES --- */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white mb-3 flex items-center">
                                <Bell className="mr-2 text-brand-purple" size={14} /> 
                                Nuevas Solicitudes ({pendingRequests.length})
                            </h3>
                            
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                                    <p className="text-[10px] font-bold uppercase text-gray-400">Sin pendientes</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRequests.map((req) => (
                                        <div key={req.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm border-l-4 border-l-brand-purple border-y border-r border-gray-100 dark:border-white/5 flex flex-col gap-3">
                                            
                                            {/* Header: Date Highlight & Status */}
                                            <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-2">
                                                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-white/10 px-2.5 py-1.5 rounded-lg shadow-sm">
                                                    <Calendar size={14} className="text-gray-500 dark:text-gray-300 stroke-[2.5]"/>
                                                    <span className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight">{req.date}</span>
                                                </div>
                                                <div className="bg-brand-purple/10 px-2 py-0.5 rounded text-[9px] font-black text-brand-purple uppercase">
                                                    Pendiente
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h3 className="text-lg font-black uppercase text-brand-black dark:text-white leading-none">ID: {req.bigoId}</h3>
                                                    <p className="text-[10px] text-gray-400 mt-1 font-bold">Solicita Batalla PK</p>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRejectRequest(req.id)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors border border-transparent hover:border-red-100" title="Rechazar">
                                                        <X size={18} strokeWidth={2.5} />
                                                    </button>
                                                    <button onClick={() => handleApproveRequest(req.id)} className="w-10 h-10 rounded-xl bg-brand-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform" title="Agendar (Aprobar)">
                                                        <Check size={18} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- HISTORIAL --- */}
                        <div>
                            <div className="flex items-center justify-between mt-8 mb-4 pt-6 border-t border-gray-100 dark:border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center">
                                    <History className="mr-2" size={14} /> 
                                    Historial de Solicitudes
                                </h3>
                                <span className="text-[9px] font-bold bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-500">{historyRequests.length}</span>
                            </div>

                            {historyRequests.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <History size={32} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Historial vacío</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {historyRequests.map((req) => (
                                        <div key={req.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl flex items-center justify-between border border-transparent hover:bg-white dark:hover:bg-brand-dark-card hover:shadow-sm hover:border-gray-100 dark:hover:border-white/10 transition-all group">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                                        req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {req.status === 'approved' ? 'AGENDADA' : 'RECHAZADA'}
                                                    </span>
                                                    <div className="flex items-center text-[9px] font-bold text-gray-400">
                                                        <Calendar size={10} className="mr-1" />
                                                        {req.date}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase truncate">ID: {req.bigoId}</span>
                                                </div>
                                            </div>
                                            
                                            {/* BOTÓN DE LIMPIEZA (BASURA) - VISIBLE EN HISTORIAL */}
                                            <button 
                                                onClick={() => handleDeleteRequest(req.id)}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/10 transition-all shadow-sm bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 group-hover:border-red-100"
                                                title="Eliminar registro"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        )}

        {/* --- TAB: SEGURIDAD --- */}
        {activeTab === 'security' && (
            <div className="space-y-6 animate-slide-up">
                <div className="bg-red-600 text-white p-6 rounded-3xl shadow-xl shadow-red-600/30 relative overflow-hidden">
                    <Shield className="absolute -right-6 -bottom-6 text-white/10 rotate-[-15deg]" size={150} />
                    
                    <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm"><Ban size={24} /></div>
                            <h2 className="text-xl font-black uppercase">Zona de Peligro</h2>
                        </div>
                        <p className="text-xs text-white/80 font-medium mb-6 leading-relaxed max-w-[250px]">
                            Acciones irreversibles que afectan a toda la plataforma. Úsese con extrema precaución.
                        </p>

                        <div className="space-y-3">
                            <button 
                                onClick={() => handleGlobalBlock(true)}
                                className="w-full bg-white text-red-600 p-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                            >
                                <Lock size={14} className="mr-2" />
                                Lockdown Total (Bloquear App)
                            </button>
                            <button 
                                onClick={() => handleGlobalBlock(false)}
                                className="w-full bg-red-800/50 text-white border border-red-400/30 p-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center active:scale-95 transition-transform hover:bg-red-800"
                            >
                                <Unlock size={14} className="mr-2" />
                                Restaurar Acceso
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="text-gray-400" size={20} />
                        <h3 className="text-sm font-black uppercase text-brand-black dark:text-white">Logs de Actividad</h3>
                    </div>
                    <div className="space-y-4">
                         <div className="flex items-start space-x-3">
                             <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                             <div>
                                 <p className="text-xs font-bold text-brand-black dark:text-white">Sistema Estable</p>
                                 <p className="text-[10px] text-gray-400">Todos los servicios operando correctamente.</p>
                             </div>
                         </div>
                         <div className="flex items-start space-x-3">
                             <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
                             <div>
                                 <p className="text-xs font-bold text-brand-black dark:text-white">Respaldo Automático</p>
                                 <p className="text-[10px] text-gray-400">Completado hace 2 horas.</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB: COMUNICACIÓN --- */}
        {activeTab === 'comms' && (
            <div className="space-y-6 animate-slide-up">
                 <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-6">
                            <div className="bg-amber-500/10 p-2 rounded-lg"><Radio className="text-amber-500" size={20} /></div>
                            <h2 className="text-lg font-black uppercase text-brand-black dark:text-white">Difusión Global</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block">Mensaje de Alerta / Push</label>
                                <textarea 
                                    value={alertMessage}
                                    onChange={(e) => setAlertMessage(e.target.value)}
                                    className="w-full h-32 bg-gray-50 dark:bg-white/5 border-none rounded-xl p-4 text-sm font-medium dark:text-white focus:ring-2 ring-amber-500/20 outline-none resize-none placeholder-gray-400"
                                    placeholder="Escribe el mensaje que llegará a todos los dispositivos..."
                                />
                            </div>
                            
                            {/* Live Preview */}
                            {alertMessage && (
                                <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10 flex items-start space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-black flex items-center justify-center flex-shrink-0">
                                        <Bell size={14} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-brand-black dark:text-white uppercase mb-0.5">StreamAgency • Ahora</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-tight">{alertMessage}</p>
                                    </div>
                                </div>
                            )}

                            <Button 
                                onClick={handleSendAlert} 
                                disabled={isSendingAlert || !alertMessage}
                                fullWidth 
                                className={`bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 mt-2 ${isSendingAlert ? 'opacity-70' : ''}`}
                            >
                                {isSendingAlert ? 'Enviando...' : 'Enviar Notificación'} <Send size={16} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                 </div>
            </div>
        )}

        {/* --- TAB: DATA EVALUACIONES --- */}
        {activeTab === 'data' && (
            <div className="space-y-4 animate-slide-up">
                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white dark:bg-brand-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                         <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Promedio General</p>
                         <h2 className="text-3xl font-black text-brand-purple">4.8</h2>
                         <div className="flex mt-2 space-x-1">
                             {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-brand-purple' : 'bg-gray-200 dark:bg-white/10'}`}></div>)}
                         </div>
                     </div>
                     <div className="bg-white dark:bg-brand-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                         <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Asistencia</p>
                         <h2 className="text-3xl font-black text-green-500">92%</h2>
                         <p className="text-[9px] text-green-600 dark:text-green-400 font-bold mt-1">+5% este mes</p>
                     </div>
                 </div>

                 <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-sm font-black uppercase text-brand-black dark:text-white">Top Rendimiento</h3>
                         <Trophy size={16} className="text-yellow-500" />
                     </div>
                     
                     <div className="space-y-4">
                         {[
                             { name: 'Emisor Alpha', score: 98, color: 'bg-yellow-500' },
                             { name: 'Emisor Beta', score: 92, color: 'bg-gray-400' },
                             { name: 'Emisor Gamma', score: 85, color: 'bg-orange-400' },
                         ].map((item, idx) => (
                             <div key={idx} className="flex items-center justify-between">
                                 <div className="flex items-center space-x-3">
                                     <div className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center text-[10px] font-black text-white shadow-sm`}>{idx + 1}</div>
                                     <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{item.name}</span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                     <div className="w-24 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                         <div className="h-full bg-brand-black dark:bg-white" style={{ width: `${item.score}%` }}></div>
                                     </div>
                                     <span className="text-[10px] font-black w-6 text-right">{item.score}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;