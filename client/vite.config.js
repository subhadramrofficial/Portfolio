import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In development, "/api" is proxied to the Express server so no CORS setup is needed locally.
    proxy: { "/api": { target: "http://localhost:5000", changeOrigin: true } },
  },
});
