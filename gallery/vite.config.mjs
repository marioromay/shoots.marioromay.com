import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';
export default defineConfig({plugins:[react()],css:{postcss:{plugins:[tailwind()]}},build:{assetsInlineLimit:4096,outDir:'../gallery-build',emptyOutDir:true},resolve:{alias:{'motion/react':new URL('./src/motion.tsx',import.meta.url).pathname}}});
