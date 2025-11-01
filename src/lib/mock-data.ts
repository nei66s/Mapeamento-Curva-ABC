
import type { Item, Incident, Category, Classification, ComplianceChecklistItem, StoreComplianceData, ComplianceStatus, MaintenanceIndicator } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';
import type { ImpactFactor } from './impact-factors';


const contingencyPlans = [
  "Acionar equipe de manutenção interna.", "Contratar serviço de locação de equipamento similar.", "Isolar a área e aguardar o técnico especialista.",
  "Utilizar equipamento reserva.", "Redirecionar fluxo de clientes.", "Iniciar operação em modo de contingência manual."
];

const leadTimes = ["Imediato", "2 horas", "4 horas", "8 horas", "24 horas", "48 horas"];

const itemNames = [
    "DVR / NVR Central", "Câmeras de frente de loja / cofres", "Sensores de presença / alarme",
    "Câmeras externas / perímetro", "QGBT / Quadro geral", "Disjuntores / barramentos",
    "Iluminação de área de vendas", "Iluminação externa / decorativa", "Rack de compressores / unidade condensadora",
    "Evaporadores / câmaras frias", "Condensadoras / expositores", "Splits administrativos",
    "Gerador principal", "Quadro de transferência automática (QTA)", "Nobreak central / retificador",
    "Baterias de reserva / banco de energia", "Bomba de recalque / pressurização", "Reservatórios / caixa d’água",
    "Torneiras / válvulas / sifões", "Elevador / monta-carga", "Portas corta-fogo / hidrantes / exaustores",
    "Estruturas / revestimentos / pisos", "Serra fita", "Câmara fria / balcão refrigerado",
    "Moedor / picador / fatiador", "Embaladora / seladora", "Forno combinado / fritadeira industrial",
    "Estufa quente / expositor", "Coifa / exaustor industrial", "Forno turbo / esteira",
    "Amassadeira / batedeira", "Seladora / balança produção", "Câmaras de climatização / umidificadores",
    "Balcões refrigerados", "Nebulizadores / ventiladores", "Portas automáticas de doca",
    "Lavadora de piso", "Enceradeira / aspirador industrial", "Cancela automática",
    "Iluminação de estacionamento", "Portões automáticos / pedonais", "Climatizador / exaustor",
    "Iluminação / instalações elétricas", "Equipamentos de cozinha / micro-ondas", "Painéis LED / letreiros",
    "Iluminação decorativa / fachadas"
];

