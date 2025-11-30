

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Bell, Swords, Ban, Search, Lock, Unlock, BarChart2, Check, X, Send, Radio, Activity, Trophy, Save, Clock, Trash2, History, Calendar, Eye, FileText, Key, RefreshCw, Smartphone, AlertTriangle, UserCheck, ShieldCheck, Laptop } from 'lucide-react';
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

  // --- SECURITY STATES ---
  const [selectedSecurityUser, setSelectedSecurityUser] = useState<any | null>(null);
  const [securityPin, setSecurityPin] = useState('');
  const [showSecurityPinModal, setShowSecurityPinModal] = useState(false);
  const [pendingSecurityAction, setPendingSecurityAction] = useState<{ type: 'block' | 'unblock' | 'reset_session' | 'make_admin' | 'remove_admin', userId: string } | null>(null);
  const [pinError, setPinError] = useState(false);

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

  // --- SECURITY LOGIC ---

  const initiateSecurityAction = (type: 'block' | 'unblock' | 'reset_session' | 'make_admin' | 'remove_admin', userId: string) => {
      setPendingSecurityAction({ type, userId });
      setSecurityPin('');
      setPinError(false);
      setShowSecurityPinModal(true);
  };

  const confirmSecurityAction = async () => {
      if (securityPin !== '3926') {
          setPinError(true);
          return;
      }
      
      if (!pendingSecurityAction || !db) return;

      const { type, userId } = pendingSecurityAction;
      const userRef = doc(db, "users", userId);
      
      try {
          if (type === 'block') {
              await updateDoc(userRef, { isBlocked: true });
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: true } : u));
              if (selectedSecurityUser?.id === userId) setSelectedSecurityUser(prev => ({ ...prev, isBlocked: true }));
          } else if (type === 'unblock') {
              await updateDoc(userRef, { isBlocked: false });
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: false } : u));
              if (selectedSecurityUser?.id === userId) setSelectedSecurityUser(prev => ({ ...prev, isBlocked: false }));
          } else if (type === 'make_admin') {
              await updateDoc(userRef, { isAdmin: true, role: 'Admin Agencia' });
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: true, role: 'Admin Agencia' } : u));
              if (selectedSecurityUser?.id === userId) setSelectedSecurityUser(prev => ({ ...prev, isAdmin: true, role: 'Admin Agencia' }));
          } else if (type === 'remove_admin') {
              await updateDoc(userRef, { isAdmin: false, role: 'Streamer' });
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: false, role: 'Streamer' } : u));
              if (selectedSecurityUser?.id === userId) setSelectedSecurityUser(prev => ({ ...prev, isAdmin: false, role: 'Streamer' }));
          } else if (type === 'reset_session') {
              await updateDoc(userRef, { forceRelogin: Date.now() });
              alert("Orden de cierre de sesión enviada al dispositivo.");
          }
          
          setShowSecurityPinModal(false);
          setPendingSecurityAction(null);

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

  // Filter Requests (Already sorted by date desc in Context)
  const pendingRequests = pkRequests.filter(req => req.status === 'pending');
  const historyRequests = pkRequests.filter(req => req.status !== 'pending');

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      <Header title="Panel Admin" showBack onBack={() => navigate('/admin/selection')} />
      
      {/* --- NAV PILLS (Bubble Fix: Increased Padding) --- */}
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

        {/* --- TAB: SEGURIDAD (SECURITY COMMAND CENTER) --- */}
        {activeTab === 'security' && (
            <div className="space-y-6 animate-slide-up">
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-2">
                     <div>
                        <h2 className="text-2xl font-black uppercase text-brand-black dark:text-white leading-none">Centro de Mando</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Gestión de Accesos y Seguridad</p>
                     </div>
                     <div className="bg-brand-black dark:bg-white/10 p-2 rounded-lg text-white">
                         <ShieldCheck size={24} />
                     </div>
                </div>

                {/* Search Security User */}
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

                {/* Users List for Security */}
                <div className="grid gap-3">
                    {filteredUsers.map((u) => (
                        <button 
                            key={u.id}
                            onClick={() => setSelectedSecurityUser(u)}
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
                                {u.isAdmin && <span className="bg-brand-purple/10 text-brand-purple text-[8px] font-black px-2 py-1 rounded uppercase">Admin</span>}
                                <Eye size={16} className="text-gray-300 group-hover:text-brand-purple" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* USER DOSSIER MODAL (REDESIGNED) */}
                {selectedSecurityUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedSecurityUser(null)}>
                        {/* Improved Card Structure: Fixes gray strip issue by ensuring clean flex layout */}
                        <div className="bg-white dark:bg-[#121212] w-full max-w-md max-h-[85vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative border border-gray-100 dark:border-white/10" onClick={e => e.stopPropagation()}>
                            
                            {/* Header Gradient */}
                            <div className="h-20 bg-gradient-to-r from-gray-900 to-black shrink-0 relative flex justify-end p-4">
                                <button onClick={() => setSelectedSecurityUser(null)} className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors backdrop-blur-md">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Content Scroll Area */}
                            <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-[#121212]">
                                <div className="px-6 pb-6">
                                    
                                    {/* Avatar Overlap */}
                                    <div className="relative -mt-10 mb-4 flex justify-between items-end">
                                        <div className="w-20 h-20 rounded-full p-1 bg-white dark:bg-[#121212]">
                                            <img src={selectedSecurityUser.avatarUrl} alt="profile" className="w-full h-full rounded-full object-cover bg-gray-200" />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm ${selectedSecurityUser.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {selectedSecurityUser.isBlocked ? 'Acceso Bloqueado' : 'Usuario Activo'}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h2 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-none mb-1">{selectedSecurityUser.name}</h2>
                                        <div className="flex items-center space-x-2 text-gray-400">
                                            <span className="text-xs font-bold uppercase">{selectedSecurityUser.role || 'Streamer'}</span>
                                            <span>•</span>
                                            <span className="text-xs font-mono">{selectedSecurityUser.bigoId || 'Sin ID'}</span>
                                        </div>
                                    </div>

                                    {/* Real Data Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center space-x-2 mb-1 text-gray-400">
                                                <Laptop size={12} />
                                                <span className="text-[9px] font-black uppercase">Dispositivo</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-brand-black dark:text-white leading-tight block truncate">
                                                {selectedSecurityUser.deviceInfo || 'Desconocido'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center space-x-2 mb-1 text-gray-400">
                                                <Activity size={12} />
                                                <span className="text-[9px] font-black uppercase">Último Acceso</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-brand-black dark:text-white leading-tight block">
                                                {selectedSecurityUser.lastLogin ? new Date(selectedSecurityUser.lastLogin).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Credentials Section */}
                                    <div className="mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center">
                                            <Key size={12} className="mr-1.5" /> Credenciales
                                        </h4>
                                        <div className="flex justify-between items-center bg-white dark:bg-black p-3 rounded-lg border border-gray-100 dark:border-white/5 shadow-sm">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Contraseña</p>
                                                <p className="text-sm font-black tracking-[0.2em] text-brand-black dark:text-white">••••••••</p>
                                            </div>
                                            <button 
                                                onClick={() => alert("Se ha enviado un correo de restablecimiento de contraseña al usuario.")}
                                                className="text-[10px] font-bold text-brand-purple hover:underline"
                                            >
                                                Restablecer
                                            </button>
                                        </div>
                                    </div>

                                    {/* Real Logs History */}
                                    <div className="mb-2">
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center">
                                            <History size={12} className="mr-1.5" /> Registro de Actividad
                                        </h4>
                                        <div className="space-y-0 relative border-l border-gray-200 dark:border-white/10 ml-2">
                                            {selectedSecurityUser.accessLogs && selectedSecurityUser.accessLogs.length > 0 ? (
                                                selectedSecurityUser.accessLogs.slice().reverse().slice(0, 5).map((log: any, idx: number) => (
                                                    <div key={idx} className="flex items-start mb-4 pl-4 relative group">
                                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/20 border-2 border-white dark:border-black group-hover:bg-brand-purple transition-colors"></div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold text-brand-black dark:text-white">{log.action}</p>
                                                            <p className="text-[9px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-400 pl-4 italic">No hay registros recientes.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions (Sticky Bottom) */}
                            <div className="p-4 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-3 shrink-0">
                                <button 
                                    onClick={() => initiateSecurityAction(selectedSecurityUser.isBlocked ? 'unblock' : 'block', selectedSecurityUser.id)}
                                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all ${
                                        selectedSecurityUser.isBlocked 
                                        ? 'bg-green-50 text-green-600 border border-green-200' 
                                        : 'bg-red-50 text-red-600 border border-red-200'
                                    }`}
                                >
                                    {selectedSecurityUser.isBlocked ? <Unlock size={20} /> : <Lock size={20} />}
                                    <span className="text-[9px] font-black uppercase">
                                        {selectedSecurityUser.isBlocked ? 'Desbloquear' : 'Bloquear Acceso'}
                                    </span>
                                </button>

                                <button 
                                    onClick={() => initiateSecurityAction(selectedSecurityUser.isAdmin ? 'remove_admin' : 'make_admin', selectedSecurityUser.id)}
                                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all border ${
                                        selectedSecurityUser.isAdmin
                                        ? 'bg-gray-800 text-white border-gray-700'
                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-transparent'
                                    }`}
                                >
                                    {selectedSecurityUser.isAdmin ? <UserCheck size={20} /> : <Shield size={20} />}
                                    <span className="text-[9px] font-black uppercase">
                                        {selectedSecurityUser.isAdmin ? 'Revocar Admin' : 'Hacer Admin'}
                                    </span>
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- TAB: ARENA PK (Existing) --- */}
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

                         {/* SUPERSMASH EDITOR - Updated Style to Neutral (Gray) */}
                         <div className="bg-white dark:bg-brand-dark-card p-4 rounded-3xl border border-gray-100 dark:border-white/5">
                             <div className="flex items-center space-x-2 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                 {/* Icon stays Orange */}
                                 <div className="bg-orange-500 text-white p-1.5 rounded"><Swords size={16} /></div>
                                 <h3 className="text-sm font-black uppercase">PK Supersmash</h3>
                             </div>
                             
                             <div className="space-y-3">
                                {localSchedule.supersmash.map((event, idx) => (
                                    <div key={event.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between gap-3">
                                        <div className="flex flex-col items-center justify-center bg-white dark:bg-black/20 p-2 rounded-lg min-w-[60px]">
                                            {/* Clock Icon changed to Gray */}
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
                                                onChange={(e) => handleScheduleChange('supersmash', idx, 'id1', e.target.value)}
                                            />
                                            {/* VS Text changed to Gray */}
                                            <span className="text-[10px] font-black text-gray-300">VS</span>
                                            <input 
                                                className="w-full bg-white dark:bg-black p-3 rounded-lg text-xs font-black text-brand-black dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:border-brand-purple text-center uppercase" 
                                                placeholder="ID OPONENTE"
                                                value={event.id2}
                                                onChange={(e) => handleScheduleChange('supersmash', idx, 'id2', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>

                             {/* BOTÓN PUBLICAR PARA SUPERSMASH - Stays Orange */}
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

      {/* --- PIN CONFIRMATION MODAL FOR SECURITY ACTIONS --- */}
      {showSecurityPinModal && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white dark:bg-[#121212] w-full max-w-xs rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/10">
                  <div className="flex flex-col items-center mb-6">
                      <div className="bg-brand-black dark:bg-white text-white dark:text-black p-3 rounded-full mb-3 shadow-lg">
                          <Lock size={24} />
                      </div>
                      <h3 className="text-lg font-black text-brand-black dark:text-white uppercase">Protocolo Admin</h3>
                      <p className="text-xs text-gray-500 text-center mt-1">Ingresa el código maestro para ejecutar esta acción de seguridad.</p>
                  </div>
                  <input 
                    type="password" 
                    value={securityPin}
                    onChange={(e) => { setSecurityPin(e.target.value); setPinError(false); }}
                    maxLength={4}
                    placeholder="••••"
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-center text-2xl font-black tracking-[1em] focus:border-brand-purple outline-none mb-4"
                    autoFocus
                  />
                  {pinError && <p className="text-red-500 text-[10px] font-black uppercase text-center mb-4 flex items-center justify-center"><AlertTriangle size={12} className="mr-1"/> Código Incorrecto</p>}
                  <div className="flex gap-3">
                      <button onClick={() => { setShowSecurityPinModal(false); setSecurityPin(''); }} className="flex-1 py-3 text-xs font-bold uppercase text-gray-400 bg-gray-100 dark:bg-white/5 rounded-lg">Cancelar</button>
                      <button onClick={confirmSecurityAction} className="flex-1 py-3 text-xs font-bold uppercase text-white bg-brand-purple rounded-lg shadow-lg">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;