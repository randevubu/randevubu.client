/**
 * Inject Build Hash into Service Worker
 * 
 * Generates a unique build hash for cache versioning.
 * This script is run during the build process to inject the hash
 * into the service worker, ensuring cache is invalidated on each deployment.
 * 
 * Build hash sources (in order of priority):
 * 1. Git commit hash (most precise - deployed version tracking)
 * 2. Package version (semantic versioning)
 * 3. Timestamp (fallback - always unique)
 * 
 * Usage: node scripts/inject-build-hash.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Generate build hash from git commit, package version, or timestamp
 * @returns {string} Build hash (alphanumeric, URL-safe)
 */
function generateBuildHash() {
  try {
    // Try to get git commit hash (most reliable for deployed versions)
    const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    if (gitHash) {
      console.log(`[Build Hash] Using git commit hash: ${gitHash}`);
      return gitHash;
    }
  } catch (error) {
    // Git not available or not a git repo - fall back to version
  }

  try {
    // Fall back to package.json version
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
    if (packageJson.version) {
      console.log(`[Build Hash] Using package version: ${packageJson.version}`);
      return packageJson.version;
    }
  } catch (error) {
    // Fall back to timestamp
  }

  // Last resort: timestamp (always unique, ensures cache is busted)
  const timestamp = Date.now().toString(36);
  console.log(`[Build Hash] Using timestamp hash: ${timestamp}`);
  return timestamp;
}

const buildHash = generateBuildHash();
const swPath = path.join(__dirname, '../public/sw-custom.js');

console.log(`[Build Hash] Injecting build hash into service worker...`);

try {
  let swContent = fs.readFileSync(swPath, 'utf-8');
  
  // Replace the placeholder with actual build hash
  swContent = swContent.replace(
    /const BUILD_HASH = 'BUILD_HASH_PLACEHOLDER';/,
    `const BUILD_HASH = '${buildHash}';`
  );
  
  fs.writeFileSync(swPath, swContent, 'utf-8');
  console.log(`[Build Hash] ✅ Successfully injected: ${buildHash}`);
} catch (error) {
  console.error('[Build Hash] ❌ Failed to inject build hash:', error.message);
  process.exit(1);
}