const itemCategoryMap: Record<string, string> = {
    "DVR / NVR Central": "Segurança / CFTV / Alarme",
    "Câmeras de frente de loja / cofres": "Segurança / CFTV / Alarme",
    "Sensores de presença / alarme": "Segurança / CFTV / Alarme",
    "Câmeras externas / perímetro": "Segurança / CFTV / Alarme",
    "QGBT / Quadro geral": "Elétrica / Iluminação",
    "Disjuntores / barramentos": "Elétrica / Iluminação",
    "Iluminação de área de vendas": "Elétrica / Iluminação",
    "Iluminação externa / decorativa": "Elétrica / Iluminação",
    "Rack de compressores / unidade condensadora": "Refrigeração / Climatização Central",
    "Evaporadores / câmaras frias": "Refrigeração / Climatização Central",
    "Condensadoras / expositores": "Refrigeração / Climatização Central",
    "Splits administrativos": "Refrigeração / Climatização Central",
    "Gerador principal": "Energização / Geradores / Nobreaks",
    "Quadro de transferência automática (QTA)": "Energização / Geradores / Nobreaks",
    "Nobreak central / retificador": "Energização / Geradores / Nobreaks",
    "Baterias de reserva / banco de energia": "Energização / Geradores / Nobreaks",
    "Bomba de recalque / pressurização": "Hidráulica / Utilidades",
    "Reservatórios / caixa d’água": "Hidráulica / Utilidades",
    "Torneiras / válvulas / sifões": "Hidráulica / Utilidades",
    "Elevador / monta-carga": "Infraestrutura Predial",
    "Portas corta-fogo / hidrantes / exaustores": "Infraestrutura Predial",
    "Estruturas / revestimentos / pisos": "Infraestrutura Predial",
    "Serra fita": "Açougue / Frios",
    "Câmara fria / balcão refrigerado": "Açougue / Frios",
    "Moedor / picador / fatiador": "Açougue / Frios",
    "Embaladora / seladora": "Açougue / Frios",
    "Forno combinado / fritadeira industrial": "Rotisserie / Cozinha",
    "Estufa quente / expositor": "Rotisserie / Cozinha",
    "Coifa / exaustor industrial": "Rotisserie / Cozinha",
    "Forno turbo / esteira": "Padaria / Confeitaria",
    "Amassadeira / batedeira": "Padaria / Confeitaria",
    "Seladora / balança produção": "Padaria / Confeitaria",
    "Câmaras de climatização / umidificadores": "Padaria / Confeitaria",
    "Balcões refrigerados": "Hortifrúti / Floricultura",
    "Nebulizadores / ventiladores": "Hortifrúti / Floricultura",
    "Portas automáticas de doca": "Depósito / Doca",
    "Lavadora de piso": "Limpeza e Apoio",
    "Enceradeira / aspirador industrial": "Limpeza e Apoio",
    "Cancela automática": "Estacionamento / Acessos / Cancelas",
    "Iluminação de estacionamento": "Estacionamento / Acessos / Cancelas",
    "Portões automáticos / pedonais": "Estacionamento / Acessos / Cancelas",
    "Climatizador / exaustor": "Refeitório / Vestiários / Áreas de Apoio ao Colaborador",
    "Iluminação / instalações elétricas": "Refeitório / Vestiários / Áreas de Apoio ao Colaborador",
    "Equipamentos de cozinha / micro-ondas": "Refeitório / Vestiários / Áreas de Apoio ao Colaborador",
    "Painéis LED / letreiros": "Logo/ Painéis / Iluminação decorativa",
    "Iluminação decorativa / fachadas": "Logo/ Painéis / Iluminação decorativa",
};

const getImpactFactorsAndClassification = (itemName: string): { impactFactors: ImpactFactor['id'][], classification: Classification } => {
    // This is a deterministic way to assign impact factors based on item name for stable mock data
    const seed = itemName.length % 5;
    switch(seed) {
        case 0:
            return { impactFactors: ['safety', 'sales'], classification: 'A' };
        case 1:
            return { impactFactors: ['legal', 'brand'], classification: 'B' };
        case 2:
            return { impactFactors: ['cost'], classification: 'C' };
        case 3:
            return { impactFactors: ['sales', 'cost'], classification: 'A' };
        case 4:
            return { impactFactors: ['brand'], classification: 'B' };
        default:
            return { impactFactors: ['cost'], classification: 'C' };
    }
}


export const mockItems: Item[] = itemNames.map((name, index) => {
  const imageId = `item-image-${(index % 5) + 1}`;
  const image = PlaceHolderImages.find(img => img.id === imageId);
  const { impactFactors, classification } = getImpactFactorsAndClassification(name);

  return {
    id: `ITM-${String(index + 1).padStart(3, '0')}`,
    name: name,
    category: (itemCategoryMap as Record<string, string>)[name] || "Geral",
    classification,
    storeCount: Math.floor(name.length % 10) * 3 + 1, // Deterministic store count
    impactFactors,
    status: (['online', 'offline', 'maintenance'] as const)[index % 3],
    contingencyPlan: contingencyPlans[index % contingencyPlans.length],
    leadTime: leadTimes[index % leadTimes.length],
    imageUrl: image?.imageUrl,
  }
});

