import { User, UserRole } from './types';
import { PlaceHolderImages } from './placeholder-images';

const userAvatar = PlaceHolderImages.find(img => img.id === "user-avatar-1");

// This is our "database". Changes to user profiles should be made here to be persistent.
export const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'Ana Silva',
    email: 'admin@example.com',
    role: 'admin',
    password: 'admin',
    avatarUrl: userAvatar?.imageUrl,
  },
  {
    id: 'user-002',
    name: 'Bruno Costa',
    email: 'gestor@example.com',
    role: 'gestor',
    password: 'gestor',
    avatarUrl: 'https://picsum.photos/seed/user2/100/100',
  },
  {
    id: 'user-003',
    name: 'Carlos Dias',
    email: 'regional@example.com',
    role: 'regional',
    password: 'regional',
     avatarUrl: 'https://picsum.photos/seed/user3/100/100',
  },
  {
    id: 'user-004',
    name: 'Daniela Faria',
    email: 'viewer@example.com',
    role: 'viewer',
    password: 'viewer',
     avatarUrl: 'https://picsum.photos/seed/user4/100/100',
  },
   {
    id: 'user-005',
    name: 'Eduardo Martins',
    email: 'outro.regional@example.com',
    role: 'regional',
    password: 'regional',
     avatarUrl: 'https://picsum.photos/seed/user5/100/100',
  },
];
