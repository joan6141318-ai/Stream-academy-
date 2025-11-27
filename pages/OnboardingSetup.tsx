import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronLeft, Camera, Grid, Instagram, Facebook, Video, Check, ChevronDown, User, Sparkles, PartyPopper, Hash, CalendarDays, BadgeCheck } from 'lucide-react';
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

  // Avatares Modernos "3D/Artistic Style"
  const AVATARS = [
    "https://api.dicebear.com/9.x/micah/svg?seed=Felix&backgroundColor=b6e3f4&radius=50",
    "https://api.dicebear.com/9.x/micah/svg?seed=Aneka&backgroundColor=ffdfbf&radius=50",
    "https://api.dicebear.com/9.x/micah/svg?seed=Willow&backgroundColor=c0aede&radius=50",
    "https://api.dicebear.com/9.x/micah/svg?seed=Liam&backgroundColor=d1d4f9&radius=50",
    "https://api.dicebear.com/9.x/micah/svg?seed=Christopher&backgroundColor=ffd5dc&radius=50",
    "https://api.dicebear.com/9.x/micah/svg?seed=Jack&backgroundColor=ffdfbf&radius=50",
    "https://api.dicebear.com/9.x/micah/svg?seed=Jocelyn&backgroundColor=b6e3f4&radius=50",
    "https://api.dicebear.com/9.x/micah/svg?seed=Ryker&backgroundColor=c0aede&radius=50",
    "https://api.dicebear.com/9.x/micah/svg?seed=Andrea&backgroundColor=d1d4f9&radius=50"
  ];

  // Listas para fechas
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const years = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 18 - i);

  // --- LOGIC ---

  const handleBack = () => {
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
        };
      };
      reader.readAsDataURL(file);
    }
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

  // BOTÓN CIRCULAR MORADO (Unificado, Centrado, Parpadeo Rápido)
  const NextButton = ({ onClick, disabled, text = "Siguiente", isLoading = false }: { onClick: () => void, disabled?: boolean, text?: string, isLoading?: boolean }) => (
    <div className={`fixed bottom-10 left-0 right-0 flex flex-col items-center justify-center z-50 transition-all duration-300 ${disabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <button 
            onClick={onClick}
            disabled={disabled || isLoading}
            className="w-16 h-16 bg-brand-purple text-white rounded-full shadow-2xl shadow-brand-purple/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 border-4 border-white/20 dark:border-white/10 animate-[pulse_0.7s_ease-in-out_infinite]"
        >
            {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <ArrowRight size={28} className="transition-transform duration-300" strokeWidth={3} />
            )}
        </button>
        {text && (
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-purple dark:text-purple-400 mt-3 animate-fade-in bg-white/80 dark:bg-black/80 px-2 py-0.5 rounded backdrop-blur-sm">
                {text}
            </span>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black px-6 pt-safe pb-safe transition-colors duration-300 overflow-y-auto scrollbar-hide relative">
        
        {/* Top Bar: Back Button */}
        <div className="absolute top-safe right-6 z-20 mt-6">
            <button 
                onClick={handleBack}
                className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-brand-purple transition-colors flex items-center"
            >
                <ChevronLeft size={14} className="mr-1" />
                Atrás
            </button>
        </div>

        {/* Content Container */}
        <div className={`flex-1 flex flex-col pt-12 pb-32 transition-all duration-300 transform ${isAnimating ? '-translate-x-10 opacity-0' : 'translate-x-0 opacity-100'}`}>
            
            {/* === PASO 1: IDENTIDAD === */}
            {step === 1 && (
                <div className="space-y-10 animate-fade-in flex-1 flex flex-col">
                    <div className="space-y-6">
                        <label className="text-2xl font-black text-brand-black dark:text-white uppercase leading-[0.9] tracking-tight">
                            ¿Cómo te gustaría<br/>que te llamáramos?
                        </label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Escribe tu nombre..."
                            className="w-full bg-transparent border-b-2 border-gray-200 dark:border-white/10 p-2 text-lg font-bold text-brand-purple focus:outline-none focus:border-brand-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                            autoFocus
                        />
                        <div className="min-h-[3rem] flex items-center">
                            {name ? (
                                <div className="flex items-center gap-2 animate-fade-in">
                                    <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase tracking-tighter truncate">
                                        {name}
                                    </h1>
                                    {isSigned && (
                                        <BadgeCheck size={24} className="text-blue-500 fill-blue-500/10" strokeWidth={2} />
                                    )}
                                </div>
                            ) : (
                                <span className="text-3xl font-black text-gray-100 dark:text-white/5 uppercase tracking-tighter select-none">NOMBRE</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">¿Eres un emisor firmado?</label>
                        <div className="flex gap-4">
                            <button onClick={() => setIsSigned(true)} className={`flex-1 py-3 rounded-lg border-2 font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${isSigned === true ? 'bg-brand-black dark:bg-white border-brand-black dark:border-white text-white dark:text-black shadow-md transform scale-105' : 'border-gray-100 dark:border-white/10 text-gray-400 bg-gray-50 dark:bg-white/5'}`}>{isSigned === true && <Check size={14} />} SÍ</button>
                            <button onClick={() => setIsSigned(false)} className={`flex-1 py-3 rounded-lg border-2 font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${isSigned === false ? 'bg-brand-black dark:bg-white border-brand-black dark:border-white text-white dark:text-black shadow-md transform scale-105' : 'border-gray-100 dark:border-white/10 text-gray-400 bg-gray-50 dark:bg-white/5'}`}>NO</button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bigo ID</label>
                        <input type="text" value={bigoId} onChange={(e) => setBigoId(e.target.value)} placeholder="Ej: user1234" className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-lg p-4 text-sm font-bold text-brand-black dark:text-white focus:ring-2 focus:ring-brand-purple/50 outline-none transition-all" />
                        <p className="text-[8px] text-gray-400 font-medium pl-1">* Se encuentra en tu perfil de Bigo.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tu edad</label>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative"><select value={day} onChange={(e) => setDay(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 appearance-none rounded-lg p-3 text-xs font-bold text-brand-black dark:text-white text-center outline-none focus:bg-gray-100 dark:focus:bg-white/10 transition-colors"><option value="" className="text-gray-400">Día</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select><ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
                            <div className="relative"><select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 appearance-none rounded-lg p-3 text-xs font-bold text-brand-black dark:text-white text-center outline-none focus:bg-gray-100 dark:focus:bg-white/10 transition-colors"><option value="">Mes</option>{months.map((m, i) => <option key={i} value={m}>{m}</option>)}</select><ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
                            <div className="relative"><select value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 appearance-none rounded-lg p-3 text-xs font-bold text-brand-black dark:text-white text-center outline-none focus:bg-gray-100 dark:focus:bg-white/10 transition-colors"><option value="">Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select><ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
                        </div>
                    </div>

                    <NextButton onClick={nextStep} disabled={!name || isSigned === null || !year || !month || !day} />
                </div>
            )}

            {/* === PASO 2: FOTO DE PERFIL === */}
            {step === 2 && (
                <div className="space-y-6 animate-fade-in flex-1 flex flex-col items-center">
                    <div className="text-center w-full mb-2">
                        <h1 className="text-2xl font-black text-brand-black dark:text-white uppercase tracking-tighter mb-1">
                            Foto de Perfil
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">configuremos una foto para tu perfil</p>
                    </div>

                    {/* Main Circle - Larger */}
                    <div 
                        className="relative w-64 h-64 rounded-full bg-gray-50 dark:bg-white/5 border-[8px] border-white dark:border-white/10 shadow-2xl shadow-brand-purple/20 flex items-center justify-center overflow-hidden cursor-pointer group transition-all duration-300"
                        onClick={() => !selectedAvatar && setPhotoMode('upload')}
                    >
                        {selectedAvatar ? (
                            <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover animate-fade-in" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-300 dark:text-gray-700">
                                <User size={100} strokeWidth={0.5} />
                                <span className="text-[10px] font-black uppercase mt-2 opacity-50">Toca para añadir</span>
                            </div>
                        )}
                        {selectedAvatar && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <Camera size={32} className="text-white mb-1" />
                            </div>
                        )}
                    </div>

                    {/* VISIBLE USER DATA CARD (New Design) */}
                    {selectedAvatar && (
                        <div className="w-full animate-slide-up space-y-4 text-center mt-2">
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-3xl font-black text-brand-black dark:text-white uppercase tracking-tighter leading-none">{name}</h3>
                                    {isSigned && <BadgeCheck size={28} className="text-blue-500 fill-white dark:fill-black" strokeWidth={2} />}
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
                        </div>
                    )}

                    {/* Options Buttons */}
                    {!selectedAvatar && (
                        <div className="w-full max-w-xs grid grid-cols-2 gap-4 mt-4">
                            <button 
                                onClick={() => { setPhotoMode('upload'); fileInputRef.current?.click(); }}
                                className={`py-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${photoMode === 'upload' ? 'bg-brand-black dark:bg-white text-white dark:text-black border-transparent scale-105' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Camera size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Galería</span>
                            </button>
                            <button 
                                onClick={() => setPhotoMode('avatar')}
                                className={`py-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${photoMode === 'avatar' ? 'bg-brand-black dark:bg-white text-white dark:text-black border-transparent scale-105' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Grid size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Avatares 3D</span>
                            </button>
                        </div>
                    )}

                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

                    {/* Avatar Grid */}
                    {!selectedAvatar && photoMode === 'avatar' && (
                        <div className="w-full mt-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3 text-center">Selecciona un estilo</p>
                            <div className="grid grid-cols-3 gap-3 p-2 animate-fade-in max-h-60 overflow-y-auto scrollbar-hide pb-20">
                                {AVATARS.map((url, idx) => (
                                    <div key={idx} className="aspect-square bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-sm border border-transparent hover:border-brand-purple" onClick={() => setSelectedAvatar(url)}>
                                        <img src={url} alt="Avatar" className="w-full h-full object-cover transform scale-90" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <NextButton onClick={nextStep} disabled={!selectedAvatar} />
                </div>
            )}

            {/* === PASO 3: ENCUESTA (Acordeón) === */}
            {step === 3 && (
                <div className="space-y-8 animate-fade-in flex-1 flex flex-col">
                    <div>
                        <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none mb-2 tracking-tight">
                            YA CASI<br/>TERMINAMOS
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ayúdanos a conocerte mejor</p>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[12px] font-black uppercase tracking-widest text-brand-purple dark:text-purple-400 border-l-4 border-brand-purple pl-2">
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
                                        <span className={`text-xs font-bold uppercase tracking-wide ${referralSource === opt ? 'text-brand-purple' : 'text-gray-500'}`}>{opt}</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${referralSource === opt ? 'border-brand-purple' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {referralSource === opt && <div className="w-2.5 h-2.5 rounded-full bg-brand-purple"></div>}
                                        </div>
                                    </button>

                                    {/* RESPUESTAS ANIDADAS (ACORDEÓN) */}
                                    <div className={`overflow-hidden transition-all duration-300 ${referralSource === opt ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                                        
                                        {/* Caso: Redes Sociales */}
                                        {opt === 'Redes Sociales' && (
                                            <div className="pl-4 border-l-2 border-gray-100 dark:border-white/10 ml-4 mb-2">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Selecciona la plataforma</p>
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
                                                                className={`flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${isActive ? 'border-brand-purple bg-white dark:bg-white/10 shadow-md scale-105' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 grayscale opacity-60'}`}
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
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Nombre de quien te invitó</p>
                                                <input 
                                                    type="text" 
                                                    value={friendName}
                                                    onChange={(e) => setFriendName(e.target.value)}
                                                    placeholder="Escribe el nombre..."
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold text-brand-black dark:text-white focus:border-brand-purple outline-none shadow-inner"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
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

            {/* === PASO 4: COMPLETADO (Formal) === */}
            {step === 4 && (
                <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in pb-safe">
                    
                    <div className="mb-8 relative">
                        <div className="w-32 h-32 bg-brand-black dark:bg-white rounded-full flex items-center justify-center shadow-2xl relative z-10 animate-bounce">
                            <Check size={64} strokeWidth={5} className="text-white dark:text-black" />
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

                    {/* Mensaje Formal Estilo Editorial */}
                    <div className="w-full max-w-sm mx-auto mb-16 px-6">
                        <div className="border-t border-b border-gray-200 dark:border-white/10 py-8 relative">
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-black px-4 text-gray-300 dark:text-gray-700 font-serif italic text-lg">
                                Mensaje de Bienvenida
                            </span>
                            <p className="text-sm font-serif italic text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                                "Esperamos que disfrutes tu experiencia durante tu estadía en este proyecto de capacitación virtual que hemos diseñado para ti. Estaremos mejorando y subiendo constantes actualizaciones, por lo que te pedimos estar al pendiente."
                            </p>
                        </div>
                        <p className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em] mt-4 opacity-80">
                            TU AGENCIA, TU CONOCIMIENTO
                        </p>
                    </div>

                    <button 
                        onClick={() => navigate('/home')}
                        className="w-full max-w-xs h-14 bg-brand-purple text-white font-black uppercase tracking-[0.25em] text-xs flex items-center justify-center rounded-full hover:bg-purple-600 active:scale-95 transition-all shadow-xl hover:shadow-purple-500/30 animate-pulse"
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