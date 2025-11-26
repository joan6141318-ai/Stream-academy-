import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [id, setId] = useState('AGENCY-8821');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(id); // Initialize session with this ID
    navigate('/home');
  };

  return (
    <div className="flex flex-col h-full w-full bg-white px-6 pb-safe pt-safe overflow-y-auto scrollbar-hide">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center animate-fade-in mt-10">
        <div className="w-16 h-16 bg-brand-black flex items-center justify-center rounded-sm mb-6 shadow-xl shadow-brand-purple/20">
            <Zap className="text-white w-8 h-8" strokeWidth={2} />
        </div>
        
        <div className="space-y-2 mb-12">
          <h1 className="text-5xl font-black tracking-tighter text-brand-black leading-[0.9]">
            STREAM<br/>AGENCY
          </h1>
          <div className="h-1 w-12 bg-brand-purple"></div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] pt-2">
            Plataforma de Capacitación
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="w-full space-y-8">
          <div className="space-y-5">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-brand-purple transition-colors">ID de Streamer</label>
              <input 
                type="text" 
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full h-14 border-b-2 border-gray-100 bg-transparent text-lg font-bold text-brand-black placeholder-gray-200 focus:outline-none focus:border-brand-black transition-all rounded-none p-0"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-brand-purple transition-colors">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full h-14 border-b-2 border-gray-100 bg-transparent text-lg font-bold text-brand-black placeholder-gray-200 focus:outline-none focus:border-brand-black transition-all rounded-none p-0"
              />
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <Button fullWidth type="submit" variant="black" size="lg" className="shadow-lg shadow-black/20">
              ACCEDER
            </Button>
            <p className="text-center text-xs font-medium text-gray-400">
              v1.0.4 • Agency Mobile
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;