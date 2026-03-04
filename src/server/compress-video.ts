import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { join, basename, extname } from "path";
import { tmpdir } from "os";
import { writeFileSync, readFileSync, unlinkSync, statSync } from "fs";

ffmpeg.setFfmpegPath(ffmpegStatic as string);

const SUPPORTED_VIDEO_FORMATS = [".mp4", ".mov", ".mkv", ".avi", ".webm"];

const VIDEO_CRF = 30;
const VIDEO_PRESET = "slower";
const AUDIO_BITRATE = "96k";
const VIDEO_MAXRATE = "1.5M";
const VIDEO_BUFSIZE = "3M";
const VIDEO_SCALE = "scale=1920:1080:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2";


export function isSupportedVideo(filename: string): boolean {
    return SUPPORTED_VIDEO_FORMATS.includes(extname(filename).toLowerCase());
}


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

    writeFileSync(inputTmp, new Uint8Array(inputBuffer));

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
            .on("progress", (progress: { percent?: number }) => {
                const pct = Math.min(Math.round(progress.percent ?? 0), 100);
                onProgress?.(pct);
            })
            .on("end", () => {
                try { unlinkSync(inputTmp); } catch { }

                try {
                    const outputBuffer = readFileSync(outputTmp);
                    const outputSize = outputBuffer.length;

                    try { unlinkSync(outputTmp); } catch { }

                    resolve({ outputBuffer, outputName, inputSize, outputSize });
                } catch (err) {
                    reject(err);
                }
            })
            .on("error", (err: Error) => {
                try { unlinkSync(inputTmp); } catch { }
                try { unlinkSync(outputTmp); } catch { }
                reject(err);
            })
            .save(outputTmp);
    });
}

export { SUPPORTED_VIDEO_FORMATS };
