import type { Item, Incident, Category } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

function getRandomClassification() {
  const rand = Math.random();
  if (rand < 0.2) return 'A';
  if (rand < 0.5) return 'B';
  return 'C';
}

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

export const mockItems: Item[] = itemNames.map((name, index) => {
  const imageId = `item-image-${(index % 5) + 1}`;
  const image = PlaceHolderImages.find(img => img.id === imageId);
  return {
    id: `ITM-${String(index + 1).padStart(3, '0')}`,
    name: name,
    category: (itemCategoryMap as Record<string, string>)[name] || "Geral",
    classification: getRandomClassification(),
    storeCount: Math.floor(Math.random() * 10) + 1,
    generalIndex: Math.floor(Math.random() * 10) + 1,
    status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'offline' : 'maintenance') : 'online',
    contingencyPlan: contingencyPlans[Math.floor(Math.random() * contingencyPlans.length)],
    leadTime: leadTimes[Math.floor(Math.random() * leadTimes.length)],
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

export const mockCategories: Category[] = rawCategories.map(category => {
    const itemsInCategory = mockItems.filter(item => item.category === category.name);
    const itemCount = itemsInCategory.length;
    const totalRisk = itemsInCategory.reduce((acc, item) => acc + item.generalIndex, 0);
    const riskIndex = itemCount > 0 ? Math.round(totalRisk / itemCount) : 0;
    
    let imageUrl = '';
    switch(category.name) {
        case 'Segurança / CFTV / Alarme':
            imageUrl = PlaceHolderImages.find(i => i.id === 'item-image-2')?.imageUrl || '';
            break;
        case 'Elétrica / Iluminação':
            imageUrl = PlaceHolderImages.find(i => i.id === 'item-image-3')?.imageUrl || '';
            break;
        case 'Refrigeração / Climatização Central':
             imageUrl = PlaceHolderImages.find(i => i.id === 'item-image-1')?.imageUrl || '';
             break;
        case 'Açougue / Frios':
            imageUrl = PlaceHolderImages.find(i => i.id === 'item-image-4')?.imageUrl || '';
            break;
        case 'Padaria / Confeitaria':
            imageUrl = PlaceHolderImages.find(i => i.id === 'item-image-5')?.imageUrl || '';
            break;
    }

    return {
        ...category,
        itemCount,
        riskIndex,
        imageUrl,
    };
});


export const mockIncidents: Incident[] = [
  { id: 'INC-001', itemName: 'Rack de compressores / unidade condensadora', location: 'Loja A (SP)', status: 'Aberto', openedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), description: "Parada total do equipamento de refrigeração central, afetando a climatização de toda a área de vendas. A temperatura interna subiu 5°C em 1 hora.", lat: -23.5505, lng: -46.6333 },
  { id: 'INC-002', itemName: 'Balcões refrigerados', location: 'Loja B (RJ)', status: 'Em Andamento', openedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), description: "Não está atingindo a temperatura ideal, risco de perda de produtos perecíveis. A temperatura está oscilando entre 8°C e 12°C.", lat: -22.9068, lng: -43.1729 },
  { id: 'INC-003', itemName: 'QGBT / Quadro geral', location: 'Loja C (MG)', status: 'Resolvido', openedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), description: "Desarme do disjuntor principal causou interrupção total de energia na loja por 45 minutos. Todas as operações foram paralisadas.", lat: -19.9167, lng: -43.9345 },
  { id: 'INC-004', itemName: 'Nobreak central / retificador', location: 'Depósito Central (BA)', status: 'Fechado', openedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), description: "Falha na bateria do nobreak durante uma queda de energia, resultando na perda de dados não salvos nos servidores administrativos.", lat: -12.9777, lng: -38.5016 },
  { id: 'INC-005', itemName: 'Câmeras externas / perímetro', location: 'Loja D (RS)', status: 'Aberto', openedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), description: "Uma das câmeras do perímetro parou de gravar. A imagem está congelada.", lat: -30.0346, lng: -51.2177 },
];
