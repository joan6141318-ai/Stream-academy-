

export interface TrainingResource {
  title: string;
  type: 'table' | 'calc' | 'wallet' | 'card' | 'doc';
  imageUrl?: string; // Nuevo: Imagen de fondo opcional para la tarjeta interna
  style?: ModuleStyle; // Nuevo: Estilo personalizado para la tarjeta interna
}

export interface ModuleStyle {
  bg: string;
  shadow: string;
  iconName: string; // guardar el nombre del icono como string para mapearlo luego
  imagePosition?: 'object-top' | 'object-center' | 'object-bottom'; // Nuevo campo de posición
  cardOpacity?: number; // 0.0 a 1.0 (Transparencia)
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string; // Placeholder for demo
  textContent: string;
  resources?: TrainingResource[];
  style?: ModuleStyle; // Nuevo campo para estilos dinámicos
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
  imagePosition?: 'object-top' | 'object-center' | 'object-bottom'; // Nuevo campo de posición
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