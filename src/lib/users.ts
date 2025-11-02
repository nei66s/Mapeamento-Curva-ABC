
import { User, UserRole } from './types';
import { PlaceHolderImages } from './placeholder-images';

const userAvatar = PlaceHolderImages.find(img => img.id === "user-avatar-1");

// This is our "database". Changes to user profiles should be made here to be persistent.
export const mockUsers: User[] = [
  {
    id: 'user-00',
    name: 'Líder Admin',
    email: 'admin@gmail.com',
    role: 'admin',
    password: 'admin',
    avatarUrl: userAvatar?.imageUrl,
  },
  {
    id: 'user-01',
    name: 'Líder Regional 01',
    email: 'regional1@example.com',
    role: 'regional',
  },
  {
    id: 'user-02',
    name: 'Líder Regional 02',
    email: 'regional2@example.com',
    role: 'regional',
  },
  {
    id: 'user-03',
    name: 'Líder Regional 03',
    email: 'regional3@example.com',
    role: 'viewer',
  },
  {
    id: 'user-04',
    name: 'Líder Regional 04',
    email: 'regional4@example.com',
    role: 'viewer',
  },
];
