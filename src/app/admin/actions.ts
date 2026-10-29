"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "../../../generated/prisma/client";
import { requireAdmin } from "@/lib/admin";
import { collectImageUrls, deleteUnusedImages, projectImageSelect } from "@/lib/blob-cleanup";
import { importFromGithub, type GithubImport } from "@/lib/github-import";
import { prisma } from "@/lib/prisma";
import { parseProjectForm, type ProjectFormState } from "@/lib/project-input";
import { putImageDeduped } from "@/lib/blob-upload";
import { isImage, isPdf, MAX_UPLOAD_BYTES } from "@/lib/uploads";

const SLUG_TAKEN: ProjectFormState = {
  fieldErrors: { slug: "Another Project already uses this slug." },
};

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const parsed = parseProjectForm(formData);
  if ("fieldErrors" in parsed) return { fieldErrors: parsed.fieldErrors };

  try {
    const last = await prisma.project.aggregate({ _max: { order: true } });
    await prisma.project.create({
      data: { ...parsed.data, order: (last._max.order ?? 0) + 1 },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return SLUG_TAKEN;
    }
    throw e;
  }

  updateTag("projects");
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function importGithubRepo(
  url: string,
): Promise<{ data: GithubImport } | { error: string }> {
  await requireAdmin();
  try {
    return { data: await importFromGithub(url) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not import the repository." };
  }
}

export async function updateProject(
  id: string,
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const parsed = parseProjectForm(formData);
  if ("fieldErrors" in parsed) return { fieldErrors: parsed.fieldErrors };

  const before = await prisma.project.findUnique({
    where: { id },
    select: projectImageSelect,
  });

  try {
    await prisma.project.update({ where: { id }, data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return SLUG_TAKEN;
      if (e.code === "P2025") return { error: "This Project no longer exists." };
    }
    throw e;
  }

  if (before) {
    const kept = collectImageUrls(parsed.data);
    await deleteUnusedImages([...collectImageUrls(before)].filter((url) => !kept.has(url)));
  }

  updateTag("projects");
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function setPublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.project.update({ where: { id }, data: { published } });
  updateTag("projects");
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function reorderProjects(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await prisma.project.findMany({ select: { id: true } });
  const known = new Set(existing.map((p) => p.id));
  if (ids.length !== known.size || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id))) {
    return { error: "The Project list changed. Reload the page and try again." };
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.project.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  updateTag("projects");
  revalidatePath("/admin", "layout");
  return {};
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const before = await prisma.project.findUnique({
    where: { id },
    select: projectImageSelect,
  });
  try {
    await prisma.project.delete({ where: { id } });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
      throw e;
    }
  }
  if (before) await deleteUnusedImages(collectImageUrls(before));
  updateTag("projects");
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export type UploadResult = { url?: string; error?: string };

async function readUpload(
  formData: FormData,
  check: (bytes: Uint8Array) => boolean,
  kind: string,
): Promise<{ file: File } | { error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file first." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "File is too large (max 3 MB)." };
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!check(head)) return { error: `That doesn't look like a valid ${kind}.` };
  return { file };
}

export async function uploadImage(
  _prev: UploadResult,
  formData: FormData,
): Promise<UploadResult> {
  await requireAdmin();
  const upload = await readUpload(formData, isImage, "PNG, JPEG, GIF or WebP image");
  if ("error" in upload) return upload;

  const { url } = await putImageDeduped(upload.file);
  return { url };
}

export async function uploadCv(
  _prev: UploadResult,
  formData: FormData,
): Promise<UploadResult> {
  await requireAdmin();
  const upload = await readUpload(formData, isPdf, "PDF");
  if ("error" in upload) return upload;

  const { url } = await put("cv/cv.pdf", upload.file, {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/pdf",
  });

  const previous = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { cvUrl: url },
    create: { id: 1, cvUrl: url },
  });
  if (previous?.cvUrl) await del(previous.cvUrl);

  updateTag("cv");
  revalidatePath("/admin");
  return { url };
}
