#!/usr/bin/env node
'use strict';

/**
 * Mailpit — local SMTP catcher for dev email testing.
 *
 *   yarn mail                  # start Mailpit (foreground)
 *
 * If Mailpit is already running on :1025, prints the UI URL and exits.
 * Otherwise finds an existing binary (PATH → scripts/.mailpit/ → Docker)
 * or downloads the official single-binary release. No package manager,
 * no root, no Docker required.
 *
 * Point your .env.dev SMTP_HOST at localhost:1025 to capture every
 * outbound email from the server during development. The new server
 * config branches on NODE_ENV and picks port 1025 automatically when
 * NODE_ENV=development, so no extra wiring is required.
 */

const { execFileSync, execSync, spawn } = require('node:child_process');
const fs = require('node:fs');
const https = require('node:https');
const net = require('node:net');
const path = require('node:path');

// ── arg parsing ──────────────────────────────────────────────────────────
const cliArgs = process.argv.slice(2);
if (cliArgs.includes('--help') || cliArgs.includes('-h')) {
  console.log(`
  Usage: yarn mail [--download] [--no-color]

  Starts a local SMTP catcher (Mailpit) on :1025 with a web UI on :8025.
  Point your .env.dev SMTP_HOST at localhost:1025 to capture outbound
  email from the server during development.

  Options:
    --download    Force re-download of the Mailpit binary
    --no-color    Suppress ANSI colors
    --help, -h    Show this message
`);
  process.exit(0);
}
const forceDownload = cliArgs.includes('--download');

// ── output ───────────────────────────────────────────────────────────────
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const useColor = process.stdout.isTTY && !cliArgs.includes('--no-color');
const c = (color, s) => (useColor ? `${color}${s}${RESET}` : s);

// ── ports ────────────────────────────────────────────────────────────────
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '1025', 10);
const HTTP_PORT = parseInt(process.env.MAILPIT_HTTP_PORT || '8025', 10);

// ── helpers ──────────────────────────────────────────────────────────────
function probeTcp(port, host = '127.0.0.1', timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

const BINARY_DIR = path.resolve(__dirname, '.mailpit');
const binaryPath = () =>
  path.join(BINARY_DIR, process.platform === 'win32' ? 'mailpit.exe' : 'mailpit');

// Platform → release asset name. See https://github.com/axllent/mailpit/releases
const ASSETS = {
  'linux-x64':    'mailpit-linux-amd64.tar.gz',
  'linux-arm64':  'mailpit-linux-arm64.tar.gz',
  'linux-arm':    'mailpit-linux-armv7.tar.gz',
  'darwin-x64':   'mailpit-darwin-amd64.tar.gz',
  'darwin-arm64': 'mailpit-darwin-arm64.tar.gz',
  'win32-x64':    'mailpit-windows-amd64.zip',
};

function commandExists(cmd) {
  try {
    execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function followRedirects(url) {
  return new Promise((resolve, reject) => {
    const visit = (target) => {
      https.get(target, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          visit(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${target}`));
          return;
        }
        resolve(res);
      }).on('error', reject);
    };
    visit(url);
  });
}

async function downloadAndExtract() {
  const key = `${process.platform}-${process.arch}`;
  const asset = ASSETS[key];
  if (!asset) {
    throw new Error(
      `Unsupported platform: ${key}. Install manually from https://mailpit.axllent.org/install/`,
    );
  }
  const url = `https://github.com/axllent/mailpit/releases/latest/download/${asset}`;
  const archivePath = path.join(BINARY_DIR, asset);
  fs.mkdirSync(BINARY_DIR, { recursive: true });

  console.log(c(CYAN, '↓ Downloading Mailpit:'), c(DIM, asset));
  const res = await followRedirects(url);
  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(archivePath);
    res.pipe(file);
    file.on('finish', () => file.close(resolve));
    file.on('error', reject);
  });

  console.log(c(CYAN, '↓ Extracting...'));
  if (asset.endsWith('.tar.gz')) {
    execSync(
      `tar -xzf ${JSON.stringify(archivePath)} -C ${JSON.stringify(BINARY_DIR)}`,
      { stdio: 'inherit' },
    );
  } else if (asset.endsWith('.zip')) {
    if (process.platform === 'win32') {
      execSync(
        `powershell -NoProfile -Command "Expand-Archive -Path ${JSON.stringify(archivePath)} -DestinationPath ${JSON.stringify(BINARY_DIR)}"`,
        { stdio: 'inherit' },
      );
    } else {
      execSync(
        `unzip -o ${JSON.stringify(archivePath)} -d ${JSON.stringify(BINARY_DIR)}`,
        { stdio: 'inherit' },
      );
    }
  } else {
    throw new Error(`Unknown archive format: ${asset}`);
  }
  fs.unlinkSync(archivePath);

  // Mailpit releases extract to ./mailpit at the archive root.
  let found = binaryPath();
  if (!fs.existsSync(found)) {
    const nested = path.join(
      BINARY_DIR,
      process.platform === 'win32' ? 'mailpit' : 'mailpit',
      process.platform === 'win32' ? 'mailpit.exe' : 'mailpit',
    );
    if (fs.existsSync(nested)) found = nested;
    else
      throw new Error(
        `Could not locate mailpit binary in ${BINARY_DIR} after extraction`,
      );
  }
  if (process.platform !== 'win32') fs.chmodSync(found, 0o755);
  return found;
}

// ── main ─────────────────────────────────────────────────────────────────
(async () => {
  // 1) Already running on :1025?
  if (!forceDownload && (await probeTcp(SMTP_PORT))) {
    console.log(c(GREEN, '✓ Mailpit is already running.'));
    console.log(`  ${c(BOLD, 'Web UI:')} http://localhost:${HTTP_PORT}`);
    console.log(`  ${c(BOLD, 'SMTP:  ')} localhost:${SMTP_PORT}`);
    process.exit(0);
  }

  let cmd;
  let spawnArgs;

  // 2) PATH
  if (!forceDownload && commandExists('mailpit')) {
    console.log(c(CYAN, '→ Using mailpit from PATH'));
    cmd = 'mailpit';
  }
  // 3) Cached binary
  else if (!forceDownload && fs.existsSync(binaryPath())) {
    console.log(c(CYAN, '→ Using cached binary:'), c(DIM, binaryPath()));
    cmd = binaryPath();
  }
  // 4) Download
  else {
    try {
      cmd = await downloadAndExtract();
    } catch (err) {
      console.error(c(RED, '❌ Could not install Mailpit:'), err.message);
      console.error(
        c(YELLOW, '  Install manually: https://mailpit.axllent.org/install/'),
      );
      process.exit(1);
    }
  }

  console.log();
  console.log(`  ${c(BOLD, 'Web UI:')} http://localhost:${HTTP_PORT}`);
  console.log(`  ${c(BOLD, 'SMTP:  ')} localhost:${SMTP_PORT}`);
  console.log(c(DIM, '  Press Ctrl+C to stop.'));
  console.log();

  spawnArgs = [
    '--smtp',
    `0.0.0.0:${SMTP_PORT}`,
    '--listen',
    `0.0.0.0:${HTTP_PORT}`,
  ];
  const child = spawn(cmd, spawnArgs, { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
})();