
'use server';

import { promises as fs } from 'fs';
import path from 'path';

// Define paths to the relevant files
const buyerPagePath = path.join(process.cwd(), 'src', 'app', 'buyer', 'page.tsx');

// Type definition for the configuration object
interface DashboardConfig {
  heroImageUrl: string;
  carouselImages: string[];
  categoryImages: string[];
}

// A helper function to perform replacement using a regex
function replaceImageSource(content: string, hint: string, newUrl: string): string {
  // Regex to find an Image component with a specific data-ai-hint and replace its src
  // It captures the parts before and after the src URL to reconstruct the tag
  const regex = new RegExp(`(<Image[^>]*?data-ai-hint="${hint}"[^>]*?src=")[^"]*("[^>]*>)`);
  return content.replace(regex, `$1${newUrl}$2`);
}


export async function updateDashboard(config: DashboardConfig) {
  try {
    let buyerPageContent = await fs.readFile(buyerPagePath, 'utf-8');

    // --- Update Carousel Images in buyer/page.tsx ---
    const carouselHints = ["sale banner", "tech gadgets", "home decor", "outdoor adventure", "gourmet food"];
    config.carouselImages.forEach((url, index) => {
        if (carouselHints[index]) {
            buyerPageContent = replaceImageSource(buyerPageContent, carouselHints[index], url);
        }
    });

    // --- Update Category Images in buyer/page.tsx ---
     const categoryHints = ["Apparel", "Electronics", "Home Goods", "Sports & Outdoors", "Food & Grocery"];
     config.categoryImages.forEach((url, index) => {
        if (categoryHints[index]) {
            // Special case for categories as the hint is in the category name passed to the component
             const categoryRegex = new RegExp(`(<CategoryCards[^}]*categories=\{.*?name: '${categoryHints[index]}'.*?image: ")([^"]*)(".*?\\}\].*?\/>)`);
             
             // This replacement is more complex and might not work if the component structure changes.
             // It finds the CategoryCards component and drills down to the specific category image.
             // A more robust solution would involve a proper database for this content.
             // For now, we'll try a regex that is specific to the current structure.
             const categoryImageRegex = new RegExp(`(name:\\s*'${categoryHints[index]}',\\s*image:\\s*')[^']*(')`);
             buyerPageContent = buyerPageContent.replace(categoryImageRegex, `$1${url}$2`);
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
