import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const artifacts = resolve(root, 'artifacts/e2e');
export const appId = 'com.logecommerce.mobile.e2e';
export function run(command, args = [], options = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: 'inherit', ...options });
  if (result.error) throw new Error(`${command}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} exited ${result.status ?? result.signal}`);
  return result.stdout?.trim();
}
export function compose(args, options) {
  return run('docker', ['compose', '--project-name', 'mobile-e2e', '--file', 'e2e/backend/compose.yaml', ...args], options);
}
export async function json(path) {
  const response = await fetch(`http://127.0.0.1:18080${path}`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}
export async function waitFor(label, probe, timeout = 180000) {
  const deadline = Date.now() + timeout;
  let last;
  while (Date.now() < deadline) {
    try { await probe(); return; } catch (error) { last = error; }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`${label} not ready: ${last?.message}`);
}
