import { existsSync, mkdirSync, copyFileSync, cpSync, symlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, run } from './common.mjs';

const env = {
  ...process.env, E2E_BUILD: '1', EXPO_NO_DOTENV: '1', CI: '1',
  EXPO_PUBLIC_API_URL: 'http://10.0.2.2:18080',
  EXPO_PUBLIC_KEYCLOAK_URL: 'http://10.0.2.2:18180',
  EXPO_PUBLIC_KEYCLOAK_REALM: 'ecommerce', EXPO_PUBLIC_KEYCLOAK_CLIENT_ID: 'mobile-app',
};
try {
  const staging = resolve(root, '.e2e/build');
  mkdirSync(staging, { recursive: true });
  for (const path of ['src', 'assets', 'app.json', 'app.config.js', 'package.json', 'package-lock.json', 'tsconfig.json']) {
    cpSync(resolve(root, path), resolve(staging, path), { recursive: true });
  }
  if (!existsSync(resolve(staging, 'node_modules'))) {
    symlinkSync(resolve(root, 'node_modules'), resolve(staging, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  }
  // Generate in staging: never rewrite an existing developer android/ project.
  run(process.execPath, [resolve(root, 'node_modules/expo/bin/cli'), 'prebuild', '--platform', 'android', '--no-install'], { cwd: staging, env });
  run(process.platform === 'win32' ? 'gradlew.bat' : './gradlew',
    [':app:assembleRelease', '-PreactNativeArchitectures=x86_64', '--no-daemon', '--max-workers=2'],
    { cwd: resolve(staging, 'android'), env, shell: process.platform === 'win32' });
  const apk = resolve(staging, 'android/app/build/outputs/apk/release/app-release.apk');
  if (!existsSync(apk)) throw new Error('Gradle did not produce an installable release APK');
  mkdirSync(resolve(root, '.e2e'), { recursive: true });
  copyFileSync(apk, resolve(root, '.e2e/mobile-e2e.apk'));
} catch (error) { console.error(error); process.exitCode = 1; }
