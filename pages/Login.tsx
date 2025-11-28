import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, AlertCircle, WifiOff, Check, Shield, User } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth(); 
  
  // Estados para manejar el formulario
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Nuevo estado para el Rol
  const [role, setRole] = useState<'streamer' | 'admin'>('streamer');

  // Limpiar errores al escribir
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setError(null);
    setIsNetworkError(false);
    setter(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsNetworkError(false);
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        if (!name.trim()) throw new Error("Ingresa tu nombre para continuar.");
        await register(email, password, name);
        // ÉXITO REGISTRO -> Siempre va a Onboarding porque es nuevo
        setIsSuccess(true);
        navigate('/onboarding', { replace: true });
      } else {
        await login(email, password);
        // ÉXITO LOGIN -> Verificar estado del perfil
        setIsSuccess(true);
        
        if (role === 'admin') {
            // Si intenta entrar como admin, lo mandamos al selector
            // (La protección de ruta AdminRoute verificará si realmente es admin después)
            navigate('/admin/selection', { replace: true });
        } else {
            // Lógica inteligente para Streamers:
            // Revisamos en DB si ya completó el onboarding
            if (auth.currentUser && db) {
                try {
                    const userDocRef = doc(db, "users", auth.currentUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    
                    if (userDoc.exists() && userDoc.data().isOnboardingComplete) {
                        // YA configuró su perfil -> Al Home directo
                        navigate('/home', { replace: true });
                    } else {
                        // NO ha configurado -> Al Onboarding
                        navigate('/onboarding', { replace: true });
                    }
                } catch (fetchError) {
                    console.error("Error fetching user profile post-login", fetchError);
                    // Si falla la lectura, por seguridad mandamos a onboarding/home por defecto
                    navigate('/onboarding', { replace: true });
                }
            } else {
                navigate('/onboarding', { replace: true });
            }
        }
      }
      
    } catch (err: any) {
      console.error("Firebase Auth Error:", err.code, err.message);
      setIsSuccess(false);
      setIsSubmitting(false);
      
      // Manejo de errores
      const errorCode = err.code || '';
      const errorMessage = err.message || '';

      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        setError("Usuario o contraseña incorrectos. Verifica tus datos.");
      } else if (errorCode === 'auth/email-already-in-use') {
        setError("Este correo ya está registrado. Cambiando a inicio de sesión...");
        setTimeout(() => {
            setIsRegistering(false);
            setError(null);
        }, 2000);
      } else if (errorCode === 'auth/weak-password') {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (errorCode === 'auth/operation-not-allowed') {
        setError("Error: Debes habilitar 'Correo/Contraseña' en la consola de Firebase.");
      } else if (errorCode === 'auth/configuration-not-found') {
        setError("Error: Configuración incompleta. Revisa la consola de Firebase.");
      } else if (errorCode === 'auth/network-request-failed' || errorMessage.includes('network-request-failed')) {
        setError("Error de conexión: Firebase bloqueó la solicitud. Revisa tu internet o los dominios autorizados.");
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
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center animate-fade-in">
        <div className="w-14 h-14 bg-brand-black dark:bg-white flex items-center justify-center rounded-sm mb-6 shadow-xl shadow-brand-purple/20">
            <Zap className="text-white dark:text-black w-7 h-7" strokeWidth={2} />
        </div>
        
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-brand-black dark:text-white leading-[0.9]">
            STREAM<br/>AGENCY
          </h1>
          <div className="h-1 w-10 bg-brand-purple"></div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.25em] pt-2">
            {isRegistering ? 'Registro de Emisor' : 'Acceso a Plataforma'}
          </p>
        </div>

        {/* SELECTOR DE ROL (ADMIN / EMISOR) */}
        {!isRegistering && (
            <div className="w-full bg-gray-100 dark:bg-white/5 p-1 rounded-lg mb-8 flex relative">
                <button
                    onClick={() => setRole('admin')}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-300 z-10 ${role === 'admin' ? 'text-brand-black dark:text-black shadow-sm bg-white dark:bg-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                    <Shield size={12} className="mr-1.5" />
                    Admin
                </button>
                <button
                    onClick={() => setRole('streamer')}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-300 z-10 ${role === 'streamer' ? 'text-brand-black dark:text-black shadow-sm bg-white dark:bg-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                    <User size={12} className="mr-1.5" />
                    Emisor
                </button>
            </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className={`mb-6 p-4 border-l-4 flex items-start animate-fade-in ${isNetworkError ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500'}`}>
            {isNetworkError ? <WifiOff size={16} className="text-orange-500 mr-2 flex-shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />}
            <div>
                <p className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${isNetworkError ? 'text-orange-600 dark:text-orange-400' : 'text-red-500'}`}>{error}</p>
                {isNetworkError && (
                    <p className="text-[9px] text-orange-800 dark:text-orange-300 mt-1 leading-snug">
                        El dominio actual no está autorizado en Firebase. Agrégalo en Authentication &gt; Configuración &gt; Dominios autorizados.
                    </p>
                )}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="w-full space-y-8">
          <div className="space-y-6">
            
            {/* Campo Nombre (Solo visible al registrarse) */}
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
                placeholder={role === 'admin' ? "admin@agencia.com" : "usuario@email.com"}
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
          </div>

          <div className="pt-6 space-y-5">
            <Button 
                fullWidth 
                type="submit" 
                variant="black" 
                size="lg" 
                className={`shadow-xl shadow-black/20 dark:shadow-white/5 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-xs relative transition-all duration-300 ${isSuccess ? 'bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-400 text-white dark:text-white border-transparent' : ''}`} 
                disabled={isSubmitting || isSuccess}
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
                  isRegistering ? 'CREAR CUENTA' : (role === 'admin' ? 'INGRESAR COMO ADMIN' : 'INICIAR SESIÓN')
              )}
            </Button>
            
            <button 
              type="button"
              onClick={() => { setError(null); setIsRegistering(!isRegistering); }}
              className="w-full text-center py-2 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest hover:text-brand-purple dark:hover:text-white transition-colors"
            >
              {isRegistering ? 'Cancelar Registro' : '¿Primera vez? Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="pb-6 text-center">
         <p className="text-[9px] font-bold text-gray-200 dark:text-gray-800 uppercase tracking-widest">
           Secure Access • v1.8
         </p>
      </div>
    </div>
  );
};

export default Login;