
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
  { id: 'INC-001', itemName: 'Rack de compressores / unidade condensadora', location: 'Pague Menos - Loja 01', status: 'Aberto', openedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), description: "Parada total do equipamento de refrigeração central, afetando a climatização de toda a área de vendas. A temperatura interna subiu 5°C em 1 hora.", lat: -22.7532, lng: -47.3292 },
  { id: 'INC-002', itemName: 'Balcões refrigerados', location: 'Pague Menos - Loja 02', status: 'Em Andamento', openedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), description: "Não está atingindo a temperatura ideal, risco de perda de produtos perecíveis. A temperatura está oscilando entre 8°C e 12°C.", lat: -22.7391, lng: -47.4005 },
  { id: 'INC-003', itemName: 'QGBT / Quadro geral', location: 'Pague Menos - Loja 03', status: 'Resolvido', openedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), description: "Desarme do disjuntor principal causou interrupção total de energia na loja por 45 minutos. Todas as operações foram paralisadas.", lat: -22.8013, lng: -47.2185 },
  { id: 'INC-004', itemName: 'Nobreak central / retificador', location: 'Pague Menos - Loja 04', status: 'Fechado', openedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), description: "Falha na bateria do nobreak durante uma queda de energia, resultando na perda de dados não salvos nos servidores administrativos.", lat: -22.9068, lng: -47.0616 },
  { id: 'INC-005', itemName: 'Câmeras externas / perímetro', location: 'Pague Menos - Loja 05', status: 'Aberto', openedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), description: "Uma das câmeras do perímetro parou de gravar. A imagem está congelada.", lat: -22.5855, lng: -47.4153 },
];

