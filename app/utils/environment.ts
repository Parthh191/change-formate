/**
 * Environment detection utilities for the file converter application
 */

export type RuntimeEnvironment = 'vercel' | 'local' | 'docker' | 'unknown';

/**
 * Detects the current runtime environment
 */
export function detectEnvironment(): RuntimeEnvironment {
  if (typeof process === 'undefined') return 'unknown';
  
  if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
    return 'vercel';
  }
  
  if (process.env.DOCKER_CONTAINER || process.env.CONTAINER) {
    return 'docker';
  }
  
  return 'local';
}

/**
 * Checks if the current environment supports LibreOffice conversions
 */
export async function supportsLibreOfficeConversions(): Promise<boolean> {
  const env = detectEnvironment();
  
  // Vercel doesn't support LibreOffice
  if (env === 'vercel') return false;
  
  // Local and Docker environments might support it - check for soffice binary
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    return data.libreOffice?.installed === true;
  } catch (e) {
    console.error('Failed to check LibreOffice status:', e);
    // Assume not available if check fails
    return false;
  }
}

/**
 * Gets the appropriate conversion endpoint based on environment capabilities
 */
export function getConversionEndpoint(): string {
  const env = detectEnvironment();
  
  if (env === 'vercel') {
    return '/api/convert-cloud';
  }
  
  return '/api/convert';
}
