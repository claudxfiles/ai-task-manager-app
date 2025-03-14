/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Rutas de autenticación manejadas por NextAuth
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*'
      },
      // Rutas de goals redirigidas al backend
      {
        source: '/api/goals/:path*',
        destination: 'http://localhost:8000/api/goals/:path*'
      },
      // Rutas de goals sin parámetros
      {
        source: '/api/goals',
        destination: 'http://localhost:8000/api/goals'
      },
      // Ruta específica para el chat
      {
        source: '/api/chat',
        destination: 'http://localhost:8000/chat'
      },
      // Resto de rutas API redirigidas al backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*'
      }
    ];
  },
};

module.exports = nextConfig; 