export const allStores = [
    { id: "LOJA-01", name: "Loja 01", city: "Americana", lat: -22.7532, lng: -47.3292 },
    { id: "LOJA-02", name: "Loja 02", city: "Santa Bárbara d'Oeste", lat: -22.7391, lng: -47.4005 },
    { id: "LOJA-03", name: "Loja 03", city: "Nova Odessa", lat: -22.8013, lng: -47.2185 },
    { id: "LOJA-04", name: "Loja 04", city: "Campinas", lat: -22.9068, lng: -47.0616 },
    { id: "LOJA-05", name: "Loja 05", city: "Piracicaba", lat: -22.5855, lng: -47.4153 },
    { id: "LOJA-06", name: "Loja 06", city: "Sumaré", lat: -22.8219, lng: -47.2669 },
    { id: "LOJA-07", name: "Loja 07", city: "Hortolândia", lat: -22.8596, lng: -47.2203 },
    { id: "LOJA-08", name: "Loja 08", city: "Paulinia", lat: -22.7634, lng: -47.1545 },
    { id: "LOJA-09", name: "Loja 09", city: "Limeira", lat: -22.5647, lng: -47.4069 },
    { id: "LOJA-10", name: "Loja 10", city: "Araras", lat: -22.3564, lng: -47.3828 },
    { id: "LOJA-11", name: "Loja 11", city: "Indaiatuba", lat: -23.0867, lng: -47.2183 },
    { id: "LOJA-12", name: "Loja 12", city: "Tietê", lat: -23.1022, lng: -47.7153 },
    { id: "LOJA-13", name: "Loja 13", city: "Boituva", lat: -23.2842, lng: -47.6711 },
    { id: "LOJA-14", name: "Loja 14", city: "Salto", lat: -23.2017, lng: -47.2883 },
    { id: "LOJA-15", name: "Loja 15", city: "Itu", lat: -23.2644, lng: -47.2992 },
    { id: "LOJA-16", name: "Loja 16", city: "Sorocaba", lat: -23.501, lng: -47.458 },
    { id: "LOJA-17", name: "Loja 17", city: "Valinhos", lat: -22.9711, lng: -46.9961 },
    { id: "LOJA-18", name: "Loja 18", city: "Mogi Mirim", lat: -22.4319, lng: -46.9564 },
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

const fullIndicatorData = [
    { mes: "2024-01", chamados_abertos: 1337, chamados_solucionados: 1408, backlog: 1638 },
    { mes: "2024-02", chamados_abertos: 1386, chamados_solucionados: 802, backlog: 1567 },
    { mes: "2024-03", chamados_abertos: 1379, chamados_solucionados: 779, backlog: 2151 },
    { mes: "2024-04", chamados_abertos: 1334, chamados_solucionados: 918, backlog: 2751 },
    { mes: "2024-05", chamados_abertos: 1323, chamados_solucionados: 1477, backlog: 3167 },
    { mes: "2024-06", chamados_abertos: 1200, chamados_solucionados: 1303, backlog: 3013 },
    { mes: "2024-07", chamados_abertos: 1566, chamados_solucionados: 1285, backlog: 2910 },
    { mes: "2024-08", chamados_abertos: 1439, chamados_solucionados: 1254, backlog: 2629 },
    { mes: "2024-09", chamados_abertos: 1568, chamados_solucionados: 1366, backlog: 2444 },
    { mes: "2024-10", chamados_abertos: 1258, chamados_solucionados: 1272, backlog: 2242 },
    { mes: "2024-11", chamados_abertos: 1637, chamados_solucionados: 1199, backlog: 2256 },
    { mes: "2024-12", chamados_abertos: 1442, chamados_solucionados: 1246, backlog: 1818 },
    { mes: "2025-01", chamados_abertos: 1790, chamados_solucionados: 1737, backlog: 1818 },
    { mes: "2025-02", chamados_abertos: 1725, chamados_solucionados: 1789, backlog: 1871 },
    { mes: "2025-03", chamados_abertos: 1760, chamados_solucionados: 1846, backlog: 1807 },
    { mes: "2025-04", chamados_abertos: 1475, chamados_solucionados: 1598, backlog: 1721 },
    { mes: "2025-05", chamados_abertos: 1454, chamados_solucionados: 1616, backlog: 1598 },
    { mes: "2025-06", chamados_abertos: 1362, chamados_solucionados: 1380, backlog: 1436 },
    { mes: "2025-07", chamados_abertos: 1367, chamados_solucionados: 1489, backlog: 1314 },
    { mes: "2025-08", chamados_abertos: 1355, chamados_solucionados: 1369, backlog: 1145 }
];

export const mockMaintenanceIndicators: MaintenanceIndicator[] = fullIndicatorData.map((item, index) => {
    const prevItem = fullIndicatorData[index - 1] || item;
    const sla_mensal = 78 + Math.sin(index) * 5; // Placeholder SLA
    const crescimento_mensal_sla = sla_mensal - (78 + Math.sin(index - 1) * 5);
    const valor_mensal = (item.chamados_abertos * 700) + Math.random() * 100000;
    const prev_valor_mensal = (prevItem.chamados_abertos * 700) + Math.random() * 100000;

    const totalCriticidade = (item.chamados_abertos);
    const criticidade = {
        baixa: Math.floor(totalCriticidade * (0.1 + Math.random() * 0.1)),
        media: Math.floor(totalCriticidade * (0.4 + Math.random() * 0.1)),
        alta: Math.floor(totalCriticidade * (0.3 + Math.random() * 0.1)),
        muito_alta: Math.floor(totalCriticidade * (0.1 + Math.random() * 0.1))
    };
    
    const generateAgingData = () => ({
        baixa: Math.floor(Math.random() * 50),
        media: Math.floor(Math.random() * 100),
        alta: Math.floor(Math.random() * 150),
        muito_alta: Math.floor(Math.random() * 80),
    });

    return {
        id: String(index + 1),
        mes: item.mes,
        sla_mensal: parseFloat(sla_mensal.toFixed(2)),
        meta_sla: 80.0,
        crescimento_mensal_sla: parseFloat(crescimento_mensal_sla.toFixed(2)),
        r2_tendencia: 90.0 + Math.random() * 2, // Placeholder
        chamados_abertos: item.chamados_abertos,
        chamados_solucionados: item.chamados_solucionados,
        backlog: item.backlog,
        valor_mensal: parseFloat(valor_mensal.toFixed(2)),
        variacao_percentual_valor: parseFloat((((valor_mensal - prev_valor_mensal) / prev_valor_mensal) * 100).toFixed(2)),
        aging: {
            inferior_30: generateAgingData(),
            entre_30_60: generateAgingData(),
            entre_60_90: generateAgingData(),
            superior_90: generateAgingData(),
        },
        criticidade: criticidade,
        prioridade: {
            baixa: Math.random() * 20,
            media: Math.random() * 30,
            alta: Math.random() * 40,
            muito_alta: Math.random() * 10
        }
    };
});
