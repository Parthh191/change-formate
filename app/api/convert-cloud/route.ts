import { NextRequest, NextResponse } from 'next/server';
import { convertFileWithZamzar, ZamzarError } from '@/app/utils/zamzar-integration';

/**
 * This endpoint handles conversions in cloud environments like Vercel where
 * LibreOffice is not available. It uses Zamzar for document conversions.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string;
    
    if (!file || !targetFormat) {
      return NextResponse.json(
        { error: 'File and target format are required' },
        { status: 400 }
      );
    }

    // Get file details
    const sourceFormat = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Check if we're running on Vercel
    if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
      // For image conversions, we recommend client-side conversion
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(sourceFormat) && 
          ['jpg', 'jpeg', 'png', 'webp'].includes(targetFormat)) {
        return NextResponse.json({
          clientSideConversion: true,
          message: 'Image conversions should be handled on the client side'
        });
      }
      
      // For document conversions, use Zamzar if configured
      if (process.env.CONVERSION_API_KEY) {
        try {
          // Use Zamzar to convert the file
          console.log(`Using Zamzar to convert from ${sourceFormat} to ${targetFormat}`);
          
          const convertedFile = await convertFileWithZamzar(
            file,
            targetFormat,
            process.env.CONVERSION_API_KEY
          );
          
          // Get base filename for download
          const originalName = file.name.split('.')[0] || 'converted';
          
          // Return the converted file
          return new NextResponse(convertedFile, {
            headers: {
              'Content-Disposition': `attachment; filename="${originalName}.${targetFormat}"`,
              'Content-Type': getContentTypeForFormat(targetFormat),
            },
          });
        } catch (apiError) {
          console.error('Zamzar API error:', apiError);
          
          // Return a user-friendly error
          if (apiError instanceof ZamzarError) {
            return NextResponse.json({
              error: 'Conversion service error',
              details: apiError.message
            }, { status: apiError.statusCode || 500 });
          }
          
          throw apiError; // Let the outer catch handle it
        }
      }
      
      // If we get here, no conversion method was available
      return NextResponse.json({
        error: 'Conversion not available in this environment',
        details: `Converting from ${sourceFormat} to ${targetFormat} requires either LibreOffice (not available in Vercel) or a configured API key. Your conversion will work in the self-hosted version.`,
        selfHostingInfo: true
      }, { status: 501 });
    }
    
    // Forward to regular conversion endpoint if not on Vercel
    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData
    });
    
    return response;
    
  } catch (error) {
    console.error('Cloud conversion error:', error);
    return NextResponse.json(
      { 
        error: 'File conversion failed',
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

function getContentTypeForFormat(format: string): string {
  const contentTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'txt': 'text/plain',
    'csv': 'text/csv',
    // Add more as needed
  };
  
  return contentTypes[format] || 'application/octet-stream';
}
