
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, addDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Banner, TrainingModule, HomeConfig, PKSchedule, PKRequest, ModuleStyle } from '../types';
import { TRAINING_MODULES as INITIAL_MODULES } from '../constants';

// --- CRYPTO UTILITY ---
export const hashString = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Datos iniciales de Banners para sembrar la DB si está vacía
const INITIAL_BANNERS: Banner[] = [
    {
      id: 'banner-5',
      tag: "GAMING",
      tagColor: "bg-green-400 text-black",
      title: "JUEGA DIVIÉRTETE Y APRENDE",
      subtitle: "Juega y diviértete mientras mejoras tus habilidades.",
      gradient: "from-indigo-600 via-purple-600 to-fuchsia-600",
      image: "https://picsum.photos/1080/430?random=banner5",
      shadow: "shadow-purple-500/20",
      link: '/tools/gamer',
      imagePosition: 'object-center'
    },
    {
      id: 'banner-1',
      tag: "NUEVO",
      tagColor: "bg-white text-brand-black",
      title: "TORNEO PK INTER-AGENCIAS",
      subtitle: "Participa este fin de semana y gana bonos dobles.",
      gradient: "from-pink-600 via-purple-600 to-indigo-600",
      image: "https://picsum.photos/1080/430?random=banner1",
      shadow: "shadow-pink-500/20",
      imagePosition: 'object-center'
    },
    {
      id: 'banner-2',
      tag: "RECOMPENSA",
      tagColor: "bg-yellow-400 text-black",
      title: "BONO CRECIENTE ACTIVADO",
      subtitle: "Completa 40 horas y recibe +$50 USD extra.",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      image: "https://picsum.photos/1080/430?random=banner2",
      shadow: "shadow-emerald-500/20",
      imagePosition: 'object-center'
    },
    {
      id: 'banner-3',
      tag: "MASTERCLASS",
      tagColor: "bg-brand-black text-white",
      title: "TALLER DE ILUMINACIÓN",
      subtitle: "Mejora la calidad de tu stream hoy mismo.",
      gradient: "from-orange-500 via-red-500 to-pink-600",
      image: "https://picsum.photos/1080/430?random=banner3",
      shadow: "shadow-orange-500/20",
      imagePosition: 'object-center'
    },
    {
      id: 'banner-4',
      tag: "RANKING",
      tagColor: "bg-blue-500 text-white",
      title: "TOP 10 EMISORES DEL MES",
      subtitle: "Consulta la tabla de posiciones actualizada.",
      gradient: "from-blue-600 via-indigo-600 to-violet-600",
      image: "https://picsum.photos/1080/430?random=banner4",
      shadow: "shadow-blue-500/20",
      imagePosition: 'object-center'
    }
];

