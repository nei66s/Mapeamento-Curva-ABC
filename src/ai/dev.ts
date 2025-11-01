import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-contingency-plans.ts';
import '@/ai/flows/incident-summary.ts';
import '@/ai/flows/route-optimizer-flow.ts';
import '@/ai/tools/get-holidays-tool.ts';

    