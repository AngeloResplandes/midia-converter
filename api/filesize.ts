import type { VercelRequest, VercelResponse } from "@vercel/node";


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
    const headRes = await fetch(url, { method: "HEAD" });
    const cl = headRes.headers.get("content-length");
    if (cl && cl !== "0") return parseInt(cl, 10);

    const rangeRes = await fetch(url, { headers: { Range: "bytes=0-1" } });
    const contentRange = rangeRes.headers.get("content-range");
    await rangeRes.body?.cancel();
    if (contentRange) {
        const match = contentRange.match(/\/(\d+)$/);
        if (match?.[1]) return parseInt(match[1], 10);
    }

    const getRes = await fetch(url);
    const buffer = await getRes.arrayBuffer();
    return buffer.byteLength || null;
}
