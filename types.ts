export interface TrainingResource {
  title: string;
  type: 'table' | 'calc' | 'wallet' | 'card' | 'doc';
}

export interface ModuleStyle {
  bg: string;
  shadow: string;
  iconName: string; // guardar el nombre del icono como string para mapearlo luego
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
}

export interface UserProfile {
  name: string;
  id: string;
  role: string;
  avatarUrl: string;
  isAdmin?: boolean; 
}