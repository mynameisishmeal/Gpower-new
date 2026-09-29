const http = require('http');
const path = require('path');
const next = require('next');
const fs = require('fs');
const dotenv = require('dotenv');

const logFile = path.join(process.cwd(), 'gpower-desktop.log');

function logToFile(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch (e) {}
}

function formatArg(a) {
  if (a instanceof Error) {
    return `${a.name}: ${a.message}\n${a.stack || ''}`;
  }
  if (typeof a === 'object' && a !== null) {
    try {
      if (a.message || a.stack) {
        return `${a.name || 'Error'}: ${a.message}\n${a.stack || ''}`;
      }
      return JSON.stringify(a, Object.getOwnPropertyNames(a));
    } catch (e) {
      return String(a);
    }
  }
  return String(a);
}

// Mirror all console outputs to log file
const origLog = console.log;
const origErr = console.error;
const origWarn = console.warn;

console.log = (...args) => {
  origLog(...args);
  logToFile('[LOG] ' + args.map(formatArg).join(' '));
};

console.error = (...args) => {
  origErr(...args);
  logToFile('[ERR] ' + args.map(formatArg).join(' '));
};

console.warn = (...args) => {
  origWarn(...args);
  logToFile('[WARN] ' + args.map(formatArg).join(' '));
};

// Locate and load .env.local
function loadEnvironment(appDir) {
  const envCandidates = [
    process.resourcesPath ? path.join(process.resourcesPath, '.env.local') : null,
    process.resourcesPath ? path.join(process.resourcesPath, 'app.asar.unpacked', '.env.local') : null,
    path.join(path.dirname(process.execPath), 'resources', '.env.local'),
    path.join(process.cwd(), 'resources', '.env.local'),
    path.join(appDir, '.env.local'),
    path.join(process.cwd(), '.env.local'),
    path.join(__dirname, '..', '.env.local')
  ].filter(Boolean);

  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
      try {
        const raw = fs.readFileSync(envPath, 'utf8');
        const parsed = dotenv.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          process.env[k] = v;
        }
      } catch (e) {}

      if (process.resourcesPath) {
        process.env.RESOURCES_PATH = process.resourcesPath;
      }

      const msg = `[Electron Server] Loaded environment from: ${envPath} (MONGODB_URI set: ${!!process.env.MONGODB_URI})`;
      console.log(msg);
      logToFile(msg);
      return;
    }
  }
  const warnMsg = '[Electron Server] No .env.local found in standard paths, relying on system env.';
  console.warn(warnMsg);
  logToFile(warnMsg);
}

// Find an available port, preferring defaultPort (3000)
function checkPortAvailable(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const tester = http.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, host);
  });
}

async function findAvailablePort(preferredPort = 3000) {
  let port = preferredPort;
  while (port < preferredPort + 50) {
    const isAvail = await checkPortAvailable(port);
    if (isAvail) return port;
    port++;
  }
  return 0; // system will pick random port
}

async function startNextServer({ appDir, preferredPort = 3000 }) {
  loadEnvironment(appDir);

  const port = await findAvailablePort(preferredPort);
  console.log(`[Electron Server] Preparing Next.js on port ${port}...`);

  const app = next({
    dev: false,
    dir: appDir,
    hostname: '127.0.0.1',
    port
  });

  const handle = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => {
    logToFile(`${req.method} ${req.url}`);
    handle(req, res);
  });

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      const errStr = `[Electron Server] Server error: ${err.message || err}`;
      console.error(errStr);
      logToFile(errStr);
      reject(err);
    });

    server.listen(port, '127.0.0.1', () => {
      const listenMsg = `[Electron Server] Next.js ready and listening at http://127.0.0.1:${port}`;
      console.log(listenMsg);
      logToFile(listenMsg);
      resolve({
        server,
        port,
        url: `http://127.0.0.1:${port}`
      });
    });
  });
}

module.exports = {
  startNextServer,
  checkPortAvailable,
  loadEnvironment,
  logToFile
};
