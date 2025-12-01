import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Bell, Swords, Ban, Search, Lock, Unlock, BarChart2, Check, X, Send, Radio, Activity, Trophy, Save, Clock, Trash2, History, Calendar, Eye, Laptop, UserCheck, ShieldCheck, AlertTriangle, ChevronRight, Key, EyeOff } from 'lucide-react';
import { collection, updateDoc, doc, onSnapshot, query, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useContent, hashString } from '../context/ContentContext';
import { PKSchedule, PKEvent, ActivityLog } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { pkSchedule, updatePKSchedule, pkRequests, updatePKRequestStatus, deletePKRequest, homeConfig, updateHomeConfig } = useContent();
  
  // Tabs Principales
  const [activeTab, setActiveTab] = useState<'users' | 'pk' | 'security' | 'comms' | 'data'>('users');
  
  // Sub-tabs para PK
  const [pkView, setPkView] = useState<'assign' | 'requests'>('assign');

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local State for PK Editing
  const [localSchedule, setLocalSchedule] = useState<PKSchedule | null>(null);

  // Estados Formularios
  const [alertMessage, setAlertMessage] = useState('');
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // --- SECURITY STATES (REAL TIME FIX) ---
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Agency Code Management State
  const [newAgencyCode, setNewAgencyCode] = useState('');
  const [showAgencyCode, setShowAgencyCode] = useState(false);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  
  // Derivamos el usuario seleccionado en tiempo real
  const selectedSecurityUser = users.find(u => u.id === selectedUserId) || null;

  // Sync Local PK State
  useEffect(() => {
      if (pkSchedule) {
          setLocalSchedule(pkSchedule);
      }
  }, [pkSchedule]);

  // --- REAL TIME USERS LISTENER ---
  useEffect(() => {
    if (!db) return;
    
    // Listen to users collection
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

  // --- ACTIONS ---

  const handleBlockUser = async (userId: string, currentStatus: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", userId), { isBlocked: !currentStatus });
    } catch (e) {
      alert("Error al actualizar estado");
    }
  };

  // --- GLOBAL LOCKDOWN LOGIC ---
  const handleGlobalBlock = async (block: boolean) => {
    if (!window.confirm(`¿CONFIRMAR PROTOCOLO DE SEGURIDAD: ${block ? 'LOCKDOWN TOTAL' : 'RESTAURAR ACCESO'}?`)) return;
    try {
        await updateHomeConfig({ maintenanceMode: block });
        alert(block ? "SISTEMA BLOQUEADO. Solo Admins tienen acceso." : "SISTEMA RESTAURADO. Acceso público permitido.");
    } catch (e) {
        alert("Error al actualizar estado de seguridad.");
    }
  };

  const handleUpdateAgencyCode = async () => {
      if (!newAgencyCode.trim()) {
          alert("La contraseña no puede estar vacía.");
          return;
      }
      
      setIsUpdatingKey(true);
      try {
          // Encrypt
          const hashed = await hashString(newAgencyCode.trim().toLowerCase());
          await updateHomeConfig({ agencyCodeHash: hashed });
          alert("¡Código de Agencia actualizado exitosamente! Los nuevos usuarios deberán usar esta clave.");
          setNewAgencyCode('');
      } catch(e) {
          alert("Error al actualizar clave.");
      } finally {
          setIsUpdatingKey(false);
      }
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

  const handleApproveRequest = async (reqId: string) => {
      const confirm = window.confirm("¿Confirmar Agenda?");
      if (confirm) await updatePKRequestStatus(reqId, 'approved');
  };

  const handleRejectRequest = async (reqId: string) => {
      const confirm = window.confirm("¿Rechazar solicitud?");
      if (confirm) await updatePKRequestStatus(reqId, 'rejected');
  };

  const handleDeleteRequest = async (reqId: string) => {
      const confirm = window.confirm("¿Eliminar del historial?");
      if (confirm) await deletePKRequest(reqId);
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

  // --- SECURITY LOGIC ---

  const initiateSecurityAction = async (type: 'block' | 'unblock' | 'reset_session' | 'make_admin' | 'remove_admin', userId: string) => {
      if (!window.confirm("¿Confirmar acción de seguridad?")) return;
      
      if (!db) return;

      const userRef = doc(db, "users", userId);
      const now = new Date().toISOString();
      let logAction = "";

      try {
          if (type === 'block') {
              await updateDoc(userRef, { isBlocked: true });
              logAction = "Bloqueo de Acceso";
          } else if (type === 'unblock') {
              await updateDoc(userRef, { isBlocked: false });
              logAction = "Desbloqueo de Acceso";
          } else if (type === 'make_admin') {
              await updateDoc(userRef, { isAdmin: true, role: 'Admin Agencia' });
              logAction = "Promovido a Admin";
          } else if (type === 'remove_admin') {
              await updateDoc(userRef, { isAdmin: false, role: 'Streamer' });
              logAction = "Revocado de Admin";
          } else if (type === 'reset_session') {
              await updateDoc(userRef, { forceRelogin: Date.now() });
              alert("Orden de cierre de sesión enviada.");
              logAction = "Reinicio de Sesión Forzado";
          }

          // Add Security Log to User's History
          if (logAction) {
             const newLog: ActivityLog = {
                 action: `ADMIN: ${logAction}`,
                 timestamp: now,
                 device: "Panel de Seguridad",
                 type: "security_alert"
             };
             await updateDoc(userRef, {
                 accessLogs: arrayUnion(newLog)
             });
          }

      } catch (error) {
          console.error(error);
          alert("Error ejecutando protocolo de seguridad.");
      }
  };


  const filteredUsers = users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.bigoId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = pkRequests.filter(req => req.status === 'pending');
  const historyRequests = pkRequests.filter(req => req.status !== 'pending');

  // Check for default agency code risk (Using Hash Comparison for 'moon')
  const DEFAULT_HASH = "a43c1b0aa53a0c908810c03ab1d7cb9922c2a05d605c567839356b20677275c5";
  const isDefaultAgencyCode = homeConfig?.agencyCodeHash === DEFAULT_HASH || !homeConfig?.agencyCodeHash;

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      <Header title="Panel Admin" showBack onBack={() => navigate('/admin/selection')} />
      
      {/* Nav Tabs */}
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-4 bg-white dark:bg-black/95 sticky top-0 z-30 border-b border-gray-100 dark:border-white/5">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide p-4">
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

        {/* --- TAB: SEGURIDAD --- */}
        {activeTab === 'security' && (
            <div className="space-y-6 animate-slide-up">
                
                <div className="flex items-center justify-between mb-2">
                     <div>
                        <h2 className="text-2xl font-black uppercase text-brand-black dark:text-white leading-none">Centro de Mando</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Gestión de Accesos en Tiempo Real</p>
                     </div>
                     <div className="bg-brand-black dark:bg-white/10 p-2 rounded-lg text-white">
                         <ShieldCheck size={24} />
                     </div>
                </div>

                {/* WARNING ALERT FOR DEFAULT PASSWORD */}
                {isDefaultAgencyCode && (
                    <div className="w-full bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-2xl flex items-center justify-between gap-3 text-left group">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                            <div>
                                <h3 className="text-xs font-black text-yellow-500 uppercase mb-1">Riesgo Detectado</h3>
                                <p className="text-[10px] text-yellow-600 dark:text-yellow-400 leading-relaxed font-medium">
                                    El "Código de Agencia" es inseguro ("moon").
                                    <br/>
                                    Utiliza el módulo de abajo para cambiarlo.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- AGENCY CODE MANAGEMENT --- */}
                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-brand-purple/10 p-2 rounded-lg">
                            <Key className="text-brand-purple" size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase text-brand-black dark:text-white">Llave de Acceso (Registro)</h3>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 block">Nueva Contraseña de Agencia</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type={showAgencyCode ? "text" : "password"} 
                                    value={newAgencyCode} 
                                    onChange={(e) => setNewAgencyCode(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-black text-brand-black dark:text-white focus:border-brand-purple outline-none tracking-widest pr-10 placeholder:font-normal placeholder:tracking-normal"
                                    placeholder="Nueva clave secreta"
                                />
                                <button onClick={() => setShowAgencyCode(!showAgencyCode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-purple">
                                    {showAgencyCode ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <Button 
                                onClick={handleUpdateAgencyCode} 
                                disabled={isUpdatingKey || !newAgencyCode.trim()} 
                                size="sm" 
                                className="h-auto rounded-xl shadow-lg"
                            >
                                {isUpdatingKey ? '...' : <Save size={18} />}
                            </Button>
                        </div>
                        <p className="text-[9px] text-gray-400 font-medium leading-tight">
                            * Esta clave es necesaria para que nuevos usuarios creen una cuenta.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-dark-card p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center">
                    <Search size={18} className="text-gray-400 ml-2" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar usuario para auditar..." 
                        className="bg-transparent border-none text-sm font-bold w-full ml-3 focus:outline-none dark:text-white placeholder-gray-300" 
                    />
                </div>

                {/* DANGER ZONE - REAL LOCKDOWN */}
                <div className={`p-6 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-500 ${homeConfig.maintenanceMode ? 'bg-red-700 shadow-red-900/50' : 'bg-white dark:bg-brand-dark-card border border-gray-100 dark:border-white/5'}`}>
                    {homeConfig.maintenanceMode && <Shield className="absolute -right-6 -bottom-6 text-white/10 rotate-[-15deg]" size={150} />}
                    
                    <div className="relative z-10">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className={`${homeConfig.maintenanceMode ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'} p-2 rounded-lg backdrop-blur-sm`}><Ban size={24} /></div>
                            <h2 className={`text-xl font-black uppercase ${homeConfig.maintenanceMode ? 'text-white' : 'text-brand-black dark:text-white'}`}>Zona de Peligro</h2>
                        </div>
                        <p className={`text-xs font-medium mb-6 leading-relaxed max-w-[250px] ${homeConfig.maintenanceMode ? 'text-white/80' : 'text-gray-500'}`}>
                            {homeConfig.maintenanceMode 
                                ? "EL SISTEMA ESTÁ BLOQUEADO. Nadie puede acceder excepto administradores." 
                                : "Acciones irreversibles. El botón 'Lockdown' expulsará a todos los usuarios no administradores inmediatamente."}
                        </p>

                        <div className="space-y-3">
                            {homeConfig.maintenanceMode ? (
                                <button onClick={() => handleGlobalBlock(false)} className="w-full bg-white text-red-700 p-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                                    <Unlock size={14} className="mr-2" /> RESTAURAR ACCESO PÚBLICO
                                </button>
                            ) : (
                                <button onClick={() => handleGlobalBlock(true)} className="w-full bg-red-600 text-white p-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-red-700">
                                    <Lock size={14} className="mr-2" /> ACTIVAR LOCKDOWN TOTAL
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="text-gray-400" size={20} />
                        <h3 className="text-sm font-black uppercase text-brand-black dark:text-white">Estado del Sistema</h3>
                    </div>
                    <div className="space-y-4">
                         <div className="flex items-start space-x-3">
                             <div className={`w-2.5 h-2.5 rounded-full mt-1.5 animate-pulse ${homeConfig.maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                             <div>
                                 <p className="text-xs font-bold text-brand-black dark:text-white">{homeConfig.maintenanceMode ? 'MODO MANTENIMIENTO ACTIVO' : 'SISTEMA ESTABLE'}</p>
                                 <p className="text-[10px] text-gray-400">{homeConfig.maintenanceMode ? 'Acceso restringido a usuarios.' : 'Todos los servicios operando correctamente.'}</p>
                             </div>
                         </div>
                    </div>
                </div>

                <div className="grid gap-3">
                    {filteredUsers.map((u) => (
                        <button 
                            key={u.id}
                            onClick={() => setSelectedUserId(u.id)}
                            className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.99] transition-all hover:border-brand-purple/30 text-left"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <img src={u.avatarUrl} alt="av" className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-black ${u.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-brand-black dark:text-white leading-none mb-0.5">{u.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-mono">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Eye size={16} className="text-gray-300 group-hover:text-brand-purple" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* --- FIXED USER DOSSIER MODAL (CLEAN DESIGN - NO HEADER STRIP) --- */}
                {selectedSecurityUser && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        {/* 1. SOLID BACKDROP */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedUserId(null)}></div>

                        {/* 2. CARD CONTAINER */}
                        <div className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col h-auto max-h-[85vh] animate-slide-up">
                            
                            {/* FLOATING CLOSE BUTTON */}
                            <button 
                                onClick={() => setSelectedUserId(null)} 
                                className="absolute top-4 right-4 z-50 bg-gray-100 dark:bg-white/10 text-brand-black dark:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors shadow-sm"
                            >
                                <X size={20} />
                            </button>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-[#121212] relative pt-12">
                                <div className="px-6 pb-6">
                                    
                                    {/* Profile Info - Centered */}
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="relative">
                                            <div className="w-28 h-28 rounded-full p-1 bg-white dark:bg-[#121212] shadow-2xl border-4 border-gray-50 dark:border-white/5">
                                                <img src={selectedSecurityUser.avatarUrl} alt="profile" className="w-full h-full rounded-full object-cover bg-gray-200" />
                                            </div>
                                            <div className={`absolute bottom-0 right-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-2 border-white dark:border-[#121212] ${selectedSecurityUser.isBlocked ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                                {selectedSecurityUser.isBlocked ? 'BLOQUEADO' : 'ACTIVO'}
                                            </div>
                                        </div>
                                        
                                        <h2 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none mt-4 text-center">{selectedSecurityUser.name}</h2>
                                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mt-2">
                                            <ShieldCheck size={14} />
                                            <span className="text-xs font-bold uppercase">{selectedSecurityUser.role || 'Streamer'}</span>
                                            <span>•</span>
                                            <span className="text-xs font-mono">{selectedSecurityUser.bigoId || 'Sin ID'}</span>
                                        </div>
                                    </div>

                                    {/* Live Data Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center space-x-2 mb-2 text-gray-400">
                                                <Laptop size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-wider">Dispositivo</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-brand-black dark:text-white leading-tight block line-clamp-2">
                                                {selectedSecurityUser.deviceInfo || 'Desconocido'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center space-x-2 mb-2 text-gray-400">
                                                <Activity size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-wider">Última Sesión</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-brand-black dark:text-white leading-tight block">
                                                {selectedSecurityUser.lastLogin ? new Date(selectedSecurityUser.lastLogin).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Real-time Logs History */}
                                    <div className="mb-2">
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center">
                                            <History size={14} className="mr-2" /> Historial de Actividad
                                        </h4>
                                        <div className="space-y-4 relative border-l-2 border-gray-100 dark:border-white/10 ml-2.5 pb-2">
                                            {selectedSecurityUser.accessLogs && selectedSecurityUser.accessLogs.length > 0 ? (
                                                selectedSecurityUser.accessLogs.slice().reverse().slice(0, 10).map((log: ActivityLog, idx: number) => (
                                                    <div key={idx} className="flex items-start pl-6 relative group">
                                                        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-black transition-colors ${log.type === 'security_alert' ? 'bg-red-500' : 'bg-gray-300 dark:bg-white/20'}`}></div>
                                                        <div className="flex-1">
                                                            <p className="text-[11px] font-bold text-brand-black dark:text-white leading-tight">{log.action}</p>
                                                            <p className="text-[9px] text-gray-400 mt-0.5">{new Date(log.timestamp).toLocaleString()} • {log.device}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-400 pl-6 italic">Sin actividad registrada.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer (Sticky at bottom of card) */}
                            <div className="p-4 bg-gray-50 dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-white/10 shrink-0">
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => initiateSecurityAction(selectedSecurityUser.isBlocked ? 'unblock' : 'block', selectedSecurityUser.id)}
                                        className={`p-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm ${
                                            selectedSecurityUser.isBlocked 
                                            ? 'bg-white text-green-600 border border-green-200 hover:bg-green-50' 
                                            : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                                        }`}
                                    >
                                        {selectedSecurityUser.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                                        <span className="text-[10px] font-black uppercase">
                                            {selectedSecurityUser.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                        </span>
                                    </button>

                                    <button 
                                        onClick={() => initiateSecurityAction(selectedSecurityUser.isAdmin ? 'remove_admin' : 'make_admin', selectedSecurityUser.id)}
                                        className={`p-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm border ${
                                            selectedSecurityUser.isAdmin
                                            ? 'bg-brand-black text-white border-transparent'
                                            : 'bg-white text-brand-black border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        {selectedSecurityUser.isAdmin ? <UserCheck size={18} /> : <Shield size={18} />}
                                        <span className="text-[10px] font-black uppercase">
                                            {selectedSecurityUser.isAdmin ? 'Quitar Admin' : 'Hacer Admin'}
                                        </span>
                                    </button>
                                </div>
                                <button 
                                    onClick={() => initiateSecurityAction('reset_session', selectedSecurityUser.id)}
                                    className="w-full mt-3 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                >
                                    Cerrar Sesión en todos los dispositivos
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        )}

        {/* ... (Other tabs remain unchanged) ... */}
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
                         {/* PK Editor Code... */}
                         {/* ... */}
                         <div className="bg-white dark:bg-brand-dark-card p-4 rounded-3xl border border-gray-100 dark:border-white/5"><div className="flex items-center space-x-2 mb-4 border-b border-gray-100 dark:border-white/5 pb-2"><div className="bg-brand-black text-white p-1.5 rounded"><Swords size={16} /></div><h3 className="text-sm font-black uppercase">PK Potencial</h3></div><div className="space-y-3">{localSchedule.potential.map((event, idx) => (<div key={event.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between gap-3"><div className="flex flex-col items-center justify-center bg-white dark:bg-black/20 p-2 rounded-lg min-w-[60px]"><Clock size={12} className="text-gray-400 mb-1"/><span className="text-[9px] font-black text-brand-black dark:text-white whitespace-nowrap text-center leading-tight">08:00<br/>08:15 PM</span></div><div className="flex-1 flex items-center gap-2"><input className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:border-brand-purple text-center uppercase" placeholder="ID EMISOR" value={event.id1} onChange={(e) => handleScheduleChange('potential', idx, 'id1', e.target.value)} /><span className="text-[10px] font-black text-gray-300">VS</span><input className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:border-brand-purple text-center uppercase" placeholder="ID OPONENTE" value={event.id2} onChange={(e) => handleScheduleChange('potential', idx, 'id2', e.target.value)} /></div></div>))}</div><div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5"><Button onClick={saveSchedule} fullWidth variant="black" className="shadow-lg h-12 text-xs"><Save size={16} className="mr-2" /> Publicar Cambios (Potencial)</Button></div></div>
                         <div className="bg-white dark:bg-brand-dark-card p-4 rounded-3xl border border-gray-100 dark:border-white/5"><div className="flex items-center space-x-2 mb-4 border-b border-gray-100 dark:border-white/5 pb-2"><div className="bg-orange-500 text-white p-1.5 rounded"><Swords size={16} /></div><h3 className="text-sm font-black uppercase">PK Supersmash</h3></div><div className="space-y-3">{localSchedule.supersmash.map((event, idx) => (<div key={event.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between gap-3"><div className="flex flex-col items-center justify-center bg-white dark:bg-black/20 p-2 rounded-lg min-w-[60px]"><Clock size={12} className="text-gray-400 mb-1"/><span className="text-[9px] font-black text-brand-black dark:text-white whitespace-nowrap text-center leading-tight">08:00<br/>08:15 PM</span></div><div className="flex-1 flex items-center gap-2"><input className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:border-orange-500 text-center uppercase" placeholder="ID EMISOR" value={event.id1} onChange={(e) => handleScheduleChange('supersmash', idx, 'id1', e.target.value)} /><span className="text-[10px] font-black text-gray-300">VS</span><input className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:border-orange-500 text-center uppercase" placeholder="ID OPONENTE" value={event.id2} onChange={(e) => handleScheduleChange('supersmash', idx, 'id2', e.target.value)} /></div></div>))}</div><div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5"><Button onClick={saveSchedule} fullWidth variant="black" className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg h-12 text-xs border-transparent"><Save size={16} className="mr-2" /> Publicar Cambios (Supersmash)</Button></div></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Requests List ... */}
                        <div><h3 className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white mb-3 flex items-center"><Bell className="mr-2 text-brand-purple" size={14} /> Nuevas Solicitudes ({pendingRequests.length})</h3>{pendingRequests.length === 0 ? (<div className="text-center py-6 border border-dashed border-gray-200 dark:border-white/10 rounded-xl"><p className="text-[10px] font-bold uppercase text-gray-400">Sin pendientes</p></div>) : (<div className="space-y-3">{pendingRequests.map((req) => (<div key={req.id} className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm border-l-4 border-l-brand-purple border-y border-r border-gray-100 dark:border-white/5 flex flex-col gap-3"><div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-2"><div className="flex items-center space-x-2 bg-gray-900 text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-lg shadow-md transform -translate-y-1"><Calendar size={14} className="stroke-[2.5]"/><span className="text-xs font-black uppercase tracking-tight">{req.date}</span></div><div className="bg-brand-purple/10 px-2 py-0.5 rounded text-[9px] font-black text-brand-purple uppercase">Pendiente</div></div><div className="flex justify-between items-end"><div><h3 className="text-lg font-black uppercase text-brand-black dark:text-white leading-none">ID: {req.bigoId}</h3><p className="text-[10px] text-gray-400 mt-1 font-bold">Solicita Batalla PK</p></div><div className="flex gap-2"><button onClick={() => handleRejectRequest(req.id)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors border border-transparent hover:border-red-100"><X size={18} strokeWidth={2.5} /></button><button onClick={() => handleApproveRequest(req.id)} className="w-10 h-10 rounded-xl bg-brand-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Check size={18} strokeWidth={3} /></button></div></div></div>))}</div>)}</div>
                        <div><div className="flex items-center justify-between mt-8 mb-4 pt-6 border-t border-gray-100 dark:border-white/5"><h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center"><History className="mr-2" size={14} /> Historial de Solicitudes</h3><span className="text-[9px] font-bold bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-500">{historyRequests.length}</span></div>{historyRequests.length === 0 ? (<div className="text-center py-10 opacity-50"><History size={32} className="mx-auto mb-2 text-gray-300" /><p className="text-[10px] text-gray-400 font-bold uppercase">Historial vacío</p></div>) : (<div className="space-y-3">{historyRequests.map((req) => (<div key={req.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl flex items-center justify-between border border-transparent hover:bg-white dark:hover:bg-brand-dark-card hover:shadow-sm hover:border-gray-100 dark:hover:border-white/10 transition-all group"><div className="flex-1 min-w-0 pr-4"><div className="flex items-center space-x-2 mb-1"><span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{req.status === 'approved' ? 'AGENDADA' : 'RECHAZADA'}</span><div className="flex items-center text-[9px] font-bold text-gray-400"><Calendar size={10} className="mr-1" />{req.date}</div></div><div className="flex items-center justify-between"><span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase truncate">ID: {req.bigoId}</span></div></div><button onClick={() => handleDeleteRequest(req.id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/10 transition-all shadow-sm bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 group-hover:border-red-100"><Trash2 size={16} /></button></div>))}</div>)}</div>
                    </div>
                )}
            </div>
        )}

        {/* COMMS & DATA TABS (Existing content) */}
        {activeTab === 'comms' && (<div className="space-y-6 animate-slide-up"><div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 relative overflow-hidden"><div className="relative z-10"><div className="flex items-center space-x-2 mb-6"><div className="bg-amber-500/10 p-2 rounded-lg"><Radio className="text-amber-500" size={20} /></div><h2 className="text-lg font-black uppercase text-brand-black dark:text-white">Difusión Global</h2></div><div className="space-y-4"><div><label className="text-[9px] font-black uppercase text-gray-400 mb-2 block">Mensaje de Alerta / Push</label><textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} className="w-full h-32 bg-gray-50 dark:bg-white/5 border-none rounded-xl p-4 text-sm font-medium dark:text-white focus:ring-2 ring-amber-500/20 outline-none resize-none placeholder-gray-400" placeholder="Escribe el mensaje..." /></div><Button onClick={handleSendAlert} disabled={isSendingAlert || !alertMessage} fullWidth className={`bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 mt-2 ${isSendingAlert ? 'opacity-70' : ''}`}>{isSendingAlert ? 'Enviando...' : 'Enviar Notificación'} <Send size={16} className="ml-2" /></Button></div></div></div></div>)}
        {activeTab === 'data' && <div className="text-center py-20 text-gray-400 text-xs">Módulo de datos en construcción</div>}

      </div>
    </div>
  );
};

export default AdminDashboard;