#!/usr/bin/env node

/**
 * Generate Favicon from Logo
 * 
 * This script converts the saree4ever-logo.png to a square favicon
 * by adding white padding around the logo to maintain aspect ratio.
 * 
 * Usage: node scripts/generate-favicon.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is not installed.');
  console.error('Please install it by running: npm install --save-dev sharp');
  process.exit(1);
}

const LOGO_PATH = path.join(__dirname, '../public/saree4ever-logo.png');
const OUTPUT_DIR = path.join(__dirname, '../src/app');
const SIZES = [
  { size: 32, name: 'icon.png' },
  { size: 32, name: 'favicon.ico' }, // Also generate ICO format for better compatibility
  { size: 192, name: 'apple-icon.png' },
  { size: 512, name: 'icon-512.png' },
];

async function generateFavicon() {
  try {
    // Check if logo exists
    if (!fs.existsSync(LOGO_PATH)) {
      console.error(`Error: Logo file not found at ${LOGO_PATH}`);
      process.exit(1);
    }

    // Get logo metadata
    const logoMetadata = await sharp(LOGO_PATH).metadata();
    console.log(`Original logo: ${logoMetadata.width}x${logoMetadata.height}px`);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Generate favicons for each size
    for (const { size, name } of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, name);
      
      // Create a square canvas with white background
      const squareCanvas = sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      });

      // Resize logo to fit within the square (with padding)
      // Calculate the size to maintain aspect ratio
      const logoAspectRatio = logoMetadata.width / logoMetadata.height;
      let logoWidth, logoHeight;
      
      if (logoAspectRatio > 1) {
        // Logo is wider than tall
        logoWidth = Math.floor(size * 0.8); // Use 80% of square size
        logoHeight = Math.floor(logoWidth / logoAspectRatio);
      } else {
        // Logo is taller than wide or square
        logoHeight = Math.floor(size * 0.8); // Use 80% of square size
        logoWidth = Math.floor(logoHeight * logoAspectRatio);
      }

      // Calculate position to center the logo
      const x = Math.floor((size - logoWidth) / 2);
      const y = Math.floor((size - logoHeight) / 2);

      // Determine output format based on file extension
      const isIco = name.endsWith('.ico');
      
      // Composite the resized logo onto the square canvas
      const compositeCanvas = squareCanvas.composite([
        {
          input: await sharp(LOGO_PATH)
            .resize(logoWidth, logoHeight, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer(),
          left: x,
          top: y
        }
      ]);

      // Save in appropriate format
      if (isIco) {
        // For ICO, we'll save as PNG first then convert (sharp doesn't support ICO directly)
        // Most modern browsers accept PNG as favicon.ico, so we'll save as PNG with .ico extension
        await compositeCanvas.png().toFile(outputPath);
      } else {
        await compositeCanvas.png().toFile(outputPath);
      }

      console.log(`✓ Generated ${name} (${size}x${size}px) at ${outputPath}`);
    }

    console.log('\n✅ Favicon generation complete!');
    console.log('The favicons have been generated in the src/app directory.');
    console.log('Next.js will automatically use icon.png as the favicon.');

  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

// Run the script
generateFavicon();
