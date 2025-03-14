const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 384, 512];
const inputFile = path.join(__dirname, '..', 'public', 'logo.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Asegurarse de que el directorio existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(inputFile)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      
      console.log(`✓ Generado icono ${size}x${size}`);
    }
    console.log('¡Todos los íconos han sido generados!');
  } catch (error) {
    console.error('Error generando íconos:', error);
  }
}

generateIcons(); 