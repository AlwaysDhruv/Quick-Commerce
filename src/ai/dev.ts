import { config } from 'dotenv';
config();

import '@/ai/flows/generate-product-description.ts';
import '@/ai/flows/recommend-products.ts';
import '@/ai/flows/geocode-address-flow.ts';
import