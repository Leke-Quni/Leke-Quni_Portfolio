import { cacheLife, cacheTag } from "next/cache";
import type { Project } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type { Project };

export async function getPublishedProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  cacheLife("max");

  return prisma.project.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  const projects = await getPublishedProjects();
  return projects.find((p) => p.slug === slug);
}

export async function getAdjacentProjects(
  slug: string,
): Promise<{ previous?: Project; next?: Project }> {
  const projects = await getPublishedProjects();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { previous: projects[i - 1], next: projects[i + 1] };
}
