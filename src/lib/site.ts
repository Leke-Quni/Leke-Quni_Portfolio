import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getCvUrl(): Promise<string | null> {
  "use cache";
  cacheTag("cv");
  cacheLife("max");

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return settings?.cvUrl ?? null;
}
