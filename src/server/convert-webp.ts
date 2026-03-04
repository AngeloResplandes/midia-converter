import sharp = require("sharp");
import { extname } from "path";


const WEBP_QUALITY = 90;
const SUPPORTED_IMAGE_FORMATS = [".jpg", ".jpeg", ".png", ".gif", ".tiff", ".bmp", ".avif"];


export function isSupportedImage(filename: string): boolean {
    return SUPPORTED_IMAGE_FORMATS.includes(extname(filename).toLowerCase());
}


export async function convertToWebP(
    inputBuffer: Buffer,
    originalName: string
): Promise<{ outputBuffer: Buffer; outputName: string; inputSize: number; outputSize: number }> {
    const base = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const outputName = `${base}.webp`;
    const inputSize = inputBuffer.length;
    const isGif = extname(originalName).toLowerCase() === ".gif";

    let pipeline = sharp(inputBuffer, { animated: isGif });

    if (!isGif) {
        pipeline = pipeline.rotate();
    }

    const outputBuffer = await pipeline
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toBuffer();

    return { outputBuffer, outputName, inputSize, outputSize: outputBuffer.length };
}

export { SUPPORTED_IMAGE_FORMATS };
