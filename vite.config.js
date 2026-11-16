import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the same build works everywhere:
// - GitHub Pages project site (served from /flight-seat-selection-passenger-management/)
// - Vercel (served from the domain root)
// - any other static host
export default defineConfig({
  base: './',
  plugins: [react()],
});
