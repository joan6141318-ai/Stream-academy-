
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Banner, TrainingModule, HomeConfig, PKSchedule, ModuleStyle, GiftItem } from '../types';
import { TRAINING_MODULES as INITIAL_MODULES } from '../constants';

// --- CRYPTO UTILITY ---
export const hashString = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Datos iniciales de Banners (Solo memoria, no escritura automática)
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

// Helper para asignar estilos iniciales
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

const INITIAL_HOME_CONFIG: HomeConfig = {
    welcomeText: "Bienvenido de nuevo,",
    modulesTitle: "Módulos de Capacitación",
    modulesSubtitle: "Elige el módulo relacionado con tu duda",
    agencyCodeHash: "a43c1b0aa53a0c908810c03ab1d7cb9922c2a05d605c567839356b20677275c5", 
    maintenanceMode: 'off'
};

const INITIAL_GIFTS: GiftItem[] = [
    // VARIEDAD (Ordenado explícitamente según solicitud)
    { id: '6', name: "Flor", value: "1", category: 'variedad', order: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_080839.jpg?alt=media&token=08e399f4-c8f6-4fb0-b14e-e5548c34609c" },
    { id: '1', name: "Mace", value: "100", category: 'variedad', order: 2, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_080356.jpg?alt=media&token=43fbcf9b-e527-42ec-ad9b-50fac86309fa" },
    { id: '7', name: "Crush", value: "100", category: 'variedad', order: 3, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_081105.jpg?alt=media&token=52c9ec8d-ac6c-4b6b-875f-6303560af2a3" },
    { id: '3', name: "Kismee", value: "500", category: 'variedad', order: 4, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_080556.jpg?alt=media&token=d5d96aea-c4f6-46db-aa53-e46afeaad424" },
    { id: '4', name: "Luxury car", value: "40000", category: 'variedad', order: 5, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_080619.jpg?alt=media&token=edc6467b-d54c-4e51-afff-4423fd3fa8d3" },
    { id: '9', name: "Super dragón", value: "9999", category: 'variedad', order: 6, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_082317.jpg?alt=media&token=bdd1c65d-1106-42ba-87db-ed9123fffc08" },
    { id: '5', name: "Gala dragón", value: "1000", category: 'variedad', order: 7, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_080711.jpg?alt=media&token=22fa1f90-0e75-4dd4-9e0d-22bb4105e09c" },
    { id: '2', name: "Yate de lujo", value: "20000", category: 'variedad', order: 8, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_080518.jpg?alt=media&token=8c00c88c-31ca-464b-845d-aacc50dfca96" },
    
    // LUCKY
    { id: '12', name: "Campana", value: "5", category: 'lucky', order: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_080046.jpg?alt=media&token=b61ba601-1323-4a7a-a782-48c5c5e22e5c" },
    { id: '8', name: "Gold box", value: "20", category: 'lucky', order: 2, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_081339.jpg?alt=media&token=d8d7a6cf-90bf-4581-a96c-40d3f7532008" },
    { id: '10', name: "Big win", value: "500", category: 'lucky', order: 3, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_082345.jpg?alt=media&token=7cf7e2a8-4c55-4485-8c06-9c9add518f0a" },
    { id: '13', name: "Mythical pegasus", value: "3000", category: 'lucky', order: 4, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_080106.jpg?alt=media&token=9d142e12-f31d-418b-8331-4cea3294a747" },

    // HOT
    { id: '14', name: "Regalos Calientes", value: "10", category: 'hot', order: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Regalos%2FIMG_20251205_080311.jpg?alt=media&token=c244e596-789f-4dd1-ba8c-9608512558df" }
];

interface ContentContextType {
  banners: Banner[];
  modules: TrainingModule[];
  gifts: GiftItem[];
  homeConfig: HomeConfig;
  loading: boolean;
  updateBanner: (id: string, data: Partial<Banner>) => Promise<void>;
  updateModule: (id: string, data: Partial<TrainingModule>) => Promise<void>;
  updateHomeConfig: (data: Partial<HomeConfig>) => Promise<void>;
  updateGifts: (newGifts: GiftItem[]) => Promise<void>;
  updatePKSchedule: (data: PKSchedule) => Promise<void>;
  addPKRequest: (date: string, bigoId: string, userId: string) => Promise<void>;
  updatePKRequestStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  deletePKRequest: (id: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [modules, setModules] = useState<TrainingModule[]>(INITIAL_MODULES.map(m => ({...m, style: getInitialStyle(m.id)})));
  const [gifts, setGifts] = useState<GiftItem[]>(INITIAL_GIFTS);
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(INITIAL_HOME_CONFIG);
  
  // SOLUCIÓN 1: Estado de carga global gestionado
  const [loading, setLoading] = useState(true);
  const loadingFlags = useRef({ banners: false, modules: false, config: false, gifts: false });
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkLoading = () => {
      if (loadingFlags.current.banners && loadingFlags.current.modules && loadingFlags.current.config && loadingFlags.current.gifts) {
          if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
          setLoading(false);
      }
  };

  useEffect(() => {
    // SOLUCIÓN 2: Safety Timeout. Si Firebase falla, liberamos la app en 5 segundos.
    safetyTimeoutRef.current = setTimeout(() => {
        console.warn("Firebase timeout: Liberando aplicación con datos locales.");
        setLoading(false);
    }, 5000);

    if (!db) {
        setLoading(false);
        return;
    }

    // 1. Listen Banners
    const unsubBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
        if (!snapshot.empty) {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
            setBanners(list);
        }
        loadingFlags.current.banners = true;
        checkLoading();
    }, (error) => {
        console.warn("Banners load failed (using default):", error.code);
        loadingFlags.current.banners = true;
        checkLoading();
    });

    // 2. Listen Modules
    const unsubModules = onSnapshot(collection(db, "modules"), (snapshot) => {
        if (!snapshot.empty) {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule));
            setModules(list);
        }
        loadingFlags.current.modules = true;
        checkLoading();
    }, (error) => {
        console.warn("Modules load failed (using default):", error.code);
        loadingFlags.current.modules = true;
        checkLoading();
    });

    // 3. Listen Home Config
    const unsubConfig = onSnapshot(doc(db, "config", "home"), (docSnap) => {
        if (docSnap.exists()) {
            setHomeConfig(docSnap.data() as HomeConfig);
        }
        loadingFlags.current.config = true;
        checkLoading();
    }, (error) => {
        console.warn("Config load failed (using default):", error.code);
        loadingFlags.current.config = true;
        checkLoading();
    });

    // 4. Listen Gifts Config
    const unsubGifts = onSnapshot(doc(db, "config", "app_tour"), (docSnap) => {
        let currentGifts: GiftItem[] = [];
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.gifts && Array.isArray(data.gifts)) {
                currentGifts = data.gifts;
            }
        }

        // Merge logic: Add missing gifts from INITIAL if not present in Firestore
        const missingGifts = INITIAL_GIFTS.filter(initGift => !currentGifts.some(g => g.id === initGift.id));
        const finalGifts = [...currentGifts, ...missingGifts].map(g => ({
            ...g,
            // Ensure properties exist if old data doesn't have them
            category: g.category || 'variedad',
            order: g.order || 99,
            name: g.name || 'Regalo'
        }));
        
        setGifts(finalGifts as GiftItem[]);
        
        loadingFlags.current.gifts = true;
        checkLoading();
    }, (error) => {
        console.warn("Gifts load failed (using default):", error.code);
        // Fallback to initial
        setGifts(INITIAL_GIFTS);
        loadingFlags.current.gifts = true;
        checkLoading();
    });

    return () => {
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        unsubBanners();
        unsubModules();
        unsubConfig();
        unsubGifts();
    };
  }, []);

  // --- CRUD Operations ---

  const updateBanner = async (id: string, data: Partial<Banner>) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    if(!db) return;
    try { await updateDoc(doc(db, "banners", String(id)), data); } catch (e) { console.error("Update failed", e); }
  };

  const updateModule = async (id: string, data: Partial<TrainingModule>) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    if(!db) return;
    try { await updateDoc(doc(db, "modules", id), data); } catch (e) { console.error("Update failed", e); }
  };

  const updateHomeConfig = async (data: Partial<HomeConfig>) => {
      setHomeConfig(prev => ({ ...prev, ...data }));
      if (!db) return;
      try { await setDoc(doc(db, "config", "home"), data, { merge: true }); } catch (e) { console.error("Update failed", e); }
  };

  const updateGifts = async (newGifts: GiftItem[]) => {
      setGifts(newGifts);
      if (!db) return;
      try { await setDoc(doc(db, "config", "app_tour"), { gifts: newGifts }, { merge: true }); } catch (e) { console.error("Update failed", e); }
  }

  const updatePKSchedule = async (data: PKSchedule) => {
      if (!db) return;
      try { await setDoc(doc(db, "schedules", "main"), data); } catch (e) { console.error("Update failed", e); }
  };

  const addPKRequest = async (date: string, bigoId: string, userId: string) => {
      if (!db) throw new Error("Database not connected");
      await addDoc(collection(db, "pk_requests"), {
          date,
          bigoId,
          userId,
          status: 'pending',
          createdAt: Date.now()
      });
  };

  const updatePKRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
      if (!db) return;
      await updateDoc(doc(db, "pk_requests", id), { status });
  };

  const deletePKRequest = async (id: string) => {
      if (!db) return;
      await deleteDoc(doc(db, "pk_requests", id));
  };

  return (
    <ContentContext.Provider value={{ 
        banners, modules, homeConfig, gifts, loading, 
        updateBanner, updateModule, updateHomeConfig, updateGifts, updatePKSchedule, 
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
