import type { VercelRequest, VercelResponse } from "@vercel/node";
import { zipSync } from "fflate";

interface ZipEntry {
    publicId: string;
    type: "image" | "video";
    filename: string;
}

/**
 * POST /api/download-zip
 * Body: { files: ZipEntry[] }
 * Returns a ZIP archive containing all converted files.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return res.status(500).json({ error: "Cloudinary não configurado" });

    const { files } = req.body as { files?: ZipEntry[] };
    if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: "Nenhum arquivo informado" });
    }

    // Fetch all files from Cloudinary in parallel
    const results = await Promise.allSettled(
        files.map(async ({ publicId, type, filename }) => {
            const url = type === "video"
                ? `https://res.cloudinary.com/${cloudName}/video/upload/vc_h264,q_auto:low,w_1920,h_1080,c_limit/${publicId}.mp4`
                : `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_90/${publicId}`;

            const upstream = await fetch(url);
            if (!upstream.ok) throw new Error(`Cloudinary ${upstream.status} para ${publicId}`);
            const buffer = await upstream.arrayBuffer();
            return { filename: filename.replace(/[^a-zA-Z0-9._\- ()]/g, "_"), buffer };
        })
    );

    // Build ZIP entries — skip failed files
    const zipEntries: Record<string, Uint8Array> = {};
    for (const result of results) {
        if (result.status === "fulfilled") {
            const { filename, buffer } = result.value;
            // Deduplicate filenames
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
        return res.status(500).json({ error: "Nenhum arquivo pôde ser baixado" });
    }

    const zip = zipSync(zipEntries, { level: 0 }); // level 0 = store only (media files are already compressed)

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="convertidos.zip"`);
    res.setHeader("Content-Length", zip.byteLength);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(zip));
}
