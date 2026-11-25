import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({root:resolve(process.cwd(),'frontend'),plugins:[react()],server:{host:'0.0.0.0'},build:{outDir:resolve(process.cwd(),'dist'),emptyOutDir:true}});