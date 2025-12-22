import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@nexigen/entity-normalizer': path.resolve(__dirname, '../../src'),
    },
    dedupe: ['react', 'react-dom'],
  },
});
