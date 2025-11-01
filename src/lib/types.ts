export type Classification = 'A' | 'B' | 'C';
export type IncidentStatus = 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Fechado';
export type UserRole = 'admin' | 'gestor' | 'regional' | 'viewer';

export type Category = {
  id: string;
  name: string;
  description: string;
};

export type Item = {
  id: string;
  name: string;
  category: string;
  classification: Classification;
  storeCount: number;
  generalIndex: number;
  status: 'online' | 'offline' | 'maintenance';
  contingencyPlan: string;
  leadTime: string;
  imageUrl?: string;
};

export type Incident = {
  id: string;
  itemName: string;
  location: string;
  status: IncidentStatus;
  openedAt: string; // ISO date string
  description: string;
  lat?: number;
  lng?: number;
};
