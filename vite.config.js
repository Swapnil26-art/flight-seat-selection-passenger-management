import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base is set for GitHub Pages project-site hosting; harmless on Vercel.
export default defineConfig({
  base: '/Flight-Seat-Selection-Passenger-Management-/',
  plugins: [react()],
});
