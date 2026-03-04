import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? "",
    });
}
