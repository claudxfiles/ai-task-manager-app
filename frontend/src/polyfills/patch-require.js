// Guardar el require original
const originalRequire = require;

// Sobrescribir require para manejar node: URLs
function patchedRequire(path) {
  // Manejar importaciones node:
  if (typeof path === 'string') {
    if (path === 'node:events') return require('events');
    if (path === 'node:process') return require('process/browser');
    if (path === 'node:stream') return require('stream-browserify');
    if (path === 'node:buffer') return require('buffer');
    if (path === 'node:util') return require('util');
    if (path === 'node:path') return require('path-browserify');
    if (path === 'http2') return require('./http2');
  }
  
  // Llamar al require original para todo lo demás
  return originalRequire.apply(this, arguments);
}

// Reemplazar la función global require
if (typeof require !== 'undefined') {
  require = patchedRequire;
}

module.exports = patchedRequire; 