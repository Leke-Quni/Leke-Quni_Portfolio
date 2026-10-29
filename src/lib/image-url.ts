export function isOwnImageUrl(url: string) {
  try {
    const { hostname, pathname } = new URL(url);
    return hostname.endsWith(".public.blob.vercel-storage.com") && pathname.startsWith("/images/");
  } catch {
    return false;
  }
}
