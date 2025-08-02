const fs = require('fs');
const path = require('path');

// Create a simple canvas-like approach for Node.js
// Since we need PNG files, I'll create them as data URIs that can be converted

const sizes = [16, 32, 96, 128, 192, 256, 384, 512];

// Create a function to generate PNG data for each size
function generateFaviconSVG(size) {
  const scale = size / 200;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
  <!-- Green circle background -->
  <circle cx="100" cy="100" r="95" fill="none" stroke="#8BC34A" stroke-width="10"/>

  <!-- Chart bars -->
  <rect x="60" y="120" width="20" height="50" fill="#00695C"/>
  <rect x="90" y="100" width="20" height="70" fill="#00695C"/>
  <rect x="120" y="80" width="20" height="90" fill="#00695C"/>

  <!-- Green checkmark -->
  <path d="M45 110 L75 135 L155 65" stroke="#8BC34A" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

// Generate SVG files for each size
sizes.forEach(size => {
  const svgContent = generateFaviconSVG(size);
  const filename = `favicon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(__dirname, 'icons', filename), svgContent);
  console.log(`Generated ${filename}`);
});

console.log('All favicon SVG files generated successfully!');
