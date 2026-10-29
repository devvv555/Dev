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
if (fs.existsSync(path.join(publicDir, 'robots.txt'))) {
  fs.copyFileSync(path.join(publicDir, 'robots.txt'), path.join(distDir, 'robots.txt'));
}
if (fs.existsSync(path.join(publicDir, 'sitemap.xml'))) {
  fs.copyFileSync(path.join(publicDir, 'sitemap.xml'), path.join(distDir, 'sitemap.xml'));
}
if (fs.existsSync(path.join(publicDir, 'googlea3b7e1129bb80d53.html'))) {
  fs.copyFileSync(path.join(publicDir, 'googlea3b7e1129bb80d53.html'), path.join(distDir, 'googlea3b7e1129bb80d53.html'));
}

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

// Read generated dist/index.html to extract the bundled Expo script tag
const indexPath = path.join(distDir, 'index.html');
const distHtml = fs.readFileSync(indexPath, 'utf8');
const scriptMatches = distHtml.match(/<script[^>]+src=["'][^"']+["'][^>]*><\/script>/gi) || [];

// Use public/index.html as template and inject the Expo bundle script
let finalHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const scriptsToInject = scriptMatches.join('\n  ');
finalHtml = finalHtml.replace('</body>', `  ${scriptsToInject}\n  </body>`);

fs.writeFileSync(indexPath, finalHtml, 'utf8');

console.log('✅ PWA Build Complete! Dist folder ready at:', distDir);
