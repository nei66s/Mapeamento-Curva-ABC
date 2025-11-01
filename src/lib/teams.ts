'use client';

import type { Team } from './types';

export const mockTeams: Team[] = [
    {
        id: 'team-01',
        name: 'Equipe Alpha',
        technicians: ['Carlos Silva', 'Mariana Costa'],
        region: 'Campinas e Região',
    },
    {
        id: 'team-02',
        name: 'Equipe Beta',
        technicians: ['Roberto Almeida', 'Fernanda Lima'],
        region: 'Piracicaba e Limeira',
    },
    {
        id: 'team-03',
        name: 'Equipe Gama',
        technicians: ['Lucas Pereira', 'Juliana Santos'],
        region: 'Sul de São Paulo',
    }
];
