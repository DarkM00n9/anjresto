"use client";

import imageCompression from "browser-image-compression";

/** Compresse une photo côté client avant upload (~300 Ko max, 1600px max). */
export async function compressPhoto(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
  });
}
