export type Role = 'OWNER' | 'EDITOR' | 'VIEWER' | 'NONE';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  userId: string;
  role: 'EDITOR' | 'VIEWER';
  user: User;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner: User;
  shares?: DocumentShare[];
  createdAt: string;
  updatedAt: string;
  currentUserRole?: Role;
}
