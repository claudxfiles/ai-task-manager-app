/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');

const nextConfig = {
  transpilePackages: ['agent-base', 'googleapis', 'google-auth-library', 'gaxios', 'google-logging-utils', 'gcp-metadata'],
  webpack: (config, { isServer }) => {
    // Solo aplicamos los polyfills en el cliente, no en el servidor
    if (!isServer) {
      // Cargar nuestros polyfills antes que cualquier otro módulo
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        // Agregamos nuestro archivo de polyfills antes de la entrada principal
        if (entries['main.js'] && !entries['main.js'].includes('src/polyfills/index.js')) {
          entries['main.js'] = ['./src/polyfills/index.js', ...entries['main.js']];
        }
        return entries;
      };

      // Añadir plugin para polyfills de Node.js
      config.plugins.push(
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Configuración especial para manejar el esquema "node:"
      config.module.rules.push({
        test: /\.js$/,
        include: /node_modules\/(google-logging-utils|gcp-metadata|google-auth-library|googleapis)/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            {
              search: 'require\\([\'"]node:events[\'"]\\)',
              replace: 'require("events")',
              flags: 'g',
            },
            {
              search: 'require\\([\'"]node:process[\'"]\\)',
              replace: 'require("process/browser")',
              flags: 'g',
            },
            {
              search: 'require\\([\'"]node:stream[\'"]\\)',
              replace: 'require("stream-browserify")',
              flags: 'g',
            },
            {
              search: 'require\\([\'"]node:buffer[\'"]\\)',
              replace: 'require("buffer")',
              flags: 'g',
            },
            {
              search: 'require\\([\'"]node:util[\'"]\\)',
              replace: 'require("util")',
              flags: 'g',
            },
            {
              search: 'require\\([\'"]node:path[\'"]\\)',
              replace: 'require("path-browserify")',
              flags: 'g',
            },
            {
              search: 'require\\([\'"]http2[\'"]\\)',
              replace: 'require("' + path.resolve(__dirname, 'src/polyfills/http2.js').replace(/\\/g, '/') + '")',
              flags: 'g',
            }
          ]
        },
      });

      // También añadir un loader para archivos TS
      config.module.rules.push({
        test: /\.(ts|tsx)$/,
        include: /node_modules\/(google-logging-utils|gcp-metadata|google-auth-library|googleapis)/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            {
              search: 'from [\'"]node:events[\'"]',
              replace: 'from "events"',
              flags: 'g',
            },
            {
              search: 'from [\'"]node:process[\'"]',
              replace: 'from "process/browser"',
              flags: 'g',
            },
            {
              search: 'from [\'"]node:stream[\'"]',
              replace: 'from "stream-browserify"',
              flags: 'g',
            },
            {
              search: 'from [\'"]node:buffer[\'"]',
              replace: 'from "buffer"',
              flags: 'g',
            },
            {
              search: 'from [\'"]node:util[\'"]',
              replace: 'from "util"',
              flags: 'g',
            },
            {
              search: 'from [\'"]node:path[\'"]',
              replace: 'from "path-browserify"',
              flags: 'g',
            }
          ]
        },
      });

      // Configuración de fallbacks para módulos de Node.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http2: path.resolve(__dirname, 'src/polyfills/http2.js'),
        "node:events": path.resolve(__dirname, 'src/polyfills/node-events.js'),
        "node:process": path.resolve(__dirname, 'src/polyfills/node-process.js'),
      };

      // Alias para node: imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:events': path.resolve(__dirname, 'src/polyfills/node-events.js'),
        'node:process': path.resolve(__dirname, 'src/polyfills/node-process.js'),
        'node:stream': 'stream-browserify',
        'node:buffer': 'buffer',
        'node:util': 'util',
        'node:path': 'path-browserify',
        'http2': path.resolve(__dirname, 'src/polyfills/http2.js'),
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
