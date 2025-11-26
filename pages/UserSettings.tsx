import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Lock, HelpCircle, ChevronRight, Camera, User, Mail, CreditCard, Moon, Save, Instagram, Video, Calendar, Type } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';

const SettingItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value?: string;
  isToggle?: boolean;
  isToggled?: boolean;
  onClick?: () => void;
  danger?: boolean;
}> = ({ icon, label, value, isToggle, isToggled, onClick, danger }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white dark:bg-brand-dark-card border-b border-gray-50 dark:border-white/5 last:border-0 active:bg-gray-50 dark:active:bg-white/5 transition-colors"
  >
    <div className="flex items-center space-x-4">
      <div className={`p-2 rounded-sm ${danger ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-gray-50 text-brand-black dark:bg-white/10 dark:text-white'}`}>
        {icon}
      </div>
      <span className={`text-sm font-bold ${danger ? 'text-red-500' : 'text-brand-black dark:text-white'}`}>
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    bio: 'Streamer oficial de Bigo Live. Me encantan los videojuegos y charlar.',
    instagram: '@alex_rivera',
    tiktok: '@alexstream',
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
            const photoUrl = await uploadPhoto(reader.result as string);
            await updateProfile({ avatarUrl: photoUrl });
        } catch (error) {
            console.error("Error uploading photo", error);
        } finally {
            setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) return;
    setIsSaving(true);
    
    try {
        await updateProfile({ name: formData.name });
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
      <Header title="Mi Perfil" />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
        
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-brand-dark-card p-6 mb-3 flex flex-col items-center justify-center text-center pb-8 shadow-sm">
            
            {/* Avatar Upload */}
            <div className="relative mb-4 group cursor-pointer" onClick={triggerFileInput}>
                <div className={`w-28 h-28 bg-gray-100 dark:bg-white/5 rounded-full p-1 border-4 border-brand-purple overflow-hidden relative shadow-xl ${isUploading ? 'opacity-50' : ''}`}>
                    <img 
                        src={user.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                    />
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                {!isUploading && (
                    <div className="absolute bottom-1 right-1 bg-brand-black dark:bg-white text-white dark:text-black p-2 rounded-full shadow-lg active:scale-95 transition-transform border-2 border-white dark:border-black">
                        <Camera size={14} />
                    </div>
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
                        />
                     </div>
                     <button 
                        onClick={handleSaveProfile} 
                        disabled={isSaving}
                        className="w-full py-2 bg-brand-purple text-white rounded-sm shadow-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center"
                    >
                        {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <> <Save size={14} className="mr-2" /> Guardar Cambios</>}
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-2xl font-black text-brand-black dark:text-white uppercase tracking-tight">{user.name}</h2>
                    </div>
                    <p className="text-xs font-bold text-brand-purple bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded uppercase tracking-wider mb-4">{user.id}</p>
                    
                    <button onClick={() => setIsEditing(true)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-200 dark:border-white/10 px-4 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        Editar Perfil
                    </button>
                </>
            )}
        </div>

        {/* --- DETALLES DE PERFIL (Solo lectura en Demo) --- */}
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
                                className="w-full bg-gray-50 dark:bg-white/5 border-none text-sm p-2 rounded-sm h-20 resize-none focus:ring-1 focus:ring-brand-purple"
                             />
                        ) : (
                            <p className="text-sm font-medium text-brand-black dark:text-white leading-relaxed">{formData.bio}</p>
                        )}
                    </div>
                </div>

                {/* SOCIALS */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-white/5 rounded-sm border border-gray-100 dark:border-white/5">
                        <Instagram size={16} className="text-pink-600" />
                        <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">Instagram</span>
                            <span className="text-xs font-bold text-brand-black dark:text-white">{formData.instagram}</span>
                        </div>
                     </div>
                     <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-white/5 rounded-sm border border-gray-100 dark:border-white/5">
                        <Video size={16} className="text-black dark:text-white" />
                        <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">TikTok</span>
                            <span className="text-xs font-bold text-brand-black dark:text-white">{formData.tiktok}</span>
                        </div>
                     </div>
                </div>

                {/* BIRTHDAY */}
                <div className="flex items-center space-x-4 border-t border-gray-50 dark:border-white/5 pt-4">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                         <span className="text-[9px] font-bold text-gray-400 uppercase block">Fecha de Nacimiento</span>
                         <span className="text-sm font-bold text-brand-black dark:text-white">15 Mayo 1998</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- DATOS PRIVADOS --- */}
        <div className="bg-white dark:bg-brand-dark-card mb-3 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Datos Privados</h3>
            </div>
            <div className="flex flex-col">
                <SettingItem icon={<Mail size={18} />} label="Correo Vinculado" value={user.email} />
                <SettingItem icon={<CreditCard size={18} />} label="Método de Pago" value="Payoneer •••• 4421" />
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
                StreamAgency v1.1.0 • Build 2405
            </p>
        </div>

      </div>
    </div>
  );
};

export default UserSettings;