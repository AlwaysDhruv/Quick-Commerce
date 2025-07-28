
'use server';

import { promises as fs } from 'fs';
import path from 'path';

// IMPORTANT: This path must be relative to the project root where the server is running.
const cssFilePath = path.join(process.cwd(), 'src', 'app', 'globals.css');

export async function updateTheme(theme: {
  primary: string;
  background: string;
  accent: string;
}) {
  try {
    // Read the original file content
    const originalCss = await fs.readFile(cssFilePath, 'utf-8');

    // Replace the color variables
    let updatedCss = originalCss
      .replace(/--primary:\s*[^;]+;/, `--primary: ${theme.primary};`)
      .replace(/--background:\s*[^;]+;/, `--background: ${theme.background};`)
      .replace(/--accent:\s*[^;]+;/, `--accent: ${theme.accent};`);
    
    // Also update the dark theme colors to match, ensuring consistency.
    updatedCss = updatedCss
      .replace(/(\.dark\s*\{[^}]*--primary:\s*)[^;]+(;)/, `$1${theme.primary}$2`)
      .replace(/(\.dark\s*\{[^}]*--background:\s*)[^;]+(;)/, `$1${theme.background}$2`)
      .replace(/(\.dark\s*\{[^}]*--accent:\s*)[^;]+(;)/, `$1${theme.accent}$2`)


    // Write the updated content back to the file
    await fs.writeFile(cssFilePath, updatedCss, 'utf-8');
    
    return { success: true, message: 'Theme updated successfully.' };
  } catch (error) {
    console.error('Failed to update theme:', error);
    // In a real app, you'd want more robust error handling.
    // For this prototype, we'll just throw the error.
    if (error instanceof Error) {
        throw new Error(`Failed to update globals.css: ${error.message}`);
    }
    throw new Error('An unknown error occurred while updating the theme.');
  }
}
