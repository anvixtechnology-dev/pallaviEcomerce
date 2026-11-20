import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Serves the Vercel function in `api/cloudinary.ts` during `npm run dev`, so
 * image uploads work locally without `vercel dev`. Production uses Vercel.
 */
function localApi(): Plugin {
  return {
    name: "local-vercel-api",
    apply: "serve",
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), "CLOUDINARY_"));

      server.middlewares.use("/api/cloudinary", async (req, res) => {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);

          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === "string") headers.set(key, value);
          }
          const request = new Request(`http://localhost${req.originalUrl ?? req.url}`, {
            method: req.method,
            headers,
            body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
          });

          const handler = (await server.ssrLoadModule("/api/cloudinary.ts")) as Record<
            string,
            ((request: Request) => Promise<Response>) | undefined
          >;
          const method = handler[req.method ?? "GET"];
          const response = method ? await method(request) : new Response("Method Not Allowed", { status: 405 });

          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.config.logger.error(String(error));
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Local API error." }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApi()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
});
