'use client';

import type { Team } from './types';

export const mockTeams: Team[] = [
    {
        id: 'team-01',
        name: 'Regional 01',
        technicians: ['Carlos Silva', 'Mariana Costa'],
        region: 'Campinas e Região',
    },
    {
        id: 'team-02',
        name: 'Regional 02',
        technicians: ['Roberto Almeida', 'Fernanda Lima'],
        region: 'Piracicaba e Limeira',
    },
    {
        id: 'team-03',
        name: 'Regional 03',
        technicians: ['Lucas Pereira', 'Juliana Santos'],
        region: 'Sul de São Paulo',
    },
    {
        id: 'team-04',
        name: 'Regional 04',
        technicians: ['André Souza', 'Beatriz Oliveira'],
        region: 'Capital e Grande SP',
    }
];
