
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Lock, HelpCircle, ChevronRight, Camera, User, Mail, Moon, Save, Type, Shield, Grid, X, Smile, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAILS } from '../constants';

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

const SettingItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value?: string;
  isToggle?: boolean;
  isToggled?: boolean;
  onClick?: () => void;
  danger?: boolean;
  highlight?: boolean;
}> = ({ icon, label, value, isToggle, isToggled, onClick, danger, highlight }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white dark:bg-brand-dark-card border-b border-gray-50 dark:border-white/5 last:border-0 active:bg-gray-50 dark:active:bg-white/5 transition-colors"
  >
    <div className="flex items-center space-x-4">
      <div className={`p-2 rounded-sm ${
        danger ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 
        highlight ? 'bg-brand-purple text-white' :
        'bg-gray-50 text-brand-black dark:bg-white/10 dark:text-white'
      }`}>
        {icon}
      </div>
      <span className={`text-sm font-bold ${danger ? 'text-red-500' : highlight ? 'text-brand-purple' : 'text-brand-black dark:text-white'}`}>
        {label}
      </span>
    </div>
    <div className="flex items-center">
      {value && <span className="text-xs font-medium text-gray-400 mr-2">{value}</span>}
      {isToggle ? (
        <div className={`w-10 h-6 rounded-full relative p-1 transition-colors duration-200 ${isToggled ? 'bg-brand-purple' : 'bg-gray-200 dark:bg-white/20'}`}>
          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-200 ${isToggled ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </div>
      ) : (
         !danger && <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
      )}
    </div>
  </button>
);

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, uploadPhoto } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    bio: 'Streamer oficial de Bigo Live. Me encantan los videojuegos y charlar.',
    birthdate: '1998-05-15'
  });

  useEffect(() => {
    if (user) {
        setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
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

  const handleAdminAccess = async () => {
      if (!user) return;

      const isAuthorized = ADMIN_EMAILS.includes(user.email.toLowerCase());

      if (!isAuthorized) {
         alert("Lo sentimos no eres Administrador hay algo en lo que te podamos ayudar?");
         return;
      }

      if (!user.isAdmin) {
          const confirm = window.confirm("¿Confirmas que eres el dueño de esta agencia?\n\nEsto actualizará tu rol en la base de datos.");
          if (confirm) {
              await updateProfile({ isAdmin: true, role: 'Agencia Admin' });
              alert("Permisos actualizados. Bienvenido, Admin.");
              navigate('/admin');
          }
      } else {
          navigate('/admin');
      }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Mi Perfil" />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
        
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-brand-dark-card p-6 mb-3 flex flex-col items-center justify-center text-center pb-8 shadow-sm relative">
            
            {/* Avatar Section */}
            <div className="relative mb-4">
                <div 
                    className={`w-28 h-28 bg-gray-100 dark:bg-white/5 rounded-full p-1 border-4 border-brand-purple overflow-hidden relative shadow-xl ${isUploading ? 'opacity-50' : ''}`}
                >
                    <img 
                        src={user.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                        key={user.avatarUrl} 
                    />
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {!isUploading && (
                    <>
                        {/* Botón Cámara (Subir Foto) - Solo visible en modo normal o edición, pero sin avatares flotantes */}
                        <button 
                            onClick={triggerFileInput}
                            className="absolute bottom-1 right-1 bg-brand-black dark:bg-white text-white dark:text-black p-2 rounded-full shadow-lg active:scale-95 transition-transform border-2 border-white dark:border-black z-10"
                            title="Subir foto"
                        >
                            <Camera size={14} />
                        </button>
                    </>
                )}
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            </div>

            {/* Name Display/Edit */}
            {isEditing ? (
                <div className="w-full max-w-xs animate-fade-in space-y-4">
                     <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre Visible</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/5 border-b-2 border-brand-purple p-2 text-center font-bold text-lg text-brand-black dark:text-white focus:outline-none"
                            autoFocus
                        />
                     </div>

                     {/* Botón para Elegir Avatar 3D (Solo en modo edición) */}
                     <button 
                        type="button"
                        onClick={() => setShowAvatarModal(true)}
                        className="w-full py-3 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded-sm font-black text-xs uppercase tracking-widest flex items-center justify-center active:scale-95 transition-transform hover:bg-brand-purple/20"
                     >
                        <Grid size={14} className="mr-2" />
                        Elegir Avatar 3D
                     </button>

                     <button 
                        onClick={handleSaveProfile} 
                        disabled={isSaving}
                        className="w-full py-2 bg-brand-purple text-white rounded-sm shadow-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center active:scale-95 transition-transform mt-2"
                    >
                        {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <> <Save size={14} className="mr-2" /> Guardar Cambios</>}
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-2xl font-black text-brand-black dark:text-white uppercase tracking-tight">{user.name}</h2>
                        {user.isAdmin && <Shield size={16} className="text-brand-purple" />}
                    </div>
                    <p className="text-xs font-bold text-brand-purple bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded uppercase tracking-wider mb-4">{user.role || 'Streamer'}</p>
                    
                    <button onClick={() => setIsEditing(true)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-200 dark:border-white/10 px-4 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        Editar Perfil
                    </button>
                </>
            )}
        </div>

        {/* --- ADMIN ACCESS --- */}
        <div className="bg-white dark:bg-brand-dark-card mb-3 shadow-sm">
            <div className="flex flex-col">
                <SettingItem 
                    icon={<Shield size={18} />} 
                    label={user.isAdmin ? "Panel de Agencia" : "Acceso Administrativo"} 
                    highlight={user.isAdmin}
                    onClick={handleAdminAccess}
                />
            </div>
        </div>

        {/* --- DETALLES DE PERFIL --- */}
        <div className="bg-white dark:bg-brand-dark-card mb-3 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Información Pública</h3>
            </div>
            
            <div className="px-6 py-4 space-y-6">
                {/* BIO */}
                <div className="flex items-start space-x-4">
                    <div className="mt-1 bg-gray-50 dark:bg-white/5 p-2 rounded-sm"><Type size={16} className="text-brand-purple" /></div>
                    <div className="flex-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Biografía</label>
                        {isEditing ? (
                             <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-white/5 border-none text-sm p-2 rounded-sm h-20 resize-none focus:ring-1 focus:ring-brand-purple outline-none"
                             />
                        ) : (
                            <p className="text-sm font-medium text-brand-black dark:text-white leading-relaxed">{formData.bio}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- DATOS PRIVADOS (LIMPIO) --- */}
        <div className="bg-white dark:bg-brand-dark-card mb-3 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Datos Privados</h3>
            </div>
            <div className="flex flex-col">
                <SettingItem icon={<Mail size={18} />} label="Correo Vinculado" value={user.email} />
            </div>
        </div>

        {/* --- CONFIGURACIÓN APP --- */}
        <div className="bg-white dark:bg-brand-dark-card mb-3 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Aplicación</h3>
            </div>
            <div className="flex flex-col">
                <SettingItem 
                    icon={<Bell size={18} />} 
                    label="Notificaciones Push" 
                    isToggle 
                    isToggled={notifications}
                    onClick={() => setNotifications(!notifications)}
                />
                <SettingItem 
                    icon={<Moon size={18} />} 
                    label="Modo Oscuro" 
                    isToggle 
                    isToggled={darkMode}
                    onClick={toggleDarkMode}
                />
                <SettingItem icon={<Lock size={18} />} label="Seguridad y Contraseña" />
                <SettingItem icon={<HelpCircle size={18} />} label="Soporte y Ayuda" />
            </div>
        </div>

        {/* Logout */}
        <div className="mt-8 px-6 mb-6">
            <button 
                onClick={handleLogout}
                className="w-full h-14 bg-red-50 dark:bg-red-900/10 text-red-500 font-black uppercase tracking-widest text-xs flex items-center justify-center rounded-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-900/30"
            >
                <LogOut size={16} className="mr-2" />
                Cerrar Sesión
            </button>
            <p className="text-center text-[10px] font-bold text-gray-300 dark:text-gray-600 mt-4 uppercase">
                StreamAgency v1.2.0 • Build 2501
            </p>
        </div>

      </div>

      {/* --- AVATAR SELECTION MODAL --- */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={() => setShowAvatarModal(false)}>
            <div 
                className="relative w-full max-w-sm bg-white dark:bg-[#121212] rounded-3xl p-6 animate-slide-up border border-gray-100 dark:border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="bg-brand-purple/10 p-1.5 rounded-lg">
                            <Smile size={18} className="text-brand-purple" />
                        </div>
                        <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">Elige tu Avatar</h3>
                    </div>
                    <button onClick={() => setShowAvatarModal(false)} className="p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                    {AVATARS.map((item, idx) => (
                        <div 
                            key={idx} 
                            className="aspect-square bg-gray-50 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all duration-200 relative overflow-hidden group border border-transparent hover:border-gray-200 dark:hover:border-white/20"
                            onClick={() => handleAvatarSelect(item.url)}
                        >
                            <div className="absolute inset-0 flex items-end justify-center">
                                <img 
                                    src={item.url} 
                                    alt={item.label} 
                                    className="w-[85%] h-auto object-cover transform translate-y-1 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm" 
                                />
                            </div>
                            {user.avatarUrl === item.url && (
                                <div className="absolute top-1 right-1 bg-brand-purple rounded-full p-0.5">
                                    <Check size={10} className="text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                    <p className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase">Estilo 3D</p>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default UserSettings;
