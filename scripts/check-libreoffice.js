#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

console.log('Checking LibreOffice installation...');

// Try different commands based on common LibreOffice installation paths
const commands = [
  'libreoffice --version',
  'soffice --version',
  '/usr/bin/libreoffice --version',
  '/usr/bin/soffice --version',
  '/usr/lib/libreoffice/program/soffice --version',
  '/Applications/LibreOffice.app/Contents/MacOS/soffice --version', // macOS
  'C:\\Program Files\\LibreOffice\\program\\soffice.exe --version', // Windows
];

// For Docker environments
const dockerCommands = [
  'which libreoffice',
  'which soffice',
  'apt-get -y update && apt-get -y install libreoffice',
];

console.log(`Operating System: ${os.type()} ${os.release()}`);

let success = false;

function runCommand(command, index) {
  if (index >= commands.length && !success) {
    console.log('\n-------------------------------------------');
    console.log('❌ LibreOffice not found or not working properly.');
    console.log('\nTo install LibreOffice:');
    console.log('- Ubuntu/Debian: sudo apt-get install libreoffice');
    console.log('- macOS: brew install libreoffice or download from https://www.libreoffice.org/');
    console.log('- Windows: Download from https://www.libreoffice.org/');
    console.log('-------------------------------------------');
    return;
  }
  
  if (success) return;
  
  const currentCommand = command || commands[index];
  console.log(`\nTrying: ${currentCommand}`);
  
  exec(currentCommand, (error, stdout, stderr) => {
    if (!error) {
      success = true;
      console.log('✅ LibreOffice found:');
      console.log(stdout.trim());
      console.log('\nLibreOffice is correctly installed and available for the converter application.');
    } else {
      console.log(`Command failed: ${error.message}`);
      if (command) {
        // If we're in the docker commands phase
        if (commands.indexOf(command) === commands.length - 1) {
          runCommand(dockerCommands[0], 0);
        } else {
          runCommand(dockerCommands[commands.indexOf(command) + 1], 0);
        }
      } else {
        runCommand(null, index + 1);
      }
    }
  });
}

// Start checking
runCommand(null, 0);
