import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * GET /api/config
 * Returns the public Cloudinary configuration needed by the frontend
 * to upload files directly to Cloudinary.
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? "",
    });
}
