import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "local-json-db",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith("/api/")) {
            return next();
          }

          const getMatch = /^\/api\/([a-zA-Z0-9_-]+)\.json$/.exec(req.url);
          const saveMatch = /^\/api\/save-([a-zA-Z0-9_-]+)$/.exec(req.url);

          if (req.method === "GET" && getMatch) {
            const resource = getMatch[1];
            const targetPath = path.resolve(
              __dirname,
              `./server/data/${resource}.json`,
            );
            if (fs.existsSync(targetPath)) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(fs.readFileSync(targetPath, "utf-8"));
            } else {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Not found" }));
            }
          } else if (req.method === "POST" && saveMatch) {
            const resource = saveMatch[1];
            let body = "";
            req.on("data", (chunk) => {
              body += chunk;
            });
            req.on("end", () => {
              try {
                const targetPath = path.resolve(
                  __dirname,
                  `./server/data/${resource}.json`,
                );
                const formattedJSON = JSON.stringify(JSON.parse(body), null, 2);
                fs.writeFileSync(targetPath, formattedJSON, "utf-8");
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: String(err) }));
              }
            });
          } else {
            next();
          }
        });
      },
    },
  ],
  build: {
    sourcemap: false, // Ensure source maps are strictly disabled
    target: "esnext",
    chunkSizeWarningLimit: 1000,
  },
});
