const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const assetsDir = path.join(rootDir, 'assets');

console.log('🚀 Step 1: Exporting web bundle using Expo...');
execSync('npx expo export -p web', { stdio: 'inherit', cwd: rootDir });

console.log('📦 Step 2: Injecting PWA manifest & Service Worker into dist...');

// Copy manifest.json & sw.js to dist
fs.copyFileSync(path.join(publicDir, 'manifest.json'), path.join(distDir, 'manifest.json'));
fs.copyFileSync(path.join(publicDir, 'sw.js'), path.join(distDir, 'sw.js'));

// Ensure assets directory exists in dist
const distAssetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir, { recursive: true });
}

// Copy icons to dist
if (fs.existsSync(path.join(publicDir, 'icon-192.png'))) {
  fs.copyFileSync(path.join(publicDir, 'icon-192.png'), path.join(distDir, 'icon-192.png'));
}
if (fs.existsSync(path.join(publicDir, 'icon-512.png'))) {
  fs.copyFileSync(path.join(publicDir, 'icon-512.png'), path.join(distDir, 'icon-512.png'));
}
if (fs.existsSync(path.join(assetsDir, 'icon.png'))) {
  fs.copyFileSync(path.join(assetsDir, 'icon.png'), path.join(distAssetsDir, 'icon.png'));
}
if (fs.existsSync(path.join(assetsDir, 'favicon.png'))) {
  fs.copyFileSync(path.join(assetsDir, 'favicon.png'), path.join(distAssetsDir, 'favicon.png'));
}
if (fs.existsSync(path.join(publicDir, 'favicon.ico'))) {
  fs.copyFileSync(path.join(publicDir, 'favicon.ico'), path.join(distDir, 'favicon.ico'));
}

// Read generated dist/index.html and inject PWA tags if not present
const indexPath = path.join(distDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const pwaHeadTags = `
    <!-- PWA Capabilities -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0284C7" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Attendance" />
    <link rel="apple-touch-icon" href="/assets/icon.png" />
    <link rel="icon" type="image/png" href="/assets/favicon.png" />
`;

const swScript = `
    <!-- Register PWA Service Worker -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js')
            .then(function (reg) {
              console.log('[PWA] Service Worker registered:', reg.scope);
            })
            .catch(function (err) {
              console.warn('[PWA] Service Worker failed:', err);
            });
        });
      }
    </script>
`;

if (!indexHtml.includes('manifest.json')) {
  indexHtml = indexHtml.replace('</head>', `${pwaHeadTags}\n  </head>`);
}

if (!indexHtml.includes('serviceWorker.register')) {
  indexHtml = indexHtml.replace('</body>', `${swScript}\n  </body>`);
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');

console.log('✅ PWA Build Complete! Dist folder ready at:', distDir);
