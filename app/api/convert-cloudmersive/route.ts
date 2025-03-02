import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string;
    
    // Check required parameters
    if (!file || !targetFormat) {
      return NextResponse.json({ error: 'File and target format are required' }, { status: 400 });
    }
    
    if (!process.env.CONVERSION_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    
    // Get input format from file extension
    const sourceFormat = file.name.split('.').pop()?.toLowerCase();
    
    // Choose the appropriate Cloudmersive endpoint based on formats
    let endpoint = '';
    let formDataForApi = new FormData();
    formDataForApi.append('inputFile', file);
    
    if (sourceFormat === 'pdf' && targetFormat === 'docx') {
      endpoint = 'https://api.cloudmersive.com/convert/pdf/to/docx';
    } else if (sourceFormat === 'pdf' && targetFormat === 'jpg') {
      endpoint = 'https://api.cloudmersive.com/convert/pdf/to/jpg';
    } else if (['doc', 'docx'].includes(sourceFormat || '') && targetFormat === 'pdf') {
      endpoint = 'https://api.cloudmersive.com/convert/docx/to/pdf';
    } else {
      return NextResponse.json({ 
        error: 'Unsupported conversion combination',
        details: `Converting ${sourceFormat} to ${targetFormat} is not supported by this API`
      }, { status: 400 });
    }
    
    // Call Cloudmersive API
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formDataForApi,
      headers: {
        'Apikey': process.env.CONVERSION_API_KEY
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    // Return the converted file
    const convertedFile = await response.arrayBuffer();
    const baseFileName = file.name.split('.').shift() || 'converted';
    
    return new NextResponse(convertedFile, {
      headers: {
        'Content-Disposition': `attachment; filename="${baseFileName}.${targetFormat}"`,
        'Content-Type': getContentTypeForFormat(targetFormat)
      }
    });
    
  } catch (error) {
    console.error('Cloudmersive conversion error:', error);
    return NextResponse.json({
      error: 'Conversion failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function getContentTypeForFormat(format: string): string {
  const contentTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'jpg': 'image/jpeg',
    'png': 'image/png'
    // Add more as needed
  };
  
  return contentTypes[format] || 'application/octet-stream';
}
