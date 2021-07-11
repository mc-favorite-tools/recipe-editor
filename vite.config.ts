import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import vitePluginImport from 'vite-plugin-babel-import';

export default defineConfig({
  base: './',
  plugins: [
    reactRefresh(),
    vitePluginImport([]),
  ]
})
