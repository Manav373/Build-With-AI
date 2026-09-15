import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@vendor': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../SHARED'),
      '@krishiai/ui': path.resolve(__dirname, '../../SHARED/ui/src'),
      '@krishiai/api': path.resolve(__dirname, '../../SHARED/api-client/src'),
      '@krishiai/auth': path.resolve(__dirname, '../../SHARED/auth/src'),
      '@krishiai/types': path.resolve(__dirname, '../../SHARED/types/src'),
      '@krishiai/utils': path.resolve(__dirname, '../../SHARED/utilities/src'),
      '@krishiai/config': path.resolve(__dirname, '../../SHARED/config/src'),
      '@krishiai/hooks': path.resolve(__dirname, '../../SHARED/hooks'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    reportCompressedSize: false,
    cssCodeSplit: true,
  },
});
