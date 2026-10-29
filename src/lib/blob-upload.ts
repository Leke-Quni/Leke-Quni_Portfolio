import { createHash } from "node:crypto";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { imageExtension } from "@/lib/uploads";

async function findBlob(pathname: string) {
  try {
    return await head(pathname);
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    throw e;
  }
}

export async function putImageDeduped(file: File): Promise<{ url: string; reused: boolean }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = imageExtension(bytes);
  if (!kind) throw new Error("Not a supported image.");

  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 32);
  const pathname = `images/${hash}.${kind.ext}`;

  const existing = await findBlob(pathname);
  if (existing) return { url: existing.url, reused: true };

  try {
    const { url } = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: kind.type,
    });
    return { url, reused: false };
  } catch (e) {
    const raced = await findBlob(pathname);
    if (raced) return { url: raced.url, reused: true };
    throw e;
  }
}
