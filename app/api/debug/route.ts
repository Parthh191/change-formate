import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import os from 'os';
import { promises as fs } from 'fs';

export async function GET() {
  // Collect environment information
  const environment = {
    platform: os.platform(),
    release: os.release(),
    totalmem: Math.round(os.totalmem() / (1024 * 1024)) + 'MB',
    freemem: Math.round(os.freemem() / (1024 * 1024)) + 'MB',
    cpus: os.cpus().length,
    tmpdir: os.tmpdir(),
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }
  };

  // Check if we can write to temp dir
  let tempWritable = false;
  try {
    const testFile = `${os.tmpdir()}/test-${Date.now()}.txt`;
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    tempWritable = true;
  } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    tempWritable = false;
  }

  // Check for LibreOffice
  let libreoffice = 'Not detected';
  try {
    const result = await new Promise<string>((resolve) => {
      exec('which libreoffice || which soffice', { timeout: 3000 }, (error, stdout) => {
        if (error || !stdout) resolve('Not found');
        else resolve(stdout.trim());
      });
    });
    libreoffice = result;
  } catch (error) {
    libreoffice = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }

  return NextResponse.json({
    environment,
    filesystem: {
      tempWritable,
    },
    binaries: {
      libreoffice
    }
  });
}
