const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

const createSvgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${Math.round(size * 0.08)}" y="${Math.round(size * 0.08)}" width="${Math.round(size * 0.84)}" height="${Math.round(size * 0.84)}" rx="${Math.round(size * 0.15)}" fill="#e63946"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${Math.round(size * 0.4)}">AT</text>
</svg>`;

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = Buffer.from(createSvgIcon(size));
    const outputPath = path.join(publicDir, `icon-${size}.png`);

    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated ${outputPath}`);
  }

  // Also generate favicon
  const faviconSvg = Buffer.from(createSvgIcon(32));
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');

  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);
