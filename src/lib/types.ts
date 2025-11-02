

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

export type Store = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
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
  password?: string;
};

export type AgingCriticidade = {
  baixa: number;
  media: number;
  alta: number;
  muito_alta: number;
};

export type MaintenanceIndicator = {
  id:string;
  mes: string;
  sla_mensal: number;
  meta_sla: number;
  crescimento_mensal_sla: number;
  r2_tendencia: number;
  chamados_abertos: number;
  chamados_solucionados: number;
  backlog: number;
  valor_mensal: number;
  valor_orcado: number;
  variacao_percentual_valor: number;
  aging: {
    inferior_30: AgingCriticidade;
    entre_30_60: AgingCriticidade;
    entre_60_90: AgingCriticidade;
    superior_90: AgingCriticidade;
  };
  criticidade: { // This might be redundant now or could represent totals
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

export type Supplier = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  cnpj: string;
  specialty: string;
};

export type WarrantyItem = {
  id: string;
  itemName: string;
  storeLocation: string;
  serialNumber?: string;
  purchaseDate: string; // ISO date string
  warrantyEndDate: string; // ISO date string
  supplierId: string;
  notes?: string;
};

export type RncStatus = 'Aberta' | 'Em Análise' | 'Concluída' | 'Cancelada';
export type RncClassification = 'Crítica' | 'Moderada' | 'Baixa';

export type RNC = {
    id: string;
    title: string;
    supplierId: string;
    incidentId?: string;
    description: string;
    status: RncStatus;
    classification: RncClassification;
    createdAt: string; // ISO date string
};
    
