import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()], 
  build: {
    outDir: 'dist', // tells Vite where to output the production build
  }, 
  server: {
    port: 3000, 
    open: true, // optional: automatically opens browser on 'npm run dev'
    historyApiFallback: true // ensures React Router paths work in dev
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  css: {
    postcss: './postcss.config.js', // or you can inline the config here
  },
})