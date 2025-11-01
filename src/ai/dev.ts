import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-contingency-plans.ts';
import '@/ai/flows/incident-summary.ts';
import '@/ai/tools/get-holidays-tool.ts';
import '@/ai/flows/summarize-kpi-flow.ts';
