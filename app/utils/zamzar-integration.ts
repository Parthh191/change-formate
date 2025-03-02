/**
 * Zamzar API Integration for file conversions
 * 
 * This utility handles communication with Zamzar's conversion API
 * Documentation: https://developers.zamzar.com/
 */

import { v4 as uuidv4 } from 'uuid';

// API endpoints
const ZAMZAR_API_BASE = 'https://api.zamzar.com/v1';
const ZAMZAR_JOBS_ENDPOINT = `${ZAMZAR_API_BASE}/jobs`;
const ZAMZAR_FILES_ENDPOINT = `${ZAMZAR_API_BASE}/files`;

// Error class for Zamzar API errors
export class ZamzarError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ZamzarError';
    this.statusCode = statusCode;
  }
}

// Interface for Zamzar job response
interface ZamzarJobResponse {
  id: number;
  key: string;
  status: string;
  source_file: {
    id: number;
    name: string;
  };
  target_files: {
    id: number;
    name: string;
  }[];
  [key: string]: any; // Allow other properties
}

/**
 * Convert a file using Zamzar API
 * @param file The file to convert
 * @param targetFormat The target format
 * @param apiKey The Zamzar API key
 */
export async function convertFileWithZamzar(
  file: File, 
  targetFormat: string, 
  apiKey: string
): Promise<ArrayBuffer> {
  // Validate inputs
  if (!file || !targetFormat || !apiKey) {
    throw new ZamzarError('Missing required parameters');
  }

  try {
    console.log(`Starting Zamzar conversion: ${file.name} to ${targetFormat}`);
    
    // Step 1: Create a job to convert the file
    const jobResponse = await createConversionJob(file, targetFormat, apiKey);
    console.log(`Job created with ID: ${jobResponse.id}`);
    
    // Step 2: Wait for job to complete
    const completedJob = await waitForJobCompletion(jobResponse.id, apiKey);
    console.log(`Job completed: ${completedJob.status}`);
    
    if (!completedJob.target_files || completedJob.target_files.length === 0) {
      throw new ZamzarError('No target files found after conversion');
    }
    
    // Step 3: Download the converted file
    const targetFileId = completedJob.target_files[0].id;
    const convertedFile = await downloadConvertedFile(targetFileId, apiKey);
    console.log(`Downloaded converted file, size: ${convertedFile.byteLength} bytes`);
    
    return convertedFile;
  } catch (error) {
    console.error('Zamzar conversion error:', error);
    if (error instanceof ZamzarError) {
      throw error;
    }
    throw new ZamzarError(`Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a conversion job
 */
async function createConversionJob(
  file: File, 
  targetFormat: string, 
  apiKey: string
): Promise<ZamzarJobResponse> {
  // Create form data for the API request
  const formData = new FormData();
  
  // Change the file name to ensure uniqueness
  const uniqueFileName = `${uuidv4()}-${file.name}`;
  const fileWithUniqueName = new File([file], uniqueFileName, { type: file.type });
  
  // Add file and conversion parameters
  formData.append('source_file', fileWithUniqueName);
  formData.append('target_format', targetFormat);
  
  // Make the API request
  const response = await fetch(ZAMZAR_JOBS_ENDPOINT, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  
  // Handle errors
  if (!response.ok) {
    const errorText = await response.text();
    throw new ZamzarError(`Failed to create conversion job: ${errorText}`, response.status);
  }
  
  // Parse and return the response
  return await response.json();
}

/**
 * Wait for a job to complete
 */
async function waitForJobCompletion(
  jobId: number, 
  apiKey: string, 
  maxAttempts = 60
): Promise<ZamzarJobResponse> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // Get job status
    const response = await fetch(`${ZAMZAR_JOBS_ENDPOINT}/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new ZamzarError(`Failed to check job status: ${errorText}`, response.status);
    }
    
    const job = await response.json();
    
    // Check if job is complete
    if (job.status === 'successful') {
      return job;
    }
    
    // Check for failure
    if (job.status === 'failed') {
      throw new ZamzarError(`Conversion job failed: ${job.failure_reason || 'Unknown reason'}`);
    }
    
    // Wait before checking again
    console.log(`Job status: ${job.status}, waiting...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
  
  throw new ZamzarError('Job timed out');
}

/**
 * Download a converted file
 */
async function downloadConvertedFile(fileId: number, apiKey: string): Promise<ArrayBuffer> {
  const response = await fetch(`${ZAMZAR_FILES_ENDPOINT}/${fileId}/content`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new ZamzarError(`Failed to download converted file: ${errorText}`, response.status);
  }
  
  return await response.arrayBuffer();
}
