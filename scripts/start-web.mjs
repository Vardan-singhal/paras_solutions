import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { waitForApi } from './wait-for-api.mjs';
import { loadFrontendEnv } from './load-env.mjs';
const mode = process.argv[2];
if (!['dev', 'start'].includes(mode)) throw new Error('Choose dev or start.');
const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const directory = fileURLToPath(new URL('../frontend/', import.meta.url));
require('@next/env').loadEnvConfig(directory, mode === 'dev');
loadFrontendEnv();
const api = process.env.API_INTERNAL_URL || 'http://127.0.0.1:4000';
console.log('Waiting for the API and database before starting the website…');
await waitForApi(api);
const child = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), mode, '--port', '3000'],
  {
    cwd: fileURLToPath(new URL('../frontend/', import.meta.url)),
    stdio: 'inherit',
    windowsHide: true,
  },
);
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
child.on('exit', (code) => {
  process.exitCode = code || 0;
});
