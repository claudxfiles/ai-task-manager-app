const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Crear un canvas de 32x32 (tamaño estándar para favicon)
const canvas = createCanvas(32, 32);
const ctx = canvas.getContext('2d');

// Establecer el fondo
ctx.fillStyle = '#0F172A'; // Color de fondo oscuro
ctx.fillRect(0, 0, 32, 32);

// Dibujar la letra "S" estilizada
ctx.font = 'bold 24px Arial';
ctx.fillStyle = '#60A5FA'; // Color azul claro
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('S', 16, 16);

// Convertir el canvas a un buffer PNG
const buffer = canvas.toBuffer('image/png');

// Guardar el archivo
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buffer);
console.log('✓ Favicon generado correctamente'); 