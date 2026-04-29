import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
    ],
    build: {
        // Silence the bundle warning — Welcome.js is large due to embedded Puter.js blob
        // True code splitting requires Puter to be loaded via CDN <script> tag instead
        chunkSizeWarningLimit: 2500,
    },
});
