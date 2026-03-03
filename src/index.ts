import { serve } from "bun";
import { extname } from "path";
import index from "./index.html";
import { convertToWebP, isSupportedImage } from "./server/convert-webp";
import { compressVideo, isSupportedVideo } from "./server/compress-video";
import { jobs, json, toPublic, contentDisposition } from "./server/jobs";
import type { Job } from "./server/jobs";

// ─── Server ────────────────────────────────────────────────────────────────
const server = serve({
  routes: {
    "/*": index,

    // ── Upload ──────────────────────────────────────────────────────────────
    "/api/upload": {
      async POST(req) {
        try {
          const formData = await req.formData();
          const files = formData.getAll("files") as File[];

          if (files.length === 0) {
            return json({ error: "Nenhum arquivo enviado" }, 400);
          }

          const results: Array<{ id: string; name: string; type: string; size: number }> = [];

          for (const file of files) {
            const ext = extname(file.name).toLowerCase();
            const type = isSupportedImage(file.name)
              ? "image"
              : isSupportedVideo(file.name)
                ? "video"
                : "unknown";

            if (type === "unknown") continue;

            const id = crypto.randomUUID();

            // Read file content into memory only — nothing written to disk
            const inputBuffer = Buffer.from(await file.arrayBuffer());

            jobs.set(id, {
              id,
              originalName: file.name,
              type: type as "image" | "video",
              status: "uploading",
              progress: 0,
              inputSize: inputBuffer.length,
              // Temporarily store input buffer — cleared once conversion starts
              outputBuffer: inputBuffer,
            });

            results.push({ id, name: file.name, type, size: file.size });
          }

          return json({ files: results });
        } catch (err) {
          return json({ error: String(err) }, 500);
        }
      },
    },

    // ── Convert ─────────────────────────────────────────────────────────────
    "/api/convert": {
      async POST(req) {
        try {
          const { ids } = await req.json() as { ids: string[] };

          for (const id of ids) {
            const job = jobs.get(id);
            if (!job || !job.outputBuffer) continue;

            // Grab the input buffer and clear it in the job entry immediately
            const inputBuffer = job.outputBuffer;
            job.outputBuffer = undefined;
            job.status = "converting";
            job.progress = 0;

            if (job.type === "image") {
              convertToWebP(inputBuffer, job.originalName)
                .then((result) => {
                  job.status = "done";
                  job.progress = 100;
                  job.outputSize = result.outputSize;
                  job.outputName = result.outputName;
                  job.outputBuffer = result.outputBuffer;
                })
                .catch((err) => {
                  job.status = "error";
                  job.error = String(err);
                });
              job.progress = 50;

            } else if (job.type === "video") {
              compressVideo(inputBuffer, job.originalName, (pct) => {
                job.progress = pct;
              })
                .then((result) => {
                  job.status = "done";
                  job.progress = 100;
                  job.outputSize = result.outputSize;
                  job.outputName = result.outputName;
                  job.outputBuffer = result.outputBuffer;
                })
                .catch((err) => {
                  job.status = "error";
                  job.error = String(err);
                });
            }
          }

          return json({ message: "Conversão iniciada", ids });
        } catch (err) {
          return json({ error: String(err) }, 500);
        }
      },
    },

    // ── Status ──────────────────────────────────────────────────────────────
    "/api/status": {
      GET(req) {
        const url = new URL(req.url);
        const idsParam = url.searchParams.get("ids");

        if (idsParam) {
          const ids = idsParam.split(",");
          const statuses = ids
            .map((id) => jobs.get(id))
            .filter((j): j is Job => j !== undefined)
            .map(toPublic);
          return json({ jobs: statuses });
        }

        return json({ jobs: Array.from(jobs.values()).map(toPublic) });
      },
    },

    // ── Download ─────────────────────────────────────────────────────────────
    "/api/download/:id": {
      GET(req) {
        const { id } = req.params;
        const job = jobs.get(id);

        if (!job || job.status !== "done" || !job.outputBuffer || !job.outputName) {
          return json({ error: "Arquivo não encontrado" }, 404);
        }

        const contentType =
          job.type === "image" ? "image/webp" : "video/mp4";

        // Buffer kept alive until user explicitly deletes the job —
        // allows multiple downloads and preview without 404
        const body = new Uint8Array(job.outputBuffer);
        return new Response(body, {
          headers: {
            "Content-Disposition": contentDisposition("attachment", job.outputName),
            "Content-Type": contentType,
            "Content-Length": String(body.byteLength),
          },
        });
      },
    },

    // ── Preview (inline — does NOT free the buffer) ───────────────────────────
    "/api/preview/:id": {
      GET(req) {
        const { id } = req.params;
        const job = jobs.get(id);

        if (!job || job.status !== "done" || !job.outputBuffer || !job.outputName) {
          return json({ error: "Arquivo não encontrado" }, 404);
        }

        const contentType =
          job.type === "image" ? "image/webp" : "video/mp4";

        const body = new Uint8Array(job.outputBuffer);
        return new Response(body, {
          headers: {
            "Content-Disposition": contentDisposition("inline", job.outputName),
            "Content-Type": contentType,
            "Content-Length": String(body.byteLength),
          },
        });
      },
    },

    // ── Delete ───────────────────────────────────────────────────────────────
    "/api/delete/:id": {
      DELETE(req) {
        const { id } = req.params;
        const job = jobs.get(id);

        if (!job) {
          return json({ error: "Job não encontrado" }, 404);
        }

        // Free any held buffer and remove from map
        job.outputBuffer = undefined;
        jobs.delete(id);

        return json({ message: "Deletado" });
      },
    },

    // ── Clear all ────────────────────────────────────────────────────────────
    "/api/clear": {
      POST() {
        for (const job of jobs.values()) {
          job.outputBuffer = undefined;
        }
        jobs.clear();
        return json({ message: "Tudo limpo" });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
console.log(`� Mode: in-memory — no files saved to disk`);
