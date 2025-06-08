import { spawn } from 'child_process';
import path from 'path';

console.log('Starting ShareIt server...');

const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  if (code !== 0) {
    console.log('Restarting server in 2 seconds...');
    setTimeout(() => {
      spawn(process.argv[0], [__filename], {
        stdio: 'inherit',
        detached: true
      }).unref();
    }, 2000);
  }
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  serverProcess.kill('SIGINT');
});