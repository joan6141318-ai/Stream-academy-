
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>(INITIAL_MODULES.map(m => ({...m, style: getInitialStyle(m.id)})));
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(INITIAL_HOME_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }

    const unsubBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
        if (!snapshot.empty) {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
            setBanners(list);
        }
    });

    const unsubModules = onSnapshot(collection(db, "modules"), (snapshot) => {
        if (!snapshot.empty) {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule));
            setModules(list);
        }
    });

    const unsubConfig = onSnapshot(doc(db, "config", "home"), (docSnap) => {
        if (docSnap.exists()) {
            setHomeConfig(docSnap.data() as HomeConfig);
        }
        setLoading(false); 
    });

    const unsubGifts = onSnapshot(doc(db, "config", "app_tour"), (docSnap) => {
        if (docSnap.exists() && docSnap.data().gifts) {
            setGifts(docSnap.data().gifts);
        }
    });

    return () => {
        unsubBanners();
        unsubModules();
        unsubConfig();
        unsubGifts();
    };
  }, []);

  const updateBanner = async (id: string, data: Partial<Banner>) => {
      if (!db) return;
      await updateDoc(doc(db, "banners", id), data);
  };

  const updateModule = async (id: string, data: Partial<TrainingModule>) => {
      if (!db) return;
      await updateDoc(doc(db, "modules", id), data);
  };

  const updateHomeConfig = async (data: Partial<HomeConfig>) => {
      if (!db) return;
      await setDoc(doc(db, "config", "home"), data, { merge: true });
  };

  const updateGifts = async (newGifts: GiftItem[]) => {
      if (!db) return;
      await setDoc(doc(db, "config", "app_tour"), { gifts: newGifts }, { merge: true });
  };

  const updatePKSchedule = async (data: PKSchedule) => {
      if (!db) return;
      await setDoc(doc(db, "schedules", "main"), data);
  };

  const addPKRequest = async (date: string, bigoId: string, userId: string) => {
      if (!db) return;
      await addDoc(collection(db, "pk_requests"), {
          date, bigoId, userId, status: 'pending', createdAt: Date.now()
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
        banners, modules, gifts, homeConfig, loading, 
        updateBanner, updateModule, updateHomeConfig, updateGifts, 
        updatePKSchedule, addPKRequest, updatePKRequestStatus, deletePKRequest 
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
