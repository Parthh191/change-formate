/**
 * Client-side conversion utilities for simple format conversions
 * that don't require LibreOffice
 */

/**
 * Check if we can convert this format in the browser
 * @param sourceFormat The source file format
 * @param targetFormat The target file format
 */
export function canConvertInBrowser(sourceFormat: string, targetFormat: string): boolean {
  // Simple image conversions that browsers can handle
  const browserCompatibleConversions = {
    'png': ['jpeg', 'jpg', 'webp'],
    'jpeg': ['png', 'webp'],
    'jpg': ['png', 'webp'],
    'webp': ['png', 'jpeg', 'jpg'],
    // Text-based conversions
    'txt': ['text/plain'],
    'csv': ['text/csv'],
  };

  return Boolean(
    browserCompatibleConversions[sourceFormat as keyof typeof browserCompatibleConversions]?.includes(targetFormat)
  );
}

/**
 * Convert an image file to another format in the browser
 * @param file The source file
 * @param targetFormat The target format ('png', 'jpeg', 'webp')
 */
export async function convertImageInBrowser(file: File, targetFormat: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to the desired format
        const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error(`Failed to convert to ${targetFormat}`));
            }
          },
          mimeType,
          0.92 // Quality for jpeg
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Deploy instructions for the Docker solution
 */
export function getDeploymentInstructions(): string {
  return `
# File Conversion Deployment Instructions

1. Build the Docker image:
   \`\`\`
   docker build -t file-converter .
   \`\`\`

2. Run the container:
   \`\`\`
   docker run -p 3000:3000 file-converter
   \`\`\`

3. For cloud deployment:
   - Railway: Connect your GitHub repo and it will automatically detect the Dockerfile
   - DigitalOcean: Create an App from your GitHub repo with Dockerfile deployment
   - Render: Create a Web Service with "Docker" as the environment

These platforms will provide you with a hosted URL for your conversion service.
`;
}
