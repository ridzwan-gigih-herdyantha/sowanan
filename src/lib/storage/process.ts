import sharp from "sharp";
import { PURPOSES, type Purpose } from "./media.ts";

export type Processed = { buffer: Buffer; ext: string; contentType: string; width: number; height: number };

export async function processImage(input: Buffer, purpose: Purpose): Promise<Processed> {
  const preset = PURPOSES[purpose];
  if (preset.kind !== "image") throw new Error(`${purpose} bukan gambar.`);

  let pipeline = sharp(input, { failOn: "error" }).rotate();
  pipeline =
    "height" in preset && preset.height
      ? pipeline.resize(preset.width, preset.height, { fit: "cover", position: "attention" })
      : pipeline.resize({ width: preset.width, withoutEnlargement: true });

  const out =
    preset.format === "jpeg"
      ? await pipeline.jpeg({ quality: preset.quality, mozjpeg: true, progressive: true }).toBuffer({ resolveWithObject: true })
      : await pipeline
          .webp(preset.lossless ? { lossless: true } : { quality: preset.quality, effort: 5, smartSubsample: true })
          .toBuffer({ resolveWithObject: true });

  return {
    buffer: out.data,
    ext: preset.format === "jpeg" ? "jpg" : "webp",
    contentType: preset.format === "jpeg" ? "image/jpeg" : "image/webp",
    width: out.info.width,
    height: out.info.height,
  };
}
