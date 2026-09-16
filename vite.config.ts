import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative assets work on GitHub Pages and local preview
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@react-native/assets-registry/registry': path.resolve(__dirname, 'src/shims/assetsRegistry.js'),
      '@react-native/assets-registry': path.resolve(__dirname, 'src/shims/assetsRegistry.js'),
    },
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
    ],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(false),
  },
  server: {
    port: 3000,
    open: false,
  },
});
