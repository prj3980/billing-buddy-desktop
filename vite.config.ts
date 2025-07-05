
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      isDev && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: "./",
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      minify: isProd ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: true,
      } : undefined,
    },
  };
});
