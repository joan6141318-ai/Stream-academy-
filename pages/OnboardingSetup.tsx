import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Camera, Grid, Instagram, Facebook, Video, Check, ChevronDown, User, PartyPopper, Pencil, X, Sparkles, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const OnboardingSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, uploadPhoto } = useAuth();
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- STATES ---
  
  // Step 1: Identity
  const [name, setName] = useState('');
  const [isSigned, setIsSigned] = useState<boolean | null>(null);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [bigoId, setBigoId] = useState('');

  // Step 2: Photo
  const [photoMode, setPhotoMode] = useState<'upload' | 'avatar' | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Survey
  const [referralSource, setReferralSource] = useState('');
  const [socialNetworks, setSocialNetworks] = useState<string[]>([]);
  const [friendName, setFriendName] = useState('');

  // Avatares Estilo 3D / WhatsApp Moderno
  // Selección limpia sin fondos pesados
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

  // Listas para fechas
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const years = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 18 - i);

  // --- LOGIC ---

  const handleBack = () => {
    // Si está en modo selección de avatar (modal abierto), regresar cierra el modal
    if (step === 2 && photoMode === 'avatar' && !selectedAvatar) {
        setPhotoMode(null);
        return;
    }
    
    if (step > 1) {
        setStep(prev => prev - 1);
    } else {
        navigate('/onboarding');
    }
  };

  const nextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
        setStep(prev => prev + 1);
        setIsAnimating(false);
    }, 300);
  };

  const getAge = () => {
      if (!year) return '--';
      const currentYear = new Date().getFullYear();
      return currentYear - parseInt(year);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 500;
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            setSelectedAvatar(base64);
            setPhotoMode(null); // Cerrar modo selección
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const resetPhoto = () => {
      setSelectedAvatar('');
      setPhotoMode(null);
  };

  const toggleSocial = (network: string) => {
      if (socialNetworks.includes(network)) {
          setSocialNetworks(prev => prev.filter(n => n !== network));
      } else {
          setSocialNetworks(prev => [...prev, network]);
      }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
        let finalPhotoUrl = selectedAvatar;
        if (selectedAvatar.startsWith('data:')) {
            const res = await fetch(selectedAvatar);
            const blob = await res.blob();
            finalPhotoUrl = await uploadPhoto(blob, selectedAvatar);
        }

        await updateProfile({
            name: name,
            role: isSigned ? 'Emisor Verificado' : 'Nuevo Ingreso',
            avatarUrl: finalPhotoUrl
        });

        if (db) {
            const userDocRef = doc(db, "users", user.id);
            await setDoc(userDocRef, {
                bigoId: bigoId || 'No registrado',
                birthdate: `${day}/${month}/${year}`,
                age: getAge(),
                isSigned,
                referral: {
                    source: referralSource,
                    socials: referralSource === 'Redes Sociales' ? socialNetworks : [],
                    friendName: referralSource === 'Recomendación de amigo/a' ? friendName : null
                },
                isOnboardingComplete: true
            }, { merge: true });
        }

        nextStep();
    } catch (e) {
        console.error("Error saving setup:", e);
        nextStep();
    } finally {
        setIsSaving(false);
    }
  };

  // BOTÓN CENTRADO HORIZONTALMENTE, POSICIÓN MEDIA-BAJA
  const NextButton = ({ onClick, disabled, text = "Siguiente", isLoading = false }: { onClick: () => void, disabled?: boolean, text?: string, isLoading?: boolean }) => (
    <div className="w-full flex flex-col items-center justify-center mt-auto pb-10 pt-6 shrink-0 z-20 mb-10">
        <button 
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`w-16 h-16 bg-brand-purple text-white rounded-full shadow-2xl shadow-brand-purple/50 flex items-center justify-center transition-all duration-300 active:scale-95 border-4 border-white/20 dark:border-white/10 ${disabled ? 'opacity-50 grayscale' : 'hover:scale-105'}`}
        >
            {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <ArrowRight size={28} className="transition-transform duration-300" strokeWidth={3} />
            )}
        </button>
        {text && (
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-brand-purple dark:text-purple-400 mt-3 bg-white/80 dark:bg-black/80 px-2 py-0.5 rounded backdrop-blur-sm transition-opacity ${disabled ? 'opacity-0' : 'opacity-100'}`}>
                {text}
            </span>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black px-6 pt-safe pb-safe transition-colors duration-300 overflow-y-auto scrollbar-hide relative">
        
        {/* HEADER MODIFICADO: Indicadores ARRIBA del botón Atrás */}
        <div className="w-full pt-6 mb-2">
            
            {/* 1. Indicadores de Progreso (Barra Segmentada) - PRIMERO */}
            <div className="flex w-full space-x-1.5 mb-4">
                {[1, 2, 3, 4].map((i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${i <= step ? 'bg-brand-purple' : 'bg-gray-100 dark:bg-white/10'}`} 
                    />
                ))}
            </div>

            {/* 2. Botón Atrás (Alineado a la derecha) - SEGUNDO */}
            {step < 4 && (
                <div className="flex justify-end min-h-[20px]">
                    <button 
                        onClick={handleBack}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-brand-purple transition-colors flex items-center"
                    >
                        <ChevronLeft size={14} className="mr-1" />
                        Atrás
                    </button>
                </div>
            )}
        </div>

        {/* Content Container */}
        <div className={`flex-1 flex flex-col pt-4 min-h-0 transition-all duration-300 transform ${isAnimating ? '-translate-x-10 opacity-0' : 'translate-x-0 opacity-100'}`}>
            
            {/* === PASO 1: IDENTIDAD (ALINEADO IZQUIERDA) === */}
            {step === 1 && (
                <div className="w-full animate-fade-in flex flex-col flex-1">
                    <div className="w-full text-left space-y-8">
                        <div>
                            <h1 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-tight tracking-tight mb-6 text-left">
                                ¿Cómo te gustaría<br/>que te llamáramos?
                            </h1>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Escribe tu nombre..."
                                className="w-full text-left bg-transparent border-b-2 border-gray-200 dark:border-white/10 p-2 text-lg font-bold text-brand-purple focus:outline-none focus:border-brand-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700 mb-2 rounded-none"
                                autoFocus
                            />
                            <div className="min-h-[3rem] flex items-center justify-start w-full">
                                {name ? (
                                    <div className="flex items-center gap-2 animate-fade-in">
                                        <h2 className="text-3xl font-black text-brand-black dark:text-white uppercase tracking-tighter truncate max-w-[250px]">
                                            {name}
                                        </h2>
                                        {isSigned && (
                                            <div className="bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm flex-shrink-0">
                                                <Check size={10} className="text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-3xl font-black text-gray-100 dark:text-white/5 uppercase tracking-tighter select-none">NOMBRE</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block text-left">¿Eres un emisor firmado?</label>
                            <div className="flex gap-4">
                                <button onClick={() => setIsSigned(true)} className={`flex-1 py-3 rounded-lg border-2 font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${isSigned === true ? 'bg-brand-black dark:bg-white border-brand-black dark:border-white text-white dark:text-black shadow-md' : 'border-gray-100 dark:border-white/10 text-gray-400 bg-gray-50 dark:bg-white/5'}`}>{isSigned === true && <Check size={14} />} SÍ</button>
                                <button onClick={() => setIsSigned(false)} className={`flex-1 py-3 rounded-lg border-2 font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${isSigned === false ? 'bg-brand-black dark:bg-white border-brand-black dark:border-white text-white dark:text-black shadow-md' : 'border-gray-100 dark:border-white/10 text-gray-400 bg-gray-50 dark:bg-white/5'}`}>NO</button>
                            </div>
                        </div>

                        <div className="space-y-2 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block text-left">Bigo ID</label>
                            <input type="text" value={bigoId} onChange={(e) => setBigoId(e.target.value)} placeholder="Ej: user1234" className="w-full text-left bg-gray-50 dark:bg-white/5 border-none rounded-lg p-4 text-sm font-bold text-brand-black dark:text-white focus:ring-2 focus:ring-brand-purple/50 outline-none transition-all" />
                            <p className="text-[8px] text-gray-400 font-medium text-left">* Se encuentra en tu perfil de Bigo.</p>
                        </div>

                        <div className="space-y-2 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block text-left">Tu edad</label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="relative"><select value={day} onChange={(e) => setDay(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 appearance-none rounded-lg p-3 text-xs font-bold text-brand-black dark:text-white text-center outline-none focus:bg-gray-100 dark:focus:bg-white/10 transition-colors"><option value="" className="text-gray-400">Día</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select><ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
                                <div className="relative"><select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 appearance-none rounded-lg p-3 text-xs font-bold text-brand-black dark:text-white text-center outline-none focus:bg-gray-100 dark:focus:bg-white/10 transition-colors"><option value="">Mes</option>{months.map((m, i) => <option key={i} value={m}>{m}</option>)}</select><ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
                                <div className="relative"><select value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 appearance-none rounded-lg p-3 text-xs font-bold text-brand-black dark:text-white text-center outline-none focus:bg-gray-100 dark:focus:bg-white/10 transition-colors"><option value="">Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select><ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
                            </div>
                        </div>
                    </div>

                    <NextButton onClick={nextStep} disabled={!name || isSigned === null || !year || !month || !day} />
                </div>
            )}

            {/* === PASO 2: FOTO DE PERFIL (CENTRADO) === */}
            {step === 2 && (
                <div className="animate-fade-in flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center space-y-6">
                        <div className="text-left w-full mb-2">
                            <h1 className="text-2xl font-black text-brand-black dark:text-white uppercase tracking-tighter mb-1 text-left">
                                Foto de Perfil
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide text-left">configuremos una foto para tu perfil</p>
                        </div>

                        {/* Main Circle - Larger */}
                        <div 
                            className="relative w-64 h-64 rounded-full bg-gray-50 dark:bg-white/5 border-[8px] border-white dark:border-white/10 shadow-2xl shadow-brand-purple/20 flex items-center justify-center overflow-hidden transition-all duration-300"
                        >
                            {selectedAvatar ? (
                                <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover animate-fade-in" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-300 dark:text-gray-700">
                                    <User size={100} strokeWidth={0.5} />
                                    <span className="text-[10px] font-black uppercase mt-2 opacity-50">Vista Previa</span>
                                </div>
                            )}
                        </div>

                        {/* VISIBLE USER DATA CARD */}
                        {selectedAvatar && (
                            <div className="w-full animate-slide-up space-y-4 text-center mt-2">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-3xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-none">{name}</h3>
                                        {isSigned && (
                                            <div className="bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white dark:border-black flex-shrink-0">
                                                <Check size={12} className="text-white" strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-brand-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                                        {isSigned ? 'Emisor Firmado' : 'Emisor Independiente'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full max-w-xs mx-auto">
                                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Bigo ID</span>
                                        <span className="text-sm font-black text-brand-purple truncate w-full text-center">{bigoId || '---'}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Edad</span>
                                        <span className="text-sm font-black text-brand-black dark:text-white">{getAge()} Años</span>
                                    </div>
                                </div>

                                {/* EDITAR FOTO BUTTON */}
                                <button 
                                    onClick={resetPhoto}
                                    className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-brand-purple transition-colors uppercase tracking-widest mt-2"
                                >
                                    <Pencil size={12} className="mr-2" />
                                    Editar Foto
                                </button>
                            </div>
                        )}

                        {/* Options Buttons */}
                        {!selectedAvatar && (
                            <div className="w-full max-w-xs grid grid-cols-2 gap-4 mt-4">
                                <button 
                                    onClick={() => { setPhotoMode('upload'); fileInputRef.current?.click(); }}
                                    className="py-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-md bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-500 hover:bg-gray-50 hover:border-gray-200"
                                >
                                    <Camera size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Galería</span>
                                </button>
                                <button 
                                    onClick={() => setPhotoMode('avatar')}
                                    className="py-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-md bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-500 hover:bg-gray-50 hover:border-gray-200"
                                >
                                    <Grid size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Avatares 3D</span>
                                </button>
                            </div>
                        )}

                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

                        {/* Avatar Card Overlay (MODAL MINIMALISTA) */}
                        {!selectedAvatar && photoMode === 'avatar' && (
                            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 animate-fade-in" onClick={() => setPhotoMode(null)}>
                                
                                {/* 1. Backdrop - Completely transparent (No blur, no color) */}
                                <div className="absolute inset-0"></div>

                                {/* 2. Tarjeta Blanca Minimalista (No Shadow, high contrast border) */}
                                <div 
                                    className="relative w-full max-w-sm bg-white rounded-3xl p-6 animate-slide-up border border-gray-100 mt-24 shadow-none"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Header Limpio */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <div className="bg-brand-purple/10 p-1.5 rounded-lg">
                                                    <Smile size={16} className="text-brand-purple" />
                                                </div>
                                                <h3 className="text-sm font-black text-brand-black uppercase tracking-tight">Elige tu Avatar</h3>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-8 mt-1">Colección 3D</p>
                                        </div>
                                        <button onClick={() => setPhotoMode(null)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    
                                    {/* Grid de Avatares Limpios */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {AVATARS.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="aspect-square bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 active:scale-95 transition-all duration-200 relative overflow-hidden group border border-transparent hover:border-gray-200"
                                                onClick={() => { setSelectedAvatar(item.url); setPhotoMode(null); }}
                                            >
                                                <div className="absolute inset-0 flex items-end justify-center">
                                                    <img 
                                                        src={item.url} 
                                                        alt={item.label} 
                                                        className="w-[85%] h-auto object-cover transform translate-y-1 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm" 
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-6 text-center">
                                        <p className="text-[9px] text-gray-300 font-bold tracking-[0.2em] uppercase">Selecciona uno</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <NextButton onClick={nextStep} disabled={!selectedAvatar} />
                </div>
            )}

            {/* === PASO 3: ENCUESTA (ALINEADO IZQUIERDA) === */}
            {step === 3 && (
                <div className="w-full animate-fade-in flex-1 flex flex-col">
                    <div className="space-y-8 w-full">
                        <div className="text-left w-full mb-6">
                            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none mb-2 tracking-tight text-left">
                                YA CASI<br/>TERMINAMOS
                            </h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider text-left">Ayúdanos a conocerte mejor</p>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[12px] font-black uppercase tracking-widest text-brand-purple dark:text-purple-400 border-l-4 border-brand-purple pl-2 block text-left">
                                ¿Cómo supiste de nosotros?
                            </label>
                            
                            <div className="flex flex-col gap-3">
                                {['Redes Sociales', 'Recomendación de amigo/a', 'Búsqueda Web'].map((opt) => (
                                    <div key={opt} className="w-full transition-all duration-300">
                                        <button
                                            onClick={() => { 
                                                setReferralSource(opt); 
                                                if (opt !== referralSource) { setSocialNetworks([]); setFriendName(''); }
                                            }}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 active:scale-[0.99] shadow-sm ${referralSource === opt ? 'border-brand-purple bg-purple-50 dark:bg-purple-900/10 z-10 relative' : 'border-gray-100 dark:border-white/10 bg-white dark:bg-brand-dark-card'}`}
                                        >
                                            <span className={`text-xs font-bold uppercase tracking-wide text-left ${referralSource === opt ? 'text-brand-purple' : 'text-gray-500'}`}>{opt}</span>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${referralSource === opt ? 'border-brand-purple' : 'border-gray-300 dark:border-gray-600'}`}>
                                                {referralSource === opt && <div className="w-2.5 h-2.5 rounded-full bg-brand-purple"></div>}
                                            </div>
                                        </button>

                                        {/* RESPUESTAS ANIDADAS (ACORDEÓN) */}
                                        <div className={`overflow-hidden transition-all duration-300 ${referralSource === opt ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                                            
                                            {/* Caso: Redes Sociales */}
                                            {opt === 'Redes Sociales' && (
                                                <div className="pl-4 border-l-2 border-gray-100 dark:border-white/10 ml-4 mb-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 text-left">Selecciona la plataforma</p>
                                                    <div className="flex gap-2">
                                                        {[
                                                            { name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                                                            { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
                                                            { name: 'TikTok', icon: Video, color: 'text-black dark:text-white' }
                                                        ].map((social) => {
                                                            const isActive = socialNetworks.includes(social.name);
                                                            return (
                                                                <button 
                                                                    key={social.name}
                                                                    onClick={() => toggleSocial(social.name)}
                                                                    className={`flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${isActive ? 'border-brand-purple bg-white dark:bg-white/10 shadow-md' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 grayscale opacity-60'}`}
                                                                >
                                                                    <social.icon size={18} className={social.color} />
                                                                    <span className={`text-[7px] font-black uppercase ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>{social.name}</span>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Caso: Amigo */}
                                            {opt === 'Recomendación de amigo/a' && (
                                                <div className="pl-4 border-l-2 border-gray-100 dark:border-white/10 ml-4 mb-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 text-left">Nombre de quien te invitó</p>
                                                    <input 
                                                        type="text" 
                                                        value={friendName}
                                                        onChange={(e) => setFriendName(e.target.value)}
                                                        placeholder="Escribe el nombre..."
                                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold text-brand-black dark:text-white focus:border-brand-purple outline-none shadow-inner text-left"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <NextButton 
                        onClick={handleSave} 
                        disabled={isSaving || !referralSource} 
                        text={isSaving ? "Guardando..." : "Guardar y Avanzar"}
                        isLoading={isSaving}
                    />
                </div>
            )}

            {/* === PASO 4: COMPLETADO (CENTRADO) === */}
            {step === 4 && (
                <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in pb-safe">
                    
                    <div className="mb-8 relative">
                        {/* CÍRCULO COLOR MORADO */}
                        <div className="w-32 h-32 bg-brand-purple rounded-full flex items-center justify-center shadow-2xl relative z-10 animate-bounce">
                            <Check size={64} strokeWidth={5} className="text-white" />
                        </div>
                        <div className="absolute top-0 right-0 animate-ping opacity-50">
                             <PartyPopper size={40} className="text-brand-purple" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-black text-brand-black dark:text-white uppercase tracking-tighter mb-4 leading-none">
                        LISTO !
                    </h1>
                    
                    <div className="mb-12 px-6">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                            HEMOS TERMINADO DE CONFIGURAR TU PERFIL
                        </p>
                        <p className="text-2xl font-black text-brand-purple uppercase tracking-tight">
                            {name}
                        </p>
                    </div>

                    {/* Mensaje Formal - Ajustado a estilo limpio */}
                    <div className="w-full max-w-sm mx-auto mb-16 px-6">
                        <div className="py-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                                Esperamos que disfrutes tu experiencia durante tu estadía en este proyecto de capacitación virtual que hemos diseñado para ti. Estaremos mejorando y subiendo constantes actualizaciones, por lo que te pedimos estar al pendiente.
                            </p>
                        </div>
                        <p className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em] mt-4 opacity-80">
                            TU AGENCIA, TU CONOCIMIENTO
                        </p>
                    </div>

                    <button 
                        onClick={() => navigate('/home')}
                        className="w-full max-w-xs h-14 bg-brand-purple text-white font-black uppercase tracking-[0.25em] text-xs flex items-center justify-center rounded-full hover:bg-purple-600 active:scale-95 transition-all shadow-xl hover:shadow-purple-500/30"
                    >
                        COMENZAMOS
                    </button>
                </div>
            )}

        </div>
    </div>
  );
};

export default OnboardingSetup;