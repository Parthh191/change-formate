import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import os from 'os';

export async function GET() {
  try {
    // Check LibreOffice
    let libreOfficeInfo = null;
    try {
      libreOfficeInfo = await checkLibreOffice();
    } catch (error) {
      libreOfficeInfo = { error: (error as Error).message };
    }

    return NextResponse.json({
      status: 'ok',
      time: new Date().toISOString(),
      system: {
        platform: os.platform(),
        release: os.release(),
        hostname: os.hostname(),
        cpus: os.cpus().length,
        memoryTotal: Math.round(os.totalmem() / (1024 * 1024)), // MB
        memoryFree: Math.round(os.freemem() / (1024 * 1024)), // MB
      },
      libreOffice: libreOfficeInfo,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Status check failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function checkLibreOffice(): Promise<any> {
  // Try different commands
  const commands = [
    'libreoffice --version',
    'soffice --version',
  ];

  for (const command of commands) {
    try {
      const info = await runCommand(command);
      return {
        installed: true,
        version: info.trim(),
        command,
      };
    } catch (error) {
      // Try next command
    }
  }

  // If we get here, all commands failed
  throw new Error('LibreOffice not found or not properly installed');
}

function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command failed: ${error.message}`));
      } else {
        resolve(stdout);
      }
    });
  });
}
