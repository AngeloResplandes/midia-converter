import type { VercelRequest, VercelResponse } from "@vercel/node";


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET" && req.method !== "HEAD") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { publicId, type, filename } = req.query;

    if (!publicId || typeof publicId !== "string") {
        return res.status(400).json({ error: "publicId obrigatório" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        return res.status(500).json({ error: "Cloudinary não configurado" });
    }

    const resourceType = type === "video" ? "video" : "image";
    const safeFilename = typeof filename === "string"
        ? filename.replace(/[^a-zA-Z0-9._-]/g, "_")
        : publicId;

    const cloudinaryUrl = resourceType === "image"
        ? `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_90/${publicId}`
        : `https://res.cloudinary.com/${cloudName}/video/upload/vc_h264,q_auto:low,w_1920,h_1080,c_limit/${publicId}.mp4`;

    try {
        if (req.method === "HEAD") {
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
            res.setHeader("Content-Type", contentType);
            if (contentLength) res.setHeader("Content-Length", contentLength);
            res.setHeader("Cache-Control", "no-store");
            return res.status(headRes.ok ? 200 : headRes.status).end();
        }

        const upstream = await fetch(cloudinaryUrl);
        if (!upstream.ok) {
            return res.status(upstream.status).json({ error: `Cloudinary retornou ${upstream.status}` });
        }

        const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
        const buffer = await upstream.arrayBuffer();

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
        res.setHeader("Content-Length", buffer.byteLength);
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).send(Buffer.from(buffer));
    } catch (err) {
        return res.status(500).json({ error: String(err) });
    }
}
