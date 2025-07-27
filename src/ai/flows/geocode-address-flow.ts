'use server';

/**
 * @fileOverview An AI flow for reverse geocoding coordinates into a structured address.
 *
 * - geocodeAddress - A function that converts latitude and longitude into an address.
 * - GeocodeAddressInput - The input type for the geocodeAddress function.
 * - GeocodeAddressOutput - The return type for the geocodeAddress function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { defineTool } from 'genkit/tool';
import { config } from 'dotenv';
config();

const GeocodeAddressInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type GeocodeAddressInput = z.infer<typeof GeocodeAddressInputSchema>;

const GeocodeAddressOutputSchema = z.object({
  streetAddress: z.string().describe('The full street address, including house number and street name.'),
  city: z.string().describe('The city or locality.'),
  district: z.string().describe('The administrative area level 2, district, or county.'),
  country: z.string().describe('The country.'),
  pincode: z.string().describe('The postal code or pincode.'),
});
export type GeocodeAddressOutput = z.infer<typeof GeocodeAddressOutputSchema>;

// This tool uses the Google Maps Geocoding API. 
// IMPORTANT: You must enable the "Geocoding API" in your Google Cloud project for this to work.
const geocodeAddressTool = defineTool(
  {
    name: 'geocodeAddressTool',
    description: 'Converts latitude and longitude into a structured address using Google Geocoding API.',
    inputSchema: GeocodeAddressInputSchema,
    outputSchema: GeocodeAddressOutputSchema,
  },
  async ({ latitude, longitude }) => {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error('Firebase API key is not configured.');
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error(`Geocoding failed with status: ${data.status}. ${data.error_message || ''}`);
      }

      const addressComponents = data.results[0].address_components;
      const formattedAddress = data.results[0].formatted_address;

      const getAddressComponent = (type: string, longName = true) => {
        const component = addressComponents.find((c: any) => c.types.includes(type));
        return component ? (longName ? component.long_name : component.short_name) : '';
      };

      // Extract parts. Note: Google's address component types can be complex. This is a best-effort extraction.
      const streetNumber = getAddressComponent('street_number');
      const route = getAddressComponent('route');
      const streetAddress = [streetNumber, route].filter(Boolean).join(' ') || formattedAddress.split(',')[0];
      
      const city = getAddressComponent('locality') || getAddressComponent('postal_town');
      const district = getAddressComponent('administrative_area_level_2');
      const country = getAddressComponent('country');
      const pincode = getAddressComponent('postal_code');

      return {
        streetAddress,
        city,
        district,
        country,
        pincode,
      };
    } catch (error) {
      console.error('Error in geocodeAddressTool:', error);
      throw error;
    }
  }
);


const geocodePrompt = ai.definePrompt({
    name: 'geocodePrompt',
    input: { schema: GeocodeAddressInputSchema },
    output: { schema: GeocodeAddressOutputSchema },
    tools: [geocodeAddressTool],
    prompt: `Based on the provided latitude and longitude, use the geocodeAddressTool to find the structured address.`,
});


const geocodeAddressFlow = ai.defineFlow(
  {
    name: 'geocodeAddressFlow',
    inputSchema: GeocodeAddressInputSchema,
    outputSchema: GeocodeAddressOutputSchema,
  },
  async (input) => {
    const llmResponse = await geocodePrompt(input);
    
    const toolRequest = llmResponse.toolRequest('geocodeAddressTool');
    if (toolRequest) {
      const toolResponse = await toolRequest.run();
      return toolResponse.output!;
    }
    
    // Fallback in case the tool isn't called, though it should be.
    return {
      streetAddress: '',
      city: '',
      district: '',
      country: '',
      pincode: '',
    };
  }
);


export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeAddressOutput> {
  return geocodeAddressFlow(input);
}
