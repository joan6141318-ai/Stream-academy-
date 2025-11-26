import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Lock, HelpCircle, ChevronRight, Camera, User, Mail, CreditCard, Moon, Save } from 'lucide-react';
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
  const { user, logout, updateProfile, uploadPhoto } = useAuth(); // Hooks reales
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  // Local state for editing
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) setName(user.name);
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

  // 1. Manejar subida de foto real
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
            // Enviamos el base64 al contexto (que decidirá si guardarlo local o en Firebase)
            const photoUrl = await uploadPhoto(reader.result as string);
            await updateProfile({ avatarUrl: photoUrl });
        } catch (error) {
            console.error("Error uploading photo", error);
            alert("Error al subir imagen");
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
    if (!name.trim()) return;
    setIsSaving(true);
    
    try {
        await updateProfile({ name });
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
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-brand-dark-card p-6 mb-3 flex flex-col items-center justify-center text-center pb-8 shadow-sm">
            
            {/* Avatar Upload */}
            <div className="relative mb-4 group cursor-pointer" onClick={triggerFileInput}>
                <div className={`w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full p-1 border-2 border-brand-purple overflow-hidden relative ${isUploading ? 'opacity-50' : ''}`}>
                    <img 
                        src={user.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                    />
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                {!isUploading && (
                    <div className="absolute bottom-0 right-0 bg-brand-black dark:bg-white text-white dark:text-black p-2 rounded-full shadow-md active:scale-95 transition-transform">
                        <Camera size={14} />
                    </div>
                )}
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>

            {/* Editable Name */}
            {isEditing ? (
                <div className="flex items-center space-x-2 animate-fade-in">
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="bg-gray-100 dark:bg-white/10 border-b-2 border-brand-purple text-center font-black text-xl text-brand-black dark:text-white focus:outline-none w-48 py-1"
                        autoFocus
                    />
                    <button 
                        onClick={handleSaveProfile} 
                        disabled={isSaving}
                        className="p-2 bg-brand-purple text-white rounded-full shadow-lg"
                    >
                        {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block"></span> : <Save size={16} />}
                    </button>
                </div>
            ) : (
                <div onClick={() => setIsEditing(true)} className="group cursor-pointer flex items-center space-x-2">
                    <h2 className="text-xl font-black text-brand-black dark:text-white uppercase">{user.name}</h2>
                    <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-bold group-hover:text-brand-purple transition-colors">EDITAR</span>
                </div>
            )}
            
            <p className="text-xs font-bold text-gray-400 mt-1">{user.id}</p>
        </div>

        {/* Form Fields Section */}
        <div className="bg-white dark:bg-brand-dark-card mb-3 px-6 py-4 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Datos Personales</h3>
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre Completo</label>
                    <div className="flex items-center border-b border-gray-100 dark:border-white/10 py-2">
                        <User size={16} className="text-brand-purple mr-3" />
                        <span className="flex-1 font-bold text-sm text-brand-black dark:text-white opacity-60">{user.name}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Correo Electrónico</label>
                    <div className="flex items-center border-b border-gray-100 dark:border-white/10 py-2">
                        <Mail size={16} className="text-brand-purple mr-3" />
                        <span className="flex-1 font-bold text-sm text-brand-black dark:text-white opacity-60">{user.email}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Método de Pago</label>
                    <div className="flex items-center border-b border-gray-100 dark:border-white/10 py-2">
                        <CreditCard size={16} className="text-brand-purple mr-3" />
                        <span className="flex-1 font-bold text-sm text-brand-black dark:text-white opacity-60">Payoneer •••• 4421</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Settings List */}
        <div className="bg-white dark:bg-brand-dark-card mb-3 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Configuración</h3>
            </div>
            <div className="flex flex-col">
                <SettingItem 
                    icon={<Bell size={18} />} 
                    label="Notificaciones" 
                    isToggle 
                    isToggled={notifications}
                    onClick={() => setNotifications(!notifications)}
                />
                <SettingItem 
                    icon={<Moon size={18} />} 
                    label="Modo Nocturno" 
                    isToggle 
                    isToggled={darkMode}
                    onClick={toggleDarkMode}
                />
                <SettingItem icon={<Lock size={18} />} label="Cambiar Contraseña" />
                <SettingItem icon={<HelpCircle size={18} />} label="Ayuda y Soporte" />
            </div>
        </div>

        {/* Logout */}
        <div className="mt-6 px-4">
            <button 
                onClick={handleLogout}
                className="w-full h-14 bg-red-50 dark:bg-red-900/20 text-red-500 font-black uppercase tracking-widest text-xs flex items-center justify-center rounded-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
                <LogOut size={16} className="mr-2" />
                Cerrar Sesión
            </button>
            <p className="text-center text-[10px] font-bold text-gray-300 dark:text-gray-600 mt-4 uppercase">
                StreamAgency v1.0.4
            </p>
        </div>

      </div>
    </div>
  );
};

export default UserSettings;