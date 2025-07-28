
'use server';

import { promises as fs } from 'fs';
import path from 'path';

// Define paths to the relevant files
const buyerPagePath = path.join(process.cwd(), 'src', 'app', 'buyer', 'page.tsx');

// Type definition for the configuration object
interface DashboardConfig {
  heroImageUrl: string;
  carouselImages: string[];
  categoryImages: { name: string; url: string; hint: string; }[];
}

// A helper function to perform replacement using a regex
function replaceImageSource(content: string, hint: string, newUrl: string): string {
  // Regex to find an Image component with a specific data-ai-hint and replace its src
  // It captures the parts before and after the src URL to reconstruct the tag
  const regex = new RegExp(`(<Image[^>]*?data-ai-hint="${hint}"[^>]*?src=")[^"]*("[^>]*>)`);
  const match = content.match(regex);
  if (match) {
    return content.replace(regex, `$1${newUrl}$2`);
  }
  // Fallback for category images which have a different structure in the component
   const categoryRegex = new RegExp(`(hint:\\s*'${hint}'[^}]*?image:\\s*')[^']*(')`);
   if (content.match(categoryRegex)){
       return content.replace(categoryRegex, `$1${newUrl}$2`);
   }
  
  return content;
}


export async function updateDashboard(config: DashboardConfig) {
  try {
    let buyerPageContent = await fs.readFile(buyerPagePath, 'utf-8');

    // --- Update Carousel Images in buyer/page.tsx ---
    const carouselHints = ["sale banner", "tech gadgets", "home decor", "outdoor adventure", "gourmet food"];
    config.carouselImages.forEach((url, index) => {
        if (carouselHints[index] && url) {
            buyerPageContent = replaceImageSource(buyerPageContent, carouselHints[index], url);
        }
    });

    // --- Update Category Images in buyer/page.tsx ---
     config.categoryImages.forEach((cat) => {
        if (cat.hint && cat.url) {
            buyerPageContent = replaceImageSource(buyerPageContent, cat.hint, cat.url);
        }
     });

    // The hero image is in src/app/page.tsx, so we handle it separately
    // Since this function is only for the buyer page, we remove the hero logic from here.

    await fs.writeFile(buyerPagePath, buyerPageContent, 'utf-8');
    
    return { success: true, message: 'Buyer homepage updated successfully.' };
  } catch (error) {
    console.error('Failed to update dashboard:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to update page files: ${error.message}`);
    }
    throw new Error('An unknown error occurred while updating the dashboard.');
  }
}
