export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((b, i) => bytes[offset + i] === b);

export function isImage(bytes: Uint8Array) {
  return (
    startsWith(bytes, [0x89, 0x50, 0x4e, 0x47]) ||
    startsWith(bytes, [0xff, 0xd8, 0xff]) ||
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38]) ||
    (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
      startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8))
  );
}

export function isPdf(bytes: Uint8Array) {
  return startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
}

export function safeFileName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").toLowerCase();
  return base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}
