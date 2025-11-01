
'use server';
/**
 * @fileOverview Provides a flow to optimize a route of stores based on their coordinates,
 * considering holidays and weekends, starting from a fixed distribution center.
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
  stores: z.array(StoreSchema).describe('An array of store objects to be included in the route. The first store in the array is always the starting point (Distribution Center).'),
  startDate: z.string().describe('The start date for the route planning in ISO 8601 format.'),
});
type RouteOptimizerInput = z.infer<typeof RouteOptimizerInputSchema>;

const OptimizedStopSchema = z.object({
    storeId: z.string().describe("The ID of the store."),
    visitDate: z.string().describe("The suggested visit date in ISO 8601 format."),
});

const RouteOptimizerOutputSchema = z.object({
  optimizedRoute: z.array(OptimizedStopSchema).describe('An array of store objects in the optimized order with suggested visit dates, starting with the distribution center.'),
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
  Your task is to solve the Traveling Salesperson Problem (TSP) for a given list of locations.
  The route MUST start at the first location in the list, which is the distribution center. You must then visit every other store exactly once.
  You must determine the most efficient sequence of visits to minimize the total travel distance.
  
  After determining the optimal sequence of stores, you must assign a valid visit date for each stop.
  The first visit (to the first store after the distribution center) will be on the provided start date.
  Each subsequent visit will be on the next available business day.
  Business days are Monday to Friday. You must skip weekends (Saturdays and Sundays) and any holidays returned by the getHolidaysTool.
  Use the getHolidaysTool for the year and month of the start date to check for holidays. You should also check the next month if the route extends into it.

  Here is the list of locations with their IDs and coordinates (latitude, longitude):
  {{#each stores}}
  - Store ID: {{id}}, Name: {{name}}, Coordinates: ({{lat}}, {{lng}})
  {{/each}}
  
  Start date for the route: {{{startDate}}}

  Please provide the optimized route sequence including the starting distribution center, with calculated visit dates for the stores, and the total distance of the route. The distribution center itself does not need a visit date.
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
