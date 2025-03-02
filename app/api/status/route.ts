import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import os from 'os';

// Interface used for documenting our structure
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SystemStatus {
  libreoffice: {
    installed: boolean;
    version: string | null;
    error?: string;
  };
  system: {
    platform: string;
    memory: {
      total: number;
      free: number;
    };
    cpu: {
      cores: number;
      model: string;
      speed: number;
    };
  };
}

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
  } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  }
}

// Fix the stderr unused variable
async function checkLibreOffice(): Promise<{ installed: boolean; version: string | null; command?: string }> {
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
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // Try next command
    }
  }

  // If we get here, all commands failed
  throw new Error('LibreOffice not found or not properly installed');
}

function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, _stderr) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      if (error) {
        reject(new Error(`Command failed: ${error.message}`));
      } else {
        resolve(stdout);
      }
    });
  });
}
