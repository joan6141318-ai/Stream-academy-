import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, Shield, Bell, Swords, Ban, CheckCircle, Search, Lock, Unlock, Eye, BarChart2 } from 'lucide-react';
import { collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'alerts' | 'pk'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para Alertas
  const [alertMessage, setAlertMessage] = useState('');
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Estado para PK
  const [pkData, setPkData] = useState({ user1: '', user2: '', date: '', time: '' });

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
  }, [activeTab]); // Refetch when tab changes to ensure fresh data

  // --- ACTIONS ---

  const handleBlockUser = async (userId: string, currentStatus: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", userId), { isBlocked: !currentStatus });
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !currentStatus } : u));
    } catch (e) {
      alert("Error al actualizar estado del usuario");
    }
  };

  const handleGlobalBlock = async (block: boolean) => {
    if (!window.confirm(`¿Estás seguro de que quieres ${block ? 'BLOQUEAR' : 'DESBLOQUEAR'} el acceso a TODOS los usuarios?`)) return;
    // Esto idealmente sería una Cloud Function para batch updates masivos
    alert("Esta función requiere Cloud Functions para procesar lotes masivos. Se simulará en la lista actual.");
    setUsers(prev => prev.map(u => ({ ...u, isBlocked: block })));
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) return;
    setIsSendingAlert(true);
    // Simular envío a colección de notificaciones
    try {
        if(db) {
            await setDoc(doc(collection(db, "global_alerts")), {
                message: alertMessage,
                date: new Date(),
                readBy: []
            });
        }
        alert("Alerta enviada a todos los dispositivos activos.");
        setAlertMessage('');
    } catch(e) {
        console.error(e);
    } finally {
        setIsSendingAlert(false);
    }
  };

  const handleAssignPK = () => {
    alert(`Evento PK Asignado:\n${pkData.user1} vs ${pkData.user2}\nFecha: ${pkData.date} ${pkData.time}`);
    setPkData({ user1: '', user2: '', date: '', time: '' });
  };

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Administrador" showBack onBack={() => navigate('/admin/selection')} />
      
      {/* TABS HEADER */}
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] bg-white dark:bg-brand-dark-card border-b border-gray-200 dark:border-white/10 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-6">
            <button onClick={() => setActiveTab('users')} className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-gray-400'}`}>Usuarios</button>
            <button onClick={() => setActiveTab('security')} className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === 'security' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400'}`}>Seguridad</button>
            <button onClick={() => setActiveTab('alerts')} className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === 'alerts' ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-400'}`}>Alertas</button>
            <button onClick={() => setActiveTab('pk')} className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pk' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'}`}>Eventos PK</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-24">

        {/* --- TAB: USUARIOS --- */}
        {activeTab === 'users' && (
            <div className="space-y-4 animate-fade-in">
                <div className="bg-white dark:bg-brand-dark-card p-4 rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center space-x-2 mb-4">
                        <Users className="text-brand-purple" size={20} />
                        <h2 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-wide">Registro de Emisores</h2>
                    </div>
                    {/* Search Mock */}
                    <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg flex items-center mb-4">
                        <Search size={16} className="text-gray-400 ml-2" />
                        <input type="text" placeholder="Buscar por ID o Nombre..." className="bg-transparent border-none text-xs font-bold w-full ml-2 focus:outline-none dark:text-white" />
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            <p className="text-xs text-center p-4">Cargando usuarios...</p>
                        ) : users.map((u) => (
                            <div key={u.id} className="border-b border-gray-50 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-3">
                                        <img src={u.avatarUrl} alt="av" className="w-8 h-8 rounded-full bg-gray-200" />
                                        <div>
                                            <p className="text-xs font-black text-brand-black dark:text-white">{u.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {u.isBlocked ? 'BLOQUEADO' : 'ACTIVO'}
                                        </span>
                                    </div>
                                </div>
                                {/* Tracking Info */}
                                <div className="bg-gray-50 dark:bg-white/5 p-2 rounded text-[10px] space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 font-bold">Módulos Visitados:</span>
                                        <span className="font-black text-brand-purple">{Math.floor(Math.random() * 8)} / 8</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-white/10 h-1 rounded-full">
                                        <div className="bg-brand-purple h-1 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex justify-end mt-2 space-x-2">
                                    <button className="text-[9px] font-bold text-blue-500 uppercase flex items-center"><Eye size={10} className="mr-1"/> Ver Actividad</button>
                                    <button 
                                        onClick={() => handleBlockUser(u.id, u.isBlocked)}
                                        className={`text-[9px] font-bold uppercase flex items-center ${u.isBlocked ? 'text-green-500' : 'text-red-500'}`}
                                    >
                                        {u.isBlocked ? <Unlock size={10} className="mr-1"/> : <Lock size={10} className="mr-1"/>}
                                        {u.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-dark-card p-4 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 opacity-50 grayscale">
                     <div className="flex items-center space-x-2 mb-2">
                        <BarChart2 size={18} />
                        <h2 className="text-sm font-black uppercase">Resultados de Evaluaciones</h2>
                     </div>
                     <p className="text-xs font-bold text-gray-400">Próximamente disponible.</p>
                </div>
            </div>
        )}

        {/* --- TAB: SEGURIDAD --- */}
        {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-center mb-2">
                        <Shield className="text-red-500 mr-2" size={24} />
                        <h2 className="text-lg font-black text-red-600 dark:text-red-400 uppercase">Centro de Seguridad</h2>
                    </div>
                    <p className="text-xs text-red-800 dark:text-red-200 font-medium mb-4">
                        Acciones críticas para proteger la plataforma. Estas acciones afectan a todos los usuarios.
                    </p>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={() => handleGlobalBlock(true)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-black uppercase text-xs tracking-widest flex items-center justify-center shadow-lg"
                        >
                            <Ban size={16} className="mr-2" />
                            Bloquear Acceso Total (Lockdown)
                        </button>
                        <button 
                            onClick={() => handleGlobalBlock(false)}
                            className="w-full bg-white dark:bg-brand-dark-card text-green-600 border border-green-500 p-3 rounded-lg font-black uppercase text-xs tracking-widest flex items-center justify-center"
                        >
                            <CheckCircle size={16} className="mr-2" />
                            Restaurar Acceso General
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-dark-card p-4 rounded-lg shadow-sm">
                    <h3 className="text-xs font-black uppercase text-gray-400 mb-3">Usuarios Bloqueados Recientemente</h3>
                    <p className="text-center text-xs text-gray-300 py-4">No hay bloqueos recientes.</p>
                </div>
            </div>
        )}

        {/* --- TAB: ALERTAS --- */}
        {activeTab === 'alerts' && (
            <div className="space-y-4 animate-fade-in">
                <div className="bg-white dark:bg-brand-dark-card p-5 rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center space-x-2 mb-4">
                        <Bell className="text-amber-500" size={20} />
                        <h2 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-wide">Mensajería Masiva</h2>
                    </div>
                    
                    <div className="mb-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Mensaje de Alerta</label>
                        <textarea 
                            value={alertMessage}
                            onChange={(e) => setAlertMessage(e.target.value)}
                            className="w-full h-32 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:border-amber-500 outline-none resize-none dark:text-white"
                            placeholder="Escribe el mensaje que recibirán todos los emisores..."
                        />
                    </div>

                    <Button 
                        fullWidth 
                        onClick={handleSendAlert} 
                        disabled={isSendingAlert || !alertMessage}
                        className={`bg-amber-500 hover:bg-amber-600 text-white ${isSendingAlert ? 'opacity-50' : ''}`}
                    >
                        {isSendingAlert ? 'Enviando...' : 'Enviar Alerta Push'}
                    </Button>
                </div>

                <div className="bg-white dark:bg-brand-dark-card p-4 rounded-lg shadow-sm">
                    <h3 className="text-xs font-black uppercase text-gray-400 mb-3">Historial de Alertas</h3>
                    <div className="space-y-2">
                        <div className="border-l-2 border-amber-300 pl-3 py-1">
                            <p className="text-[10px] text-gray-400">Hace 2 días</p>
                            <p className="text-xs font-medium dark:text-white">Mantenimiento programado para el servidor de pagos.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB: PK --- */}
        {activeTab === 'pk' && (
            <div className="space-y-4 animate-fade-in">
                <div className="bg-white dark:bg-brand-dark-card p-5 rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center space-x-2 mb-4">
                        <Swords className="text-blue-500" size={20} />
                        <h2 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-wide">Asignar Evento PK</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Contrincante 1</label>
                            <input 
                                type="text" 
                                value={pkData.user1}
                                onChange={(e) => setPkData({...pkData, user1: e.target.value})}
                                placeholder="ID o Nombre" 
                                className="w-full bg-gray-50 dark:bg-white/5 p-2 rounded text-xs font-bold dark:text-white border-none" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Contrincante 2</label>
                            <input 
                                type="text" 
                                value={pkData.user2}
                                onChange={(e) => setPkData({...pkData, user2: e.target.value})}
                                placeholder="ID o Nombre" 
                                className="w-full bg-gray-50 dark:bg-white/5 p-2 rounded text-xs font-bold dark:text-white border-none" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Fecha</label>
                            <input 
                                type="date" 
                                value={pkData.date}
                                onChange={(e) => setPkData({...pkData, date: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-white/5 p-2 rounded text-xs font-bold dark:text-white border-none" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Hora</label>
                            <input 
                                type="time" 
                                value={pkData.time}
                                onChange={(e) => setPkData({...pkData, time: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-white/5 p-2 rounded text-xs font-bold dark:text-white border-none" 
                            />
                        </div>
                    </div>

                    <Button onClick={handleAssignPK} fullWidth className="bg-blue-600 hover:bg-blue-700 text-white">
                        Programar Batalla
                    </Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;