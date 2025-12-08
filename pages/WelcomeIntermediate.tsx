import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Zap, Calendar, ClipboardCheck, MessageCircle, PlayCircle, ArrowRight, Check, Star, ArrowUpRight, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WelcomeIntermediate: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] text-brand-black px-6 pt-safe pb-safe relative overflow-hidden font-sans">
      
      {/* Header Minimalista */}
      <div className="flex justify-between items-center py-6 animate-fade-in z-10 relative">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-brand-black rounded-lg flex items-center justify-center shadow-lg shadow-black/20">
                <LayoutGrid size={16} className="text-white" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.15em]">Streamers Academy</span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-white border border-gray-100 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm active:scale-95 text-gray-400 hover:text-black"
          >
              <LogOut size={16} strokeWidth={2.5} />
          </button>
      </div>

      {/* Profile Section - Clean & Bold */}
      <div className="flex flex-col items-center mb-10 animate-fade-in z-10 relative">
          {/* Avatar con anillo decorativo y badge */}
          <div className="relative mb-5 group cursor-pointer">
               {/* Anillo de estado animado */}
               <div className="absolute -inset-3 rounded-full border border-dashed border-gray-300 animate-[spin_12s_linear_infinite] opacity-50"></div>
               
               {/* Contenedor Avatar */}
               <div className="w-28 h-28 rounded-full p-1.5 bg-white shadow-2xl shadow-gray-200">
                   <img 
                    src={user.avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105" 
                   />
               </div>
               
               {/* Badge Verificado */}
               <div className="absolute bottom-1 right-1 bg-brand-black text-white p-1.5 rounded-full border-4 border-[#FAFAFA] shadow-sm flex items-center justify-center">
                   <Check size={12} strokeWidth={4} />
               </div>
          </div>
          
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-center leading-none text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">
              {user.name}
          </h1>
          
          <div className="flex items-center space-x-3 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                  {user.role || 'Streamer'}
              </span>
              <div className="w-px h-3 bg-gray-200"></div>
              <div className="flex items-center text-[10px] font-bold text-brand-black">
                  <Star size={10} className="fill-black mr-1.5" />
                  5.0
              </div>
          </div>
      </div>

      {/* Grid de Módulos */}
      <div className="flex-1 grid grid-cols-2 gap-4 mb-6 content-start animate-slide-up pb-10 z-10 relative">
          
          {/* Main Card: Capacítate (Black) */}
          <button 
            onClick={() => navigate('/home')}
            className="col-span-2 bg-brand-black text-white p-8 rounded-[2rem] relative overflow-hidden group shadow-2xl shadow-black/20 active:scale-[0.98] transition-all duration-300 text-left h-48 flex flex-col justify-between border-[5px] border-[#1A1A1A]"
          >
              <div className="flex justify-between items-start w-full relative z-10">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                      <Zap className="text-white" size={24} fill="currentColor" />
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full border border-white/5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">Principal</span>
                  </div>
              </div>

              <div className="relative z-10">
                  <h3 className="text-3xl font-black uppercase leading-none mb-1 tracking-tight">Capacítate</h3>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">Ingresar al Campus Virtual</p>
              </div>
              
              {/* Decor Effects */}
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                      <ArrowRight size={20} />
                  </div>
              </div>
              <Zap className="absolute -bottom-4 -right-4 text-white/5 rotate-[-15deg] group-hover:scale-110 group-hover:rotate-0 transition-all duration-500" size={160} />
          </button>

          {/* Card 1: Calendario de PK (Gris con Marco Blanco) */}
          <button 
            onClick={() => navigate('/pk-calendar')}
            className="bg-gray-200 dark:bg-[#1A1A1A] p-5 rounded-[2rem] flex flex-col justify-between aspect-square active:scale-[0.96] transition-all group relative overflow-hidden border-[5px] border-white dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none"
          >
              <div className="flex justify-between items-start w-full relative z-10">
                  <div className="w-10 h-10 bg-white dark:bg-black/40 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <Calendar size={18} strokeWidth={2.5} className="text-brand-black dark:text-white" />
                  </div>
                  <ArrowUpRight size={18} className="text-gray-400 group-hover:text-brand-black dark:group-hover:text-white transition-colors" />
              </div>
              
              <div className="relative z-10 text-left">
                  <span className="text-sm font-black uppercase leading-tight block mb-0.5 text-brand-black dark:text-white">Calendario<br/>de PK</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide group-hover:text-brand-purple transition-colors">Eventos & Batallas</span>
              </div>
              
              {/* Decor */}
              <Calendar className="absolute -right-5 -bottom-5 text-white dark:text-white/5 rotate-[-15deg] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" size={90} strokeWidth={1.5} />
          </button>

          {/* Card 2: Evaluaciones (Negro Puro Minimalista) */}
          <button 
            onClick={() => alert('Próximamente: Exámenes')}
            className="bg-black text-white p-5 rounded-[2rem] flex flex-col justify-between aspect-square shadow-xl shadow-black/20 active:scale-[0.96] transition-all group relative overflow-hidden border-[5px] border-[#1A1A1A]"
          >
              <div className="flex justify-between items-start w-full relative z-10">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300 backdrop-blur-sm">
                      <ClipboardCheck size={18} strokeWidth={2.5} />
                  </div>
                  <ArrowUpRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
              </div>
              
              <div className="relative z-10 text-left">
                  <span className="text-sm font-black uppercase leading-tight block mb-0.5 text-white">Evaluaciones<br/>Mensuales</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide group-hover:text-white transition-colors">Test de Nivel</span>
              </div>
              
              <ClipboardCheck className="absolute -right-5 -bottom-5 text-white/5 rotate-[-15deg] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" size={90} strokeWidth={1.5} />
          </button>
          
           {/* Card 3: Tu Opinión (Naranja Minimalista) */}
           <button 
            onClick={() => alert('Próximamente: Buzón')}
            className="bg-orange-500 text-white p-5 rounded-[2rem] flex flex-col justify-between aspect-square shadow-xl shadow-orange-500/20 active:scale-[0.96] transition-all group relative overflow-hidden border-[5px] border-orange-400"
           >
              <div className="flex justify-between items-start w-full relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-orange-600 transition-colors duration-300 backdrop-blur-sm border border-white/10">
                      <MessageCircle size={18} strokeWidth={2.5} />
                  </div>
                  <ArrowUpRight size={18} className="text-white/60 group-hover:text-white transition-colors" />
              </div>

               <div className="relative z-10 text-left">
                  <span className="text-sm font-black uppercase leading-tight block mb-0.5 text-white">Tu Opinión<br/>Cuenta</span>
                  <span className="text-[9px] font-bold text-white/80 uppercase tracking-wide group-hover:text-white transition-colors">Sugerencias</span>
              </div>
              
              <MessageCircle className="absolute -right-5 -bottom-5 text-white/10 rotate-[-15deg] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" size={90} strokeWidth={1.5} />
          </button>

           {/* Card 4: Conoce la App (Morado Minimalista) */}
           <button 
            onClick={() => navigate('/app-tour')}
            className="bg-brand-purple text-white p-5 rounded-[2rem] flex flex-col justify-between aspect-square shadow-xl shadow-purple-500/20 active:scale-[0.96] transition-all group relative overflow-hidden border-[5px] border-violet-500"
           >
              <div className="flex justify-between items-start w-full relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-brand-purple transition-colors duration-300 backdrop-blur-sm border border-white/10">
                      <PlayCircle size={18} strokeWidth={2.5} />
                  </div>
                  <ArrowUpRight size={18} className="text-white/60 group-hover:text-white transition-colors" />
              </div>

               <div className="relative z-10 text-left">
                  <span className="text-sm font-black uppercase leading-tight block mb-0.5 text-white">Conoce<br/>la App</span>
                  <span className="text-[9px] font-bold text-white/80 uppercase tracking-wide group-hover:text-white transition-colors">Tutoriales</span>
              </div>
              
              <PlayCircle className="absolute -right-5 -bottom-5 text-white/10 rotate-[-15deg] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" size={90} strokeWidth={1.5} />
          </button>

      </div>
      
      <div className="pb-4 text-center z-10 relative">
          <div className="inline-flex items-center space-x-1.5 bg-gray-100 px-3 py-1 rounded-full">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  Sistema Operativo v2.0
               </p>
          </div>
      </div>

    </div>
  );
};

export default WelcomeIntermediate;