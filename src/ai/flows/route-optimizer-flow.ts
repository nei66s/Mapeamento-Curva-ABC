
'use server';
/**
 * @fileOverview Provides a flow to optimize a route of stores based on their coordinates,
 * considering holidays and weekends.
 *
 * - optimizeRoute - A function that takes a list of stores and a start date,
 *   and returns an optimized route with suggested visit dates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getHolidaysTool } from '../tools/get-holidays-tool';

const StoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
});

const RouteOptimizerInputSchema = z.object({
  stores: z.array(StoreSchema).describe('An array of store objects to be included in the route.'),
  startDate: z.string().describe('The start date for the route planning in ISO 8601 format.'),
});
type RouteOptimizerInput = z.infer<typeof RouteOptimizerInputSchema>;

const OptimizedStopSchema = z.object({
    storeId: z.string().describe("The ID of the store."),
    visitDate: z.string().describe("The suggested visit date in ISO 8601 format."),
});

const RouteOptimizerOutputSchema = z.object({
  optimizedRoute: z.array(OptimizedStopSchema).describe('An array of store objects in the optimized order with suggested visit dates.'),
  totalDistance: z.number().describe('The total distance of the optimized route in kilometers.'),
});
export type RouteOptimizerOutput = z.infer<typeof RouteOptimizerOutputSchema>;


export async function optimizeRoute(input: RouteOptimizerInput): Promise<RouteOptimizerOutput> {
  return routeOptimizerFlow(input);
}


const routeOptimizerPrompt = ai.definePrompt({
  name: 'routeOptimizerPrompt',
  input: {schema: RouteOptimizerInputSchema},
  output: {schema: RouteOptimizerOutputSchema},
  tools: [getHolidaysTool],
  prompt: `You are a route optimization expert for a logistics company.
  Your task is to solve the Traveling Salesperson Problem (TSP) for a given list of stores (locations).
  You must determine the most efficient route that starts at the first store in the list, visits every other store exactly once, and returns to the starting store.
  
  After determining the optimal sequence of stores, you must assign a valid visit date for each stop.
  The first visit will be on the provided start date. Each subsequent visit will be on the next available business day.
  Business days are Monday to Friday. You must skip weekends (Saturdays and Sundays) and any holidays returned by the getHolidaysTool.
  Use the getHolidaysTool for the year and month of the start date to check for holidays.

  Here is the list of stores with their IDs and coordinates (latitude, longitude):
  {{#each stores}}
  - Store ID: {{id}}, Name: {{name}}, Coordinates: ({{lat}}, {{lng}})
  {{/each}}
  
  Start date for the route: {{{startDate}}}

  Please provide the optimized route sequence with calculated visit dates and the total distance.
  `,
});

const routeOptimizerFlow = ai.defineFlow(
  {
    name: 'routeOptimizerFlow',
    inputSchema: RouteOptimizerInputSchema,
    outputSchema: RouteOptimizerOutputSchema,
  },
  async (input: RouteOptimizerInput) => {
    if (input.stores.length < 2) {
       const visitDate = new Date(input.startDate);
       const optimizedRoute = input.stores.map(s => ({
          storeId: s.id,
          visitDate: visitDate.toISOString(),
        }));
      return {
        optimizedRoute: optimizedRoute,
        totalDistance: 0,
      };
    }
    const {output} = await routeOptimizerPrompt(input);
    return output!;
  }
);

    