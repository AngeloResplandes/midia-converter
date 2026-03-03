import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { join, basename, extname } from "path";
import { tmpdir } from "os";
import { writeFileSync, readFileSync, unlinkSync, statSync } from "fs";

ffmpeg.setFfmpegPath(ffmpegStatic as string);

const SUPPORTED_VIDEO_FORMATS = [".mp4", ".mov", ".mkv", ".avi", ".webm"];

const VIDEO_CRF = 30;           // 28 → 30: ~20-30% smaller, visually near-lossless
const VIDEO_PRESET = "slower";  // "slow" → "slower": better compression at same quality
const AUDIO_BITRATE = "96k";    // 128k → 96k: imperceptible for most content
const VIDEO_MAXRATE = "1.5M";   // 2M → 1.5M: tighter upper bitrate ceiling
const VIDEO_BUFSIZE = "3M";     // 4M → 3M
// Scale down to max 1920x1080 keeping aspect ratio — biggest win for 4K/2K inputs
const VIDEO_SCALE = "scale=1920:1080:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2";


export function isSupportedVideo(filename: string): boolean {
    return SUPPORTED_VIDEO_FORMATS.includes(extname(filename).toLowerCase());
}

/**
 * Compresses a video using OS temp files (not the project's uploads/ folder).
 * Temp files are deleted immediately after the output buffer is read.
 */
export function compressVideo(
    inputBuffer: Buffer,
    originalName: string,
    onProgress?: (percent: number) => void
): Promise<{ outputBuffer: Buffer; outputName: string; inputSize: number; outputSize: number }> {
    const id = crypto.randomUUID();
    const ext = extname(originalName).toLowerCase();
    const inputTmp = join(tmpdir(), `mc_in_${id}${ext}`);
    const outputTmp = join(tmpdir(), `mc_out_${id}.mp4`);
    const outputName = basename(originalName, extname(originalName)) + "_compressed.mp4";
    const inputSize = inputBuffer.length;

    // Write input to OS temp dir only
    writeFileSync(inputTmp, inputBuffer);

    return new Promise((resolve, reject) => {
        ffmpeg(inputTmp)
            .videoCodec("libx264")
            .audioCodec("aac")
            .audioBitrate(AUDIO_BITRATE)
            .outputOptions([
                `-crf ${VIDEO_CRF}`,
                `-preset ${VIDEO_PRESET}`,
                `-maxrate ${VIDEO_MAXRATE}`,
                `-bufsize ${VIDEO_BUFSIZE}`,
                `-vf ${VIDEO_SCALE}`,
                "-movflags +faststart",
                "-pix_fmt yuv420p",
                "-threads 0",
            ])
            .on("progress", (progress) => {
                const pct = Math.min(Math.round(progress.percent ?? 0), 100);
                onProgress?.(pct);
            })
            .on("end", () => {
                // Clean up input temp immediately
                try { unlinkSync(inputTmp); } catch { }

                try {
                    const outputBuffer = readFileSync(outputTmp);
                    const outputSize = outputBuffer.length;

                    // Clean up output temp immediately after reading into memory
                    try { unlinkSync(outputTmp); } catch { }

                    resolve({ outputBuffer, outputName, inputSize, outputSize });
                } catch (err) {
                    reject(err);
                }
            })
            .on("error", (err) => {
                try { unlinkSync(inputTmp); } catch { }
                try { unlinkSync(outputTmp); } catch { }
                reject(err);
            })
            .save(outputTmp);
    });
}

export { SUPPORTED_VIDEO_FORMATS };
