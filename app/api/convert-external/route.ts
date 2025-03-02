import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string;
    
    // Prepare data for external API
    const externalFormData = new FormData();
    externalFormData.append('file', file);
    externalFormData.append('format', targetFormat);
    
    // Forward to external conversion service
    const response = await fetch('https://api.conversion-service.com/convert', {
      method: 'POST',
      body: externalFormData,
      headers: {
        'Authorization': `Bearer ${process.env.CONVERSION_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Return the converted file
    const convertedFile = await response.arrayBuffer();
    return new NextResponse(convertedFile, {
      headers: {
        'Content-Disposition': `attachment; filename="converted.${targetFormat}"`,
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Conversion failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
