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
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/icons-material',
      'clsx',
      'tailwind-merge',
      '@radix-ui/react-slot',
      '@radix-ui/react-select'
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
      }
    }
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