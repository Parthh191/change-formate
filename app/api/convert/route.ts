import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Convert file using LibreOffice and return the path to the converted file
async function convertWithLibreOffice(inputPath: string, outputDir: string, targetFormat: string, isFromPdf: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    // For PDF conversions, we need special handling
    const command = isFromPdf
      ? `soffice --headless --infilter="writer_pdf_import" --convert-to ${targetFormat} --outdir "${outputDir}" "${inputPath}"`
      : `soffice --headless --convert-to ${targetFormat} --outdir "${outputDir}" "${inputPath}"`;
    
    console.log('Executing command:', command);
    
    const timeout = 60000; // 60 seconds timeout for PDF conversions which can take longer
    const process = exec(command, { timeout }, async (error, stdout, stderr) => {
      if (error) {
        console.error('LibreOffice conversion error:', error);
        console.error('Stderr:', stderr);
        return reject(new Error(`Conversion failed: ${stderr || error.message}`));
      }
      
      console.log('LibreOffice stdout:', stdout);
      
      // Get the input filename without path
      const inputFilename = path.basename(inputPath);
      // Get the input filename without extension
      const filenameWithoutExt = inputFilename.substring(0, inputFilename.lastIndexOf('.'));
      
      // List all files in the directory to find the converted file
      try {
        const files = await fs.readdir(outputDir);
        console.log('Directory contents after conversion:', files);
        
        // Look for any file that matches our conversion - with more flexible matching
        const possibleOutputFiles = files.filter(f => 
          (f.includes(filenameWithoutExt) || f.includes(path.parse(filenameWithoutExt).name)) && 
          f.endsWith(`.${targetFormat}`)
        );
        
        if (possibleOutputFiles.length > 0) {
          // Sort by creation time to get the most recent file if multiple matches exist
          const filePaths = await Promise.all(possibleOutputFiles.map(async (file) => {
            const filePath = path.join(outputDir, file);
            const stats = await fs.stat(filePath);
            return { path: filePath, time: stats.mtime.getTime() };
          }));
          
          filePaths.sort((a, b) => b.time - a.time);
          console.log('Found output file:', filePaths[0].path);
          resolve(filePaths[0].path);
        } else {
          reject(new Error('No converted output file found'));
        }
      } catch (dirErr) {
        const errorMessage = dirErr instanceof Error ? dirErr.message : String(dirErr);
        reject(new Error(`Failed to locate output file: ${errorMessage}`));
      }
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    // Parse the FormData from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string;
    
    if (!file || !targetFormat) {
      return NextResponse.json(
        { error: 'File and target format are required' },
        { status: 400 }
      );
    }

    // Create temp directory for processing
    const tempDir = path.join(os.tmpdir(), 'file-converter');
    await fs.mkdir(tempDir, { recursive: true });
    
    // Generate unique filenames
    const uniqueId = uuidv4();
    const originalFilename = file.name;
    const extension = originalFilename.split('.').pop()?.toLowerCase() || '';
    const baseFilename = originalFilename.replace(`.${extension}`, '');
    
    const inputPath = path.join(tempDir, `${uniqueId}-input.${extension}`);
    
    // Save uploaded file to temp directory
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputPath, buffer);
    
    console.log('Processing file conversion:');
    console.log('- Original filename:', originalFilename);
    console.log('- Input path:', inputPath);
    console.log('- Target format:', targetFormat);
    console.log('- Source format:', extension);
    
    // Check if the source is PDF
    const isFromPdf = extension.toLowerCase() === 'pdf';
    if (isFromPdf) {
      console.log('PDF conversion detected, using special handling');
    }

    // Try multiple conversion approaches
    let outputPath;
    try {
      // First attempt with PDF-specific parameters if needed
      outputPath = await convertWithLibreOffice(inputPath, tempDir, targetFormat, isFromPdf);
    } catch (libreOfficeError) {
      console.log('First conversion attempt failed, trying alternative approach...');
      
      try {
        // For PDF to DOCX conversion, alternative approach
        if (isFromPdf && ['doc', 'docx', 'odt'].includes(targetFormat)) {
          const exportParam = targetFormat === 'docx' ? 'export=docx' : 
                             targetFormat === 'doc' ? 'export=doc' : 'export=odt';
          
          const alternativeCommand = `soffice --headless --infilter="writer_pdf_import" --convert-to ${targetFormat}:"${exportParam}" --outdir "${tempDir}" "${inputPath}"`;
          console.log('Executing alternative PDF command:', alternativeCommand);
          
          await new Promise<void>((resolve, reject) => {
            exec(alternativeCommand, { timeout: 60000 }, (error, stdout, stderr) => {
              if (error) {
                console.error('Alternative PDF conversion error:', error);
                return reject(error);
              }
              console.log('Alternative conversion stdout:', stdout);
              resolve();
            });
          });
          
          // Look for the output file
          const files = await fs.readdir(tempDir);
          console.log('Directory contents after alternative conversion:', files);
          
          // Get the input filename without extension
          const filenameBase = path.basename(inputPath, '.pdf');
          
          // Look for any file that might match our conversion - using async fs.stat
          const possibleOutputFiles = await Promise.all(files.map(async (f) => {
            if (f.includes(filenameBase) && f.endsWith(`.${targetFormat}`)) {
              const outputStat = await fs.stat(path.join(tempDir, f));
              const inputStat = await fs.stat(inputPath);
              if (outputStat.mtime > inputStat.mtime) {
                return f;
              }
            }
            return null;
          }));
          
          const possibleOutputFile = possibleOutputFiles.find(f => f !== null);
          
          if (possibleOutputFile) {
            outputPath = path.join(tempDir, possibleOutputFile);
            console.log('Found output file with alternative approach:', outputPath);
          } else {
            throw new Error('Converted file not found after alternative conversion');
          }
        } else {
          throw new Error('Initial conversion failed and no alternative method available');
        }
      } catch (alternativeError) {
        console.error('All conversion attempts failed');
        return NextResponse.json(
          { 
            error: 'PDF conversion failed', 
            details: 'Converting from PDF to this format is not supported. Please try another format.' 
          },
          { status: 500 }
        );
      }
    }
    
    // Read the converted file
    let convertedFile;
    try {
      convertedFile = await fs.readFile(outputPath);
      console.log('Successfully read converted file, size:', convertedFile.length);
      
      // Verify the file is not empty and is valid
      if (convertedFile.length === 0) {
        throw new Error('Converted file is empty');
      }
    } catch (readError) {
      console.error('Error reading converted file:', readError);
      return NextResponse.json(
        { error: 'Failed to read converted file' },
        { status: 500 }
      );
    }
    
    // Clean up temporary files - only try to delete files that exist
    try {
      await fs.access(inputPath);
      await fs.unlink(inputPath);
      console.log('Cleaned up input file');
    } catch (err) {
      console.log('Input file already removed or not found');
    }
    
    try {
      await fs.access(outputPath);
      await fs.unlink(outputPath);
      console.log('Cleaned up output file');
    } catch (err) {
      console.log('Output file already removed or not found');
    }

    // Return the converted file
    return new NextResponse(convertedFile, {
      headers: {
        'Content-Disposition': `attachment; filename="${baseFilename}.${targetFormat}"`,
        'Content-Type': getContentType(targetFormat),
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { 
        error: 'File conversion failed', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

function getContentType(format: string): string {
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    odt: 'application/vnd.oasis.opendocument.text',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odp: 'application/vnd.oasis.opendocument.presentation',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    txt: 'text/plain',
    rtf: 'application/rtf',
    csv: 'text/csv',
  };
  
  return contentTypes[format] || 'application/octet-stream';
}
