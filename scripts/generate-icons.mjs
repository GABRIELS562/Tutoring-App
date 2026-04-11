#!/usr/bin/env node
/**
 * Generate PWA icons for Angelo Tutoring
 *
 * This script generates simple icon files.
 * For production, replace with professionally designed icons.
 *
 * To generate high-quality icons:
 * 1. Install: npm install canvas
 * 2. Run: node scripts/generate-icons.mjs
 *
 * Or use an online PWA icon generator like:
 * https://realfavicongenerator.net/
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Create a simple SVG-based PNG placeholder
// In production, use actual PNG files designed professionally

const createSvgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.84}" height="${size * 0.84}" rx="${size * 0.15}" fill="#e63946"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.4}">AT</text>
</svg>`;

// For browsers that need PNG, we'll create a basic data URI approach
// In production, generate actual PNG files

const sizes = [192, 512];

sizes.forEach((size) => {
  const svgContent = createSvgIcon(size);
  const svgPath = join(publicDir, `icon-${size}.svg`);
  writeFileSync(svgPath, svgContent);
  console.log(`Generated ${svgPath}`);
});

console.log(`
Icon generation complete!

NOTE: The generated SVG icons work for development.
For production PWA, convert these to PNG using:
- Online converter: https://cloudconvert.com/svg-to-png
- Or install 'sharp' package and convert programmatically

Replace icon-192.png and icon-512.png in /public with actual PNGs.
`);