// Helper para asignar estilos iniciales a los módulos si no los tienen
const getInitialStyle = (id: string): ModuleStyle => {
    switch (id) {
      case 'bigo-live': return { iconName: 'PlayCircle', bg: 'bg-blue-600', shadow: 'shadow-blue-600/40', imagePosition: 'object-center' };
      case 'pagos': return { iconName: 'DollarSign', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40', imagePosition: 'object-center' };
      case 'bloqueos': return { iconName: 'Shield', bg: 'bg-rose-600', shadow: 'shadow-rose-600/40', imagePosition: 'object-center' };
      case 'pk': return { iconName: 'Zap', bg: 'bg-orange-500', shadow: 'shadow-orange-500/40', imagePosition: 'object-center' };
      case 'bonos': return { iconName: 'Star', bg: 'bg-amber-500', shadow: 'shadow-amber-500/40', imagePosition: 'object-center' };
      case 'seguridad': return { iconName: 'Lock', bg: 'bg-slate-800', shadow: 'shadow-slate-800/40', imagePosition: 'object-center' };
      case 'funciones': return { iconName: 'Smartphone', bg: 'bg-indigo-600', shadow: 'shadow-indigo-600/40', imagePosition: 'object-center' };
      case 'live-data': return { iconName: 'BarChart2', bg: 'bg-purple-600', shadow: 'shadow-purple-600/40', imagePosition: 'object-center' };
      default: return { iconName: 'PlayCircle', bg: 'bg-gray-800', shadow: 'shadow-gray-800/40', imagePosition: 'object-center' };
    }
};

// Default Hash for 'moon': a43c1b0aa53a0c908810c03ab1d7cb9922c2a05d605c567839356b20677275c5
const INITIAL_HOME_CONFIG: HomeConfig = {
    welcomeText: "Bienvenido de nuevo,",
    modulesTitle: "Módulos de Capacitación",
    modulesSubtitle: "Elige el módulo relacionado con tu duda",
    agencyCodeHash: "a43c1b0aa53a0c908810c03ab1d7cb9922c2a05d605c567839356b20677275c5", 
    maintenanceMode: 'off'
};

// Initial PK Data Structure (Empty Slots)
const INITIAL_PK_SCHEDULE: PKSchedule = {
    potential: [
        { id: 'p1', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
        { id: 'p2', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
        { id: 'p3', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
        { id: 'p4', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
        { id: 'p5', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
    ],
    supersmash: [
        { id: 's1', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
        { id: 's2', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
        { id: 's3', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
        { id: 's4', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
        { id: 's5', time: '08:00 - 08:15 PM', user1: '', id1: '', user2: '', id2: '', confirmed: false },
    ]
};

interface ContentContextType {
  banners: Banner[];
  modules: TrainingModule[];
  homeConfig: HomeConfig;
  pkSchedule: PKSchedule;
  pkRequests: PKRequest[];
  loading: boolean;
  updateBanner: (id: string, data: Partial<Banner>) => Promise<void>;
  updateModule: (id: string, data: Partial<TrainingModule>) => Promise<void>;
  updateHomeConfig: (data: Partial<HomeConfig>) => Promise<void>;
  updatePKSchedule: (data: PKSchedule) => Promise<void>;
  addPKRequest: (date: string, bigoId: string, userId: string) => Promise<void>;
  updatePKRequestStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  deletePKRequest: (id: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [modules, setModules] = useState<TrainingModule[]>(INITIAL_MODULES.map(m => {
       const initStyle = getInitialStyle(m.id);
       return {...m, style: initStyle};
  }));
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(INITIAL_HOME_CONFIG);
  const [pkSchedule, setPkSchedule] = useState<PKSchedule>(INITIAL_PK_SCHEDULE);
  const [pkRequests, setPkRequests] = useState<PKRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }

    // 1. Listen Banners
    const unsubBanners = onSnapshot(collection(db, "banners"), async (snapshot) => {
        if (snapshot.empty) {
            try {
                for (const b of INITIAL_BANNERS) {
                    await setDoc(doc(db, "banners", String(b.id)), b);
                }
            } catch (e) { console.warn("Seeding Banners failed"); }
        } else {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
            setBanners(list);
        }
    }, (error) => console.warn("Banners Error:", error.code));

    // 2. Listen Modules
    const unsubModules = onSnapshot(collection(db, "modules"), async (snapshot) => {
        if (snapshot.empty) {
             try {
                 for (const m of INITIAL_MODULES) {
                     const styledModule = { ...m, style: getInitialStyle(m.id) };
                     await setDoc(doc(db, "modules", m.id), styledModule);
                 }
             } catch (e) { console.warn("Seeding Modules failed"); }
        } else {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule));
            setModules(list);
        }
    }, (error) => console.warn("Modules Error:", error.code));

    // 3. Listen Home Config
    const unsubConfig = onSnapshot(doc(db, "config", "home"), (docSnap) => {
        if (docSnap.exists()) {
            setHomeConfig(docSnap.data() as HomeConfig);
        } else {
             setDoc(doc(db, "config", "home"), INITIAL_HOME_CONFIG).catch(e => console.warn("Auto-seed config failed", e));
        }
    }, (error) => console.warn("Config Error", error.code));

    // 4. Listen PK Schedule (ROBUST HANDLER)
    const unsubPK = onSnapshot(doc(db, "schedules", "main"), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data() as PKSchedule;
            // Ensure arrays always exist to prevent UI crashes if DB is partial
            const safeData = {
                potential: data.potential || INITIAL_PK_SCHEDULE.potential,
                supersmash: data.supersmash || INITIAL_PK_SCHEDULE.supersmash
            };
            setPkSchedule(safeData);
        } else {
            setDoc(doc(db, "schedules", "main"), INITIAL_PK_SCHEDULE).catch(e => console.warn("Auto-seed PK failed", e));
            setPkSchedule(INITIAL_PK_SCHEDULE);
        }
    }, (error) => console.warn("PK Schedule Error", error.code));

    // 5. Listen PK Requests
    const unsubRequests = onSnapshot(
        query(collection(db, "pk_requests")), 
        (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PKRequest));
            list.sort((a, b) => b.createdAt - a.createdAt);
            setPkRequests(list);
        },
        (error) => console.warn("Requests Error", error.code)
    );

    setLoading(false);

    return () => {
        unsubBanners();
        unsubModules();
        unsubConfig();
        unsubPK();
        unsubRequests();
    };
  }, []);

  const updateBanner = async (id: string, data: Partial<Banner>) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    if(!db) return;
    try { await updateDoc(doc(db, "banners", String(id)), data); } catch (e) { console.error(e); }
  };

  const updateModule = async (id: string, data: Partial<TrainingModule>) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    if(!db) return;
    try { await updateDoc(doc(db, "modules", id), data); } catch (e) { console.error(e); }
  };

  const updateHomeConfig = async (data: Partial<HomeConfig>) => {
      setHomeConfig(prev => ({ ...prev, ...data }));
      if (!db) return;
      try { await setDoc(doc(db, "config", "home"), data, { merge: true }); } catch (e) { console.error(e); }
  };

  const updatePKSchedule = async (data: PKSchedule) => {
      setPkSchedule(data);
      if (!db) return;
      try { await setDoc(doc(db, "schedules", "main"), data); } catch (e) { console.error(e); }
  };

  const addPKRequest = async (date: string, bigoId: string, userId: string) => {
      if (!db) return;
      try {
          await addDoc(collection(db, "pk_requests"), {
              date,
              bigoId,
              userId,
              status: 'pending',
              createdAt: Date.now()
          });
      } catch (e) { console.error("Error adding PK request", e); }
  };

  const updatePKRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
      if (!db) return;
      try {
          await updateDoc(doc(db, "pk_requests", id), { status });
      } catch (e) { console.error("Error updating PK request", e); }
  };

  const deletePKRequest = async (id: string) => {
      if (!db) return;
      try {
          await deleteDoc(doc(db, "pk_requests", id));
      } catch (e) { console.error("Error removing PK request", e); }
  };

  return (
    <ContentContext.Provider value={{ 
        banners, modules, homeConfig, pkSchedule, pkRequests, loading, 
        updateBanner, updateModule, updateHomeConfig, updatePKSchedule, 
        addPKRequest, updatePKRequestStatus, deletePKRequest 
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
