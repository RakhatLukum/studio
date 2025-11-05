'use server';

/**
 * @fileOverview An AI agent that finds local job and internship opportunities using the Google Maps Places API.
 *
 * - findLocalOpportunities - A function that finds local job/internship opportunities.
 * - FindLocalOpportunitiesInput - The input type for the findLocalOpportunities function.
 * - FindLocalOpportunitiesOutput - The return type for the findLocalOpportunities function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindLocalOpportunitiesInputSchema = z.object({
  careerName: z.string().describe('The career path to search for (e.g., "Software Engineer", "Graphic Designer").'),
  latitude: z.number().describe("The user's latitude."),
  longitude: z.number().describe("The user's longitude."),
  radius: z.number().default(10000).describe('Search radius in meters.'),
});
export type FindLocalOpportunitiesInput = z.infer<typeof FindLocalOpportunitiesInputSchema>;

const PlaceSchema = z.object({
  name: z.string().describe('Company name.'),
  address: z.string().describe('Company address.'),
  rating: z.number().optional().describe('Company rating on Google.'),
  website: z.string().optional().describe('Company website.'),
});

const FindLocalOpportunitiesOutputSchema = z.object({
  opportunities: z.array(PlaceSchema).describe('A list of local companies and potential internship opportunities.'),
});
export type FindLocalOpportunitiesOutput = z.infer<typeof FindLocalOpportunitiesOutputSchema>;

export async function findLocalOpportunities(input: FindLocalOpportunitiesInput): Promise<FindLocalOpportunitiesOutput> {
  return findLocalOpportunitiesFlow(input);
}

// Define a tool for the Places API
const findCompaniesTool = ai.defineTool(
    {
        name: 'findCompaniesTool',
        description: 'Searches for companies near a given location based on a career type.',
        inputSchema: FindLocalOpportunitiesInputSchema,
        outputSchema: FindLocalOpportunitiesOutputSchema,
    },
    async (input) => {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
            console.error('Google Maps API Key is not configured.');
            // Return a specific error message or empty opportunities
            return { opportunities: [] };
        }

        const query = `${input.careerName} internships`;
        const url = `https://places.googleapis.com/v1/places:searchText`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri,places.rating',
                },
                body: JSON.stringify({
                    textQuery: query,
                    locationBias: {
                        circle: {
                            center: {
                                latitude: input.latitude,
                                longitude: input.longitude,
                            },
                            radius: input.radius,
                        },
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Places API request failed:', errorData);
                throw new Error(`Google Places API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            const opportunities = (data.places || []).map((place: any) => ({
                name: place.displayName?.text || 'Unknown Company',
                address: place.formattedAddress,
                website: place.websiteUri,
                rating: place.rating,
            }));

            return { opportunities };

        } catch (error) {
            console.error('Error calling Places API:', error);
            return { opportunities: [] };
        }
    }
);


const findLocalOpportunitiesFlow = ai.defineFlow(
  {
    name: 'findLocalOpportunitiesFlow',
    inputSchema: FindLocalOpportunitiesInputSchema,
    outputSchema: FindLocalOpportunitiesOutputSchema,
    tools: [findCompaniesTool],
  },
  async (input) => {
    // We directly call the tool here, as the LLM doesn't need to decide anything.
    // We are just using the tool as a structured way to call an external API.
    return findCompaniesTool(input);
  }
);
