import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  assetsInclude: ['**/*.mp4'], // Include MP4 files as assets
  server: {
    port: 5174,
    host: true,
  },
  esbuild: {
    // Keep console logs for debugging production issues
    drop: ['debugger'],
  },
  build: {
    minify: 'esbuild',
    target: 'esnext',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          animations: ['framer-motion'],
          charts: ['recharts'],
          utils: ['axios'],
          markdown: ['react-markdown', 'remark-math', 'rehype-katex', 'katex']
        },
        assetFileNames: (assetInfo) => {
          // Keep video files with their original names for easier reference
          if (assetInfo.name?.endsWith('.mp4')) {
            return 'assets/videos/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  // Expose environment variables to client
  envPrefix: 'VITE_',
})