export interface TrainingResource {
  title: string;
  type: 'table' | 'calc' | 'wallet' | 'card' | 'doc';
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string; // Placeholder for demo
  textContent: string;
  resources?: TrainingResource[];
}

export interface UserProfile {
  name: string;
  id: string;
  role: string;
  avatarUrl: string;
  isAdmin?: boolean; // New field for Role Based Access
}