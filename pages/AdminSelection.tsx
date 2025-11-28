import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Edit3, ArrowRight, LayoutDashboard, PenTool } from 'lucide-react';
import { Header } from '../components/Header';

const AdminSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black transition-colors duration-300">
      <Header title="Acceso Administrativo" showBack onBack={() => navigate('/home')} />
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-safe pb-safe">
        
        <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase tracking-tighter mb-2">
                Panel de Control
            </h1>
            <p className="text-sm text-gray-500 font-medium">
                Selecciona el modo de gestión
            </p>
        </div>

        <div className="w-full max-w-md space-y-6">
            {/* OPCIÓN 1: MODO ADMINISTRADOR */}
            <button 
                onClick={() => navigate('/admin/dashboard')}
                className="w-full bg-brand-black dark:bg-brand-dark-card border border-gray-100 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group active:scale-[0.98] transition-all duration-300 text-left shadow-xl"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-brand-purple/30 transition-colors"></div>
                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <div className="bg-brand-purple w-10 h-10 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-brand-purple/30">
                            <LayoutDashboard className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">
                            Modo Administrador
                        </h2>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[200px]">
                            Gestión de usuarios, seguridad, alertas y eventos PK.
                        </p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="text-white" size={20} />
                    </div>
                </div>
            </button>

            {/* OPCIÓN 2: MODO EDITOR */}
            <button 
                onClick={() => navigate('/admin/editor')}
                className="w-full bg-white dark:bg-brand-dark-card border border-gray-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group active:scale-[0.98] transition-all duration-300 text-left shadow-xl"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors"></div>
                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                            <PenTool className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl font-black text-brand-black dark:text-white uppercase tracking-tight mb-1">
                            Modo Editor
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[200px]">
                            Edición visual de contenido, banners y módulos sin código.
                        </p>
                    </div>
                    <div className="bg-brand-black/5 dark:bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="text-brand-black dark:text-white" size={20} />
                    </div>
                </div>
            </button>
        </div>

        <p className="mt-12 text-[10px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest">
            StreamAgency Secure Access v2.0
        </p>
      </div>
    </div>
  );
};

export default AdminSelection;