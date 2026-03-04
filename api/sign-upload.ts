import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cloudinary } from "../src/server/cloudinary";

/**
 * GET /api/sign-upload?publicId=...&resourceType=image|video
 *
 * Returns a signed upload signature so the browser can upload directly to
 * Cloudinary without an unsigned preset (no 100 MB file-size restriction).
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
    const publicId = req.query.publicId as string | undefined;
    const resourceType = (req.query.resourceType as string | undefined) ?? "auto";

    if (!publicId) {
        return res.status(400).json({ error: "publicId obrigatório" });
    }

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !apiSecret || !cloudName) {
        return res.status(500).json({ error: "Cloudinary API Key/Secret não configurados" });
    }

    const timestamp = Math.round(Date.now() / 1000);

    const params: Record<string, string | number> = { public_id: publicId, timestamp };

    const signature = cloudinary.utils.api_sign_request(params, apiSecret);

    return res.status(200).json({ signature, timestamp, apiKey, cloudName, resourceType });
}
