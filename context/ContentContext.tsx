import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Banner, TrainingModule, HomeConfig } from '../types';
import { TRAINING_MODULES as INITIAL_MODULES } from '../constants';

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
const getInitialStyle = (id: string) => {
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

const INITIAL_HOME_CONFIG: HomeConfig = {
    welcomeText: "Bienvenido de nuevo,",
    modulesTitle: "Módulos de Capacitación",
    modulesSubtitle: "Elige el módulo relacionado con tu duda"
};

interface ContentContextType {
  banners: Banner[];
  modules: TrainingModule[];
  homeConfig: HomeConfig;
  loading: boolean;
  updateBanner: (id: string, data: Partial<Banner>) => Promise<void>;
  updateModule: (id: string, data: Partial<TrainingModule>) => Promise<void>;
  updateHomeConfig: (data: Partial<HomeConfig>) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializamos con datos estáticos para que la app siempre tenga contenido
  // incluso si Firebase falla o no tiene permisos.
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [modules, setModules] = useState<TrainingModule[]>(INITIAL_MODULES.map(m => {
       // @ts-ignore
       const initStyle = getInitialStyle(m.id);
       return {...m, style: initStyle};
  }));
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(INITIAL_HOME_CONFIG);
  const [loading, setLoading] = useState(true);

  // Inicializar Datos y Escuchar Cambios
  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }

    // 1. Listen Banners
    const unsubBanners = onSnapshot(collection(db, "banners"), async (snapshot) => {
        if (snapshot.empty) {
            // Seed DB if empty (Intentar solo si hay permisos)
            console.log("Seeding Banners...");
            try {
                for (const b of INITIAL_BANNERS) {
                    await setDoc(doc(db, "banners", String(b.id)), b);
                }
            } catch (e) {
                console.warn("Seeding failed (Permission Denied), using static data.");
            }
        } else {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
            setBanners(list);
        }
    }, (error) => {
        // Callback de error para evitar que la app explote por permisos
        console.warn("Firestore Banner Error (using offline data):", error.code);
        // Mantenemos los datos iniciales
    });

    // 2. Listen Modules
    const unsubModules = onSnapshot(collection(db, "modules"), async (snapshot) => {
        if (snapshot.empty) {
             console.log("Seeding Modules...");
             try {
                 for (const m of INITIAL_MODULES) {
                     // @ts-ignore
                     const styledModule = { ...m, style: getInitialStyle(m.id) };
                     await setDoc(doc(db, "modules", m.id), styledModule);
                 }
             } catch (e) {
                 console.warn("Seeding failed (Permission Denied), using static data.");
             }
        } else {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule));
            setModules(list);
        }
    }, (error) => {
        // Callback de error
        console.warn("Firestore Module Error (using offline data):", error.code);
        // Mantenemos los datos iniciales
    });

    // 3. Listen Home Config
    const unsubConfig = onSnapshot(doc(db, "config", "home"), (docSnap) => {
        if (docSnap.exists()) {
            setHomeConfig(docSnap.data() as HomeConfig);
        } else {
            // Si no existe, intentar crearlo con valores por defecto
             setDoc(doc(db, "config", "home"), INITIAL_HOME_CONFIG).catch(e => console.warn("Auto-seed config failed", e));
        }
    }, (error) => {
        console.warn("Firestore Config Error", error.code);
    });

    setLoading(false);

    return () => {
        unsubBanners();
        unsubModules();
        unsubConfig();
    };
  }, []);

  const updateBanner = async (id: string, data: Partial<Banner>) => {
    // 1. Actualización Optimista
    setBanners(prevBanners => 
        prevBanners.map(banner => 
            banner.id === id ? { ...banner, ...data } : banner
        )
    );

    // 2. Actualización en Base de Datos
    if(!db) return;
    try {
        const ref = doc(db, "banners", String(id));
        await updateDoc(ref, data);
    } catch (e) {
        console.error("Error updating banner in DB", e);
    }
  };

  const updateModule = async (id: string, data: Partial<TrainingModule>) => {
    // 1. Actualización Optimista
    setModules(prevModules => 
        prevModules.map(module => 
            module.id === id ? { ...module, ...data } : module
        )
    );

    // 2. Actualización en Base de Datos
    if(!db) return;
    try {
        const ref = doc(db, "modules", id);
        await updateDoc(ref, data);
    } catch (e) {
        console.error("Error updating module in DB", e);
    }
  };

  const updateHomeConfig = async (data: Partial<HomeConfig>) => {
      setHomeConfig(prev => ({ ...prev, ...data }));
      if (!db) return;
      try {
          const ref = doc(db, "config", "home");
          await setDoc(ref, data, { merge: true });
      } catch (e) {
          console.error("Error updating home config", e);
      }
  };

  return (
    <ContentContext.Provider value={{ banners, modules, homeConfig, loading, updateBanner, updateModule, updateHomeConfig }}>
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