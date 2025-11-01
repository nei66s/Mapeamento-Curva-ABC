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
    classification: Classification;
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

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
};

export type MaintenanceIndicator = {
  id: string;
  mes: string;
  sla_mensal: number;
  meta_sla: number;
  crescimento_mensal_sla: number;
  r2_tendencia: number;
  chamados_abertos: number;
  chamados_solucionados: number;
  backlog: number;
  valor_mensal: number;
  variacao_percentual_valor: number;
  aging: {
    inferior_30: number;
    entre_30_60: number;
    entre_60_90: number;
    superior_90: number;
  };
  criticidade: {
    baixa: number;
    media: number;
    alta: number;
    muito_alta: number;
  };
  prioridade: {
    baixa: number;
    media: number;
    alta: number;
    muito_alta: number;
  };
};
