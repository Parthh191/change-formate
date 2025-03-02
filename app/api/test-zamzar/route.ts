import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint to test if the Zamzar API key is working correctly
 */
export async function GET(_request: NextRequest) {
  try {
    // Check if the API key is set
    const apiKey = process.env.CONVERSION_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'CONVERSION_API_KEY is not set'
      }, { status: 400 });
    }
    
    // Test the API key by making a request to the Zamzar API
    const response = await fetch('https://api.zamzar.com/v1/formats', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        status: 'error',
        message: 'API key validation failed',
        details: errorText
      }, { status: response.status });
    }
    
    // Parse supported formats
    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      message: 'Zamzar API key is valid and working correctly',
      supportedFormats: data.data.length
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to validate Zamzar API key',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
