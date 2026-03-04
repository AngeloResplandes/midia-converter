import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * GET /api/filesize?publicId=...&type=image|video
 * Returns { bytes: N } — the size of the Cloudinary-transformed file.
 *
 * For images: the transform is synchronous; the HEAD response has Content-Length.
 * For videos: we initiate a GET and read only the headers (aborting the body).
 *             On first access Cloudinary generates the H264 derivative; the
 *             Content-Length header is present once the derivative is ready.
 *             If unavailable, we fall back to a Range request.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const { publicId, type } = req.query;
    if (!publicId || typeof publicId !== "string") {
        return res.status(400).json({ error: "publicId obrigatório" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return res.status(500).json({ error: "Cloudinary não configurado" });

    const resourceType = type === "video" ? "video" : "image";
    const cloudinaryUrl = resourceType === "image"
        ? `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_90/${publicId}`
        : `https://res.cloudinary.com/${cloudName}/video/upload/vc_h264,q_auto:low,w_1920,h_1080,c_limit/${publicId}.mp4`;

    try {
        const bytes = await getFileSize(cloudinaryUrl);
        if (bytes === null) return res.status(200).json({});
        return res.status(200).json({ bytes });
    } catch (err) {
        return res.status(500).json({ error: String(err) });
    }
}

async function getFileSize(url: string): Promise<number | null> {
    // 1. Try HEAD
    const headRes = await fetch(url, { method: "HEAD" });
    const cl = headRes.headers.get("content-length");
    if (cl && cl !== "0") return parseInt(cl, 10);

    // 2. Try Range: bytes=0-1 → Content-Range: bytes 0-1/TOTAL
    const rangeRes = await fetch(url, { headers: { Range: "bytes=0-1" } });
    const contentRange = rangeRes.headers.get("content-range"); // "bytes 0-1/12345"
    await rangeRes.body?.cancel();
    if (contentRange) {
        const match = contentRange.match(/\/(\d+)$/);
        if (match?.[1]) return parseInt(match[1], 10);
    }

    // 3. Last resort: GET and count bytes (triggers transformation for videos)
    const getRes = await fetch(url);
    const buffer = await getRes.arrayBuffer();
    return buffer.byteLength || null;
}