const rawCategories: Omit<Category, 'itemCount' | 'riskIndex'>[] = [
    { id: "CAT-001", name: "Segurança / CFTV / Alarme", description: "Sistemas de vigilância, controle de acesso e alarmes.", classification: 'A' },
    { id: "CAT-002", name: "Elétrica / Iluminação", description: "Infraestrutura elétrica, quadros de energia e sistemas de iluminação.", classification: 'A' },
    { id: "CAT-003", name: "Refrigeração / Climatização Central", description: "Equipamentos de refrigeração industrial e ar condicionado central.", classification: 'A' },
    { id: "CAT-004", name: "Energização / Geradores / Nobreaks", description: "Fontes de energia de emergência e estabilizadores.", classification: 'A' },
    { id: "CAT-005", name: "Hidráulica / Utilidades", description: "Sistemas de abastecimento de água e saneamento.", classification: 'B' },
    { id: "CAT-006", name: "Infraestrutura Predial", description: "Elevadores, estruturas e sistemas de segurança predial.", classification: 'B' },
    { id: "CAT-007", name: "Açougue / Frios", description: "Equipamentos específicos para o setor de carnes e frios.", classification: 'B' },
    { id: "CAT-008", name: "Rotisserie / Cozinha", description: "Equipamentos para preparo de alimentos em cozinhas industriais.", classification: 'C' },
    { id: "CAT-009", name: "Padaria / Confeitaria", description: "Maquinário para produção de pães e confeitaria.", classification: 'B' },
    { id: "CAT-010", name: "Hortifrúti / Floricultura", description: "Sistemas de refrigeração e exposição para produtos frescos.", classification: 'C' },
    { id: "CAT-011", name: "Depósito / Doca", description: "Equipamentos para logística e armazenamento.", classification: 'B' },
    { id: "CAT-012", name: "Limpeza e Apoio", description: "Maquinário para limpeza de grandes áreas.", classification: 'C' },
    { id: "CAT-013", name: "Estacionamento / Acessos / Cancelas", description: "Controle de acesso de veículos e segurança perimetral.", classification: 'C' },
    { id: "CAT-014", name: "Refeitório / Vestiários / Áreas de Apoio ao Colaborador", description: "Infraestrutura para áreas de funcionários.", classification: 'C' },
    { id: "CAT-015", name: "Logo/ Painéis / Iluminação decorativa", description: "Sistemas de comunicação visual e iluminação de fachada.", classification: 'C' }
];

export const mockCategories: Category[] = rawCategories.map((category, index) => {
    const itemsInCategory = mockItems.filter(item => item.category === category.name);
    const itemCount = itemsInCategory.length;
    
    const riskScoreMap: Record<Classification, number> = { 'A': 3, 'B': 2, 'C': 1 };
    const riskScore = itemsInCategory.reduce((acc, item) => acc + riskScoreMap[item.classification], 0);

    const riskIndex = itemCount > 0 ? Math.round((riskScore / (itemCount * 3)) * 10) : 0;
    
    const imageIds = ['item-image-2', 'item-image-3', 'item-image-1', 'item-image-4', 'item-image-5'];
    const image = PlaceHolderImages.find(i => i.id === imageIds[index % imageIds.length]);
    
    return {
        ...category,
        itemCount,
        riskIndex,
        imageUrl: image?.imageUrl,
    };
});


