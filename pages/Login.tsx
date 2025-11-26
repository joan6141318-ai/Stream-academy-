import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, user, loading } = useAuth();
  
  // Estados para manejar el formulario
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redireccionar si ya hay sesión iniciada
  React.useEffect(() => {
    if (user && !loading) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        if (!name.trim()) throw new Error("Ingresa tu nombre para continuar.");
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Credenciales incorrectas.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este correo ya está registrado.");
      } else if (err.code === 'auth/weak-password') {
        setError("La contraseña es muy débil (mínimo 6 caracteres).");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Error de conexión. Intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col h-full w-full bg-white px-8 pb-safe pt-safe overflow-y-auto scrollbar-hide">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center animate-fade-in">
        <div className="w-14 h-14 bg-brand-black flex items-center justify-center rounded-sm mb-6 shadow-xl shadow-brand-purple/20">
            <Zap className="text-white w-7 h-7" strokeWidth={2} />
        </div>
        
        <div className="space-y-2 mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-brand-black leading-[0.9]">
            STREAM<br/>AGENCY
          </h1>
          <div className="h-1 w-10 bg-brand-purple"></div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.25em] pt-2">
            {isRegistering ? 'Registro de Emisor' : 'Acceso a Plataforma'}
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 flex items-center animate-fade-in">
            <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0" />
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">{error}</p>
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu Nombre"
                  className="w-full h-10 border-b-2 border-gray-100 bg-transparent text-base font-bold text-brand-black placeholder-gray-200 focus:outline-none focus:border-brand-black transition-all rounded-none p-0"
                />
              </div>
            )}

            <div className="group">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-brand-purple">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@email.com"
                required
                className="w-full h-10 border-b-2 border-gray-100 bg-transparent text-base font-bold text-brand-black placeholder-gray-200 focus:outline-none focus:border-brand-black transition-all rounded-none p-0"
              />
            </div>

            <div className="group">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-brand-purple">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 border-b-2 border-gray-100 bg-transparent text-base font-bold text-brand-black placeholder-gray-200 focus:outline-none focus:border-brand-black transition-all rounded-none p-0"
              />
            </div>
          </div>

          <div className="pt-6 space-y-5">
            <Button fullWidth type="submit" variant="black" size="lg" className="shadow-xl shadow-black/20 text-xs" disabled={isSubmitting}>
              {isSubmitting ? 'CARGANDO...' : (isRegistering ? 'CREAR CUENTA' : 'INGRESAR')}
            </Button>
            
            <button 
              type="button"
              onClick={() => { setError(null); setIsRegistering(!isRegistering); }}
              className="w-full text-center py-2 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-brand-purple transition-colors"
            >
              {isRegistering ? 'Cancelar Registro' : '¿Primera vez? Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="pb-6 text-center">
         <p className="text-[9px] font-bold text-gray-200 uppercase tracking-widest">
           Secure Access • v1.2
         </p>
      </div>
    </div>
  );
};

export default Login;