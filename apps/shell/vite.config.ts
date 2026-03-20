/* eslint-disable no-undef */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

const WORKOUT_URL = process.env.VITE_WORKOUT_URL || 'http://localhost:3001';
const FOOD_URL = process.env.VITE_FOOD_URL || 'http://localhost:3002';
const ANALYTICS_URL = process.env.VITE_ANALYTICS_URL || 'http://localhost:3003';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        workout: `${WORKOUT_URL}/assets/remoteEntry.js`,
        food: `${FOOD_URL}/assets/remoteEntry.js`,
        analytics: `${ANALYTICS_URL}/assets/remoteEntry.js`,
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});