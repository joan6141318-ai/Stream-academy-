
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Bell, Swords, Ban, Search, Lock, Unlock, BarChart2, Check, X, Send, Radio, Activity, Trophy, Save, Clock, Trash2, History, Calendar, Eye, Laptop, UserCheck, ShieldCheck, AlertTriangle, ChevronRight, Key, EyeOff, Grid, ArrowLeft, UserX, Fingerprint, ArrowRight, Settings, Wrench, Bot } from 'lucide-react';
import { collection, updateDoc, doc, onSnapshot, query, arrayUnion, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useContent, hashString } from '../context/ContentContext';
import { PKSchedule, PKEvent, ActivityLog, PKRequest } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Solo importamos las funciones de acción, no los datos masivos
  const { updatePKSchedule, updatePKRequestStatus, deletePKRequest, homeConfig, updateHomeConfig } = useContent();
  
  // Tabs Principales
  const [activeTab, setActiveTab] = useState<'users' | 'pk' | 'security' | 'comms' | 'data'>('users');
  
  // Security Sub-Navigation State
  const [securityView, setSecurityView] = useState<'menu' | 'access_control' | 'agency_key' | 'lockdown'>('menu');

  // Sub-tabs para PK
  const [pkView, setPkView] = useState<'assign' | 'requests'>('assign');

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local States for Data Fetching (Removed from Global Context)
  const [pkSchedule, setPkSchedule] = useState<PKSchedule | null>(null);
  const [pkRequests, setPkRequests] = useState<PKRequest[]>([]);
  const [localSchedule, setLocalSchedule] = useState<PKSchedule | null>(null);

  // Estados Formularios COMMS
  const [alertMessage, setAlertMessage] = useState('');
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [restApiKey, setRestApiKey] = useState(sessionStorage.getItem('onesignal_api_key') || '');

  // --- SECURITY STATES ---
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newAgencyCode, setNewAgencyCode] = useState('');
  const [showAgencyCode, setShowAgencyCode] = useState(false);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  
  const selectedSecurityUser = users.find(u => u.id === selectedUserId) || null;

  // --- REAL TIME USERS LISTENER (FIXED: REMOVED LIMIT) ---
  useEffect(() => {
    if (!db) return;
    
    // CORRECCIÓN: Eliminado limit(100) para asegurar que el buscador encuentre a TODOS los usuarios.
    // Esto es crítico para la administración correcta aunque consuma más datos.
    const q = query(collection(db, "users"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        setIsLoading(false);
    }, (error) => {
        console.error("Error listening to users:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- REAL TIME PK DATA (Local Fetch) ---
  useEffect(() => {
      if (!db) return;

      // 1. Fetch Schedule
      const unsubSchedule = onSnapshot(doc(db, "schedules", "main"), (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data() as PKSchedule;
              const safeData = {
                  potential: data.potential || [],
                  supersmash: data.supersmash || []
              };
              setPkSchedule(safeData);
              setLocalSchedule(safeData);
          }
      });

      // 2. Fetch Requests
      const unsubRequests = onSnapshot(query(collection(db, "pk_requests")), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PKRequest));
          list.sort((a, b) => b.createdAt - a.createdAt);
          setPkRequests(list);
      });

      return () => {
          unsubSchedule();
          unsubRequests();
      };
  }, []);

  // --- ACTIONS ---

  const handleBlockUser = async (userId: string, currentStatus: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", userId), { isBlocked: !currentStatus });
    } catch (e) {
      alert("Error al actualizar estado");
    }
  };

  const handleSetMode = async (mode: 'lockdown' | 'maintenance') => {
      const currentMode = homeConfig.maintenanceMode || 'off';
      const newMode = currentMode === mode ? 'off' : mode;
      const confirmMsg = newMode === 'off' 
          ? `¿Desactivar ${mode === 'lockdown' ? 'Lockdown' : 'Mantenimiento'}?`
          : `¿Activar modo ${mode === 'lockdown' ? 'LOCKDOWN (Rojo)' : 'MANTENIMIENTO (Morado)'}?`;

      if (!window.confirm(confirmMsg)) return;

      try {
          await updateHomeConfig({ maintenanceMode: newMode });
          alert(`Sistema actualizado: ${newMode.toUpperCase()}`);
      } catch (e) {
          alert("Error al actualizar estado.");
      }
  };

  const handleUpdateAgencyCode = async () => {
      if (!newAgencyCode.trim()) {
          alert("La contraseña no puede estar vacía.");
          return;
      }
      setIsUpdatingKey(true);
      try {
          const hashed = await hashString(newAgencyCode.trim().toLowerCase());
          await updateHomeConfig({ agencyCodeHash: hashed });
          alert("¡Código de Agencia actualizado exitosamente!");
          setNewAgencyCode('');
      } catch(e) {
          alert("Error al actualizar clave.");
      } finally {
          setIsUpdatingKey(false);
      }
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) return;
    if (!restApiKey.trim()) {
        alert("Necesitas la REST API Key de OneSignal.");
        return;
    }
    setIsSendingAlert(true);
    try {
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Basic ${restApiKey}`
            },
            body: JSON.stringify({
                app_id: "3bbf8972-d8cb-4eed-a46b-6059a4f71cd1",
                included_segments: ["Subscribed Users"], 
                contents: { "en": alertMessage, "es": alertMessage },
                headings: { "en": "StreamAgency Aviso", "es": "StreamAgency Aviso" },
                name: "ADMIN_BROADCAST"
            })
        };
        const response = await fetch('https://onesignal.com/api/v1/notifications', options);
        const data = await response.json();
        if (data.id) {
            alert(`¡Enviado a ${data.recipients || 0} dispositivos!`);
            setAlertMessage('');
            sessionStorage.setItem('onesignal_api_key', restApiKey);
        } else {
            console.error(data);
            alert("Error al enviar. Verifica tu API Key.");
        }
    } catch (err) {
        console.error(err);
        alert("Error de conexión.");
    } finally {
        setIsSendingAlert(false);
    }
  };

  const handleApproveRequest = async (reqId: string) => {
      if (window.confirm("¿Confirmar Agenda?")) await updatePKRequestStatus(reqId, 'approved');
  };

  const handleRejectRequest = async (reqId: string) => {
      if (window.confirm("¿Rechazar solicitud?")) await updatePKRequestStatus(reqId, 'rejected');
  };

  const handleDeleteRequest = async (reqId: string) => {
      if (window.confirm("¿Eliminar del historial?")) await deletePKRequest(reqId);
  };

  const handleScheduleChange = (type: 'potential' | 'supersmash', index: number, field: keyof PKEvent, value: string) => {
      if (!localSchedule) return;
      const updatedList = [...(localSchedule[type] || [])];
      if (!updatedList[index]) return;
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
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.bigoId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = pkRequests.filter(req => req.status === 'pending');
  const historyRequests = pkRequests.filter(req => req.status !== 'pending');
  const currentMode = homeConfig.maintenanceMode || 'off';

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      <Header title="Panel Admin" showBack onBack={() => navigate('/admin/selection')} />
      
      {/* Nav Tabs */}
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-4 bg-white dark:bg-black/95 sticky top-0 z-30 border-b border-gray-100 dark:border-white/5">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide p-4">
            {[
                { id: 'users', label: 'Emisores', icon: Users },
                { id: 'pk', label: 'Arena PK', icon: Swords },
                { id: 'security', label: 'Centro de Mando', icon: Shield },
                { id: 'comms', label: 'Push', icon: Bell },
            ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); setSecurityView('menu'); }}
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
                <div className="bg-white dark:bg-brand-dark-card p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center sticky top-0 z-20">
                    <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Filtrar por nombre, correo o ID..." 
                        className="bg-transparent border-none text-sm font-bold w-full ml-3 focus:outline-none dark:text-white placeholder-gray-300" 
                    />
                </div>
                <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-wider">
                    Total Usuarios: {users.length}
                </p>

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

        {/* --- TAB: CENTRO DE MANDO (SEGURIDAD) --- */}
        {activeTab === 'security' && (
            <div className="space-y-6 animate-slide-up h-full flex flex-col">
                
                {/* 1. MENU VIEW */}
                {securityView === 'menu' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black uppercase text-brand-black dark:text-white leading-none">Centro de Mando</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Seguridad & Auditoría</p>
                            </div>
                            <div className="w-10 h-10 bg-brand-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <ShieldCheck size={20} className="text-white dark:text-black" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setSecurityView('access_control')} className="bg-gradient-to-br from-blue-600 to-cyan-600 p-5 rounded-2xl shadow-xl shadow-blue-500/20 text-left relative overflow-hidden group active:scale-[0.98] transition-all h-40 flex flex-col justify-between">
                                <div className="relative z-10">
                                    <div className="bg-white/20 w-fit p-2 rounded-lg mb-3 backdrop-blur-md"><Users className="text-white" size={20} /></div>
                                    <h3 className="text-sm font-black text-white uppercase leading-tight mb-1">Gestión de<br/>Accesos</h3>
                                    <p className="text-[9px] text-white/80 font-medium">Permitir o denegar entrada.</p>
                                </div>
                                <ArrowRight className="text-white absolute right-4 bottom-4" size={14} />
                            </button>

                            <button onClick={() => setSecurityView('agency_key')} className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-5 rounded-2xl shadow-xl shadow-purple-500/20 text-left relative overflow-hidden group active:scale-[0.98] transition-all h-40 flex flex-col justify-between">
                                <div className="relative z-10">
                                    <div className="bg-white/20 w-fit p-2 rounded-lg mb-3 backdrop-blur-md"><Key className="text-white" size={20} /></div>
                                    <h3 className="text-sm font-black text-white uppercase leading-tight mb-1">Llave de<br/>Registro</h3>
                                    <p className="text-[9px] text-white/80 font-medium">Contraseña de acceso.</p>
                                </div>
                                <ArrowRight className="text-white absolute right-4 bottom-4" size={14} />
                            </button>

                            <button onClick={() => setSecurityView('lockdown')} className="col-span-2 bg-gradient-to-r from-red-600 to-rose-700 p-5 rounded-2xl shadow-xl shadow-red-500/20 text-left relative overflow-hidden group active:scale-[0.98] transition-all flex items-center justify-between">
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md"><Shield className="text-white" size={24} /></div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase leading-none mb-1">Protocolo de Emergencia</h3>
                                        <p className="text-[9px] text-white/80 font-medium">Configurar Lockdown y Mantenimiento</p>
                                    </div>
                                </div>
                                <Ban className="absolute right-10 -top-10 text-white/10" size={120} />
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. AGENCY KEY VIEW */}
                {securityView === 'agency_key' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="flex items-center space-x-2 mb-4">
                            <button onClick={() => setSecurityView('menu')} className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg text-gray-500 hover:text-brand-black dark:hover:text-white transition-colors">
                                <ArrowLeft size={18} />
                            </button>
                            <h2 className="text-lg font-black uppercase text-brand-black dark:text-white">Llave de Registro</h2>
                        </div>
                        <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 text-center tracking-widest">Nueva Contraseña</label>
                                    <div className="relative">
                                        <input 
                                            type={showAgencyCode ? "text" : "password"} 
                                            value={newAgencyCode} 
                                            onChange={(e) => setNewAgencyCode(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center text-lg font-black text-brand-black dark:text-white focus:border-brand-purple outline-none tracking-widest"
                                            placeholder="Escribe aquí..."
                                        />
                                        <button onClick={() => setShowAgencyCode(!showAgencyCode)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-purple p-2">
                                            {showAgencyCode ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleUpdateAgencyCode} 
                                    disabled={isUpdatingKey || !newAgencyCode.trim()} 
                                    fullWidth
                                    className="h-14 rounded-xl shadow-lg mt-4"
                                >
                                    {isUpdatingKey ? 'Encriptando y Guardando...' : 'Actualizar Llave'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. LOCKDOWN VIEW */}
                {securityView === 'lockdown' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="flex items-center space-x-2 mb-2">
                            <button onClick={() => setSecurityView('menu')} className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg text-gray-500 hover:text-brand-black dark:hover:text-white transition-colors">
                                <ArrowLeft size={18} />
                            </button>
                            <h2 className="text-lg font-black uppercase text-brand-black dark:text-white">Emergencia</h2>
                        </div>
                        <div className={`p-6 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-300 ${currentMode === 'lockdown' ? 'bg-red-700 shadow-red-900/50' : 'bg-white dark:bg-brand-dark-card border border-gray-100 dark:border-white/5'}`}>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <h3 className={`text-xl font-black uppercase mb-1 ${currentMode === 'lockdown' ? 'text-white' : 'text-brand-black dark:text-white'}`}>
                                    {currentMode === 'lockdown' ? 'LOCKDOWN ACTIVO' : 'LOCKDOWN TOTAL'}
                                </h3>
                                <button onClick={() => handleSetMode('lockdown')} className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center shadow-lg active:scale-95 transition-transform mt-4 ${currentMode === 'lockdown' ? 'bg-white text-red-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                                    {currentMode === 'lockdown' ? 'DESACTIVAR BLOQUEO' : 'ACTIVAR BLOQUEO'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- TAB: ARENA PK --- */}
        {activeTab === 'pk' && localSchedule && (
            <div className="space-y-6 animate-slide-up">
                
                {/* Sub-Nav Toggle */}
                <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-xl flex">
                    <button onClick={() => setPkView('assign')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${pkView === 'assign' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-black dark:text-white' : 'text-gray-400'}`}>Programar</button>
                    <button onClick={() => setPkView('requests')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${pkView === 'requests' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-black dark:text-white' : 'text-gray-400'}`}>Solicitudes ({pendingRequests.length})</button>
                </div>

                {pkView === 'assign' ? (
                    <div className="space-y-6">
                         <div className="bg-white dark:bg-brand-dark-card p-4 rounded-3xl border border-gray-100 dark:border-white/5">
                             <div className="flex items-center space-x-2 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                 <div className="bg-brand-black text-white p-1.5 rounded"><Swords size={16} /></div>
                                 <h3 className="text-sm font-black uppercase">PK Potencial</h3>
                             </div>
                             <div className="space-y-3">
                                {localSchedule.potential?.map((event, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between gap-3">
                                        <div className="flex-1 flex items-center gap-2">
                                            <input className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none text-center uppercase" placeholder="ID EMISOR" value={event.id1 || ''} onChange={(e) => handleScheduleChange('potential', idx, 'id1', e.target.value)} />
                                            <span className="text-[10px] font-black text-gray-300">VS</span>
                                            <input className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none text-center uppercase" placeholder="ID OPONENTE" value={event.id2 || ''} onChange={(e) => handleScheduleChange('potential', idx, 'id2', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                             </div>
                             <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                 <Button onClick={saveSchedule} fullWidth variant="black" className="shadow-lg h-12 text-xs"><Save size={16} className="mr-2" /> Publicar Cambios</Button>
                             </div>
                         </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white mb-3 flex items-center"><Bell className="mr-2 text-brand-purple" size={14} /> Nuevas Solicitudes ({pendingRequests.length})</h3>
                            {pendingRequests.length === 0 ? <p className="text-[10px] text-gray-400 font-bold uppercase text-center py-6">Sin pendientes</p> : (
                                <div className="space-y-3">
                                    {pendingRequests.map((req) => (
                                        <div key={req.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm border-l-4 border-l-brand-purple border-y border-r border-gray-100 dark:border-white/5 flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-black uppercase text-brand-black dark:text-white leading-none">ID: {req.bigoId}</h3>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRejectRequest(req.id)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500"><X size={18} /></button>
                                                    <button onClick={() => handleApproveRequest(req.id)} className="w-10 h-10 rounded-xl bg-brand-black dark:bg-white text-white dark:text-black flex items-center justify-center"><Check size={18} /></button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{req.date}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* COMMS TABS (PUSH NOTIFICATIONS) */}
        {activeTab === 'comms' && (
            <div className="space-y-6 animate-slide-up">
                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5">
                    <div className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                            <p className="text-[9px] font-bold text-red-500 uppercase tracking-wide flex items-center">
                                <AlertTriangle size={12} className="mr-1" />
                                Seguridad: La clave se borrará al cerrar esta pestaña.
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">OneSignal REST API Key</label>
                            <input type="password" value={restApiKey} onChange={(e) => setRestApiKey(e.target.value)} placeholder="Pega tu clave aquí..." className="w-full bg-transparent text-xs font-mono outline-none text-brand-black dark:text-white" />
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block">Mensaje</label>
                            <textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} className="w-full h-32 bg-gray-50 dark:bg-white/5 border-none rounded-xl p-4 text-sm font-medium dark:text-white outline-none resize-none" placeholder="Escribe el mensaje..." />
                        </div>
                        <Button onClick={handleSendAlert} disabled={isSendingAlert || !alertMessage || !restApiKey} fullWidth className={`bg-amber-500 hover:bg-amber-600 text-white mt-2 ${isSendingAlert ? 'opacity-70' : ''}`}>
                            {isSendingAlert ? 'Enviando...' : 'Enviar Notificación'} 
                        </Button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
