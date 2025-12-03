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
      
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-4 bg-white dark:bg-black/95 sticky top-0 z-30 border-b border-gray-100 dark:border-white/5">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide p-4">
            {[
                { id: 'users', label: 'Emisores', icon: Users },
                { id: 'pk', label: 'Arena PK', icon: Swords },
                { id: 'security', label: 'Seguridad', icon: Shield },
                { id: 'comms', label: 'Push', icon: Bell },
            ].map((tab) => {
                const Icon = tab.icon;
                return (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setSecurityView('menu'); }}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-full border transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-black dark:bg-white text-white dark:text-black border-transparent shadow-lg transform scale-105' : 'bg-white dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10'}`}>
                        <Icon size={14} strokeWidth={activeTab === tab.id ? 3 : 2} /><span className="text-[10px] font-black uppercase tracking-wide">{tab.label}</span>
                    </button>
                )
            })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-24">
        {activeTab === 'users' && (
            <div className="space-y-4 animate-slide-up">
                <div className="bg-white dark:bg-brand-dark-card p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center sticky top-0 z-20">
                    <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl"><Search size={18} className="text-gray-400" /></div>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filtrar por nombre, email o ID..." className="bg-transparent border-none text-sm font-bold w-full ml-3 focus:outline-none dark:text-white placeholder-gray-300" />
                </div>
                <div className="grid gap-3">
                    {isLoading ? <div className="text-center py-10">Cargando usuarios...</div> : filteredUsers.map((u) => (
                        <div key={u.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <img src={u.avatarUrl} alt="av" className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                                <div><h3 className="text-sm font-black text-brand-black dark:text-white leading-none mb-1">{u.name}</h3><p className="text-[10px] text-gray-400">{u.email}</p><span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{u.isBlocked ? 'BLOQUEADO' : 'ACTIVO'}</span></div>
                            </div>
                            <button onClick={() => handleBlockUser(u.id, u.isBlocked)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${u.isBlocked ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'}`}>{u.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}</button>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && !isLoading && <p className="text-center text-gray-400 text-xs mt-4">No se encontraron usuarios.</p>}
                </div>
            </div>
        )}
        
        {activeTab === 'security' && securityView === 'menu' && (
             <div className="space-y-4 animate-slide-up">
                 <button onClick={() => setSecurityView('agency_key')} className="w-full p-6 bg-purple-600 text-white rounded-2xl shadow-lg flex justify-between items-center"><div className="text-left"><h3 className="font-black text-lg">Llave de Registro</h3><p className="text-xs opacity-80">Cambiar contraseña de acceso</p></div><Key /></button>
                 <button onClick={() => setSecurityView('lockdown')} className="w-full p-6 bg-red-600 text-white rounded-2xl shadow-lg flex justify-between items-center"><div className="text-left"><h3 className="font-black text-lg">Protocolo Emergencia</h3><p className="text-xs opacity-80">Lockdown / Mantenimiento</p></div><Ban /></button>
             </div>
        )}

        {activeTab === 'security' && securityView === 'agency_key' && (
            <div className="space-y-4 animate-slide-up">
                <div className="flex items-center mb-4"><button onClick={() => setSecurityView('menu')} className="mr-2"><ArrowLeft /></button><h3 className="font-black uppercase">Llave de Acceso</h3></div>
                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-2xl border">
                    <p className="text-xs text-gray-400 mb-4">Esta es la contraseña que los nuevos usuarios deben ingresar para registrarse en la app.</p>
                    <input type="text" value={newAgencyCode} onChange={(e) => setNewAgencyCode(e.target.value)} placeholder="Nueva contraseña de agencia" className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-4 outline-none font-bold" />
                    <Button onClick={handleUpdateAgencyCode} disabled={isUpdatingKey} fullWidth>{isUpdatingKey ? 'Actualizando...' : 'Guardar Nueva Llave'}</Button>
                </div>
            </div>
        )}
        
        {activeTab === 'security' && securityView === 'lockdown' && (
            <div className="space-y-4 animate-slide-up">
                <div className="flex items-center mb-4"><button onClick={() => setSecurityView('menu')} className="mr-2"><ArrowLeft /></button><h3 className="font-black uppercase">Emergencia</h3></div>
                <div className={`p-6 rounded-2xl text-center ${currentMode === 'lockdown' ? 'bg-red-700 text-white' : 'bg-white dark:bg-brand-dark-card border'}`}>
                    <h3 className="font-black text-xl mb-4">{currentMode === 'lockdown' ? 'LOCKDOWN ACTIVO' : 'SISTEMA ONLINE'}</h3>
                    <p className="text-xs opacity-80 mb-6">El modo Lockdown bloquea el acceso a TODOS los usuarios excepto administradores.</p>
                    <Button onClick={() => handleSetMode('lockdown')} variant="black" className="w-full bg-white text-black hover:bg-gray-200">{currentMode === 'lockdown' ? 'DESACTIVAR' : 'ACTIVAR LOCKDOWN'}</Button>
                </div>
                <div className={`p-6 rounded-2xl text-center ${currentMode === 'maintenance' ? 'bg-purple-700 text-white' : 'bg-white dark:bg-brand-dark-card border'}`}>
                    <h3 className="font-black text-xl mb-4">{currentMode === 'maintenance' ? 'MANTENIMIENTO ACTIVO' : 'MANTENIMIENTO INACTIVO'}</h3>
                    <p className="text-xs opacity-80 mb-6">Muestra una pantalla de "Estamos Trabajando" a los usuarios.</p>
                    <Button onClick={() => handleSetMode('maintenance')} variant="black" className="w-full bg-white text-black hover:bg-gray-200">{currentMode === 'maintenance' ? 'FINALIZAR' : 'INICIAR MANTENIMIENTO'}</Button>
                </div>
            </div>
        )}

         {activeTab === 'pk' && localSchedule && (
            <div className="space-y-6 animate-slide-up">
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl"><button onClick={() => setPkView('assign')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase ${pkView === 'assign' ? 'bg-white shadow' : 'text-gray-400'}`}>Programar</button><button onClick={() => setPkView('requests')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase ${pkView === 'requests' ? 'bg-white shadow' : 'text-gray-400'}`}>Solicitudes ({pendingRequests.length})</button></div>
                {pkView === 'assign' ? (
                     <div className="bg-white dark:bg-brand-dark-card p-4 rounded-3xl border border-gray-100 dark:border-white/5 space-y-3">
                         <h3 className="font-black uppercase text-sm mb-2">PK Potencial</h3>
                         {localSchedule.potential.map((ev, i) => (<div key={i} className="flex gap-2"><input value={ev.id1} onChange={e => handleScheduleChange('potential', i, 'id1', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-white/5 rounded border dark:border-white/10 text-center font-bold text-xs" placeholder="ID 1" /><span className="self-center font-black text-xs">VS</span><input value={ev.id2} onChange={e => handleScheduleChange('potential', i, 'id2', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-white/5 rounded border dark:border-white/10 text-center font-bold text-xs" placeholder="ID 2" /></div>))}
                         
                         <h3 className="font-black uppercase text-sm mb-2 mt-6">PK SuperSmash</h3>
                         {localSchedule.supersmash.map((ev, i) => (<div key={i} className="flex gap-2"><input value={ev.id1} onChange={e => handleScheduleChange('supersmash', i, 'id1', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-white/5 rounded border dark:border-white/10 text-center font-bold text-xs" placeholder="ID 1" /><span className="self-center font-black text-xs">VS</span><input value={ev.id2} onChange={e => handleScheduleChange('supersmash', i, 'id2', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-white/5 rounded border dark:border-white/10 text-center font-bold text-xs" placeholder="ID 2" /></div>))}

                         <Button onClick={saveSchedule} fullWidth className="mt-4"><Save size={14} className="mr-2"/> Guardar Calendario</Button>
                     </div>
                ) : (
                    <div className="space-y-3">{pendingRequests.length === 0 ? <p className="text-center text-xs text-gray-400 py-4">No hay solicitudes pendientes.</p> : pendingRequests.map(req => (<div key={req.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex justify-between items-center"><div><h3 className="font-black text-brand-black dark:text-white">{req.bigoId}</h3><p className="text-xs text-gray-400">{req.date}</p></div><div className="flex gap-2"><button onClick={() => updatePKRequestStatus(req.id, 'rejected')} className="p-2 bg-red-50 text-red-500 rounded"><X size={16}/></button><button onClick={() => updatePKRequestStatus(req.id, 'approved')} className="p-2 bg-green-50 text-green-500 rounded"><Check size={16}/></button></div></div>))}</div>
                )}
            </div>
        )}

        {activeTab === 'comms' && (
             <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 space-y-4">
                 <h3 className="font-black uppercase text-sm">Enviar Notificación Push</h3>
                 <input type="password" value={restApiKey} onChange={e => setRestApiKey(e.target.value)} placeholder="OneSignal API Key" className="w-full p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-xs font-mono border border-gray-100 dark:border-white/10" />
                 <textarea value={alertMessage} onChange={e => setAlertMessage(e.target.value)} placeholder="Escribe el mensaje..." className="w-full p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-sm border border-gray-100 dark:border-white/10 h-24" />
                 <Button onClick={handleSendAlert} disabled={isSendingAlert} fullWidth>Enviar Push</Button>
             </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;