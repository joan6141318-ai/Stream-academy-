
export interface TrainingResource {
  title: string;
  type: 'table' | 'calc' | 'wallet' | 'card' | 'doc';
  imageUrl?: string; 
  style?: ModuleStyle; 
}

export interface ModuleStyle {
  bg: string;
  shadow: string;
  iconName: string; 
  imagePosition?: 'object-top' | 'object-center' | 'object-bottom'; 
  cardOpacity?: number; 
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string; 
  textContent: string;
  resources?: TrainingResource[];
  style?: ModuleStyle; 
}

export interface Banner {
  id: string | number;
  tag: string;
  tagColor: string;
  title: string;
  subtitle: string;
  gradient: string;
  image: string;
  shadow: string;
  link?: string;
  imagePosition?: 'object-top' | 'object-center' | 'object-bottom'; 
}

export interface HomeConfig {
  welcomeText: string;
  modulesTitle: string;
  modulesSubtitle: string;
  agencyCodeHash?: string; 
  maintenanceMode?: 'off' | 'lockdown' | 'maintenance'; 
}

// --- TOP STREAMERS TYPES ---
export interface TopStreamer {
  rank: 1 | 2 | 3;
  name: string;
  id: string;
  avatar: string;
  meta: string; // Recaudación Meta
  record: string; // Récord Histórico
  trend: 'up' | 'down' | 'stable';
}

export interface TopStreamersConfig {
  month: string; // Ej: "Noviembre 2025"
  congratsTitle?: string; // Nuevo: Título tarjeta felicitación
  congratsMessage?: string; // Nuevo: Mensaje tarjeta felicitación
  list: TopStreamer[];
}

export interface GiftItem {
  id: string;
  value: string;
  imageUrl: string;
  name: string; 
  category: 'variedad' | 'lucky' | 'hot'; 
  order: number; 
}

export interface UserProfile {
  name: string;
  id: string;
  role: string;
  avatarUrl: string;
  isAdmin?: boolean; 
  isBlocked?: boolean; 
}

// --- SECURITY & LOGS ---
export interface ActivityLog {
  action: string;
  timestamp: string; // ISO String
  device: string;
  type?: 'login' | 'security_alert' | 'profile_update' | 'module_view' | 'app_open';
}

// --- PK ARENA TYPES ---
export interface PKEvent {
  id: string;
  time: string;
  user1: string; 
  id1: string;
  user2: string; 
  id2: string;
  confirmed: boolean;
}

export interface PKSchedule {
  potential: PKEvent[];
  supersmash: PKEvent[];
}

export interface PKRequest {
  id: string;
  userId: string; 
  date: string;
  bigoId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
