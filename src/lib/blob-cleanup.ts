import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

type ProjectImages = {
  coverImage: string | null;
  summary: string;
  reasoning: string;
  technicalDepth: string;
  summaryImages: string[];
  reasoningImages: string[];
  technicalDepthImages: string[];
};

export const projectImageSelect = {
  coverImage: true,
  summary: true,
  reasoning: true,
  technicalDepth: true,
  summaryImages: true,
  reasoningImages: true,
  technicalDepthImages: true,
} as const;

const INLINE_IMAGE = /!\[[^\]]*\]\(([^)\s]+)\)/g;

export function collectImageUrls(project: ProjectImages): Set<string> {
  const urls = new Set<string>();
  if (project.coverImage) urls.add(project.coverImage);
  for (const url of [
    ...project.summaryImages,
    ...project.reasoningImages,
    ...project.technicalDepthImages,
  ]) {
    urls.add(url);
  }
  for (const text of [project.summary, project.reasoning, project.technicalDepth]) {
    for (const match of text.matchAll(INLINE_IMAGE)) urls.add(match[1]);
  }
  return urls;
}

export function isOwnImageUrl(url: string) {
  try {
    const { hostname, pathname } = new URL(url);
    return hostname.endsWith(".public.blob.vercel-storage.com") && pathname.startsWith("/images/");
  } catch {
    return false;
  }
}

export async function deleteUnusedImages(candidates: Iterable<string>) {
  const own = [...new Set(candidates)].filter(isOwnImageUrl);
  if (own.length === 0) return;

  const projects = await prisma.project.findMany({ select: projectImageSelect });
  const inUse = new Set<string>();
  for (const project of projects) {
    for (const url of collectImageUrls(project)) inUse.add(url);
  }

  const unused = own.filter((url) => !inUse.has(url));
  if (unused.length === 0) return;

  try {
    await del(unused);
  } catch (e) {
    console.error("Failed to delete unused images", e);
  }
}
