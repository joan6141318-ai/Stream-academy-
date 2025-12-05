
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Moon, Sun, Shield, Camera, User, FileText, HelpCircle, ChevronRight, Save, Edit3, Check, X, ShieldCheck, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useOneSignal } from '../hooks/useOneSignal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

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
  const { isSubscribed, togglePush, permissionStatus } = useOneSignal();
  
  const [darkMode, setDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [newName, setNewName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
        setNewName(user.name);
    }
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

  // ... (Image compression and upload logic same as before) ...
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
          alert("Error de red.");
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
      } catch (e) { console.error(e); } finally { setIsUploading(false); }
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
        await updateProfile({ name: newName });
        setIsEditing(false);
    } catch (error) {
        console.error("Error saving profile", error);
    } finally {
        setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Mi Cuenta" showBack onBack={() => navigate('/home')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* --- IDENTITY CARD (HERO) --- */}
        <div className="mt-6 mb-6">
            <div className="relative w-full bg-black rounded-[2.5rem] border-[5px] border-[#1A1A1A] p-8 shadow-2xl overflow-hidden group">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    {/* Avatar Container */}
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-brand-purple to-pink-500 shadow-xl">
                            <div className="w-full h-full rounded-full border-4 border-black bg-black overflow-hidden relative">
                                <img src={user.avatarUrl} alt="Profile" className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`} />
                                {isUploading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                            </div>
                        </div>
                        {/* Edit Photo Button */}
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full shadow-lg active:scale-95 transition-transform border-4 border-black"
                        >
                            <Camera size={16} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Editable Name */}
                    {isEditing ? (
                        <div className="w-full animate-fade-in space-y-4">
                            <input 
                                type="text" 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-center font-black text-white text-xl uppercase outline-none focus:border-brand-purple transition-colors placeholder-white/30"
                                placeholder="TU NOMBRE"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-center">
                                <button onClick={() => setShowAvatarModal(true)} className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-white/20">Elegir Avatar</button>
                                <button onClick={() => fileInputRef.current?.click()} className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-white/20">Subir Foto</button>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/10 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20">Cancelar</button>
                                <button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 bg-brand-purple text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-500/30">
                                    {isSaving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center animate-fade-in">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2 flex items-center justify-center gap-2">
                                {user.name}
                                {user.isAdmin && <ShieldCheck size={18} className="text-brand-purple" />}
                            </h2>
                            <div className="inline-flex items-center bg-white/10 px-3 py-1 rounded-full border border-white/5 space-x-2">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.role || 'Streamer'}</span>
                                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                <span className="text-[9px] font-bold text-brand-purple uppercase tracking-widest">ID: {user.id.substring(0,6)}</span>
                            </div>
                            <button onClick={() => setIsEditing(true)} className="mt-4 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-1 mx-auto">
                                <Edit3 size={12} /> Editar Perfil
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- SETTINGS GRID --- */}
        <div className="grid grid-cols-1 gap-4">
            
            {/* 1. NOTIFICACIONES (Orange) */}
            <button onClick={togglePush} className="group relative w-full bg-orange-500 p-6 rounded-[2.5rem] border-[5px] border-orange-400 overflow-hidden shadow-xl active:scale-[0.98] transition-all text-left">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-white/20 p-1.5 rounded-lg"><Bell size={16} className="text-white" /></div>
                            <span className="text-[10px] font-black text-orange-100 uppercase tracking-widest">Alertas</span>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase leading-none">Notificaciones</h3>
                        <p className="text-[10px] font-bold text-white/80 mt-1 uppercase tracking-wide">
                            {permissionStatus === 'granted' && isSubscribed ? 'Activadas' : 'Desactivadas'}
                        </p>
                    </div>
                    <div className={`w-12 h-7 rounded-full p-1 transition-colors ${isSubscribed && permissionStatus === 'granted' ? 'bg-white' : 'bg-black/20'}`}>
                        <div className={`w-5 h-5 rounded-full bg-orange-500 shadow-sm transition-transform ${isSubscribed && permissionStatus === 'granted' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                </div>
                <Bell className="absolute -bottom-6 -right-6 text-white/10 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-500" size={100} strokeWidth={1.5} />
            </button>

            {/* 2. MODO OSCURO (Purple) */}
            <button onClick={toggleDarkMode} className="group relative w-full bg-brand-purple p-6 rounded-[2.5rem] border-[5px] border-violet-500 overflow-hidden shadow-xl active:scale-[0.98] transition-all text-left">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                {darkMode ? <Moon size={16} className="text-white" /> : <Sun size={16} className="text-white" />}
                            </div>
                            <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest">Apariencia</span>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase leading-none">Modo Oscuro</h3>
                        <p className="text-[10px] font-bold text-white/80 mt-1 uppercase tracking-wide">
                            {darkMode ? 'Activado' : 'Desactivado'}
                        </p>
                    </div>
                    <div className={`w-12 h-7 rounded-full p-1 transition-colors ${darkMode ? 'bg-white' : 'bg-black/20'}`}>
                        <div className={`w-5 h-5 rounded-full bg-brand-purple shadow-sm transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                </div>
                <Moon className="absolute -bottom-6 -right-6 text-white/10 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-500" size={100} strokeWidth={1.5} />
            </button>

            {/* 3. ADMIN & UTILS ROW */}
            <div className="grid grid-cols-2 gap-4">
                {user.isAdmin && (
                    <button onClick={() => navigate('/admin')} className="col-span-2 bg-brand-black dark:bg-white p-5 rounded-[2.5rem] border-[5px] border-brand-black dark:border-white shadow-xl active:scale-[0.98] transition-all text-left relative overflow-hidden group">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-black text-white dark:text-black uppercase leading-tight">Panel Admin</h4>
                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-0.5">Gestión Agencia</p>
                            </div>
                            <div className="bg-brand-purple p-2 rounded-xl text-white"><Shield size={18} /></div>
                        </div>
                        <Shield className="absolute -right-4 -bottom-4 text-white/10 dark:text-black/5 rotate-[-15deg]" size={80} />
                    </button>
                )}

                <button onClick={() => setShowPrivacy(true)} className="bg-gray-200 dark:bg-[#1A1A1A] p-5 rounded-[2.5rem] border-[5px] border-white dark:border-white/5 shadow-lg active:scale-[0.96] transition-all text-left relative overflow-hidden group h-32 flex flex-col justify-between">
                    <div className="relative z-10">
                        <div className="bg-white dark:bg-black/40 w-fit p-2 rounded-xl mb-2"><FileText size={16} className="text-brand-black dark:text-white" /></div>
                        <h4 className="text-sm font-black text-brand-black dark:text-white uppercase leading-none">Legal</h4>
                    </div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase relative z-10">Privacidad</p>
                    <FileText className="absolute -right-4 -bottom-4 text-black/5 dark:text-white/5 rotate-[-15deg]" size={60} />
                </button>

                <button onClick={() => window.location.reload()} className="bg-gray-200 dark:bg-[#1A1A1A] p-5 rounded-[2.5rem] border-[5px] border-white dark:border-white/5 shadow-lg active:scale-[0.96] transition-all text-left relative overflow-hidden group h-32 flex flex-col justify-between">
                    <div className="relative z-10">
                        <div className="bg-white dark:bg-black/40 w-fit p-2 rounded-xl mb-2"><Zap size={16} className="text-brand-black dark:text-white" /></div>
                        <h4 className="text-sm font-black text-brand-black dark:text-white uppercase leading-none">Update</h4>
                    </div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase relative z-10">Recargar App</p>
                    <Zap className="absolute -right-4 -bottom-4 text-black/5 dark:text-white/5 rotate-[-15deg]" size={60} />
                </button>
            </div>

            {/* 4. LOGOUT (Red) */}
            <button onClick={handleLogout} className="w-full bg-red-50 dark:bg-red-900/10 p-4 rounded-[2rem] border-[3px] border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-[0.98] transition-all mt-4 mb-8">
                <LogOut size={18} strokeWidth={2.5} />
                <span className="text-xs font-black uppercase tracking-widest">Cerrar Sesión</span>
            </button>

        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
      
      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowAvatarModal(false)}>
            <div className="bg-white dark:bg-[#121212] rounded-[2.5rem] p-6 w-full max-w-sm border-[5px] border-white dark:border-white/10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-brand-black dark:text-white uppercase tracking-tight">Elige Avatar</h3>
                    <button onClick={() => setShowAvatarModal(false)} className="bg-gray-100 dark:bg-white/10 p-2 rounded-full"><X size={18} className="text-brand-black dark:text-white" /></button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {AVATARS.map((av, i) => (
                        <button key={i} onClick={() => handleAvatarSelect(av.url)} className="aspect-square bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden border-2 border-transparent hover:border-brand-purple transition-all relative group">
                            <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                            {user.avatarUrl === av.url && <div className="absolute inset-0 bg-brand-purple/50 flex items-center justify-center"><Check className="text-white" size={20} strokeWidth={3} /></div>}
                        </button>
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
