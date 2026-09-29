const { execSync } = require('child_process');

try {
  // Gracefully terminate any running instances of Gpower CRM before packaging
  execSync('taskkill /F /IM "Gpower CRM.exe" /T', { stdio: 'ignore' });
  console.log('[Build] Closed running Gpower CRM instances to release file locks.');
} catch (e) {
  // Not running, ignore
}

// Give Windows a brief moment to release directory handles
const start = Date.now();
while (Date.now() - start < 600) {}
