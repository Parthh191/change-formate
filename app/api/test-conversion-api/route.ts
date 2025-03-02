import { NextResponse } from 'next/server';

/**
 * Endpoint to test if your conversion API key is working correctly
 */
export async function GET() {
  try {
    // Check if the API key is set
    if (!process.env.CONVERSION_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'CONVERSION_API_KEY is not set'
      }, { status: 400 });
    }
    
    // Make a simple request to check API key validity
    // This will vary by provider - adjust accordingly
    const response = await fetch('https://api.your-chosen-provider.com/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CONVERSION_API_KEY}`
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: 'API key validation failed',
        details: await response.text()
      }, { status: 400 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'API key is valid and working correctly'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to validate API key',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