export const mockIncidents: Incident[] = [
  { id: 'INC-001', itemName: 'Rack de compressores / unidade condensadora', location: 'Loja A (SP)', status: 'Aberto', openedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), description: "Parada total do equipamento de refrigeração central, afetando a climatização de toda a área de vendas. A temperatura interna subiu 5°C em 1 hora.", lat: -23.5505, lng: -46.6333 },
  { id: 'INC-002', itemName: 'Balcões refrigerados', location: 'Loja B (RJ)', status: 'Em Andamento', openedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), description: "Não está atingindo a temperatura ideal, risco de perda de produtos perecíveis. A temperatura está oscilando entre 8°C e 12°C.", lat: -22.9068, lng: -43.1729 },
  { id: 'INC-003', itemName: 'QGBT / Quadro geral', location: 'Loja C (MG)', status: 'Resolvido', openedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), description: "Desarme do disjuntor principal causou interrupção total de energia na loja por 45 minutos. Todas as operações foram paralisadas.", lat: -19.9167, lng: -43.9345 },
  { id: 'INC-004', itemName: 'Nobreak central / retificador', location: 'Depósito Central (BA)', status: 'Fechado', openedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), description: "Falha na bateria do nobreak durante uma queda de energia, resultando na perda de dados não salvos nos servidores administrativos.", lat: -12.9777, lng: -38.5016 },
  { id: 'INC-005', itemName: 'Câmeras externas / perímetro', location: 'Loja D (RS)', status: 'Aberto', openedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), description: "Uma das câmeras do perímetro parou de gravar. A imagem está congelada.", lat: -30.0346, lng: -51.2177 },
];

const checklistItemCategoryMapping: Record<string, string[]> = {
  'Geradores': ['Energização / Geradores / Nobreaks'],
  'Elevadores e Esteiras': ['Infraestrutura Predial'],
  'Rampas Hidráulicas': ['Depósito / Doca'],
  'AVCB': ['Infraestrutura Predial'],
  'Equipamentos de Produção': ['Açougue / Frios', 'Rotisserie / Cozinha', 'Padaria / Confeitaria'],
  'Ar Cond. Central': ['Refrigeração / Climatização Central'],
  'Ar Cond. Split': ['Refrigeração / Climatização Central'],
};

const getChecklistItemClassification = (itemName: string): Classification => {
  const categories = checklistItemCategoryMapping[itemName] || [];
  const itemsInCategories = mockItems.filter(item => categories.includes(item.category));
  if (itemsInCategories.some(item => item.classification === 'A')) return 'A';
  if (itemsInCategories.some(item => item.classification === 'B')) return 'B';
  return 'C';
}


export const mockComplianceChecklistItems: ComplianceChecklistItem[] = [
  { id: 'CHK-01', name: 'Geradores', classification: getChecklistItemClassification('Geradores') },
  { id: 'CHK-02', name: 'Elevadores e Esteiras', classification: getChecklistItemClassification('Elevadores e Esteiras') },
  { id: 'CHK-03', name: 'Rampas Hidráulicas', classification: getChecklistItemClassification('Rampas Hidráulicas') },
  { id: 'CHK-04', name: 'AVCB', classification: getChecklistItemClassification('AVCB') },
  { id: 'CHK-05', name: 'Equipamentos de Produção', classification: getChecklistItemClassification('Equipamentos de Produção') },
  { id: 'CHK-06', name: 'Ar Cond. Central', classification: getChecklistItemClassification('Ar Cond. Central') },
  { id: 'CHK-07', name: 'Ar Cond. Split', classification: getChecklistItemClassification('Ar Cond. Split') },
];

const generateStoreData = (): StoreComplianceData[] => {
    const stores: StoreComplianceData[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 45; i++) {
        // Distribute stores throughout the current month
        const visitDay = (i % 28) + 1; // Keep it within a typical month
        const visitDate = new Date(today.getFullYear(), today.getMonth(), visitDay);

        const store: StoreComplianceData = {
            storeId: `LOJA-${String(i).padStart(3, '0')}`,
            storeName: `Loja ${i}`,
            visitDate: visitDate.toISOString(),
            items: mockComplianceChecklistItems.map((item, index) => {
                let status: ComplianceStatus = 'pending';
                const random = Math.random();
                if (random < 0.7) {
                    status = 'completed';
                } else if (random < 0.8 && item.id !== 'CHK-04') { // Don't make AVCB N/A
                    status = 'not-applicable';
                }
                return {
                    itemId: item.id,
                    status: status,
                };
            }),
        };
        stores.push(store);
    }
    return stores;
};


