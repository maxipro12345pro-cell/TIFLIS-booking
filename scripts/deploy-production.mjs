/* global process, console */
import { spawnSync } from 'node:child_process';

const PUBLIC_ALIAS = 'tiflis-booking.vercel.app';
const isDryRun = process.argv.includes('--dry-run');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function run(command, args, options = {}) {
  const pretty = [command, ...args].join(' ');

  if (isDryRun) {
    console.log(`[dry-run] ${pretty}`);
    return { stdout: '' };
  }

  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 16,
    stdio: options.capture ? ['inherit', 'pipe', 'pipe'] : 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    if (result.stdout) console.error(result.stdout);
    if (result.stderr) console.error(result.stderr);
    if (result.error) console.error(result.error.message);
    throw new Error(`Command failed: ${pretty}`);
  }

  return result;
}

function extractDeploymentUrl(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed) return '';

  try {
    const parsed = JSON.parse(trimmed);
    return parsed?.deployment?.url || parsed?.url || '';
  } catch {
    const match = trimmed.match(/https:\/\/[^\s]+\.vercel\.app/);
    return match?.[0] || '';
  }
}

console.log('Deploying production build to Vercel...');
const deployment = run(npx, ['vercel', 'deploy', '--prod', '--yes', '--format', 'json'], { capture: true });
const deploymentUrl = isDryRun ? 'dry-run.vercel.app' : extractDeploymentUrl(deployment.stdout);

if (!deploymentUrl) {
  throw new Error('Vercel deployment URL was not found in CLI output. Alias was not changed.');
}

console.log(`Assigning ${PUBLIC_ALIAS} -> ${deploymentUrl}`);
run(npx, ['vercel', 'alias', 'set', deploymentUrl, PUBLIC_ALIAS]);
console.log(`Production is ready: https://${PUBLIC_ALIAS}`);