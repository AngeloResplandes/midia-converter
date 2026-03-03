import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Deletes a resource from Cloudinary by its public_id.
 * Tries image resource_type first, then video.
 */
export async function destroyResource(publicId: string): Promise<void> {
    const imgResult = await cloudinary.uploader.destroy(publicId);
    if (imgResult.result === "not found") {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }
}

export { cloudinary };
