// Este archivo centraliza todos los parches de Node.js
// Importa este archivo al inicio de tu aplicación para cargar todos los polyfills

import './node-events-patch';
import './http2-patch';

// Aquí puedes agregar más importaciones de parches si son necesarios en el futuro

console.log('Node.js polyfills cargados correctamente');

export {}; 