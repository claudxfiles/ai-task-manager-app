/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const nextConfig = {
  // Transpilar los paquetes que nos dan problemas
  transpilePackages: [
    'googleapis',
    'googleapis-common',
    'google-auth-library'
  ],
  webpack: (config, { isServer }) => {
    // Solo aplicar estas configuraciones en el cliente (navegador)
    if (!isServer) {
      // Asegurarnos que 'http2' se maneje correctamente
      config.resolve.alias = {
        ...config.resolve.alias,
        'http2': false,
      };

      // Fallbacks para módulos de Node.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http2: false,
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
        url: require.resolve('url'),
        crypto: require.resolve('crypto-browserify'),
        querystring: require.resolve('querystring-es3'),
        buffer: require.resolve('buffer/'),
        events: require.resolve('events/'),
      };

      // Agregar polyfill para Buffer y process
      const webpack = require('webpack');
      
      // Definir variables de entorno
      const definePlugin = new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.browser': true,
        'Buffer.isBuffer': JSON.stringify(null),
      });
      
      config.plugins.push(definePlugin);
      
      // Proveer Buffer globalmente
      const providePlugin = new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      });
      
      config.plugins.push(providePlugin);
    }

    return config;
  },
};

export default nextConfig;
