import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
    }),
    checker({
      typescript: true,
      overlay: {
        initialIsOpen: false,
      },
    }),
  ],
  
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/resume': path.resolve(__dirname, './src/resume'),
      '@/editor': path.resolve(__dirname, './src/editor'),
      '@/controls': path.resolve(__dirname, './src/controls'),
      '@/templates': path.resolve(__dirname, './src/templates'),
      '@/help': path.resolve(__dirname, './src/help'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        // Add any SCSS options if needed
      },
    },
  },
  
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  
  server: {
    port: 3000,
    open: true,
  },
  
  // For GitHub Pages deployment
  base: '/experiencer/',
});
