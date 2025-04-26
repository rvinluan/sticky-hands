// This script uses Node.js to convert SVG to PNG files of different sizes
// You need to install these dependencies with: npm install sharp fs-extra

const sharp = require('sharp');
const fs = require('fs-extra');

const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-167x167.png', size: 167 },
  { name: 'icon-180x180.png', size: 180 },
  { name: 'favicon.ico', size: 32 }
];

const splashScreens = [
  { name: 'splash-2048x2732.png', width: 2048, height: 2732 },
  { name: 'splash-1668x2388.png', width: 1668, height: 2388 },
  { name: 'splash-1536x2048.png', width: 1536, height: 2048 },
  { name: 'splash-1125x2436.png', width: 1125, height: 2436 },
  { name: 'splash-1242x2688.png', width: 1242, height: 2688 },
  { name: 'splash-828x1792.png', width: 828, height: 1792 },
  { name: 'splash-750x1334.png', width: 750, height: 1334 }
];

// Ensure the icons directory exists
fs.ensureDirSync('./icons');

// Process each icon size
async function createIcons() {
  const svgBuffer = fs.readFileSync('./icons/app-icon.svg');
  
  for (const icon of sizes) {
    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .toFile(`./icons/${icon.name}`);
    
    console.log(`Created: icons/${icon.name}`);
  }
}

// Process each splash screen
async function createSplashScreens() {
  const splashBuffer = fs.readFileSync('./icons/splash.svg');
  
  for (const splash of splashScreens) {
    await sharp(splashBuffer)
      .resize(splash.width, splash.height)
      .toFile(`./icons/${splash.name}`);
    
    console.log(`Created: icons/${splash.name}`);
  }
}

async function main() {
  try {
    await createIcons();
    await createSplashScreens();
    console.log('All icons and splash screens created successfully!');
  } catch (err) {
    console.error('Error creating assets:', err);
  }
}

main(); 