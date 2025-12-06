
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Bell, Swords, Ban, Search, Lock, Unlock, Key, ArrowLeft, ArrowRight, ShieldCheck, UserX, Check, X, Save, Clock, Zap, Plus, Trash2, History, Edit2, Activity, Eye, FileText, Eraser } from 'lucide-react';
import { collection, updateDoc, doc, onSnapshot, query, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useContent, hashString } from '../context/ContentContext';
import { PKSchedule, PKEvent, PKRequest } from '../types';
import { ONESIGNAL_APP_ID } from '../constants';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { updatePKSchedule, updatePKRequestStatus, deletePKRequest, homeConfig, updateHomeConfig } = useContent();
  
  // Tabs Updated with "audit"
  const [activeTab, setActiveTab] = useState<'users' | 'pk' | 'security' | 'comms' | 'audit'>('users');
  const [securityView, setSecurityView] = useState<'menu' | 'access_control' | 'agency_key' | 'lockdown'>('menu');
  const [pkView, setPkView] = useState<'assign' | 'requests'>('assign');

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [localSchedule, setLocalSchedule] = useState<PKSchedule | null>(null);
  const [pkRequests, setPkRequests] = useState<PKRequest[]>([]);

  const [alertMessage, setAlertMessage] = useState('');
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [restApiKey, setRestApiKey] = useState(sessionStorage.getItem('onesignal_api_key') || '');

  const [newAgencyCode, setNewAgencyCode] = useState('');
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  // --- TIME MODAL STATE ---
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<{ type: 'potential' | 'supersmash', index: number } | null>(null);
  const [tempTimeData, setTempTimeData] = useState({
      startH: '08', startM: '00',
      endH: '08', endM: '15',
      ampm: 'PM'
  });

  // --- REAL TIME USERS ---
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        setIsLoading(false);
    }, (error) => {
        console.error("Error listening users:", error);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- REAL TIME PK DATA ---
  useEffect(() => {
      if (!db) return;
      const unsubSchedule = onSnapshot(doc(db, "schedules", "main"), (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data() as PKSchedule;
              setLocalSchedule({ potential: data.potential || [], supersmash: data.supersmash || [] });
          }
      });
      const unsubRequests = onSnapshot(query(collection(db, "pk_requests")), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PKRequest));
          list.sort((a, b) => b.createdAt - a.createdAt);
          setPkRequests(list);
      });
      return () => { unsubSchedule(); unsubRequests(); };
  }, []);

  // --- OPTIMIZATION: Memoized Filtering ---
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const lowerTerm = searchTerm.toLowerCase();
    return users.filter(u => 
      (u.name && u.name.toLowerCase().includes(lowerTerm)) || 
      (u.email && u.email.toLowerCase().includes(lowerTerm)) ||
      (u.bigoId && u.bigoId.toLowerCase().includes(lowerTerm))
    );
  }, [users, searchTerm]);

  // --- AUDIT LOGIC ---
  const allActivityLogs = useMemo(() => {
      const logs: any[] = [];
      users.forEach(user => {
          if (user.accessLogs && Array.isArray(user.accessLogs)) {
              user.accessLogs.forEach((log: any) => {
                  logs.push({
                      ...log,
                      userId: user.id,
                      userName: user.name,
                      userAvatar: user.avatarUrl
                  });
              });
          }
      });
      // Sort by date desc
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [users]);

  const handleClearAllLogs = async () => {
      if (!window.confirm("¿Estás seguro de ELIMINAR TODO EL HISTORIAL DE ACTIVIDAD de TODOS los usuarios?")) return;
      if (!db) return;
      
      const batch = writeBatch(db);
      users.forEach(user => {
          const userRef = doc(db, "users", user.id);
          batch.update(userRef, { accessLogs: [] });
      });
      
      try {
          await batch.commit();
          alert("Historial eliminado correctamente.");
      } catch (e) {
          alert("Error al limpiar historial.");
      }
  };

  const handleBlockUser = async (userId: string, currentStatus: boolean) => {
    if (!db) return;
    try { await updateDoc(doc(db, "users", userId), { isBlocked: !currentStatus }); } catch (e) { alert("Error al actualizar"); }
  };

  const handleSetMode = async (mode: 'lockdown' | 'maintenance') => {
      const currentMode = homeConfig.maintenanceMode || 'off';
      const newMode = currentMode === mode ? 'off' : mode;
      if (!window.confirm(`¿Cambiar estado a ${newMode.toUpperCase()}?`)) return;
      try { await updateHomeConfig({ maintenanceMode: newMode }); } catch (e) { alert("Error al actualizar"); }
  };

  const handleUpdateAgencyCode = async () => {
      if (!newAgencyCode.trim()) return;
      setIsUpdatingKey(true);
      try {
          const hashed = await hashString(newAgencyCode.trim().toLowerCase());
          await updateHomeConfig({ agencyCodeHash: hashed });
          alert("Código actualizado correctamente.");
          setNewAgencyCode('');
      } catch(e) { alert("Error al actualizar el código."); } finally { setIsUpdatingKey(false); }
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim() || !restApiKey.trim()) return;
    setIsSendingAlert(true);
    try {
        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Basic ${restApiKey}` },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID, included_segments: ["Subscribed Users"], 
                contents: { "en": alertMessage, "es": alertMessage }, headings: { "en": "Aviso Admin", "es": "Aviso Admin" }
            })
        };
        await fetch('https://onesignal.com/api/v1/notifications', options);
        alert("Enviado"); setAlertMessage('');
        sessionStorage.setItem('onesignal_api_key', restApiKey);
    } catch (err) { alert("Error conexión"); } finally { setIsSendingAlert(false); }
  };

  // --- PK LOGIC (Existing) ---
  const handleScheduleChange = (type: 'potential' | 'supersmash', index: number, field: keyof PKEvent, value: string) => {
      if (!localSchedule) return;
      const updatedList = [...(localSchedule[type] || [])];
      if (!updatedList[index]) return;
      updatedList[index] = { ...updatedList[index], [field]: value };
      setLocalSchedule({ ...localSchedule, [type]: updatedList });
  };

  const openTimeEditor = (type: 'potential' | 'supersmash', index: number, currentTime: string) => {
      let startH = '08', startM = '00', endH = '08', endM = '15', ampm = 'PM';
      try {
          const parts = currentTime.split('-');
          if (parts.length === 2) {
              const startParts = parts[0].trim().split(':');
              const endPartsRaw = parts[1].trim();
              startH = startParts[0] || '08';
              startM = startParts[1] || '00';
              if (endPartsRaw.includes('PM')) ampm = 'PM';
              else if (endPartsRaw.includes('AM')) ampm = 'AM';
              const endClean = endPartsRaw.replace('PM', '').replace('AM', '').trim();
              const endParts = endClean.split(':');
              endH = endParts[0] || '08';
              endM = endParts[1] || '15';
          }
      } catch (e) { console.warn("Could not parse time", e); }
      setTempTimeData({ startH, startM, endH, endM, ampm });
      setEditingTimeIndex({ type, index });
      setShowTimeModal(true);
  };

  const saveTimeFromModal = () => {
      if (!editingTimeIndex) return;
      const { startH, startM, endH, endM, ampm } = tempTimeData;
      const fSH = startH.padStart(2, '0');
      const fSM = startM.padStart(2, '0');
      const fEH = endH.padStart(2, '0');
      const fEM = endM.padStart(2, '0');
      const timeString = `${fSH}:${fSM} - ${fEH}:${fEM} ${ampm}`;
      handleScheduleChange(editingTimeIndex.type, editingTimeIndex.index, 'time', timeString);
      setShowTimeModal(false);
      setEditingTimeIndex(null);
  };

  const handleAddRow = (type: 'potential' | 'supersmash') => {
      if (!localSchedule) return;
      const newRow: PKEvent = { id: Date.now().toString(), time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false };
      setLocalSchedule({ ...localSchedule, [type]: [...localSchedule[type], newRow] });
  };

  const handleRemoveRow = (type: 'potential' | 'supersmash', index: number) => {
      if (!localSchedule) return;
      if (!window.confirm("¿Eliminar esta fila?")) return;
      const updatedList = [...localSchedule[type]];
      updatedList.splice(index, 1);
      setLocalSchedule({ ...localSchedule, [type]: updatedList });
  };

  const handleClearHistory = async () => {
      if (!window.confirm("¿Estás seguro de eliminar todas las solicitudes APROBADAS y RECHAZADAS?")) return;
      setIsClearingHistory(true);
      try {
          const finishedRequests = pkRequests.filter(req => req.status !== 'pending');
          const batch = writeBatch(db);
          finishedRequests.forEach(req => { const ref = doc(db, "pk_requests", req.id); batch.delete(ref); });
          await batch.commit();
          alert("Historial limpiado.");
      } catch (e) { alert("Error al limpiar historial."); } finally { setIsClearingHistory(false); }
  };

  const saveSchedule = async () => {
      if (localSchedule) { await updatePKSchedule(localSchedule); alert("Calendario actualizado"); }
  };

  const renderEditableRow = (ev: PKEvent, i: number, type: 'potential' | 'supersmash') => {
      const parts = ev.time.split('-');
      const start = parts[0]?.trim() || ev.time;
      const end = parts[1]?.trim() || '';
      return (
        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 transition-all hover:bg-gray-100 dark:hover:bg-white/10 group">
            <button onClick={() => openTimeEditor(type, i, ev.time)} className="w-20 h-12 bg-white dark:bg-black/40 rounded-lg border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group-hover:border-brand-purple/50 transition-all active:scale-95">
                <div className="absolute top-1 right-1"><Edit2 size={8} className="text-gray-300 dark:text-gray-600" /></div>
                <span className="text-[10px] font-black text-brand-black dark:text-white leading-none uppercase">{start}</span>
                {end && <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 leading-none mt-0.5 uppercase">{end}</span>}
            </button>
            <div className="flex-1 flex items-center gap-1.5">
                <input value={ev.id1} onChange={e => handleScheduleChange(type, i, 'id1', e.target.value)} className="w-full h-12 bg-white dark:bg-black/40 rounded-lg border border-gray-200 dark:border-white/10 text-center font-bold text-[10px] uppercase text-brand-black dark:text-white placeholder:text-gray-300 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/20 outline-none transition-all shadow-sm" placeholder="ID EMISOR" />
                <span className="text-[10px] font-black text-gray-300 italic flex-shrink-0 select-none">VS</span>
                <input value={ev.id2} onChange={e => handleScheduleChange(type, i, 'id2', e.target.value)} className="w-full h-12 bg-white dark:bg-black/40 rounded-lg border border-gray-200 dark:border-white/10 text-center font-bold text-[10px] uppercase text-brand-black dark:text-white placeholder:text-gray-300 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/20 outline-none transition-all shadow-sm" placeholder="ID OPONENTE" />
            </div>
            <button onClick={() => handleRemoveRow(type, i)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
        </div>
      );
  };

  const pendingRequests = pkRequests.filter(req => req.status === 'pending');
  const historyRequests = pkRequests.filter(req => req.status !== 'pending');
  const currentMode = homeConfig.maintenanceMode || 'off';

  // --- RENDER ---
  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      <Header title="PANEL ADMIN" showBack onBack={() => navigate('/admin/selection')} />
      
      {/* TABS CONTAINER */}
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] w-full bg-white dark:bg-black/95 z-30 border-b border-gray-100 dark:border-white/5 shadow-sm sticky top-0">
        <div className="flex items-center justify-start space-x-2 overflow-x-auto scrollbar-hide p-3 px-4">
            {[
                { id: 'audit', label: 'AUDITORÍA', icon: Activity },
                { id: 'users', label: 'EMISORES', icon: Users },
                { id: 'pk', label: 'ARENA PK', icon: Swords },
                { id: 'security', label: 'SEGURIDAD', icon: Shield },
                { id: 'comms', label: 'PUSH', icon: Bell },
            ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setSecurityView('menu'); }}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-all duration-300 whitespace-nowrap shadow-sm flex-shrink-0 ${isActive ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-400 border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-500 hover:border-gray-300'}`}>
                        <Icon size={14} strokeWidth={2.5} /><span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                    </button>
                )
            })}
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-24 bg-[#FAFAFA] dark:bg-black">
        
        {/* === AUDIT TAB (NEW) === */}
        {activeTab === 'audit' && (
            <div className="space-y-6 animate-slide-up">
                
                {/* 1. STATUS CONTROL (User Quick List) */}
                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black uppercase text-brand-black dark:text-white leading-none">Control de Acceso</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">Denegar / Reactivar Usuarios</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-white/10 p-2 rounded-xl text-gray-500 dark:text-white"><Users size={20} /></div>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={u.avatarUrl} className={`w-10 h-10 rounded-full bg-gray-200 ${u.isBlocked ? 'grayscale' : ''}`} />
                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${u.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase text-brand-black dark:text-white leading-none">{u.name}</h4>
                                        <p className="text-[9px] text-gray-400 truncate w-24">{u.id}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleBlockUser(u.id, u.isBlocked)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${u.isBlocked ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}
                                >
                                    {u.isBlocked ? 'REACTIVAR' : 'DENEGAR'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. ACTIVITY LOGS */}
                <div className="bg-brand-black dark:bg-[#121212] p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-xl text-white"><Eye size={20} /></div>
                                <div>
                                    <h2 className="text-xl font-black uppercase text-white leading-none">Actividad</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">Registro de Ingresos</p>
                                </div>
                            </div>
                            <button onClick={handleClearAllLogs} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all flex items-center gap-1">
                                <Eraser size={10} /> Eliminar Historial
                            </button>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {allActivityLogs.length === 0 ? (
                                <p className="text-center text-gray-600 text-xs font-mono py-10">NO HAY REGISTROS</p>
                            ) : (
                                allActivityLogs.map((log, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="text-[9px] font-mono text-gray-500 w-12 text-center leading-none">
                                                {new Date(log.timestamp).toLocaleDateString([], {day: '2-digit', month: '2-digit'})}<br/>
                                                {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[10px] font-black text-white uppercase">{log.userName}</span>
                                                    <span className="text-[8px] bg-white/10 px-1 rounded text-gray-300">{log.userId.slice(0,4)}</span>
                                                </div>
                                                <p className="text-[9px] text-brand-purple font-bold uppercase tracking-wide">{log.action}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${log.type === 'login' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {log.type === 'login' ? 'INGRESO' : 'VISITA'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ... existing users tab content ... */}
        {activeTab === 'users' && (
            <div className="space-y-4 animate-slide-up">
                <div className="bg-white dark:bg-brand-dark-card p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center sticky top-0 z-20">
                    <Search size={18} className="text-gray-400 ml-1" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar usuario..." className="bg-transparent border-none text-sm font-bold w-full ml-3 focus:outline-none text-brand-black dark:text-white placeholder-gray-300" />
                </div>
                
                <div className="space-y-3">
                    {isLoading ? <div className="text-center py-10 text-xs text-gray-400 font-bold uppercase">Cargando base de datos...</div> : filteredUsers.map((u) => (
                        <div key={u.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group">
                            <div className="flex items-center space-x-4 overflow-hidden">
                                <div className="relative">
                                    <img src={u.avatarUrl} alt="av" className={`w-12 h-12 rounded-full object-cover bg-gray-100 border-2 ${u.isBlocked ? 'border-red-500 grayscale' : 'border-transparent'}`} />
                                    {u.isBlocked && <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-0.5 rounded-full border-2 border-white"><Lock size={10} /></div>}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-black text-brand-black dark:text-white leading-none mb-1 truncate">{u.name}</h3>
                                    <p className="text-[10px] text-gray-400 truncate mb-1">{u.email}</p>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm ${u.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{u.isBlocked ? 'SUSPENDIDO' : 'ACTIVO'}</span>
                                        {u.role && <span className="text-[8px] font-bold text-gray-300 uppercase">{u.role}</span>}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleBlockUser(u.id, u.isBlocked)} 
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${u.isBlocked ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
                            >
                                {u.isBlocked ? <Unlock size={18} strokeWidth={2.5} /> : <Lock size={18} />}
                            </button>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && !isLoading && <p className="text-center text-gray-400 text-xs mt-8 uppercase font-bold tracking-widest">Sin resultados</p>}
                </div>
            </div>
        )}
        
        {/* ... existing security & PK & comms tabs (kept as is) ... */}
        {activeTab === 'security' && securityView === 'menu' && (
             <div className="space-y-4 animate-slide-up">
                 <button onClick={() => setSecurityView('agency_key')} className="w-full p-6 bg-brand-black dark:bg-white text-white dark:text-black rounded-3xl shadow-lg flex justify-between items-center group active:scale-[0.98] transition-all">
                     <div className="text-left">
                         <div className="bg-white/20 dark:bg-black/10 w-10 h-10 rounded-xl flex items-center justify-center mb-3"><Key size={20} /></div>
                         <h3 className="font-black text-lg uppercase leading-none mb-1">Llave de Registro</h3>
                         <p className="text-xs opacity-60 font-medium">Contraseña de acceso para nuevos</p>
                     </div>
                     <ArrowRight className="opacity-50 group-hover:opacity-100 transition-opacity" />
                 </button>
                 
                 <button onClick={() => setSecurityView('lockdown')} className="w-full p-6 bg-red-600 text-white rounded-3xl shadow-lg shadow-red-600/20 flex justify-between items-center group active:scale-[0.98] transition-all">
                     <div className="text-left">
                         <div className="bg-black/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3"><Ban size={20} /></div>
                         <h3 className="font-black text-lg uppercase leading-none mb-1">Zona de Peligro</h3>
                         <p className="text-xs opacity-80 font-medium">Lockdown / Mantenimiento</p>
                     </div>
                     <ArrowRight className="opacity-50 group-hover:opacity-100 transition-opacity" />
                 </button>
             </div>
        )}

        {activeTab === 'security' && securityView === 'agency_key' && (
            <div className="space-y-4 animate-slide-up">
                <div className="flex items-center mb-4"><button onClick={() => setSecurityView('menu')} className="mr-2 p-2 bg-gray-100 dark:bg-white/10 rounded-full"><ArrowLeft size={16} /></button><h3 className="font-black uppercase text-sm">Volver</h3></div>
                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-brand-purple mb-4"><Key size={24} /></div>
                    <h2 className="text-xl font-black uppercase mb-2 text-brand-black dark:text-white">Actualizar Llave</h2>
                    <p className="text-xs text-gray-500 mb-6 font-medium">Define la contraseña única que deberán ingresar los nuevos usuarios.</p>
                    <input type="text" value={newAgencyCode} onChange={(e) => setNewAgencyCode(e.target.value)} placeholder="Nueva contraseña..." className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-4 outline-none font-bold text-center text-lg tracking-widest uppercase" />
                    <Button onClick={handleUpdateAgencyCode} disabled={isUpdatingKey} fullWidth className="h-14">{isUpdatingKey ? 'Encriptando...' : 'Guardar Nueva Llave'}</Button>
                </div>
            </div>
        )}
        
        {activeTab === 'security' && securityView === 'lockdown' && (
            <div className="space-y-4 animate-slide-up">
                <div className="flex items-center mb-4"><button onClick={() => setSecurityView('menu')} className="mr-2 p-2 bg-gray-100 dark:bg-white/10 rounded-full"><ArrowLeft size={16} /></button><h3 className="font-black uppercase text-sm">Volver</h3></div>
                <div className={`p-6 rounded-3xl text-center border transition-all duration-300 ${currentMode === 'lockdown' ? 'bg-red-50 border-red-200' : 'bg-white dark:bg-brand-dark-card border-gray-100 dark:border-white/5'}`}>
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${currentMode === 'lockdown' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}><ShieldCheck size={24} /></div>
                    <h3 className={`font-black text-lg uppercase mb-1 ${currentMode === 'lockdown' ? 'text-red-600' : 'text-brand-black dark:text-white'}`}>{currentMode === 'lockdown' ? 'SISTEMA BLOQUEADO' : 'SISTEMA SEGURO'}</h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium px-4">El modo Lockdown expulsa a todos los usuarios (excepto admins).</p>
                    <button onClick={() => handleSetMode('lockdown')} className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${currentMode === 'lockdown' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-brand-black dark:bg-white text-white dark:text-black'}`}>{currentMode === 'lockdown' ? 'DESACTIVAR LOCKDOWN' : 'ACTIVAR LOCKDOWN'}</button>
                </div>
                <div className={`p-6 rounded-3xl text-center border transition-all duration-300 ${currentMode === 'maintenance' ? 'bg-purple-50 border-purple-200' : 'bg-white dark:bg-brand-dark-card border-gray-100 dark:border-white/5'}`}>
                     <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${currentMode === 'maintenance' ? 'bg-brand-purple text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}><Save size={24} /></div>
                    <h3 className={`font-black text-lg uppercase mb-1 ${currentMode === 'maintenance' ? 'text-brand-purple' : 'text-brand-black dark:text-white'}`}>{currentMode === 'maintenance' ? 'MANTENIMIENTO ACTIVO' : 'OPERACIÓN NORMAL'}</h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium px-4">Muestra una pantalla de "Estamos Trabajando".</p>
                    <button onClick={() => handleSetMode('maintenance')} className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${currentMode === 'maintenance' ? 'bg-brand-purple text-white shadow-lg shadow-purple-500/30' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{currentMode === 'maintenance' ? 'FINALIZAR MANTENIMIENTO' : 'INICIAR MANTENIMIENTO'}</button>
                </div>
            </div>
        )}

         {activeTab === 'pk' && localSchedule && (
            <div className="space-y-6 animate-slide-up">
                <div className="flex bg-white dark:bg-brand-dark-card p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <button onClick={() => setPkView('assign')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${pkView === 'assign' ? 'bg-brand-black dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>PROGRAMAR</button>
                    <button onClick={() => setPkView('requests')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${pkView === 'requests' ? 'bg-brand-black dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>SOLICITUDES ({pendingRequests.length})</button>
                </div>
                {pkView === 'assign' ? (
                     <div className="space-y-8">
                         <div className="bg-white dark:bg-brand-dark-card p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                             <div className="flex items-center gap-3 mb-6"><div className="bg-brand-black dark:bg-white text-white dark:text-black p-2 rounded-lg shadow-md"><Swords size={20} /></div><h3 className="font-black text-lg uppercase text-brand-black dark:text-white tracking-tight">PK Potencial</h3></div>
                             <div className="space-y-3">
                                {localSchedule.potential.map((ev, i) => renderEditableRow(ev, i, 'potential'))}
                                <button onClick={() => handleAddRow('potential')} className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-brand-purple hover:border-brand-purple/50 transition-all uppercase text-[10px] font-black tracking-widest gap-2 group"><Plus size={14} className="group-hover:scale-110 transition-transform" /> Agregar Fila</button>
                             </div>
                             <button onClick={saveSchedule} className="w-full bg-brand-black dark:bg-white text-white dark:text-black h-14 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 mt-8 shadow-xl active:scale-95 transition-all hover:opacity-90"><Save size={16} /> Publicar Cambios (Potencial)</button>
                         </div>
                         <div className="bg-white dark:bg-brand-dark-card p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                             <div className="flex items-center gap-3 mb-6"><div className="bg-orange-500 text-white p-2 rounded-lg shadow-md shadow-orange-500/30"><Zap size={20} /></div><h3 className="font-black text-lg uppercase text-brand-black dark:text-white tracking-tight">PK SuperSmash</h3></div>
                             <div className="space-y-3">
                                {localSchedule.supersmash.map((ev, i) => renderEditableRow(ev, i, 'supersmash'))}
                                <button onClick={() => handleAddRow('supersmash')} className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500/50 transition-all uppercase text-[10px] font-black tracking-widest gap-2 group"><Plus size={14} className="group-hover:scale-110 transition-transform" /> Agregar Fila</button>
                             </div>
                             <button onClick={saveSchedule} className="w-full bg-brand-black dark:bg-white text-white dark:text-black h-14 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 mt-8 shadow-xl active:scale-95 transition-all hover:opacity-90"><Save size={16} /> Publicar Cambios (Supersmash)</button>
                         </div>
                     </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1 mb-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bandeja de Entrada</span>{historyRequests.length > 0 && (<button onClick={handleClearHistory} disabled={isClearingHistory} className="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded flex items-center gap-1 hover:bg-red-100 transition-colors uppercase tracking-wide">{isClearingHistory ? 'Eliminando...' : <> <Trash2 size={10} /> Borrar Historial </>}</button>)}</div>
                        {pendingRequests.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-brand-dark-card rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10"><div className="bg-gray-50 dark:bg-white/5 p-4 rounded-full mb-4"><Check size={32} className="text-gray-300" /></div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sin solicitudes pendientes</p></div>) : pendingRequests.map(req => (<div key={req.id} className="bg-white dark:bg-brand-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex justify-between items-center group"><div><div className="flex items-center gap-2 mb-1"><h3 className="font-black text-brand-black dark:text-white uppercase text-xl">{req.bigoId}</h3><span className="bg-yellow-100 text-yellow-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">Pendiente</span></div><p className="text-sm font-bold text-brand-purple flex items-center gap-1"><Clock size={12}/> {req.date}</p><p className="text-[10px] text-gray-400 mt-1 font-mono">UID: {req.userId.substring(0,8)}...</p></div><div className="flex gap-3"><button onClick={() => updatePKRequestStatus(req.id, 'rejected')} className="w-12 h-12 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 border border-red-100 dark:border-red-900/20"><X size={20} strokeWidth={2.5} /></button><button onClick={() => updatePKRequestStatus(req.id, 'approved')} className="w-12 h-12 bg-green-50 dark:bg-green-900/10 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm active:scale-90 border border-green-100 dark:border-green-900/20"><Check size={20} strokeWidth={2.5} /></button></div></div>))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'comms' && (
             <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 space-y-4 animate-slide-up">
                 <div className="flex items-center space-x-3 mb-2"><div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center"><Bell size={20} /></div><div><h3 className="font-black uppercase text-sm leading-none">Notificación Push</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">Enviar a todos los usuarios</p></div></div>
                 <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 mb-4"><label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">OneSignal API Key</label><input type="password" value={restApiKey} onChange={e => setRestApiKey(e.target.value)} placeholder="Pegar REST API Key aquí..." className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-mono outline-none focus:border-brand-purple transition-colors" /></div>
                 <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5"><label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Mensaje</label><textarea value={alertMessage} onChange={e => setAlertMessage(e.target.value)} placeholder="Escribe el aviso importante..." className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-medium outline-none focus:border-brand-purple transition-colors h-24 resize-none" /></div>
                 <Button onClick={handleSendAlert} disabled={isSendingAlert} fullWidth className="shadow-xl">{isSendingAlert ? 'Enviando...' : 'Enviar Alerta Global'}</Button>
             </div>
        )}
      </div>

      {showTimeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowTimeModal(false)}>
              <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 w-full max-w-sm border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black uppercase text-brand-black dark:text-white tracking-tighter">Configurar Horario</h3><button onClick={() => setShowTimeModal(false)} className="bg-gray-100 dark:bg-white/10 p-2 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors"><X size={20} /></button></div>
                  <div className="space-y-6">
                      <div className="flex items-center justify-between"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inicio</span><div className="flex items-center gap-2"><input type="number" min="1" max="12" value={tempTimeData.startH} onChange={e => setTempTimeData({...tempTimeData, startH: e.target.value})} className="w-14 h-14 bg-gray-50 dark:bg-black/40 rounded-xl text-center text-xl font-black text-brand-black dark:text-white border-none outline-none focus:ring-2 ring-brand-purple/50" /><span className="text-xl font-black text-gray-300">:</span><input type="number" min="0" max="59" value={tempTimeData.startM} onChange={e => setTempTimeData({...tempTimeData, startM: e.target.value})} className="w-14 h-14 bg-gray-50 dark:bg-black/40 rounded-xl text-center text-xl font-black text-brand-black dark:text-white border-none outline-none focus:ring-2 ring-brand-purple/50" /></div></div>
                      <div className="flex items-center justify-between"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fin</span><div className="flex items-center gap-2"><input type="number" min="1" max="12" value={tempTimeData.endH} onChange={e => setTempTimeData({...tempTimeData, endH: e.target.value})} className="w-14 h-14 bg-gray-50 dark:bg-black/40 rounded-xl text-center text-xl font-black text-brand-black dark:text-white border-none outline-none focus:ring-2 ring-brand-purple/50" /><span className="text-xl font-black text-gray-300">:</span><input type="number" min="0" max="59" value={tempTimeData.endM} onChange={e => setTempTimeData({...tempTimeData, endM: e.target.value})} className="w-14 h-14 bg-gray-50 dark:bg-black/40 rounded-xl text-center text-xl font-black text-brand-black dark:text-white border-none outline-none focus:ring-2 ring-brand-purple/50" /></div></div>
                      <div className="bg-gray-50 dark:bg-white/5 p-1 rounded-xl flex"><button onClick={() => setTempTimeData({...tempTimeData, ampm: 'AM'})} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${tempTimeData.ampm === 'AM' ? 'bg-white dark:bg-brand-purple text-brand-black dark:text-white shadow-md' : 'text-gray-400'}`}>AM</button><button onClick={() => setTempTimeData({...tempTimeData, ampm: 'PM'})} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${tempTimeData.ampm === 'PM' ? 'bg-white dark:bg-brand-purple text-brand-black dark:text-white shadow-md' : 'text-gray-400'}`}>PM</button></div>
                      <button onClick={saveTimeFromModal} className="w-full bg-brand-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Aplicar Horario</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
