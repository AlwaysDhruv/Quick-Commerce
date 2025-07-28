
'use server';

import { promises as fs } from 'fs';
import path from 'path';

const pageFilePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');

export async function updateDashboard(config: {
  heroImageUrl: string;
}) {
  try {
    const originalContent = await fs.readFile(pageFilePath, 'utf-8');

    // Use a regular expression to find and replace the src attribute of the main hero image.
    // This targets the Image component with a data-ai-hint="online shopping"
    const updatedContent = originalContent.replace(
      /(<Image[^>]*?data-ai-hint="online shopping"[^>]*?src=")[^"]*("[^>]*>)/,
      `$1${config.heroImageUrl}$2`
    );

    if (originalContent === updatedContent) {
        throw new Error("Could not find the target Image component in src/app/page.tsx. The replacement failed.");
    }

    await fs.writeFile(pageFilePath, updatedContent, 'utf-8');
    
    return { success: true, message: 'Homepage updated successfully.' };
  } catch (error) {
    console.error('Failed to update dashboard:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to update page.tsx: ${error.message}`);
    }
    throw new Error('An unknown error occurred while updating the dashboard.');
  }
}
