import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative assets work on GitHub Pages and local preview
  server: {
    port: 3000,
    open: false,
  },
});
