
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Lock, HelpCircle, ChevronRight, Camera, User, Mail, Moon, Save, Type, Shield, Grid, X, Smile, Check, FileText, AlertCircle, Sun, ToggleLeft, ToggleRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useOneSignal } from '../hooks/useOneSignal'; // Importamos el hook real
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { useContent } from '../context/ContentContext';

// Avatares para selección rápida
const AVATARS = [
    { url: "https://avatar.iran.liara.run/public/boy?username=Max", label: "Max" },
    { url: "https://avatar.iran.liara.run/public/girl?username=Mia", label: "Mia" },
    { url: "https://avatar.iran.liara.run/public/boy?username=Leo", label: "Leo" },
    { url: "https://avatar.iran.liara.run/public/girl?username=Zoe", label: "Zoe" },
    { url: "https://avatar.iran.liara.run/public/boy?username=Alex", label: "Alex" },
    { url: "https://avatar.iran.liara.run/public/girl?username=Sara", label: "Sara" },
    { url: "https://avatar.iran.liara.run/public/job/designer/male", label: "Pro" },
    { url: "https://avatar.iran.liara.run/public/job/operator/female", label: "Tech" },
    { url: "https://avatar.iran.liara.run/public/boy?username=Sam", label: "Sam" }
];

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, uploadPhoto } = useAuth();
  
  // CONEXIÓN A ONESIGNAL
  const { isSubscribed, togglePush, subscriptionId, permissionStatus } = useOneSignal();
  
  const [darkMode, setDarkMode] = useState(false);
  
  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    bio: 'Streamer oficial de Bigo Live.',
  });

  useEffect(() => {
    if (user) {
        setFormData(prev => ({ ...prev, name: user.name }));
    }
    // Check dark mode initial state
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, [user]);

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500; 
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6)); 
          } else {
            reject(new Error("Canvas context failed"));
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
          const compressedBase64 = await compressImage(file);
          const response = await fetch(compressedBase64);
          const blob = await response.blob();
          const photoUrl = await uploadPhoto(blob, compressedBase64);
          await updateProfile({ avatarUrl: photoUrl });
      } catch (error) {
          console.error("Error uploading photo", error);
          alert("Error de red. Intenta con una imagen más pequeña.");
      } finally {
          setIsUploading(false);
      }
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
      setShowAvatarModal(false);
      setIsUploading(true);
      try {
          await updateProfile({ avatarUrl: avatarUrl });
      } catch (e) {
          console.error(e);
      } finally {
          setIsUploading(false);
      }
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) return;
    setIsSaving(true);
    setIsEditing(false); 

    try {
        await updateProfile({ name: formData.name });
    } catch (error) {
        console.error("Error saving profile", error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAdminNavigation = () => {
      if (user?.isAdmin) {
          navigate('/admin');
      }
  };

  const getPermissionLabel = () => {
      if (permissionStatus === 'granted') return 'ACTIVO';
      if (permissionStatus === 'denied') return 'BLOQUEADO';
      return 'INACTIVO';
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Configuración" />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* === HEADER INFO SECTION (Hero Style) === */}
        <div className="mt-6 mb-8 px-1">
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tighter mb-2">
                Mi Perfil<br/>& Ajustes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Gestiona tu cuenta y preferencias de la app.
            </p>
        </div>

        {/* === 1. TARJETA DE PERFIL (Black Card) === */}
        <div className="relative w-full bg-black rounded-[2.5rem] border-[5px] border-[#1A1A1A] p-6 shadow-xl overflow-hidden group mb-6">
            <div className="relative z-10 flex flex-col items-center text-center">
                
                {/* Avatar with Edit Badge */}
                <div className="relative mb-4 group/avatar">
                    <div className={`w-28 h-28 rounded-full border-4 border-white/10 p-1 bg-black overflow-hidden ${isUploading ? 'opacity-50' : ''}`}>
                        <img 
                            src={user.avatarUrl} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover" 
                        />
                    </div>
                    {!isUploading && !isEditing && (
                        <button 
                            onClick={triggerFileInput} 
                            className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full shadow-lg active:scale-95 transition-transform"
                        >
                            <Camera size={14} strokeWidth={2.5} />
                        </button>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                </div>

                {/* Info / Edit Mode */}
                {isEditing ? (
                    <div className="w-full space-y-4 animate-fade-in">
                        <div className="bg-white/10 rounded-2xl p-2 border border-white/10">
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-transparent text-center font-black text-white text-lg uppercase outline-none placeholder-white/30"
                                placeholder="NOMBRE"
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowAvatarModal(true)}
                                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Grid size={14} /> Avatares
                            </button>
                            <button 
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="flex-1 py-3 bg-brand-purple text-white rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                            >
                                {isSaving ? '...' : <><Save size={14} /> Guardar</>}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center animate-fade-in">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1 flex items-center gap-2">
                            {user.name}
                            {user.isAdmin && <Shield size={16} className="text-brand-purple" />}
                        </h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-4 border border-white/5">
                            {user.role || 'Streamer'}
                        </span>
                        
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/30 hover:border-white pb-0.5 transition-all opacity-80 hover:opacity-100"
                        >
                            <Type size={12} /> Editar Información
                        </button>
                    </div>
                )}
            </div>

            {/* Decor */}
            <User className="absolute -bottom-6 -right-6 text-white/5 rotate-[-15deg] pointer-events-none" size={140} strokeWidth={1.5} />
        </div>

        {/* === 2. SETTINGS GRID === */}
        <div className="grid grid-cols-1 gap-4">
            
            {/* ADMIN ACCESS (Special Card) */}
            {user.isAdmin && (
                <button 
                    onClick={handleAdminNavigation}
                    className="relative w-full bg-brand-black dark:bg-white p-6 rounded-[2.5rem] border-[5px] border-brand-black dark:border-white text-left overflow-hidden shadow-xl active:scale-[0.98] transition-all group"
                >
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="bg-brand-purple p-2.5 rounded-2xl w-fit mb-3 shadow-lg shadow-purple-500/30">
                                <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-lg font-black text-white dark:text-black uppercase tracking-tight leading-none mb-1">
                                Panel de Agencia
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                                Gestión y Control
                            </p>
                        </div>
                        <ArrowUpRight size={20} className="text-white dark:text-black opacity-50" />
                    </div>
                    <ShieldCheck className="absolute -right-6 -bottom-6 text-white/10 dark:text-black/5 rotate-[-15deg] group-hover:rotate-0 transition-all duration-500" size={100} />
                </button>
            )}

            {/* NOTIFICACIONES (Orange Card) */}
            <button 
                onClick={togglePush}
                className="relative w-full bg-orange-500 p-6 rounded-[2.5rem] border-[5px] border-orange-400 text-left overflow-hidden shadow-xl active:scale-[0.98] transition-all group"
            >
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                            <Bell size={20} className="text-white" strokeWidth={2.5} />
                        </div>
                        {/* Toggle Visual */}
                        <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-colors ${isSubscribed && permissionStatus === 'granted' ? 'bg-white text-orange-600 border-white' : 'bg-black/20 text-white border-white/10'}`}>
                            {getPermissionLabel()}
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">
                        Notificaciones
                    </h3>
                    <p className="text-[10px] font-bold text-orange-100 uppercase tracking-wide opacity-90 leading-tight pr-8">
                        {permissionStatus === 'denied' ? 'Permiso denegado en navegador' : 'Alertas de PK y Novedades'}
                    </p>
                </div>
                <Bell className="absolute -right-6 -bottom-6 text-white/10 rotate-[-15deg] group-hover:rotate-0 transition-all duration-500" size={100} />
            </button>

            {/* MODO OSCURO (Purple Card) */}
            <button 
                onClick={toggleDarkMode}
                className="relative w-full bg-brand-purple p-6 rounded-[2.5rem] border-[5px] border-violet-500 text-left overflow-hidden shadow-xl active:scale-[0.98] transition-all group"
            >
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                            {darkMode ? <Moon size={20} className="text-white" strokeWidth={2.5} /> : <Sun size={20} className="text-white" strokeWidth={2.5} />}
                        </div>
                        {/* Toggle Icon */}
                        <div className="text-white opacity-80">
                            {darkMode ? <ToggleRight size={28} fill="currentColor" /> : <ToggleLeft size={28} />}
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">
                        Modo Oscuro
                    </h3>
                    <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wide opacity-90 leading-tight">
                        {darkMode ? 'Activado' : 'Desactivado'}
                    </p>
                </div>
                <Moon className="absolute -right-6 -bottom-6 text-white/10 rotate-[-15deg] group-hover:rotate-0 transition-all duration-500" size={100} />
            </button>

            {/* SOPORTE Y SEGURIDAD (Gray Card) */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => setShowPrivacy(true)}
                    className="bg-gray-200 dark:bg-[#1A1A1A] p-5 rounded-[2.5rem] border-[5px] border-white dark:border-white/5 relative overflow-hidden shadow-lg active:scale-[0.96] transition-all group text-left h-36 flex flex-col justify-between"
                >
                    <div className="bg-white dark:bg-black/40 w-10 h-10 rounded-2xl flex items-center justify-center relative z-10">
                        <FileText size={18} className="text-brand-black dark:text-white" strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-sm font-black text-brand-black dark:text-white uppercase leading-none mb-1">Legal</h4>
                        <p className="text-[8px] font-bold text-gray-500 uppercase">Términos</p>
                    </div>
                    <FileText className="absolute -right-4 -bottom-4 text-brand-black/5 dark:text-white/5 rotate-[-15deg]" size={70} />
                </button>

                <button 
                    onClick={() => alert("Contactar Soporte")}
                    className="bg-gray-200 dark:bg-[#1A1A1A] p-5 rounded-[2.5rem] border-[5px] border-white dark:border-white/5 relative overflow-hidden shadow-lg active:scale-[0.96] transition-all group text-left h-36 flex flex-col justify-between"
                >
                    <div className="bg-white dark:bg-black/40 w-10 h-10 rounded-2xl flex items-center justify-center relative z-10">
                        <HelpCircle size={18} className="text-brand-black dark:text-white" strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-sm font-black text-brand-black dark:text-white uppercase leading-none mb-1">Ayuda</h4>
                        <p className="text-[8px] font-bold text-gray-500 uppercase">Soporte</p>
                    </div>
                    <HelpCircle className="absolute -right-4 -bottom-4 text-brand-black/5 dark:text-white/5 rotate-[-15deg]" size={70} />
                </button>
            </div>

        </div>

        {/* LOGOUT BUTTON */}
        <div className="mt-8 mb-6">
            <button 
                onClick={handleLogout}
                className="w-full bg-red-500 text-white h-16 rounded-[2rem] border-[5px] border-red-400 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 group relative overflow-hidden"
            >
                <span className="relative z-10 flex items-center">
                    <LogOut size={18} className="mr-2" strokeWidth={2.5} />
                    Cerrar Sesión
                </span>
                <LogOut className="absolute -right-6 -bottom-8 text-white/10 rotate-[-15deg] group-hover:scale-110 transition-transform duration-500" size={80} />
            </button>
            
            <p className="text-center text-[9px] font-bold text-gray-300 dark:text-gray-700 mt-6 uppercase tracking-widest">
                StreamAgency v2.6 • Secure Build
            </p>
        </div>

      </div>

      {/* Avatars & Privacy Modals */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-black/80 backdrop-blur-sm" onClick={() => setShowAvatarModal(false)}>
            <div className="relative w-full max-w-sm bg-white dark:bg-[#121212] rounded-[2.5rem] p-6 animate-slide-up border-[5px] border-white dark:border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="bg-brand-purple/10 p-1.5 rounded-lg"><Smile size={18} className="text-brand-purple" /></div>
                        <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">Elige tu Avatar</h3>
                    </div>
                    <button onClick={() => setShowAvatarModal(false)} className="p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {AVATARS.map((item, idx) => (
                        <div key={idx} className="aspect-square bg-gray-50 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all duration-200 relative overflow-hidden group border-2 border-transparent hover:border-brand-purple/50" onClick={() => handleAvatarSelect(item.url)}>
                            <div className="absolute inset-0 flex items-end justify-center"><img src={item.url} alt={item.label} className="w-[85%] h-auto object-cover transform translate-y-1 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm" /></div>
                            {user.avatarUrl === item.url && <div className="absolute top-1 right-1 bg-brand-purple rounded-full p-0.5"><Check size={10} className="text-white" /></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
};

export default UserSettings;
