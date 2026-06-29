import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist-standalone');
const outDir = path.join(rootDir, 'dist');

// 1. Read source HTML
const srcHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');

// 2. Read source CSS
const srcCss = fs.readFileSync(path.join(rootDir, 'css', 'style.css'), 'utf-8');

// 3. Read the built bundle
const bundle = fs.readFileSync(path.join(distDir, 'bundle.js'), 'utf-8');

// 4. Build the output HTML
let html = srcHtml;

// Remove the original module script tag
html = html.replace(
  /<script type="module"[^>]*src="\/js\/main\.js"[^>]*><\/script>/,
  ''
);

// Replace CSS link with inline style
html = html.replace(
  /<link rel="stylesheet"[^>]*href="css\/style\.css"[^>]*>/,
  ''
);

// Insert inline CSS in head
html = html.replace(
  '</head>',
  '<style>' + srcCss + '</style>\n</head>'
);

// Insert script tag before </body>
html = html.replace(
  '</body>',
  '<script>' + bundle + '</script>\n</body>'
);

// 5. Ensure output directory exists and write
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');

// 6. Copy public/ files
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  fs.readdirSync(publicDir).forEach(f => {
    const src = path.join(publicDir, f);
    const dst = path.join(outDir, f);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dst);
    }
  });
}

console.log('✓ dist/index.html generated: CSS inlined, bundle embedded');
console.log('  HTML: ' + html.length + ' bytes');
console.log('  JS:  ' + bundle.length + ' bytes');
console.log('✓ Ready for file:// protocol');
