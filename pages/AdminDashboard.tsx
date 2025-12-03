
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Bell, Swords, Ban, Search, Lock, Unlock, Key, ArrowLeft, ArrowRight, ShieldCheck, UserX, Check, X, Save } from 'lucide-react';
import { collection, updateDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useContent, hashString } from '../context/ContentContext';
import { PKSchedule, PKEvent, PKRequest } from '../types';
import { ONESIGNAL_APP_ID } from '../constants';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { updatePKSchedule, updatePKRequestStatus, deletePKRequest, homeConfig, updateHomeConfig } = useContent();
  
  const [activeTab, setActiveTab] = useState<'users' | 'pk' | 'security' | 'comms'>('users');
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

  const handleScheduleChange = (type: 'potential' | 'supersmash', index: number, field: keyof PKEvent, value: string) => {
      if (!localSchedule) return;
      const updatedList = [...(localSchedule[type] || [])];
      if (!updatedList[index]) return;
      updatedList[index] = { ...updatedList[index], [field]: value };
      setLocalSchedule({ ...localSchedule, [type]: updatedList });
  };

  const saveSchedule = async () => {
      if (localSchedule) { await updatePKSchedule(localSchedule); alert("Calendario actualizado"); }
  };

  const pendingRequests = pkRequests.filter(req => req.status === 'pending');
  const currentMode = homeConfig.maintenanceMode || 'off';

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      <Header title="Panel Admin" showBack onBack={() => navigate('/admin/selection')} />
      
      {/* TABS CONTAINER - Fixed positioning below header */}
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] w-full bg-white dark:bg-black/95 z-30 border-b border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide p-2 px-4">
            {[
                { id: 'users', label: 'Emisores', icon: Users },
                { id: 'pk', label: 'Arena PK', icon: Swords },
                { id: 'security', label: 'Seguridad', icon: Shield },
                { id: 'comms', label: 'Push', icon: Bell },
            ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setSecurityView('menu'); }}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-300 whitespace-nowrap ${isActive ? 'bg-brand-black dark:bg-white text-white dark:text-black border-transparent shadow-md' : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} /><span className="text-[11px] font-black uppercase tracking-wide">{tab.label}</span>
                    </button>
                )
            })}
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-24">
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
        
        {activeTab === 'security' && securityView === 'menu' && (
             <div className="space-y-4 animate-slide-up">
                 <button onClick={() => setSecurityView('agency_key')} className="w-full p-6 bg-brand-black dark:bg-white text-white dark:text-black rounded-3xl shadow-lg flex justify-between items-center group active:scale-[0.98] transition-all">
                     <div className="text-left">
                         <div className="bg-white/20 dark:bg-black/10 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                             <Key size={20} />
                         </div>
                         <h3 className="font-black text-lg uppercase leading-none mb-1">Llave de Registro</h3>
                         <p className="text-xs opacity-60 font-medium">Contraseña de acceso para nuevos</p>
                     </div>
                     <ArrowRight className="opacity-50 group-hover:opacity-100 transition-opacity" />
                 </button>
                 
                 <button onClick={() => setSecurityView('lockdown')} className="w-full p-6 bg-red-600 text-white rounded-3xl shadow-lg shadow-red-600/20 flex justify-between items-center group active:scale-[0.98] transition-all">
                     <div className="text-left">
                         <div className="bg-black/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                             <Ban size={20} />
                         </div>
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
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-brand-purple mb-4">
                        <Key size={24} />
                    </div>
                    <h2 className="text-xl font-black uppercase mb-2 text-brand-black dark:text-white">Actualizar Llave</h2>
                    <p className="text-xs text-gray-500 mb-6 font-medium">Define la contraseña única que deberán ingresar los nuevos usuarios para registrarse en la agencia.</p>
                    <input type="text" value={newAgencyCode} onChange={(e) => setNewAgencyCode(e.target.value)} placeholder="Nueva contraseña..." className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-4 outline-none font-bold text-center text-lg tracking-widest uppercase" />
                    <Button onClick={handleUpdateAgencyCode} disabled={isUpdatingKey} fullWidth className="h-14">{isUpdatingKey ? 'Encriptando...' : 'Guardar Nueva Llave'}</Button>
                </div>
            </div>
        )}
        
        {activeTab === 'security' && securityView === 'lockdown' && (
            <div className="space-y-4 animate-slide-up">
                <div className="flex items-center mb-4"><button onClick={() => setSecurityView('menu')} className="mr-2 p-2 bg-gray-100 dark:bg-white/10 rounded-full"><ArrowLeft size={16} /></button><h3 className="font-black uppercase text-sm">Volver</h3></div>
                
                {/* Lockdown Card */}
                <div className={`p-6 rounded-3xl text-center border transition-all duration-300 ${currentMode === 'lockdown' ? 'bg-red-50 border-red-200' : 'bg-white dark:bg-brand-dark-card border-gray-100 dark:border-white/5'}`}>
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${currentMode === 'lockdown' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className={`font-black text-lg uppercase mb-1 ${currentMode === 'lockdown' ? 'text-red-600' : 'text-brand-black dark:text-white'}`}>{currentMode === 'lockdown' ? 'SISTEMA BLOQUEADO' : 'SISTEMA SEGURO'}</h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium px-4">El modo Lockdown expulsa a todos los usuarios (excepto admins) y bloquea el acceso.</p>
                    <button onClick={() => handleSetMode('lockdown')} className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${currentMode === 'lockdown' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-brand-black dark:bg-white text-white dark:text-black'}`}>
                        {currentMode === 'lockdown' ? 'DESACTIVAR LOCKDOWN' : 'ACTIVAR LOCKDOWN'}
                    </button>
                </div>

                {/* Maintenance Card */}
                <div className={`p-6 rounded-3xl text-center border transition-all duration-300 ${currentMode === 'maintenance' ? 'bg-purple-50 border-purple-200' : 'bg-white dark:bg-brand-dark-card border-gray-100 dark:border-white/5'}`}>
                     <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${currentMode === 'maintenance' ? 'bg-brand-purple text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                        <Save size={24} />
                    </div>
                    <h3 className={`font-black text-lg uppercase mb-1 ${currentMode === 'maintenance' ? 'text-brand-purple' : 'text-brand-black dark:text-white'}`}>{currentMode === 'maintenance' ? 'MANTENIMIENTO ACTIVO' : 'OPERACIÓN NORMAL'}</h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium px-4">Muestra una pantalla de "Estamos Trabajando" temporalmente.</p>
                    <button onClick={() => handleSetMode('maintenance')} className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${currentMode === 'maintenance' ? 'bg-brand-purple text-white shadow-lg shadow-purple-500/30' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                        {currentMode === 'maintenance' ? 'FINALIZAR MANTENIMIENTO' : 'INICIAR MANTENIMIENTO'}
                    </button>
                </div>
            </div>
        )}

         {activeTab === 'pk' && localSchedule && (
            <div className="space-y-6 animate-slide-up">
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl"><button onClick={() => setPkView('assign')} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${pkView === 'assign' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>Programar</button><button onClick={() => setPkView('requests')} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${pkView === 'requests' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>Solicitudes ({pendingRequests.length})</button></div>
                {pkView === 'assign' ? (
                     <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-6 shadow-sm">
                         <div>
                             <h3 className="font-black uppercase text-xs text-gray-400 mb-3 tracking-widest">PK Potencial (Principal)</h3>
                             <div className="space-y-2">
                                {localSchedule.potential.map((ev, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <div className="w-6 text-[10px] font-black text-gray-300">{ev.time}</div>
                                        <input value={ev.id1} onChange={e => handleScheduleChange('potential', i, 'id1', e.target.value)} className="flex-1 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-transparent focus:border-brand-purple dark:border-white/10 text-center font-black text-xs uppercase" placeholder="ID 1" />
                                        <span className="text-[10px] font-black text-gray-300">VS</span>
                                        <input value={ev.id2} onChange={e => handleScheduleChange('potential', i, 'id2', e.target.value)} className="flex-1 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-transparent focus:border-brand-purple dark:border-white/10 text-center font-black text-xs uppercase" placeholder="ID 2" />
                                    </div>
                                ))}
                             </div>
                         </div>
                         
                         <div className="border-t border-gray-100 dark:border-white/5 pt-6">
                             <h3 className="font-black uppercase text-xs text-gray-400 mb-3 tracking-widest">PK SuperSmash</h3>
                             <div className="space-y-2">
                                {localSchedule.supersmash.map((ev, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <div className="w-6 text-[10px] font-black text-gray-300">{ev.time}</div>
                                        <input value={ev.id1} onChange={e => handleScheduleChange('supersmash', i, 'id1', e.target.value)} className="flex-1 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-transparent focus:border-brand-purple dark:border-white/10 text-center font-black text-xs uppercase" placeholder="ID 1" />
                                        <span className="text-[10px] font-black text-gray-300">VS</span>
                                        <input value={ev.id2} onChange={e => handleScheduleChange('supersmash', i, 'id2', e.target.value)} className="flex-1 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-transparent focus:border-brand-purple dark:border-white/10 text-center font-black text-xs uppercase" placeholder="ID 2" />
                                    </div>
                                ))}
                             </div>
                         </div>

                         <Button onClick={saveSchedule} fullWidth className="mt-4 shadow-xl"><Save size={16} className="mr-2"/> Publicar Cambios</Button>
                     </div>
                ) : (
                    <div className="space-y-3">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-10 bg-white dark:bg-brand-dark-card rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sin solicitudes pendientes</p>
                            </div>
                        ) : pendingRequests.map(req => (
                            <div key={req.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex justify-between items-center group">
                                <div>
                                    <h3 className="font-black text-brand-black dark:text-white uppercase text-lg">{req.bigoId}</h3>
                                    <p className="text-xs font-bold text-brand-purple">{req.date}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">ID Usuario: {req.userId}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => updatePKRequestStatus(req.id, 'rejected')} className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"><X size={18} /></button>
                                    <button onClick={() => updatePKRequestStatus(req.id, 'approved')} className="w-10 h-10 bg-green-50 text-green-500 rounded-lg flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"><Check size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'comms' && (
             <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 space-y-4 animate-slide-up">
                 <div className="flex items-center space-x-3 mb-2">
                     <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center">
                         <Bell size={20} />
                     </div>
                     <div>
                        <h3 className="font-black uppercase text-sm leading-none">Notificación Push</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">Enviar a todos los usuarios</p>
                     </div>
                 </div>
                 
                 <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 mb-4">
                     <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">OneSignal API Key</label>
                     <input type="password" value={restApiKey} onChange={e => setRestApiKey(e.target.value)} placeholder="Pegar REST API Key aquí..." className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-mono outline-none focus:border-brand-purple transition-colors" />
                 </div>

                 <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                     <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Mensaje</label>
                     <textarea value={alertMessage} onChange={e => setAlertMessage(e.target.value)} placeholder="Escribe el aviso importante..." className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-medium outline-none focus:border-brand-purple transition-colors h-24 resize-none" />
                 </div>
                 
                 <Button onClick={handleSendAlert} disabled={isSendingAlert} fullWidth className="shadow-xl">{isSendingAlert ? 'Enviando...' : 'Enviar Alerta Global'}</Button>
             </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
