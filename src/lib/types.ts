export type Classification = 'A' | 'B' | 'C';
export type IncidentStatus = 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Fechado';
export type UserRole = 'admin' | 'gestor' | 'regional' | 'viewer';
import type { ImpactFactor } from './impact-factors';

export type Category = {
  id: string;
  name: string;
  description: string;
  classification: Classification;
  imageUrl?: string;
  itemCount: number;
  riskIndex: number;
};

export type Item = {
  id: string;
  name: string;
  category: string;
  classification: Classification;
  storeCount: number;
  impactFactors: ImpactFactor['id'][];
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

export type ComplianceChecklistItem = {
    id: string;
    name: string;
};

export type ComplianceStatus = 'completed' | 'pending' | 'not-applicable';

export type StoreComplianceData = {
    storeId: string;
    storeName: string;
    visitDate: string; // ISO date string for the scheduled visit
    items: {
        itemId: string;
        status: ComplianceStatus;
    }[];
};
