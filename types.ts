

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
}

export interface UserProfile {
  name: string;
  id: string;
  role: string;
  avatarUrl: string;
  isAdmin?: boolean; 
}

// --- SECURITY & LOGS ---
export interface ActivityLog {
  action: string;
  timestamp: string; // ISO String for easier storage/display
  device: string;
}

// --- PK ARENA TYPES ---
export interface PKEvent {
  id: string;
  time: string;
  user1: string; // Deprecated visually, but kept for structure
  id1: string;
  user2: string; // Deprecated visually, but kept for structure
  id2: string;
  confirmed: boolean;
}

export interface PKSchedule {
  potential: PKEvent[];
  supersmash: PKEvent[];
}

export interface PKRequest {
  id: string;
  userId: string; // ID del usuario que solicita
  date: string;
  bigoId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}