export const mockStoreComplianceData: StoreComplianceData[] = generateStoreData();


export const mockMaintenanceIndicators: MaintenanceIndicator[] = [
  {
    "id": "1",
    "mes": "2025-01",
    "sla_mensal": 75.8, "meta_sla": 80.0, "crescimento_mensal_sla": -2.5, "r2_tendencia": 88.1,
    "chamados_abertos": 1650, "chamados_solucionados": 1580, "backlog": 1050,
    "valor_mensal": 1205678.90, "variacao_percentual_valor": 15.2,
    "aging": { "inferior_30": 420, "entre_30_60": 180, "entre_60_90": 100, "superior_90": 350 },
    "criticidade": { "baixa": 12, "media": 70, "alta": 170, "muito_alta": 80 },
    "prioridade": { "baixa": 15.5, "media": 25.8, "alta": 40.2, "muito_alta": 18.5 }
  },
  {
    "id": "2",
    "mes": "2025-02",
    "sla_mensal": 78.2, "meta_sla": 80.0, "crescimento_mensal_sla": 2.4, "r2_tendencia": 89.5,
    "chamados_abertos": 1700, "chamados_solucionados": 1720, "backlog": 1030,
    "valor_mensal": 1310987.50, "variacao_percentual_valor": 8.7,
    "aging": { "inferior_30": 450, "entre_30_60": 170, "entre_60_90": 95, "superior_90": 315 },
    "criticidade": { "baixa": 15, "media": 75, "alta": 180, "muito_alta": 85 },
    "prioridade": { "baixa": 14.8, "media": 27.5, "alta": 38.9, "muito_alta": 18.8 }
  },
  {
    "id": "3",
    "mes": "2025-03",
    "sla_mensal": 80.99, "meta_sla": 80.0, "crescimento_mensal_sla": 2.79, "r2_tendencia": 90.67,
    "chamados_abertos": 1760, "chamados_solucionados": 1846, "backlog": 1145,
    "valor_mensal": 1413859.36, "variacao_percentual_valor": 7.8,
    "aging": { "inferior_30": 480, "entre_30_60": 189, "entre_60_90": 91, "superior_90": 385 },
    "criticidade": { "baixa": 14, "media": 77, "alta": 185, "muito_alta": 91 },
    "prioridade": { "baixa": 16.16, "media": 28.91, "alta": 37.82, "muito_alta": 17.12 }
  },
  {
    "id": "4",
    "mes": "2025-04",
    "sla_mensal": 82.5, "meta_sla": 80.0, "crescimento_mensal_sla": 1.51, "r2_tendencia": 91.2,
    "chamados_abertos": 1800, "chamados_solucionados": 1780, "backlog": 1165,
    "valor_mensal": 1450000.00, "variacao_percentual_valor": 2.5,
    "aging": { "inferior_30": 500, "entre_30_60": 200, "entre_60_90": 100, "superior_90": 365 },
    "criticidade": { "baixa": 18, "media": 80, "alta": 190, "muito_alta": 95 },
    "prioridade": { "baixa": 17.0, "media": 30.0, "alta": 36.0, "muito_alta": 17.0 }
  },
  {
    "id": "5",
    "mes": "2025-05",
    "sla_mensal": 81.7, "meta_sla": 80.0, "crescimento_mensal_sla": -0.8, "r2_tendencia": 90.8,
    "chamados_abertos": 1720, "chamados_solucionados": 1882, "backlog": 1003,
    "valor_mensal": 1395432.10, "variacao_percentual_valor": -3.76,
    "aging": { "inferior_30": 400, "entre_30_60": 160, "entre_60_90": 80, "superior_90": 363 },
    "criticidade": { "baixa": 16, "media": 72, "alta": 175, "muito_alta": 89 },
    "prioridade": { "baixa": 16.5, "media": 29.5, "alta": 37.0, "muito_alta": 17.0 }
  }
];
