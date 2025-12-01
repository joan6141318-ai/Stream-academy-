
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Bell, Swords, Ban, Search, Lock, Unlock, BarChart2, Check, X, Send, Radio, Activity, Trophy, Save, Clock, Trash2, History, Calendar, Eye, Laptop, UserCheck, ShieldCheck, AlertTriangle, ChevronRight, Key, EyeOff, Grid, ArrowLeft, UserX, Fingerprint, ArrowRight, Settings, Wrench, Bot } from 'lucide-react';
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
  
  // Security Sub-Navigation State
  const [securityView, setSecurityView] = useState<'menu' | 'access_control' | 'agency_key' | 'lockdown'>('menu');

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

  // --- SECURITY STATES ---
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Agency Code Management State
  const [newAgencyCode, setNewAgencyCode] = useState('');
  const [showAgencyCode, setShowAgencyCode] = useState(false);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  
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

  const handleClearLogs = async (userId: string) => {
      if (!window.confirm("¿Estás seguro de borrar todo el historial de actividad de este usuario? Esta acción no se puede deshacer.")) return;
      if (!db) return;

      try {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, { accessLogs: [] });
      } catch (e) {
          console.error(e);
          alert("Error al resetear el historial.");
      }
  };


  const filteredUsers = users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.bigoId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = pkRequests.filter(req => req.status === 'pending');
  const historyRequests = pkRequests.filter(req => req.status !== 'pending');

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      <Header title="Panel Admin" showBack onBack={() => navigate('/admin/selection')} />
      
      {/* Nav Tabs - Only show if in main menu of Security or other tabs */}
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-4 bg-white dark:bg-black/95 sticky top-0 z-30 border-b border-gray-100 dark:border-white/5">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide p-4">
            {[
                { id: 'users', label: 'Emisores', icon: Users },
                { id: 'pk', label: 'Arena PK', icon: Swords },
                { id: 'security', label: 'Centro de Mando', icon: Shield }, // Renamed Label
                { id: 'comms', label: 'Push', icon: Bell },
                { id: 'data', label: 'Data', icon: BarChart2 },
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

        {/* --- TAB: USUARIOS (Legacy/Quick View) --- */}
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

        {/* --- TAB: CENTRO DE MANDO (SEGURIDAD) --- */}
        {activeTab === 'security' && (
            <div className="space-y-6 animate-slide-up h-full flex flex-col">
                
                {/* 1. MENU VIEW (GRID) */}
                {securityView === 'menu' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Header Section */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black uppercase text-brand-black dark:text-white leading-none">Centro de Mando</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Seguridad & Auditoría</p>
                            </div>
                            <div className="w-10 h-10 bg-brand-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <ShieldCheck size={20} className="text-white dark:text-black" />
                            </div>
                        </div>

                        {/* MODULES GRID */}
                        <div className="grid grid-cols-2 gap-4">
                            
                            {/* Card 1: Control de Accesos */}
                            <button 
                                onClick={() => setSecurityView('access_control')}
                                className="bg-gradient-to-br from-blue-600 to-cyan-600 p-5 rounded-2xl shadow-xl shadow-blue-500/20 text-left relative overflow-hidden group active:scale-[0.98] transition-all h-40 flex flex-col justify-between"
                            >
                                <div className="relative z-10">
                                    <div className="bg-white/20 w-fit p-2 rounded-lg mb-3 backdrop-blur-md">
                                        <Users className="text-white" size={20} />
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase leading-tight mb-1">Gestión de<br/>Accesos</h3>
                                    <p className="text-[9px] text-white/80 font-medium">Permitir o denegar entrada a la App.</p>
                                </div>
                                <div className="absolute right-4 bottom-4 bg-white/10 p-1.5 rounded-full backdrop-blur-sm">
                                    <ArrowRight className="text-white" size={14} />
                                </div>
                                <UserX className="absolute -right-4 -bottom-4 text-white/10 rotate-[-15deg] group-hover:scale-110 transition-transform" size={100} />
                            </button>

                            {/* Card 2: Llave de Acceso */}
                            <button 
                                onClick={() => setSecurityView('agency_key')}
                                className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-5 rounded-2xl shadow-xl shadow-purple-500/20 text-left relative overflow-hidden group active:scale-[0.98] transition-all h-40 flex flex-col justify-between"
                            >
                                <div className="relative z-10">
                                    <div className="bg-white/20 w-fit p-2 rounded-lg mb-3 backdrop-blur-md">
                                        <Key className="text-white" size={20} />
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase leading-tight mb-1">Llave de<br/>Registro</h3>
                                    <p className="text-[9px] text-white/80 font-medium">Editar contraseña de nuevos ingresos.</p>
                                </div>
                                <div className="absolute right-4 bottom-4 bg-white/10 p-1.5 rounded-full backdrop-blur-sm">
                                    <ArrowRight className="text-white" size={14} />
                                </div>
                                <Fingerprint className="absolute -right-4 -bottom-4 text-white/10 rotate-[15deg] group-hover:scale-110 transition-transform" size={100} />
                            </button>

                            {/* Card 3: Emergencia (Lockdown) - Full Width */}
                            <button 
                                onClick={() => setSecurityView('lockdown')}
                                className="col-span-2 bg-gradient-to-r from-red-600 to-rose-700 p-5 rounded-2xl shadow-xl shadow-red-500/20 text-left relative overflow-hidden group active:scale-[0.98] transition-all flex items-center justify-between"
                            >
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                                        <Shield className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase leading-none mb-1">Protocolo de Emergencia</h3>
                                        <p className="text-[9px] text-white/80 font-medium">Zona de Peligro / Lockdown Global</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">CONFIGURAR</span>
                                </div>
                                <Ban className="absolute right-10 -top-10 text-white/10 group-hover:rotate-12 transition-transform" size={120} />
                            </button>

                            {/* Card 4: System Status */}
                            <div className="col-span-2 bg-white dark:bg-brand-dark-card p-5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${homeConfig.maintenanceMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                    <div>
                                        <h3 className="text-xs font-black text-brand-black dark:text-white uppercase">Estado del Sistema</h3>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{homeConfig.maintenanceMode ? 'MANTENIMIENTO ACTIVO' : 'OPERATIVO'}</p>
                                    </div>
                                </div>
                                <Activity size={18} className="text-gray-300" />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. ACCESS CONTROL VIEW (USERS LIST) */}
                {securityView === 'access_control' && (
                    <div className="space-y-4 animate-slide-up h-full flex flex-col">
                        <div className="flex items-center space-x-2 mb-2">
                            <button onClick={() => setSecurityView('menu')} className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg text-gray-500 hover:text-brand-black dark:hover:text-white transition-colors">
                                <ArrowLeft size={18} />
                            </button>
                            <h2 className="text-lg font-black uppercase text-brand-black dark:text-white">Gestión de Accesos</h2>
                        </div>

                        {/* Search Bar */}
                        <div className="bg-white dark:bg-brand-dark-card p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center sticky top-0 z-20">
                            <Search size={18} className="text-gray-400 ml-2" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar usuario para gestionar acceso..." 
                                className="bg-transparent border-none text-sm font-bold w-full ml-3 focus:outline-none dark:text-white placeholder-gray-300" 
                            />
                        </div>

                        {/* Users List */}
                        <div className="grid gap-3 pb-safe">
                            {filteredUsers.map((u) => (
                                <button 
                                    key={u.id}
                                    onClick={() => setSelectedUserId(u.id)}
                                    className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.99] transition-all hover:border-brand-purple/30 text-left"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <img src={u.avatarUrl} alt="av" className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                            {/* Status Dot */}
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-black ${u.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-brand-black dark:text-white leading-none mb-0.5">{u.name}</h3>
                                            <p className="text-[10px] text-gray-400 font-mono">{u.email}</p>
                                            {u.isBlocked && <span className="text-[8px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded mt-1 inline-block">ACCESO DENEGADO</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {u.isBlocked ? <Lock size={16} className="text-red-400" /> : <Unlock size={16} className="text-green-400" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. AGENCY KEY VIEW */}
                {securityView === 'agency_key' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="flex items-center space-x-2 mb-4">
                            <button onClick={() => setSecurityView('menu')} className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg text-gray-500 hover:text-brand-black dark:hover:text-white transition-colors">
                                <ArrowLeft size={18} />
                            </button>
                            <h2 className="text-lg font-black uppercase text-brand-black dark:text-white">Llave de Registro</h2>
                        </div>

                        <div className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl relative overflow-hidden">
                            {/* Visual Header */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center border-4 border-white dark:border-[#121212] shadow-2xl">
                                    <Key className="text-brand-purple" size={32} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 text-center tracking-widest">Nueva Contraseña</label>
                                    <div className="relative">
                                        <input 
                                            type={showAgencyCode ? "text" : "password"} 
                                            value={newAgencyCode} 
                                            onChange={(e) => setNewAgencyCode(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center text-lg font-black text-brand-black dark:text-white focus:border-brand-purple outline-none tracking-widest placeholder:font-medium placeholder:tracking-normal placeholder:text-gray-300"
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

                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 mt-4">
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed text-center">
                                        Esta clave será solicitada obligatoriamente a cualquier persona que intente crear una cuenta nueva en la plataforma.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. LOCKDOWN VIEW */}
                {securityView === 'lockdown' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="flex items-center space-x-2 mb-4">
                            <button onClick={() => setSecurityView('menu')} className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg text-gray-500 hover:text-brand-black dark:hover:text-white transition-colors">
                                <ArrowLeft size={18} />
                            </button>
                            <h2 className="text-lg font-black uppercase text-brand-black dark:text-white">Protocolo Emergencia</h2>
                        </div>

                        {/* --- MAINTENANCE PREVIEW CARD (NO IMAGE - PURE CSS & ICONS) --- */}
                        {homeConfig.maintenanceMode && (
                            <div className="relative overflow-hidden bg-white dark:bg-brand-dark-card p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 mb-8 animate-fade-in group">
                                {/* Background Decor */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    {/* CSS CHARACTER COMPOSITION */}
                                    <div className="relative mb-6">
                                        {/* Main Body */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-brand-black to-gray-800 dark:from-white dark:to-gray-200 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/20 animate-[bounce_3s_infinite] relative z-10">
                                            <Bot size={48} className="text-white dark:text-black" strokeWidth={1.5} />
                                            {/* Face/Screen Glow */}
                                            <div className="absolute inset-0 bg-brand-purple/20 rounded-2xl blur-lg -z-10"></div>
                                        </div>

                                        {/* Floating Gear */}
                                        <div className="absolute -top-4 -right-4 bg-brand-purple text-white p-2 rounded-full shadow-lg animate-[spin_4s_linear_infinite] z-20 border-2 border-white dark:border-black">
                                            <Settings size={16} />
                                        </div>

                                        {/* Floating Wrench */}
                                        <div className="absolute -bottom-2 -left-4 bg-white dark:bg-brand-dark-card text-brand-black dark:text-white p-2 rounded-full shadow-lg animate-pulse z-20 border border-gray-100 dark:border-white/10">
                                            <Wrench size={16} />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black uppercase text-brand-black dark:text-white mb-2 tracking-tighter">
                                        Mantenimiento
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-xs text-center leading-relaxed mb-4">
                                        "Estamos mejorando tu experiencia. Disculpa las molestias, pronto volveremos."
                                    </p>

                                    {/* Status Badge */}
                                    <div className="inline-flex items-center space-x-2 bg-brand-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full shadow-lg">
                                        <div className="w-2 h-2 bg-brand-purple rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            Trabajando
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- MAIN LOCKDOWN CONTROL CARD --- */}
                        <div className={`p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500 ${homeConfig.maintenanceMode ? 'bg-red-700 shadow-red-900/50' : 'bg-white dark:bg-brand-dark-card border border-gray-100 dark:border-white/5'}`}>
                            {homeConfig.maintenanceMode && <Shield className="absolute -right-6 -bottom-6 text-white/10 rotate-[-15deg]" size={200} />}
                            
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className={`p-4 rounded-full mb-6 backdrop-blur-sm ${homeConfig.maintenanceMode ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                                    <Ban size={48} strokeWidth={1.5} />
                                </div>
                                
                                <h2 className={`text-2xl font-black uppercase mb-2 ${homeConfig.maintenanceMode ? 'text-white' : 'text-brand-black dark:text-white'}`}>
                                    {homeConfig.maintenanceMode ? 'SISTEMA CERRADO' : 'SISTEMA ACTIVO'}
                                </h2>
                                
                                <p className={`text-xs font-medium mb-8 leading-relaxed max-w-[280px] ${homeConfig.maintenanceMode ? 'text-white/80' : 'text-gray-500'}`}>
                                    {homeConfig.maintenanceMode 
                                        ? "El acceso público está restringido. Solo los administradores pueden ingresar a la plataforma." 
                                        : "Si activas el Lockdown, todos los usuarios (excepto administradores) serán expulsados inmediatamente a la pantalla de mantenimiento."}
                                </p>

                                <div className="w-full">
                                    {homeConfig.maintenanceMode ? (
                                        <button onClick={() => handleGlobalBlock(false)} className="w-full bg-white text-red-700 h-14 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                                            <Unlock size={16} className="mr-2" /> RESTAURAR ACCESO PÚBLICO
                                        </button>
                                    ) : (
                                        <button onClick={() => handleGlobalBlock(true)} className="w-full bg-red-600 text-white h-14 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-red-700">
                                            <Lock size={16} className="mr-2" /> ACTIVAR LOCKDOWN TOTAL
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- DOSSIER MODAL (Global for Security Tab) --- */}
                {selectedSecurityUser && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedUserId(null)}></div>
                        <div className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col h-auto max-h-[85vh] animate-slide-up">
                            
                            <button onClick={() => setSelectedUserId(null)} className="absolute top-4 right-4 z-50 bg-gray-100 dark:bg-white/10 text-brand-black dark:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors shadow-sm">
                                <X size={20} />
                            </button>

                            <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-[#121212] relative pt-12">
                                <div className="px-6 pb-6">
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

                                    {/* Action Buttons inside Dossier */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
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
                                                {selectedSecurityUser.isBlocked ? 'Permitir Acceso' : 'Denegar Acceso'}
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

                                    <div className="mb-2">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-[10px] font-black uppercase text-gray-400 flex items-center">
                                                <History size={14} className="mr-2" /> Historial de Actividad
                                            </h4>
                                            <button 
                                                onClick={() => handleClearLogs(selectedSecurityUser.id)}
                                                className="flex items-center space-x-1 text-[9px] font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-wider bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded-md"
                                            >
                                                <Trash2 size={10} />
                                                <span>Reseteo de historial</span>
                                            </button>
                                        </div>
                                        
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
                            <div className="p-4 bg-gray-50 dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-white/10 shrink-0">
                                <button onClick={() => initiateSecurityAction('reset_session', selectedSecurityUser.id)} className="w-full py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Cerrar Sesión en todos los dispositivos</button>
                            </div>
                        </div>
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
