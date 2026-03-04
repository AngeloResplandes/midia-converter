import { serve } from "bun";
import index from "./index.html";
import { destroyResource } from "./server/cloudinary";
import { zipSync } from "fflate";

async function handleDownload(req: Request, method: "GET" | "HEAD"): Promise<Response> {
  const url = new URL(req.url);
  const publicId = url.searchParams.get("publicId");
  const type = url.searchParams.get("type");
  const filename = url.searchParams.get("filename") ?? publicId;

  if (!publicId) return Response.json({ error: "publicId obrigatório" }, { status: 400 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return Response.json({ error: "Cloudinary não configurado" }, { status: 500 });

  const safeFilename = (filename ?? publicId).replace(/[^a-zA-Z0-9._-]/g, "_");
  const cloudinaryUrl = type === "video"
    ? `https://res.cloudinary.com/${cloudName}/video/upload/vc_h264,q_auto:low,w_1920,h_1080,c_limit/${publicId}.mp4`
    : `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_90/${publicId}`;

  try {
    if (method === "HEAD") {
      const headRes = await fetch(cloudinaryUrl, { method: "HEAD" });
      let contentLength = headRes.headers.get("content-length");

      if (!contentLength || contentLength === "0") {
        const rangeRes = await fetch(cloudinaryUrl, { headers: { Range: "bytes=0-1" } });
        const contentRange = rangeRes.headers.get("content-range");
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)$/);
          if (match) contentLength = match[1] ?? null;
        }
        await rangeRes.body?.cancel();
      }

      const contentType = headRes.headers.get("content-type") ?? "application/octet-stream";
      return new Response(null, {
        status: headRes.ok ? 200 : headRes.status,
        headers: { "Content-Type": contentType, "Content-Length": contentLength ?? "0", "Cache-Control": "no-store" },
      });
    }

    const upstream = await fetch(cloudinaryUrl);
    if (!upstream.ok) return Response.json({ error: `Cloudinary retornou ${upstream.status}` }, { status: upstream.status });

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

async function getFileSize(url: string): Promise<number | null> {
  const headRes = await fetch(url, { method: "HEAD" });
  const cl = headRes.headers.get("content-length");
  if (cl && cl !== "0") return parseInt(cl, 10);

  const rangeRes = await fetch(url, { headers: { Range: "bytes=0-1" } });
  const contentRange = rangeRes.headers.get("content-range");
  await rangeRes.body?.cancel();
  if (contentRange) {
    const match = contentRange.match(/\/(\d+)$/);
    if (match) return parseInt(match[1]!, 10);
  }

  const getRes = await fetch(url);
  const buffer = await getRes.arrayBuffer();
  return buffer.byteLength || null;
}

const server = serve({
  routes: {
    "/*": index,
    "/api/config": {
      GET() {
        return Response.json({
          cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
          uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? "",
        });
      },
    },

    "/api/sign-upload": {
      async GET(req) {
        const url = new URL(req.url);
        const publicId = url.searchParams.get("publicId");
        const resourceType = url.searchParams.get("resourceType") ?? "auto";

        if (!publicId) return Response.json({ error: "publicId obrigatório" }, { status: 400 });

        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

        if (!apiKey || !apiSecret || !cloudName) {
          return Response.json({ error: "Cloudinary API Key/Secret não configurados" }, { status: 500 });
        }

        const timestamp = Math.round(Date.now() / 1000);
        const params: Record<string, string | number> = { public_id: publicId, timestamp };

        const { cloudinary } = await import("./server/cloudinary");
        const signature = cloudinary.utils.api_sign_request(params, apiSecret);

        return Response.json({ signature, timestamp, apiKey, cloudName, resourceType });
      },
    },

    "/api/filesize": {
      async GET(req) {
        const url = new URL(req.url);
        const publicId = url.searchParams.get("publicId");
        const type = url.searchParams.get("type");

        if (!publicId) return Response.json({ error: "publicId obrigatório" }, { status: 400 });

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (!cloudName) return Response.json({ error: "Cloudinary não configurado" }, { status: 500 });

        const cloudinaryUrl = type === "video"
          ? `https://res.cloudinary.com/${cloudName}/video/upload/vc_h264,q_auto:low,w_1920,h_1080,c_limit/${publicId}.mp4`
          : `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_90/${publicId}`;

        try {
          const bytes = await getFileSize(cloudinaryUrl);
          return Response.json(bytes !== null ? { bytes } : {});
        } catch (err) {
          return Response.json({ error: String(err) }, { status: 500 });
        }
      },
    },

    "/api/download-zip": {
      async POST(req) {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (!cloudName) return Response.json({ error: "Cloudinary não configurado" }, { status: 500 });

        const body = await req.json() as { files?: Array<{ publicId: string; type: string; filename: string }> };
        const files = body?.files;
        if (!Array.isArray(files) || files.length === 0) {
          return Response.json({ error: "Nenhum arquivo informado" }, { status: 400 });
        }

        const results = await Promise.allSettled(
          files.map(async ({ publicId, type, filename }) => {
            const url = type === "video"
              ? `https://res.cloudinary.com/${cloudName}/video/upload/vc_h264,q_auto:low,w_1920,h_1080,c_limit/${publicId}.mp4`
              : `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_90/${publicId}`;
            const upstream = await fetch(url);
            if (!upstream.ok) throw new Error(`Cloudinary ${upstream.status}`);
            const buffer = await upstream.arrayBuffer();
            return { filename: filename.replace(/[^a-zA-Z0-9._\- ()]/g, "_"), buffer };
          })
        );

        const zipEntries: Record<string, Uint8Array> = {};
        for (const result of results) {
          if (result.status === "fulfilled") {
            const { filename, buffer } = result.value;
            let name = filename;
            let i = 1;
            while (name in zipEntries) {
              const ext = filename.lastIndexOf(".");
              name = ext > 0
                ? `${filename.slice(0, ext)}_${i}${filename.slice(ext)}`
                : `${filename}_${i}`;
              i++;
            }
            zipEntries[name] = new Uint8Array(buffer);
          }
        }

        if (Object.keys(zipEntries).length === 0) {
          return Response.json({ error: "Nenhum arquivo pôde ser baixado" }, { status: 500 });
        }

        const zip = zipSync(zipEntries, { level: 0 });
        return new Response(zip.buffer as ArrayBuffer, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="convertidos.zip"`,
            "Content-Length": String(zip.byteLength),
            "Cache-Control": "no-store",
          },
        });
      },
    },

    "/api/download": {
      async GET(req) {
        return handleDownload(req, "GET");
      },
      async HEAD(req) {
        return handleDownload(req, "HEAD");
      },
    },

    "/api/delete/:id": {
      async DELETE(req) {
        const { id } = req.params;
        try {
          await destroyResource(id);
          return Response.json({ message: "Deletado" });
        } catch (err) {
          return Response.json({ error: String(err) }, { status: 500 });
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

