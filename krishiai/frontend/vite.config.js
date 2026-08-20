import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    reportCompressedSize: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-auth': ['@clerk/clerk-react'],
          'vendor-ui': ['framer-motion', 'gsap', 'lucide-react'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-utils': ['axios', 'recharts'],
        }
      }
    }
  },
})
