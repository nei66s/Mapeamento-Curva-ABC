'use server';
/**
 * @fileOverview Provides a flow to optimize a route of stores based on their coordinates.
 *
 * - optimizeRoute - A function that takes a list of stores and returns an optimized route.
 * - RouteOptimizerInput - The input type for the optimizeRoute function.
 * - RouteOptimizerOutput - The return type for the optimizeRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const RouteOptimizerInputSchema = z.object({
  stores: z.array(StoreSchema).describe('An array of store objects to be included in the route.'),
});
export type RouteOptimizerInput = z.infer<typeof RouteOptimizerInputSchema>;

export const RouteOptimizerOutputSchema = z.object({
  optimizedRoute: z.array(z.string()).describe('An array of store IDs in the optimized order.'),
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
  prompt: `You are a route optimization expert for a logistics company.
  Your task is to solve the Traveling Salesperson Problem (TSP) for a given list of stores (locations).
  You must determine the most efficient route that starts at the first store in the list, visits every other store exactly once, and returns to the starting store.
  The output should be an array of store IDs in the optimal visiting order and the total distance of the route in kilometers.

  Here is the list of stores with their IDs and coordinates (latitude, longitude):
  {{#each stores}}
  - Store ID: {{id}}, Name: {{name}}, Coordinates: ({{lat}}, {{lng}})
  {{/each}}

  Please provide the optimized route and the total distance.
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
      return {
        optimizedRoute: input.stores.map(s => s.id),
        totalDistance: 0,
      };
    }
    const {output} = await routeOptimizerPrompt(input);
    return output!;
  }
);
