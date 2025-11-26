import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, AlertCircle, ShieldCheck, DollarSign, Filter, ArrowUpRight } from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Header } from '../components/Header';

const AdminDashboard: React.FC = () => {
  const useNavigateHook = useNavigate();
  const [totalUsers, setTotalUsers] = useState<string>('...');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Real Data from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!db) return;
        
        // 1. Count Total Users
        const coll = collection(db, "users");
        const snapshot = await getCountFromServer(coll);
        setTotalUsers(snapshot.data().count.toString());
        
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        setTotalUsers("ERR");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Mock Data for other stats (until those features are built)
  const stats = [
    { title: "Usuarios Totales", value: totalUsers, change: "Registrados", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Semillas (Mes)", value: "45.2M", change: "+8.5%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Apelaciones", value: "18", change: "Pendientes", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Ingresos Est.", value: "$12,450", change: "USD", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const recentAppeals = [
    { user: "Sarah Jenkins", id: "AGENCY-9921", status: "Pendiente", type: "Bloqueo A", time: "2h" },
    { user: "Mike T.", id: "AGENCY-1102", status: "Revisión", type: "Bloqueo B", time: "5h" },
    { user: "Luna Star", id: "AGENCY-4420", status: "Aprobado", type: "Apelación", time: "1d" },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      <Header title="Panel Admin" showBack onBack={() => useNavigateHook('/settings')} />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-24">
        
        {/* Welcome Admin */}
        <div className="mt-6 mb-8 px-2">
            <span className="text-[10px] font-black text-brand-purple bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-sm uppercase tracking-wider mb-2 inline-block">
                Vista de Agencia
            </span>
            <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none mb-2">
                Dashboard<br/>General
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Resumen de rendimiento y gestión de emisores.
            </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
            {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div key={idx} className="bg-white dark:bg-brand-dark-card p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <Icon size={18} className={stat.color} />
                            </div>
                            <span className={`text-[10px] font-bold ${stat.change.includes('+') ? 'text-green-500' : 'text-gray-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-brand-black dark:text-white tracking-tight">
                            {isLoading && idx === 0 ? <span className="animate-pulse">...</span> : stat.value}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.title}</p>
                    </div>
                )
            })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Gestión Rápida</h3>
            <div className="grid grid-cols-1 gap-3">
                <button className="bg-white dark:bg-brand-dark-card p-4 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all">
                    <div className="flex items-center space-x-4">
                        <div className="bg-brand-black dark:bg-white text-white dark:text-black p-2 rounded-lg">
                            <Users size={20} />
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-black text-brand-black dark:text-white uppercase block">Gestionar Usuarios</span>
                            <span className="text-[10px] text-gray-400">Ver lista, editar roles, expulsar</span>
                        </div>
                    </div>
                    <ArrowUpRight size={16} className="text-gray-300" />
                </button>

                <button className="bg-white dark:bg-brand-dark-card p-4 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all">
                    <div className="flex items-center space-x-4">
                        <div className="bg-rose-500 text-white p-2 rounded-lg">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-black text-brand-black dark:text-white uppercase block">Centro de Apelaciones</span>
                            <span className="text-[10px] text-gray-400">18 solicitudes pendientes</span>
                        </div>
                    </div>
                    <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">18</div>
                </button>
            </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Actividad Reciente</h3>
                <Filter size={14} className="text-gray-400" />
            </div>
            <div>
                {recentAppeals.map((item, idx) => (
                    <div key={idx} className="px-5 py-4 border-b border-gray-50 dark:border-white/5 last:border-0 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-black text-gray-500">
                                {item.user.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-brand-black dark:text-white">{item.user}</p>
                                <p className="text-[9px] text-gray-400 font-medium">{item.type} • {item.time}</p>
                            </div>
                        </div>
                        <div className={`text-[9px] font-bold uppercase px-2 py-1 rounded-sm ${
                            item.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-600' :
                            item.status === 'Revisión' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                            {item.status}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-white/5 text-center">
                <span className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">Ver todo el historial</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;