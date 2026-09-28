/**
 * Reduce una foto antes de subirla: lado mayor a 2000px como máximo y
 * WebP calidad 0.85 (JPEG si el navegador no sabe codificar WebP, como
 * Safari). Devuelve el archivo original si no se puede decodificar, si
 * es SVG/GIF (vectorial/animado) o si comprimido no queda más liviano.
 */
const MAX_DIMENSION = 2000;
const QUALITY = 0.85;
const SKIPPED_TYPES = new Set(["image/svg+xml", "image/gif"]);

let webpSupported;
function canEncodeWebp() {
  if (webpSupported === undefined) {
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    webpSupported = probe.toDataURL("image/webp").startsWith("data:image/webp");
  }
  return webpSupported;
}

export async function compressImage(file) {
  if (!file.type.startsWith("image/") || SKIPPED_TYPES.has(file.type)) return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const type = canEncodeWebp() ? "image/webp" : "image/jpeg";

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (type === "image/jpeg") {
    // JPEG no tiene transparencia: sin fondo, un PNG transparente quedaría negro.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
  if (!blob || blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen";
  const extension = type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${baseName}.${extension}`, { type });
}
