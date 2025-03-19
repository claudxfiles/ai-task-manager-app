// Este archivo se carga antes de cualquier módulo de la aplicación
// para asegurar que todos los polyfills estén disponibles

// Cargar polyfill específico para process.stdout.isTTY
require('./process-patch');

// Cargar polyfills de Node.js core
require('./node-core-modules');

// Aplicar parche a require para manejar importaciones node:
// (esto debe hacerse antes de cualquier otro require)
try {
  require('./patch-require');
  console.log('Parche de require aplicado correctamente');
} catch (e) {
  console.error('Error al aplicar parche de require:', e);
}

// Registrar polyfills específicos
global.nodeEvents = require('./node-events');
global.http2 = require('./http2');
global.nodeProcess = require('./node-process');

// Reemplazar directamente las importaciones de node:
if (typeof window !== 'undefined') {
  window.require = (path) => {
    if (path === 'node:events') return require('./node-events');
    if (path === 'node:process') return require('./node-process');
    if (path === 'node:stream') return require('stream-browserify');
    if (path === 'node:buffer') return require('buffer');
    if (path === 'node:util') return require('util');
    if (path === 'node:path') return require('path-browserify');
    if (path === 'http2') return require('./http2');
    return require(path);
  };
}

console.log('Node.js polyfills cargados correctamente'); 