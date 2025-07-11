import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'date-fns',
      'date-fns/_lib/format/longFormatters',
      'clsx',
      'tailwind-merge'
    ],
    force: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      timeout: 60000, // Increased timeout
      overlay: true,
      clientPort: 3000
    },
    // Add proper MIME type handling
    fs: {
      strict: true,
    }
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        warn(warning)
      },
      output: {
        // Bundle splitting for performance
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
          'vendor-utils': ['date-fns'],
          
          // App chunks
          'app-auth': [
            './src/contexts/AuthContext',
            './src/lib/auth',
            './src/lib/supabase'
          ],
          'app-components': [
            './src/components/ui',
            './src/components/app'
          ],
          'app-utils': [
            './src/utils/currency',
            './src/utils/imageOptimization',
            './src/hooks/useResponsive',
            './src/hooks/useDarkMode'
          ]
        },
        // Optimize chunk names for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop() 
            : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType ?? '')) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Optimize for 3G networks
        compact: true,
        // Enable tree shaking
        treeshake: {
          preset: 'recommended',
          manualPureFunctions: ['console.log', 'console.warn']
        }
      }
    },
    // Optimize for production
    minify: 'esbuild',
    cssMinify: true,
    // Target modern browsers for smaller bundles
    target: ['es2020', 'chrome80', 'safari13'],
    // Enable compression
    reportCompressedSize: true,
    // Optimize for Nigerian users with slower connections
    assetsInlineLimit: 2048, // Reduce inline limit for 3G
  },
  // Add esbuild specific options to help with stability
  esbuild: {
    logLevel: 'info',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true
      }
    }
  }
})