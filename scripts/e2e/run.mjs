import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, artifacts, appId, run } from './common.mjs';
import { reset } from './backend.mjs';

const flows = ['home-product', 'catalog-filters', 'search', 'cart'];
let failed = false;
try {
  mkdirSync(artifacts, { recursive: true });
  const devices = run('adb', ['devices'], { stdio: 'pipe' }).split(/\r?\n/).filter(line => /^emulator-\d+\s+device$/.test(line));
  if (devices.length !== 1) throw new Error('Exactly one booted Android emulator is required (adb devices).');
  const serial = devices[0].split(/\s/)[0];
  run('maestro', ['--version'], { shell: process.platform === 'win32' });
  const apk = resolve(root, '.e2e/mobile-e2e.apk');
  if (!existsSync(apk)) throw new Error('Missing APK: run npm run e2e:build first.');
  run('adb', ['-s', serial, 'install', '-r', apk]);
  if (!run('adb', ['-s', serial, 'shell', 'pm', 'path', appId], { stdio: 'pipe' }).includes('package:')) throw new Error('E2E package was not installed');
  for (const flow of flows) {
    const directory = resolve(artifacts, `${Date.now()}-${flow}`);
    mkdirSync(directory, { recursive: true });
    // Database reset + launchApp.clearState make every flow order-independent.
    await reset();
    const report = resolve(directory, 'report.xml');
    const result = spawnSync('maestro', ['--device', serial, 'test', '--format', 'junit', '--output', report,
      '--debug-output', directory, '--test-output-dir', directory, `.maestro/${flow}.yaml`],
      { cwd: root, encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 32 * 1024 * 1024 });
    writeFileSync(resolve(directory, 'maestro.log'), `${result.stdout ?? ''}\n${result.stderr ?? ''}\n${result.error ?? ''}`);
    process.stdout.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    const xml = existsSync(report) ? readFileSync(report, 'utf8') : '';
    // Zero exit without a test case is NOT success. Never silently skip flows.
    const bad = result.status !== 0 || !/<testcase\b/.test(xml) || /<(failure|error|skipped)\b/.test(xml);
    failed ||= bad;
    const logs = spawnSync('adb', ['-s', serial, 'logcat', '-d'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    writeFileSync(resolve(directory, 'logcat.log'), logs.stdout ?? logs.stderr ?? '');
    if (bad) {
      const screenshot = spawnSync('adb', ['-s', serial, 'exec-out', 'screencap', '-p']);
      if (screenshot.status === 0) writeFileSync(resolve(directory, 'failure.png'), screenshot.stdout);
      console.error(`FAILED ${flow}: inspect ${directory}`);
    }
  }
} catch (error) { console.error(error); failed = true; }
process.exitCode = failed ? 1 : 0;
