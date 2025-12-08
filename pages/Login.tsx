import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, AlertCircle, WifiOff, Check, ShieldAlert, FileText, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useContent, hashString } from '../context/ContentContext';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, user, loading } = useAuth(); 
  const { homeConfig, loading: contentLoading } = useContent(); // Importar estado de carga del contenido
  
  // Estados para manejar el formulario
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Estados para Agencia (Código de Invitación)
  const [agencyCode, setAgencyCode] = useState(''); 
  const [agencyError, setAgencyError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isSecurityError, setIsSecurityError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // EFECTO: Si el usuario ya está logueado, mandarlo a /welcome
  useEffect(() => {
    if (!loading && user) {
        navigate('/welcome', { replace: true });
    }
  }, [user, loading, navigate]);

  // Limpiar errores al escribir
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setError(null);
    setAgencyError(null); 
    setIsNetworkError(false);
    setIsSecurityError(false);
    setter(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAgencyError(null);
    setIsNetworkError(false);
    setIsSecurityError(false);
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        if (!name.trim()) throw new Error("Ingresa tu nombre para continuar.");
        
        // --- VALIDACIÓN DE CÓDIGO DE INVITACIÓN (Gatekeeper) ---
        // CRITICAL FIX: Ensure config is loaded or fallback strictly
        if (contentLoading) {
            throw new Error("Conectando con el servidor... Intenta en unos segundos.");
        }

        const normalizedAgency = agencyCode.trim().toLowerCase();
        
        // Calcular Hash del input
        const inputHash = await hashString(normalizedAgency);
        
        // Obtener Hash Correcto de Firebase
        // SEGURIDAD: Ya no hay hash por defecto ("moon"). Si no carga la config, no entra nadie.
        const validHash = homeConfig?.agencyCodeHash;
        
        if (!validHash) {
             throw new Error("Error de configuración del sistema. Contacta soporte.");
        }
        
        if (inputHash !== validHash) {
            setAgencyError("Código inválido");
            throw new Error("El código de invitación es incorrecto. Pídelo a tu líder.");
        }

        // REGISTRO SEGURO: isAdmin siempre es false aquí.
        await register(email, password, name, false);
        setIsSuccess(true);
        navigate('/welcome', { replace: true });
      } else {
        // Inicio de sesión normal
        await login(email, password);
        setIsSuccess(true);
        navigate('/welcome', { replace: true });
      }
      
    } catch (err: any) {
      setIsSuccess(false);
      setIsSubmitting(false);
      
      const errorCode = err.code || '';
      const errorMessage = err.message || '';
      const isCustomError = errorMessage.includes("código de invitación") || errorMessage.includes("Conectando") || errorMessage.includes("configuración");

      if (!isCustomError) {
          console.error("Firebase Auth Error:", errorCode, errorMessage);
      }

      // --- MANEJO DE ERRORES ---
      if (errorMessage.includes('requests-from-referer') || errorMessage.includes('blocked')) {
         setError("Acceso bloqueado por Seguridad: Este dominio no está autorizado en Google Cloud. Usa el sitio oficial.");
         setIsSecurityError(true);
      } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        setError("Usuario o contraseña incorrectos. Si es tu primera vez, selecciona 'Crear Cuenta'.");
      } else if (errorCode === 'auth/email-already-in-use') {
        setError("Este correo ya está registrado. Cambiando a inicio de sesión...");
        setTimeout(() => {
            setIsRegistering(false);
            setError(null);
        }, 2000);
      } else if (errorCode === 'auth/weak-password') {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (errorCode === 'auth/network-request-failed' || errorMessage.includes('network-request-failed')) {
        setError("Error de conexión: Revisa tu internet.");
        setIsNetworkError(true);
      } else if (err.message) {
        setError(err.message.replace('Firebase:', '').trim());
      } else {
        setError("Error de conexión. Intenta de nuevo.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black px-8 pb-safe pt-safe overflow-y-auto scrollbar-hide transition-colors duration-300">
      
      <div className="flex-1 flex flex-col justify-center animate-fade-in">
        <div className="w-14 h-14 bg-brand-black dark:bg-white flex items-center justify-center rounded-sm mb-6 shadow-xl shadow-brand-purple/20">
            <Zap className="text-white dark:text-black w-7 h-7" strokeWidth={2} />
        </div>
        
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">
            STREAMERS<br/>ACADEMY
          </h1>
          <div className="h-1 w-10 bg-brand-purple"></div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.25em] pt-2">
            {isRegistering ? 'Registro de Emisor' : 'Acceso a Plataforma'}
          </p>
        </div>

        {error && (
          <div className={`mb-6 p-4 border-l-4 flex items-start animate-fade-in ${isSecurityError ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600' : isNetworkError ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500'}`}>
            {isSecurityError ? (
                <ShieldAlert size={16} className="text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
            ) : isNetworkError ? (
                <WifiOff size={16} className="text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
                <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <div>
                <p className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${isSecurityError ? 'text-purple-700 dark:text-purple-300' : isNetworkError ? 'text-orange-600 dark:text-orange-400' : 'text-red-500'}`}>
                    {error}
                </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-8">
          <div className="space-y-6">
            
            {isRegistering && (
              <div className="group animate-fade-in">
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-brand-purple">Nombre Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => handleInputChange(setName, e.target.value)}
                  placeholder="Tu Nombre"
                  className="w-full h-10 border-b-2 border-gray-100 dark:border-white/20 bg-transparent text-base font-bold text-brand-black dark:text-white placeholder-gray-200 dark:placeholder-gray-700 focus:outline-none focus:border-brand-black dark:focus:border-white transition-all rounded-none p-0"
                />
              </div>
            )}

            <div className="group">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-brand-purple">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                placeholder="usuario@email.com"
                required
                className="w-full h-10 border-b-2 border-gray-100 dark:border-white/20 bg-transparent text-base font-bold text-brand-black dark:text-white placeholder-gray-200 dark:placeholder-gray-700 focus:outline-none focus:border-brand-black dark:focus:border-white transition-all rounded-none p-0"
              />
            </div>

            <div className="group">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-brand-purple">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => handleInputChange(setPassword, e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 border-b-2 border-gray-100 dark:border-white/20 bg-transparent text-base font-bold text-brand-black dark:text-white placeholder-gray-200 dark:placeholder-gray-700 focus:outline-none focus:border-brand-black dark:focus:border-white transition-all rounded-none p-0"
              />
            </div>

            {isRegistering && (
              <div className="group animate-fade-in relative">
                <label className={`block text-[9px] font-black uppercase tracking-widest mb-1 transition-colors ${agencyError ? 'text-red-500' : 'text-gray-400 group-focus-within:text-brand-purple'}`}>
                  Código de Invitación
                </label>
                <div className="relative">
                    <input 
                      type="text" 
                      value={agencyCode}
                      onChange={(e) => handleInputChange(setAgencyCode, e.target.value)}
                      placeholder={contentLoading ? "Cargando sistema..." : "Código de acceso"}
                      disabled={contentLoading}
                      className={`w-full h-10 border-b-2 bg-transparent text-base font-bold text-brand-black dark:text-white placeholder-gray-200 dark:placeholder-gray-700 focus:outline-none transition-all rounded-none p-0 pr-8 ${agencyError ? 'border-red-500' : 'border-gray-100 dark:border-white/20 focus:border-brand-black dark:focus:border-white'}`}
                    />
                    {contentLoading && (
                        <div className="absolute right-0 top-2">
                            <Loader2 size={16} className="animate-spin text-brand-purple" />
                        </div>
                    )}
                </div>
                {agencyError && (
                    <span className="text-[9px] font-black text-red-500 uppercase mt-1 block animate-pulse">
                        {agencyError}
                    </span>
                )}
              </div>
            )}

          </div>

          <div className="pt-6 space-y-5">
            <Button 
                fullWidth 
                type="submit" 
                variant="black" 
                size="lg" 
                className={`shadow-xl shadow-black/20 dark:shadow-white/5 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-xs relative transition-all duration-300 ${isSuccess ? 'bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-400 text-white dark:text-white border-transparent' : ''}`} 
                disabled={isSubmitting || isSuccess || (isRegistering && contentLoading)}
            >
              {isSuccess ? (
                  <div className="flex items-center animate-fade-in">
                      <Check size={18} className="mr-2" />
                      ¡CONEXIÓN EXITOSA!
                  </div>
              ) : isSubmitting ? (
                  <div className="flex items-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin mr-2"></span>
                      {isRegistering ? 'CREANDO...' : 'INGRESANDO...'}
                  </div>
              ) : (
                  isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'
              )}
            </Button>
            
            <button 
              type="button"
              onClick={() => { setError(null); setIsRegistering(!isRegistering); setAgencyCode(''); setAgencyError(null); }}
              className="w-full text-center py-2 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest hover:text-brand-purple dark:hover:text-white transition-colors"
            >
              {isRegistering ? 'Cancelar Registro' : '¿Primera vez? Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="pb-6 text-center flex flex-col items-center gap-2">
         <button 
            onClick={() => setShowPrivacy(true)}
            className="text-[9px] font-bold text-gray-300 hover:text-brand-purple dark:hover:text-white transition-colors uppercase tracking-widest flex items-center"
         >
            <FileText size={10} className="mr-1" />
            Términos y Privacidad
         </button>
         <p className="text-[9px] font-bold text-gray-200 dark:text-gray-800 uppercase tracking-widest">
           Secure Access • v2.6.2
         </p>
      </div>

      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
};

export default Login;