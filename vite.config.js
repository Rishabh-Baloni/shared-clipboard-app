import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const CODE_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

// Dev-only in-memory mock of /api/note so `npm run dev` works without Redis.
// In production, Vercel serves the real serverless function in /api/note.js.
function devApiPlugin() {
  const store = new Map();
  return {
    name: "dev-api-note",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/note")) return next();

        const send = (status, obj) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(obj));
        };

        const url = new URL(req.url, "http://localhost");
        const code = url.searchParams.get("code");
        if (!code || !CODE_PATTERN.test(code)) {
          return send(400, { error: "Invalid or missing room code." });
        }
        const key = `note:${code}`;

        if (req.method === "GET") {
          return send(200, store.get(key) || { text: "" });
        }

        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            let parsed = {};
            try {
              parsed = JSON.parse(body || "{}");
            } catch {
              parsed = {};
            }
            store.set(key, { text: String(parsed.text ?? "") });
            send(200, { ok: true });
          });
          return;
        }

        send(405, { error: "Method not allowed." });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  build: {
    outDir: "dist",
  },
});
