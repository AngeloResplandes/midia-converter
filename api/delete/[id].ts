import type { VercelRequest, VercelResponse } from "@vercel/node";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * DELETE /api/delete/:id
 * Deletes a resource from Cloudinary by its public_id.
 * Tries image resource_type first, then video.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const id = req.query["id"];
    if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const imgResult = await cloudinary.uploader.destroy(id);
        if (imgResult.result === "not found") {
            await cloudinary.uploader.destroy(id, { resource_type: "video" });
        }
        return res.status(200).json({ message: "Deletado" });
    } catch (err) {
        return res.status(500).json({ error: String(err) });
    }
}
