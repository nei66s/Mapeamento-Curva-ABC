
import { User, UserRole } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-00',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    password: 'admin'
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
    role: 'regional',
  },
  {
    id: 'user-04',
    name: 'Líder Regional 04',
    email: 'regional4@example.com',
    role: 'regional',
  },
];
